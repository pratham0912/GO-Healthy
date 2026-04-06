// routes/dashboard.js — Dashboard routes (all protected)

import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDashboard,
  updatePreferences,
  updateTheme,
  getDashboardStats,
} from '../controllers/dashboardController.js';

const router = Router();

// All dashboard routes require authentication
router.use(protect);

// GET  /api/dashboard         — Get user's full dashboard
router.get('/', getDashboard);

// PUT  /api/dashboard/preferences — Update diet, fitness goal, calories etc.
router.put('/preferences', updatePreferences);

// PUT  /api/dashboard/theme   — Update theme preference
router.put('/theme', updateTheme);

// GET  /api/dashboard/stats   — Aggregated stats for the user
router.get('/stats', getDashboardStats);

export default router;
