// controllers/activityController.js — Activity CRUD + aggregation stats (ESM)

import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Dashboard from '../models/Dashboard.js';

/**
 * GET /api/activity
 * Get user's activity log — paginated, date filtered, sorted by loggedAt desc.
 */
export const getActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const filter = { userId };

    if (startDate || endDate) {
      filter.loggedAt = {};
      if (startDate) filter.loggedAt.$gte = new Date(startDate);
      if (endDate) filter.loggedAt.$lte = new Date(endDate);
    }

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .sort({ loggedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Activity.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error(`[activityController.getActivities] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * POST /api/activity
 * Log a new activity. Pushes _id to dashboard activityHistory.
 */
export const createActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, type, durationMin, caloriesBurned, distanceKm, notes } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Activity type is required',
      });
    }

    const validTypes = ['run', 'walk', 'cycle', 'swim', 'yoga', 'gym', 'breakfast', 'lunch', 'dinner', 'snack', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Type must be one of: ${validTypes.join(', ')}`,
      });
    }

    const activity = await Activity.create({
      userId,
      title,
      type,
      durationMin: durationMin || 1,
      caloriesBurned: caloriesBurned || 0,
      distanceKm: distanceKm || undefined,
      notes: notes || undefined,
    });

    // Push to dashboard activityHistory
    await Dashboard.findOneAndUpdate(
      { userId },
      { $push: { activityHistory: activity._id } }
    );

    return res.status(201).json({
      success: true,
      data: activity.toObject(),
    });
  } catch (error) {
    console.error(`[activityController.createActivity] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * DELETE /api/activity/:id
 * Delete a specific activity entry — userId check is MANDATORY.
 */
export const deleteActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // CRITICAL: filter by both _id AND userId to prevent cross-user deletion
    const activity = await Activity.findOneAndDelete({ _id: id, userId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
      });
    }

    // Remove from dashboard activityHistory
    await Dashboard.findOneAndUpdate(
      { userId },
      { $pull: { activityHistory: activity._id } }
    );

    return res.status(200).json({
      success: true,
      data: { message: 'Activity deleted' },
    });
  } catch (error) {
    console.error(`[activityController.deleteActivity] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * GET /api/activity/stats
 * Weekly and monthly summary — MongoDB aggregation.
 */
export const getActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjId = new mongoose.Types.ObjectId(userId);

    // Weekly stats (last 7 days)
    const weeklyStats = await Activity.aggregate([
      {
        $match: {
          userId: userObjId,
          loggedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$loggedAt' },
          totalDuration: { $sum: '$durationMin' },
          totalCalories: { $sum: '$caloriesBurned' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly stats (last 30 days)
    const monthlyStats = await Activity.aggregate([
      {
        $match: {
          userId: userObjId,
          loggedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$durationMin' },
          totalCalories: { $sum: '$caloriesBurned' },
          totalDistance: { $sum: '$distanceKm' },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        weekly: weeklyStats,
        monthly: monthlyStats.length > 0 ? monthlyStats[0] : {
          totalDuration: 0,
          totalCalories: 0,
          totalDistance: 0,
          count: 0,
        },
      },
    });
  } catch (error) {
    console.error(`[activityController.getActivityStats] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
