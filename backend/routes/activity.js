// routes/activity.js — Activity routes (all protected)

import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getActivities,
  createActivity,
  deleteActivity,
  getActivityStats,
} from '../controllers/activityController.js';

const router = Router();

// All activity routes require authentication
router.use(protect);

// GET  /api/activity          — Get user's activity log (paginated, date filtered)
router.get('/', getActivities);

// GET  /api/activity/stats    — Weekly/monthly summary (aggregated)
router.get('/stats', getActivityStats);

// POST /api/activity          — Log a new activity
router.post('/', createActivity);

// DELETE /api/activity/:id    — Delete a specific activity entry
router.delete('/:id', deleteActivity);

export default router;
