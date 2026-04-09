// routes/mealplan.js — Persistent meal plan routes (all protected)
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMealPlan,
  saveMealPlan,
  deleteMealPlan,
  getMealPlanHistory,
  generateMealPlan,
} from '../controllers/mealPlanController.js';

const router = express.Router();

router.use(protect);

// POST /api/mealplan/generate — AI-generated meal plan (no save)
router.post('/generate', generateMealPlan);

// GET  /api/mealplan          — get active meal plan
router.get('/', getMealPlan);

// POST /api/mealplan          — save/replace meal plan
router.post('/', saveMealPlan);

// GET  /api/mealplan/history  — all past plans
router.get('/history', getMealPlanHistory);

// DELETE /api/mealplan/:id    — delete a specific plan
router.delete('/:id', deleteMealPlan);

export default router;
