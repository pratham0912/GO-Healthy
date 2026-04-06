// models/Dashboard.js — Dashboard schema (one per user, ESM)

import mongoose from 'mongoose';

const DashboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    preferences: {
      dietType: {
        type: String,
        enum: ['vegan', 'vegetarian', 'keto', 'paleo', 'balanced', 'none'],
        default: 'none',
      },
      fitnessGoal: {
        type: String,
        enum: ['lose_weight', 'build_muscle', 'maintain', 'endurance', 'flexibility'],
        default: 'maintain',
      },
      calorieTarget: {
        type: Number,
        default: 2000,
        min: 500,
        max: 10000,
      },
      waterGoalLiters: {
        type: Number,
        default: 2.5,
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    savedBlogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogSave',
      },
    ],
    activityHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
    // ── Water intake (resets daily) ──────────────────────────────────
    waterIntake: {
      count: { type: Number, default: 0, min: 0 },
      date:  { type: Date, default: () => new Date() },
    },
    // ── Streak (increments on consecutive daily logins) ──────────────
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Kept for backwards-compatibility with old documents in the DB
    weeklyStreakCount: {
      type: Number,
      default: 0,
    },
    // Health score (0-100) — computed on every GET /api/dashboard
    healthScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Unlocked achievement IDs
    achievements: {
      type: [String],
      default: [],
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Dashboard = mongoose.model('Dashboard', DashboardSchema);
export default Dashboard;
