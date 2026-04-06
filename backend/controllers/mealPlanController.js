// controllers/mealPlanController.js — Persistent meal plan CRUD
// Replaces the in-memory route handler with MongoDB-backed operations.

import MealPlan from '../models/MealPlan.js';

/**
 * GET /api/mealplan
 * Get the user's active meal plan.
 */
export const getMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const plan = await MealPlan.findOne({ userId, isActive: true }).lean();

    if (!plan) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active meal plan found',
      });
    }

    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('[mealPlanController.getMealPlan] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * POST /api/mealplan
 * Save or replace the user's active meal plan.
 * Deactivates any existing plan before creating the new one.
 */
export const saveMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, preferences, days, totalCalories } = req.body;

    if (!days || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Meal plan must include at least one day with meals',
      });
    }

    // Deactivate any existing active plan
    await MealPlan.updateMany({ userId, isActive: true }, { $set: { isActive: false } });

    // Create new active plan
    const plan = await MealPlan.create({
      userId,
      name: name || 'My Meal Plan',
      preferences: preferences || {},
      days,
      totalCalories: totalCalories || 0,
      isActive: true,
    });

    return res.status(201).json({ success: true, data: plan });
  } catch (error) {
    console.error('[mealPlanController.saveMealPlan] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * DELETE /api/mealplan/:id
 * Delete a specific meal plan.
 */
export const deleteMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const plan = await MealPlan.findOneAndDelete({ _id: req.params.id, userId });

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Meal plan not found' });
    }

    return res.status(200).json({ success: true, data: { message: 'Meal plan deleted' } });
  } catch (error) {
    console.error('[mealPlanController.deleteMealPlan] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * GET /api/mealplan/history
 * Get all meal plans (active + inactive) for history view.
 */
export const getMealPlanHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const plans = await MealPlan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error('[mealPlanController.getMealPlanHistory] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
