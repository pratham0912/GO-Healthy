// controllers/waterController.js — Water tracking using standalone WaterIntake collection
// Replaces the old Dashboard.waterIntake sub-document approach.

import mongoose from 'mongoose';
import WaterIntake from '../models/WaterIntake.js';

/**
 * Normalize a date to UTC midnight for consistent day-level keys.
 */
function todayMidnight() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * GET /api/water?date=YYYY-MM-DD
 * Returns water intake for the given date (defaults to today).
 */
export const getWater = async (req, res) => {
  try {
    const userId = req.user.id;
    let date;

    if (req.query.date) {
      date = new Date(req.query.date);
      date.setUTCHours(0, 0, 0, 0);
    } else {
      date = todayMidnight();
    }

    const doc = await WaterIntake.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date,
    }).lean();

    return res.status(200).json({
      success: true,
      data: {
        count: doc?.count || 0,
        date: date.toISOString(),
      },
    });
  } catch (error) {
    console.error('[waterController.getWater] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * POST /api/water/increment
 * Atomically add 1 glass to today's water count (upsert).
 */
export const incrementWater = async (req, res) => {
  try {
    const userId = req.user.id;
    const date   = todayMidnight();

    const doc = await WaterIntake.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      data: { count: doc.count, date: date.toISOString() },
    });
  } catch (error) {
    console.error('[waterController.incrementWater] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * POST /api/water/decrement
 * Atomically subtract 1 glass from today's water count (min 0).
 */
export const decrementWater = async (req, res) => {
  try {
    const userId = req.user.id;
    const date   = todayMidnight();

    // First check current to avoid going below 0
    const existing = await WaterIntake.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date,
    });

    if (!existing || existing.count <= 0) {
      return res.status(200).json({
        success: true,
        data: { count: 0, date: date.toISOString() },
      });
    }

    const doc = await WaterIntake.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date },
      { $inc: { count: -1 } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: { count: doc.count, date: date.toISOString() },
    });
  } catch (error) {
    console.error('[waterController.decrementWater] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * GET /api/water/history?days=7
 * Returns water intake for the last N days (for charts).
 */
export const getWaterHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const days   = parseInt(req.query.days) || 7;
    const start  = todayMidnight();
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const docs = await WaterIntake.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: start },
    })
      .sort({ date: 1 })
      .lean();

    // Fill in missing days with count: 0
    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const found = docs.find(
        (doc) => new Date(doc.date).toISOString().split('T')[0] === dateStr
      );
      result.push({ date: dateStr, count: found?.count || 0 });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('[waterController.getWaterHistory] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
