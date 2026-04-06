// models/DailyStats.js — Per-user, per-day aggregated snapshot
// Created once per day on dashboard load. Enables trend charts and history views.

import mongoose from 'mongoose';

const DailyStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalCalories: { type: Number, default: 0 },
    calorieTarget: { type: Number, default: 2000 },
    macros: {
      protein: { type: Number, default: 0 },
      carbs:   { type: Number, default: 0 },
      fat:     { type: Number, default: 0 },
    },
    waterCount:  { type: Number, default: 0 },
    waterTarget: { type: Number, default: 8 },
    mealsLogged: { type: Number, default: 0 },
    bmi:         { type: Number },
    streakActive: { type: Boolean, default: false },
    goalsHit: {
      calories: { type: Boolean, default: false },
      water:    { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// One snapshot per user per day
DailyStatsSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyStats', DailyStatsSchema);
