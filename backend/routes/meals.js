// routes/meals.js — Meal tracking routes (all protected)
import express from 'express';
import { logMeal, getMealsByDate, getTodayMeals, getWeeklySummary, deleteMeal } from '../controllers/mealController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// GET  /api/meals?date=YYYY-MM-DD  — get meals for a specific date
router.get('/', getMealsByDate);

// POST /api/meals                   — log a new meal
router.post('/', logMeal);

// GET  /api/meals/today             — get today's meals (legacy, uses getMealsByDate internally)
router.get('/today', getTodayMeals);

// GET  /api/meals/weekly-summary    — 7-day calorie summary
router.get('/weekly-summary', getWeeklySummary);

// DELETE /api/meals/:id             — delete a meal
router.delete('/:id', deleteMeal);

export default router;
