// services/dailyStatsService.js — Daily snapshot generator
// Creates/updates one DailyStats doc per user per day.
// Designed to be idempotent — safe to call multiple times per day.

import mongoose from 'mongoose';
import DailyStats  from '../models/DailyStats.js';
import Meal        from '../models/Meal.js';
import WaterIntake from '../models/WaterIntake.js';
import User        from '../models/User.js';

function toMidnight(d) {
  const m = new Date(d);
  m.setUTCHours(0, 0, 0, 0);
  return m;
}

/**
 * Generate (or update) today's snapshot.
 * Uses upsert — will not duplicate if called multiple times.
 *
 * @param {string} userId
 * @param {Date}   [date=now]
 * @returns {DailyStats} The upserted document
 */
export async function generateSnapshot(userId, date = new Date()) {
  const userObjId = new mongoose.Types.ObjectId(userId);
  const today     = toMidnight(date);
  const tomorrow  = new Date(today); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  // 1. Get user targets
  const user = await User.findById(userId)
    .select('dailyCalorieTarget dailyWaterTarget bmi')
    .lean();

  const calorieTarget = user?.dailyCalorieTarget || 2000;
  const waterTarget   = user?.dailyWaterTarget   || 8;

  // 2. Aggregate today's meals
  const [mealAgg] = await Meal.aggregate([
    { $match: { userId: userObjId, loggedAt: { $gte: today, $lt: tomorrow } } },
    {
      $group: {
        _id: null,
        totalCalories: { $sum: '$calories' },
        protein:       { $sum: '$protein' },
        carbs:         { $sum: '$carbs' },
        fat:           { $sum: '$fat' },
        count:         { $sum: 1 },
      },
    },
  ]);

  const totalCalories = mealAgg?.totalCalories || 0;
  const macros = {
    protein: mealAgg?.protein || 0,
    carbs:   mealAgg?.carbs   || 0,
    fat:     mealAgg?.fat     || 0,
  };

  // 3. Get today's water
  const waterDoc = await WaterIntake.findOne({ userId: userObjId, date: today }).lean();
  const waterCount = waterDoc?.count || 0;

  // 4. Goal checks
  const caloriesHit = totalCalories >= calorieTarget * 0.8;
  const waterHit    = waterCount >= waterTarget;

  // 5. Upsert — creates if not exists, updates if changed
  const snapshot = await DailyStats.findOneAndUpdate(
    { userId: userObjId, date: today },
    {
      $set: {
        totalCalories,
        calorieTarget,
        macros,
        waterCount,
        waterTarget,
        mealsLogged:  mealAgg?.count || 0,
        bmi:          user?.bmi || null,
        streakActive: caloriesHit && waterHit,
        goalsHit:     { calories: caloriesHit, water: waterHit },
      },
    },
    { upsert: true, new: true }
  );

  return snapshot;
}
