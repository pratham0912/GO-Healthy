// models/WaterIntake.js — Standalone water tracking (replaces Dashboard.waterIntake sub-doc)
// Separate collection enables historical queries and per-day reporting.

import mongoose from 'mongoose';

const WaterIntakeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // UTC midnight-normalized date — one doc per user per day
    date: {
      type: Date,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound unique index: one water doc per user per day
WaterIntakeSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('WaterIntake', WaterIntakeSchema);
