// routes/water.js — Water intake routes (all protected)
import express from 'express';
import { getWater, incrementWater, decrementWater, getWaterHistory } from '../controllers/waterController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// GET  /api/water?date=YYYY-MM-DD  — get water for a specific date
router.get('/', getWater);

// GET  /api/water/history?days=7   — get water history for charts
router.get('/history', getWaterHistory);

// POST /api/water/increment        — add 1 glass
router.post('/increment', incrementWater);

// POST /api/water/decrement        — remove 1 glass
router.post('/decrement', decrementWater);

export default router;
