// models/MealPlan.js — Persistent meal plan storage (replaces in-memory object)
// One active plan per user. Stores weekly meal assignments.

import mongoose from 'mongoose';

const MealItemSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    calories: { type: Number, default: 0 },
    protein:  { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },
    fat:      { type: Number, default: 0 },
    category: { type: String },  // breakfast, lunch, dinner, snack
    emoji:    { type: String, default: '' },
  },
  { _id: false }
);

const DayPlanSchema = new mongoose.Schema(
  {
    day:   { type: String, required: true },  // Monday, Tuesday, etc.
    meals: [MealItemSchema],
  },
  { _id: false }
);

const MealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: 'My Meal Plan',
    },
    // Preferences that generated this plan
    preferences: {
      dietType:      { type: String },
      calorieTarget: { type: Number },
      goal:          { type: String },
    },
    days: [DayPlanSchema],
    totalCalories: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Only one active plan per user
MealPlanSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model('MealPlan', MealPlanSchema);
