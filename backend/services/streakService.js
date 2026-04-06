// services/streakService.js — Goal-based streak engine
// Streak increments only when BOTH calorie and water goals are met.
// Resets to 1 if user skips a day.

import mongoose from 'mongoose';
import Dashboard from '../models/Dashboard.js';
import Meal      from '../models/Meal.js';
import WaterIntake from '../models/WaterIntake.js';
import User      from '../models/User.js';

/**
 * Normalize a date to UTC midnight — used for day-level comparisons.
 */
function toMidnight(d) {
  const m = new Date(d);
  m.setUTCHours(0, 0, 0, 0);
  return m;
}

/**
 * Check whether the user met both goals today, then update streak accordingly.
 *
 * @param {string} userId
 * @param {Date}   [date=now]  — the day to evaluate
 * @returns {{ currentStreak, longestStreak, goalsCompleted }}
 */
export async function checkAndUpdateStreak(userId, date = new Date()) {
  const userObjId = new mongoose.Types.ObjectId(userId);
  const today     = toMidnight(date);
  const tomorrow  = new Date(today); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const yesterday = new Date(today); yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  // 1. Get user targets
  const user = await User.findById(userId).select('dailyCalorieTarget dailyWaterTarget').lean();
  const calorieTarget = user?.dailyCalorieTarget || 2000;
  const waterTarget   = user?.dailyWaterTarget   || 8;

  // 2. Aggregate today's calories
  const [calAgg] = await Meal.aggregate([
    { $match: { userId: userObjId, loggedAt: { $gte: today, $lt: tomorrow } } },
    { $group: { _id: null, total: { $sum: '$calories' } } },
  ]);
  const totalCalories = calAgg?.total || 0;

  // 3. Get today's water count
  const waterDoc = await WaterIntake.findOne({ userId: userObjId, date: today }).lean();
  const waterCount = waterDoc?.count || 0;

  // 4. Determine goal completion (80% threshold for calories)
  const calorieGoalMet = totalCalories >= calorieTarget * 0.8;
  const waterGoalMet   = waterCount >= waterTarget;
  const bothMet        = calorieGoalMet && waterGoalMet;

  // 5. Get or create dashboard
  let dashboard = await Dashboard.findOne({ userId });
  if (!dashboard) {
    dashboard = await Dashboard.create({ userId });
  }

  // 6. Streak logic
  const lastActive = dashboard.lastActiveAt ? toMidnight(dashboard.lastActiveAt) : null;
  const lastActiveTime = lastActive ? lastActive.getTime() : null;
  const todayTime      = today.getTime();
  const yesterdayTime   = yesterday.getTime();

  // Detect Streak Breaks (Graceful Reset)
  let status = "active";
  if (!lastActiveTime) {
      status = "new_user";
  } else if (lastActiveTime < yesterdayTime && (dashboard.streak || 0) > 0) {
      // Missed yesterday or earlier — break streak before evaluating today
      dashboard.streak = 0; 
      status = "broken";
  }

  // Process Today's Actions
  if (bothMet) {
      if (lastActiveTime !== todayTime) {
          dashboard.streak = (dashboard.streak || 0) + 1;
          dashboard.lastActiveAt = date;
          
          if (dashboard.streak === 1) {
              status = lastActiveTime ? "comeback" : "first_day";
          } else {
              status = "active";
          }
      }
      // Update longest streak
      if (dashboard.streak > (dashboard.longestStreak || 0)) {
          dashboard.longestStreak = dashboard.streak;
      }
  }

  await dashboard.save();

  return {
    currentStreak:  dashboard.streak || 0,
    longestStreak:  dashboard.longestStreak || 0,
    status:         status,
    goalsCompleted: {
      calories: calorieGoalMet,
      water:    waterGoalMet,
    },
  };
}
