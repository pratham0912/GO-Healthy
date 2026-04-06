// models/Activity.js — Unified Activity/Meal log schema (ESM)

import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    type: {
      type: String,
      required: true,
      enum: ['run', 'walk', 'cycle', 'swim', 'yoga', 'gym', 'breakfast', 'lunch', 'dinner', 'snack', 'other'],
    },
    durationMin: {
      type: Number,
      default: 1, // Optional for meals
    },
    caloriesBurned: {
      type: Number, // Serves as calories consumed for meals
    },
    distanceKm: {
      type: Number,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for fast sorted queries by user
ActivitySchema.index({ userId: 1, loggedAt: -1 });

const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity;
