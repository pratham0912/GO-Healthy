import Meal from '../models/Meal.js';
import { calculateCalories } from '../services/calorieService.js';

export const logMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, mealType, calories, protein, carbs, fat, quantity, unit, loggedAt } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Meal name is required' });
    }

    // If calories not provided, auto-calc from macros via service
    let finalCalories = calories;
    if ((!finalCalories || finalCalories === 0) && (protein || carbs || fat)) {
      finalCalories = calculateCalories({ protein: protein || 0, carbs: carbs || 0, fat: fat || 0 });
    }

    const meal = await Meal.create({
      userId,
      name,
      mealType: mealType || 'snack',
      calories: finalCalories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      quantity: quantity || 1,
      unit: unit || 'serving',
      loggedAt: loggedAt || Date.now(),
    });

    res.status(201).json({ success: true, data: meal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/meals?date=YYYY-MM-DD
 * Get meals for a specific date. Defaults to today if no date provided.
 */
export const getMealsByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    let startOfDay, endOfDay;

    if (req.query.date) {
      startOfDay = new Date(req.query.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      endOfDay = new Date(req.query.date);
      endOfDay.setUTCHours(23, 59, 59, 999);
    } else {
      startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
    }

    const meals = await Meal.find({
      userId,
      loggedAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ loggedAt: -1 });

    const macroTotals = meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.status(200).json({ success: true, data: { meals, macroTotals } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTodayMeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId,
      loggedAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ loggedAt: -1 });

    const macroTotals = meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.status(200).json({ success: true, data: { meals, macroTotals } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getWeeklySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      userId,
      loggedAt: { $gte: sevenDaysAgo }
    });

    const summaryMap = {};
    for (let i = 0; i < 7; i++) {
       const d = new Date(sevenDaysAgo);
       d.setDate(d.getDate() + i);
       summaryMap[d.toISOString().split('T')[0]] = 0;
    }

    meals.forEach(meal => {
       const dateStr = new Date(meal.loggedAt).toISOString().split('T')[0];
       if (summaryMap[dateStr] !== undefined) {
           summaryMap[dateStr] += meal.calories;
       }
    });

    const summary = Object.keys(summaryMap).map(date => ({
      date,
      totalCalories: summaryMap[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId });
    if (!meal) return res.status(404).json({ success: false, error: 'Meal not found' });
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
