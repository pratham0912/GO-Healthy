// controllers/dashboardController.js — Dashboard operations (ESM)
// Unified endpoint that aggregates meals, water, streak, and health score.

import mongoose from 'mongoose';
import Dashboard from '../models/Dashboard.js';
import Meal from '../models/Meal.js';
import WaterIntake from '../models/WaterIntake.js';
import WeightEntry from '../models/WeightEntry.js';
import User from '../models/User.js';
import { checkAndUpdateStreak } from '../services/streakService.js';
import { generateSnapshot } from '../services/dailyStatsService.js';
import { calculateHealthScore } from '../utils/healthScore.js';

/**
 * GET /api/dashboard?date=YYYY-MM-DD
 * Returns a unified dashboard response with real data from all modules.
 * Uses aggregation for meals, separate queries for water and streak.
 */
export const getDashboard = async (req, res) => {
  try {
    const userId    = req.user.id;
    const userObjId = new mongoose.Types.ObjectId(userId);

    // Parse date or default to today
    let targetDate;
    if (req.query.date) {
      targetDate = new Date(req.query.date);
      targetDate.setUTCHours(0, 0, 0, 0);
    } else {
      targetDate = new Date();
      targetDate.setUTCHours(0, 0, 0, 0);
    }
    const nextDay = new Date(targetDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // ── 1. User profile (for targets) ──────────────────────────────
    const user = await User.findById(userId)
      .select('name email profilePicture age height weight gender goal dietType dailyCalorieTarget dailyWaterTarget bmi')
      .lean();

    const calorieTarget = user?.dailyCalorieTarget || 2000;
    const waterTarget   = user?.dailyWaterTarget   || 8;

    // ── 2. Get or create dashboard doc ─────────────────────────────
    let dashboard = await Dashboard.findOne({ userId });
    if (!dashboard) {
      dashboard = await Dashboard.create({ userId, preferences: { calorieTarget } });
    }

    // ── 3. Aggregate today's meals (single DB call) ────────────────
    const [mealAgg] = await Meal.aggregate([
      { $match: { userId: userObjId, loggedAt: { $gte: targetDate, $lt: nextDay } } },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$calories' },
          protein:       { $sum: '$protein' },
          carbs:         { $sum: '$carbs' },
          fat:           { $sum: '$fat' },
          mealCount:     { $sum: 1 },
        },
      },
    ]);

    const totalCalories = mealAgg?.totalCalories || 0;
    const macros = {
      protein: mealAgg?.protein || 0,
      carbs:   mealAgg?.carbs   || 0,
      fat:     mealAgg?.fat     || 0,
    };
    const mealCount = mealAgg?.mealCount || 0;

    // ── 4. Get today's meals list (for display) ────────────────────
    const meals = await Meal.find({
      userId, loggedAt: { $gte: targetDate, $lt: nextDay },
    }).sort({ loggedAt: -1 }).lean();

    // ── 5. Get water intake (separate query) ───────────────────────
    const waterDoc = await WaterIntake.findOne({ userId: userObjId, date: targetDate }).lean();
    const waterCount = waterDoc?.count || 0;

    // ── 6. Run streak engine (separate service call) ───────────────
    const streakResult = await checkAndUpdateStreak(userId, targetDate);
    // Re-read dashboard after streak update
    await dashboard.save();
    const updatedDashboard = await Dashboard.findOne({ userId }).lean();

    // ── 7. Check for recent weight entry ───────────────────────────
    const startOfWeek = new Date(targetDate);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 7);
    const recentWeight = await WeightEntry.findOne({
      userId, loggedAt: { $gte: startOfWeek },
    }).lean();

    // ── 8. Calculate health score ──────────────────────────────────
    const healthScore = calculateHealthScore({
      waterGlasses:       waterCount,
      waterGoal:          waterTarget,
      caloriesToday:      totalCalories,
      calorieGoal:        calorieTarget,
      streak:             updatedDashboard.streak || 0,
      mealsLoggedToday:   mealCount,
      weightLoggedThisWeek: !!recentWeight,
    });

    // Persist health score on dashboard
    if (dashboard.healthScore !== healthScore) {
      dashboard.healthScore = healthScore;
      await dashboard.save();
    }

    // ── 9. Generate daily snapshot (idempotent) ────────────────────
    await generateSnapshot(userId, targetDate);

    // ── 10. Achievements ───────────────────────────────────────────
    const achievements = [
      { id: 'first_meal',     label: 'First Meal',     icon: '🥗', unlocked: mealCount >= 1 },
      { id: 'streak_3',      label: '3-Day Streak',   icon: '🔥', unlocked: (updatedDashboard.streak || 0) >= 3 },
      { id: 'health_master', label: 'Health Master',  icon: '🏆', unlocked: healthScore >= 80 },
      { id: 'streak_7',      label: 'Week Warrior',   icon: '⚡', unlocked: (updatedDashboard.streak || 0) >= 7 },
      { id: 'water_champ',   label: 'Water Champion', icon: '💧', unlocked: waterCount >= waterTarget },
    ];

    // ── 11. Build unified response ─────────────────────────────────
    return res.status(200).json({
      success: true,
      data: {
        date:               targetDate.toISOString().split('T')[0],
        // Calories
        totalCalories,
        calorieTarget,
        caloriesRemaining:  Math.max(0, calorieTarget - totalCalories),
        macros,
        // Water
        waterIntake:        waterCount,
        waterTarget,
        waterPercent:       waterTarget > 0 ? +((waterCount / waterTarget) * 100).toFixed(1) : 0,
        // Streak
        currentStreak:      updatedDashboard.streak || 0,
        longestStreak:      updatedDashboard.longestStreak || 0,
        streakStatus:       streakResult.status || 'new_user',
        // Goals
        goalsCompleted:     streakResult.goalsCompleted,
        // Score
        healthScore,
        // Meals list
        meals,
        mealCount,
        // Achievements
        achievements,
        // BMI
        bmi:                user?.bmi || null,
        // User profile summary
        user: {
          name:           user?.name,
          profilePicture: user?.profilePicture,
          goal:           user?.goal,
          dietType:       user?.dietType,
        },
      },
    });
  } catch (error) {
    console.error(`[dashboardController.getDashboard] Error: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * PUT /api/dashboard/preferences
 * Update diet, fitness goal, calories, water goal, notifications.
 */
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dietType, fitnessGoal, calorieTarget, waterGoalLiters, notifications } = req.body;

    const prefUpdate = {};
    if (dietType !== undefined) prefUpdate['preferences.dietType'] = dietType;
    if (fitnessGoal !== undefined) prefUpdate['preferences.fitnessGoal'] = fitnessGoal;
    if (calorieTarget !== undefined) prefUpdate['preferences.calorieTarget'] = calorieTarget;
    if (waterGoalLiters !== undefined) prefUpdate['preferences.waterGoalLiters'] = waterGoalLiters;
    if (notifications !== undefined) prefUpdate['preferences.notifications'] = notifications;

    // Also sync targets to User model for cross-module access
    const userUpdate = {};
    if (calorieTarget !== undefined) userUpdate.dailyCalorieTarget = calorieTarget;
    if (dietType !== undefined) userUpdate.dietType = dietType;
    if (fitnessGoal !== undefined) userUpdate.goal = fitnessGoal;

    if (Object.keys(prefUpdate).length === 0) {
      return res.status(400).json({ success: false, error: 'No preference fields to update' });
    }

    const [dashboard] = await Promise.all([
      Dashboard.findOneAndUpdate(
        { userId },
        { $set: prefUpdate },
        { new: true, runValidators: true }
      ).lean(),
      Object.keys(userUpdate).length > 0
        ? User.findByIdAndUpdate(userId, { $set: userUpdate })
        : Promise.resolve(),
    ]);

    if (!dashboard) {
      return res.status(404).json({ success: false, error: 'Dashboard not found' });
    }

    return res.status(200).json({ success: true, data: dashboard.preferences });
  } catch (error) {
    console.error(`[dashboardController.updatePreferences] Error: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * PUT /api/dashboard/theme
 * Update theme preference (light, dark, system).
 */
export const updateTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;

    const validThemes = ['light', 'dark', 'system'];
    if (!theme || !validThemes.includes(theme)) {
      return res.status(400).json({ success: false, error: 'Theme must be one of: light, dark, system' });
    }

    const dashboard = await Dashboard.findOneAndUpdate(
      { userId },
      { $set: { theme } },
      { new: true }
    ).lean();

    if (!dashboard) {
      return res.status(404).json({ success: false, error: 'Dashboard not found' });
    }

    return res.status(200).json({ success: true, data: { theme: dashboard.theme } });
  } catch (error) {
    console.error(`[dashboardController.updateTheme] Error: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * GET /api/dashboard/stats
 * Aggregated stats: totalActivities, totalCaloriesBurned, totalBlogsSaved, currentStreak.
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboard = await Dashboard.findOne({ userId })
      .select('streak longestStreak healthScore')
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        currentStreak:  dashboard?.streak || 0,
        longestStreak:  dashboard?.longestStreak || 0,
        healthScore:    dashboard?.healthScore || 0,
      },
    });
  } catch (error) {
    console.error(`[dashboardController.getDashboardStats] Error: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
