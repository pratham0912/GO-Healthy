// services/geminiService.js — Google Gemini AI Meal Plan Generator
// Uses Gemini 2.0 Flash (free tier) with a static fallback database.

import { GoogleGenAI } from '@google/genai';

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// ═══════════════════════════════════════════════════
// GEMINI AI GENERATION
// ═══════════════════════════════════════════════════

/**
 * Generate a personalized meal plan using Gemini AI.
 * Falls back to static database if AI is unavailable.
 */
export async function generatePersonalizedPlan({
  likes = [],
  dislikes = [],
  allergies = [],
  goal = 'maintenance',
  dietType = 'any',
  calorieTarget = 2000,
  numDays = 7,
}) {
  // Try AI first
  if (ai) {
    try {
      const plan = await callGemini({ likes, dislikes, allergies, goal, dietType, calorieTarget, numDays });
      if (plan && plan.days && plan.days.length > 0) return plan;
    } catch (err) {
      console.error('[GeminiService] AI generation failed, using fallback:', err.message);
    }
  }

  // Fallback to static database
  return generateStaticPlan({ likes, dislikes, allergies, goal, dietType, calorieTarget, numDays });
}

async function callGemini({ likes, dislikes, allergies, goal, dietType, calorieTarget, numDays }) {
  const goalLabels = {
    weightloss: 'Weight Loss (calorie deficit, high protein)',
    bulking: 'Bulking (calorie surplus, balanced macros)',
    muscle: 'Muscle Gain (high protein, moderate surplus)',
    maintenance: 'Maintenance (balanced nutrition)',
  };

  const dietLabels = {
    any: 'No dietary restriction',
    vegetarian: 'Vegetarian (no meat/fish)',
    vegan: 'Vegan (no animal products)',
    keto: 'Keto (very low carb, high fat)',
    highprotein: 'High Protein',
  };

  const prompt = `You are a certified nutritionist creating a personalized ${numDays}-day meal plan.

USER PREFERENCES:
- Foods they LOVE: ${likes.length ? likes.join(', ') : 'No specific preference'}
- Foods they DISLIKE: ${dislikes.length ? dislikes.join(', ') : 'None'}
- Allergies/Restrictions: ${allergies.length ? allergies.join(', ') : 'None'}
- Goal: ${goalLabels[goal] || goalLabels.maintenance}
- Diet Type: ${dietLabels[dietType] || dietLabels.any}
- Daily Calorie Target: ~${calorieTarget} kcal

STRICT RULES:
1. NEVER include any disliked food or allergen — not even as an ingredient
2. NEVER include beef or beef-based dishes in any meal
3. PRIORITIZE liked foods — use them frequently but with variety
4. Never repeat the exact same meal within 3 consecutive days in the same slot
5. Each meal must be realistic, easy to prepare, and common
6. Prefer Indian cuisine unless the preferences suggest otherwise
7. Include a relevant emoji for each meal
8. Distribute calories: Breakfast ~25%, Lunch ~35%, Dinner ~30%, Snack ~10%

Return ONLY valid JSON, no markdown, no backticks, in this exact structure:
{
  "days": [
    {
      "day": "Day 1",
      "meals": [
        { "name": "Meal Name", "category": "breakfast", "calories": 450, "protein": 20, "carbs": 50, "fat": 12, "emoji": "🥣" },
        { "name": "Meal Name", "category": "lunch", "calories": 650, "protein": 30, "carbs": 60, "fat": 20, "emoji": "🍛" },
        { "name": "Meal Name", "category": "dinner", "calories": 550, "protein": 28, "carbs": 45, "fat": 18, "emoji": "🥗" },
        { "name": "Meal Name", "category": "snack", "calories": 200, "protein": 8, "carbs": 20, "fat": 6, "emoji": "🍎" }
      ]
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 4096,
    },
  });

  // Extract text and parse JSON
  let text = response.text || '';

  // Strip markdown code fences if present
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  const parsed = JSON.parse(text);

  // Validate structure
  if (!parsed.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
    throw new Error('Invalid AI response structure — missing days array');
  }

  // Validate each day has meals
  for (const day of parsed.days) {
    if (!day.meals || !Array.isArray(day.meals) || day.meals.length === 0) {
      throw new Error(`Invalid AI response — ${day.day} has no meals`);
    }
    // Ensure numeric fields
    for (const meal of day.meals) {
      meal.calories = Number(meal.calories) || 0;
      meal.protein = Number(meal.protein) || 0;
      meal.carbs = Number(meal.carbs) || 0;
      meal.fat = Number(meal.fat) || 0;
      meal.category = meal.category || 'snack';
      meal.emoji = meal.emoji || '🍽️';
    }
  }

  return parsed;
}

// ═══════════════════════════════════════════════════
// STATIC FALLBACK DATABASE
// ═══════════════════════════════════════════════════

const MEAL_DB = {
  breakfast: {
    any: [
      { name: 'Oats with Banana & Honey', calories: 350, protein: 12, carbs: 55, fat: 8, emoji: '🥣' },
      { name: 'Egg Bhurji with Toast', calories: 380, protein: 22, carbs: 30, fat: 16, emoji: '🍳' },
      { name: 'Poha with Peanuts', calories: 300, protein: 8, carbs: 45, fat: 10, emoji: '🥜' },
      { name: 'Idli Sambar', calories: 280, protein: 10, carbs: 48, fat: 4, emoji: '🫓' },
      { name: 'Moong Dal Chilla', calories: 250, protein: 15, carbs: 30, fat: 6, emoji: '🥞' },
      { name: 'Upma with Vegetables', calories: 320, protein: 9, carbs: 50, fat: 8, emoji: '🍲' },
      { name: 'Greek Yogurt Parfait', calories: 300, protein: 18, carbs: 35, fat: 10, emoji: '🥛' },
      { name: 'Masala Dosa', calories: 370, protein: 8, carbs: 55, fat: 12, emoji: '🫓' },
      { name: 'Sprouts Salad Bowl', calories: 250, protein: 14, carbs: 30, fat: 6, emoji: '🥗' },
      { name: 'Peanut Butter Smoothie', calories: 380, protein: 20, carbs: 40, fat: 14, emoji: '🥤' },
    ],
    vegetarian: [
      { name: 'Paneer Paratha', calories: 420, protein: 16, carbs: 45, fat: 18, emoji: '🫓' },
      { name: 'Besan Chilla', calories: 280, protein: 14, carbs: 28, fat: 10, emoji: '🥞' },
      { name: 'Sabudana Khichdi', calories: 350, protein: 6, carbs: 55, fat: 12, emoji: '🍚' },
      { name: 'Rava Dosa', calories: 300, protein: 8, carbs: 45, fat: 10, emoji: '🫓' },
      { name: 'Fruit & Nut Oatmeal', calories: 380, protein: 12, carbs: 55, fat: 12, emoji: '🥣' },
    ],
  },
  lunch: {
    any: [
      { name: 'Chicken Rice Bowl', calories: 550, protein: 35, carbs: 60, fat: 14, emoji: '🍗' },
      { name: 'Rajma Chawal', calories: 480, protein: 18, carbs: 70, fat: 8, emoji: '🍛' },
      { name: 'Paneer Butter Masala + Roti', calories: 520, protein: 22, carbs: 48, fat: 24, emoji: '🧈' },
      { name: 'Dal Tadka + Rice', calories: 450, protein: 16, carbs: 65, fat: 10, emoji: '🍚' },
      { name: 'Grilled Fish + Salad', calories: 420, protein: 38, carbs: 20, fat: 18, emoji: '🐟' },
      { name: 'Chole + Bhature', calories: 580, protein: 16, carbs: 65, fat: 22, emoji: '🍛' },
      { name: 'Egg Curry + Rice', calories: 490, protein: 24, carbs: 55, fat: 16, emoji: '🥚' },
      { name: 'Quinoa Veggie Bowl', calories: 400, protein: 14, carbs: 52, fat: 12, emoji: '🥗' },
      { name: 'Chicken Biryani', calories: 600, protein: 32, carbs: 65, fat: 18, emoji: '🍚' },
      { name: 'Mixed Veg Pulao', calories: 380, protein: 10, carbs: 60, fat: 8, emoji: '🍲' },
    ],
    vegetarian: [
      { name: 'Palak Paneer + Naan', calories: 520, protein: 20, carbs: 48, fat: 22, emoji: '🧀' },
      { name: 'Aloo Gobi + Roti', calories: 400, protein: 10, carbs: 55, fat: 14, emoji: '🥔' },
      { name: 'Sambar Rice', calories: 420, protein: 14, carbs: 65, fat: 8, emoji: '🍛' },
      { name: 'Stuffed Capsicum + Rice', calories: 380, protein: 12, carbs: 52, fat: 12, emoji: '🫑' },
      { name: 'Kadhi Chawal', calories: 440, protein: 12, carbs: 60, fat: 14, emoji: '🍚' },
    ],
  },
  dinner: {
    any: [
      { name: 'Grilled Chicken Salad', calories: 380, protein: 35, carbs: 15, fat: 18, emoji: '🥗' },
      { name: 'Dal Khichdi', calories: 350, protein: 14, carbs: 50, fat: 8, emoji: '🍲' },
      { name: 'Paneer Tikka + Salad', calories: 400, protein: 24, carbs: 18, fat: 22, emoji: '🧀' },
      { name: 'Fish Curry + Rice', calories: 450, protein: 30, carbs: 45, fat: 14, emoji: '🐟' },
      { name: 'Vegetable Soup + Bread', calories: 280, protein: 8, carbs: 38, fat: 8, emoji: '🍜' },
      { name: 'Tandoori Roti + Sabzi', calories: 350, protein: 12, carbs: 48, fat: 10, emoji: '🫓' },
      { name: 'Egg Fried Rice', calories: 420, protein: 18, carbs: 55, fat: 14, emoji: '🍳' },
      { name: 'Mushroom Stir Fry + Chapati', calories: 340, protein: 12, carbs: 40, fat: 12, emoji: '🍄' },
      { name: 'Chicken Tikka + Raita', calories: 380, protein: 32, carbs: 12, fat: 20, emoji: '🍗' },
      { name: 'Tofu Bhurji + Roti', calories: 320, protein: 18, carbs: 30, fat: 14, emoji: '🫘' },
    ],
    vegetarian: [
      { name: 'Methi Thepla + Curd', calories: 350, protein: 10, carbs: 48, fat: 12, emoji: '🫓' },
      { name: 'Baingan Bharta + Roti', calories: 320, protein: 8, carbs: 40, fat: 14, emoji: '🍆' },
      { name: 'Spinach Soup + Garlic Bread', calories: 280, protein: 10, carbs: 35, fat: 10, emoji: '🍜' },
      { name: 'Paneer Bhurji + Chapati', calories: 400, protein: 22, carbs: 35, fat: 18, emoji: '🧀' },
      { name: 'Mixed Dal + Jeera Rice', calories: 380, protein: 16, carbs: 55, fat: 8, emoji: '🍚' },
    ],
  },
  snack: {
    any: [
      { name: 'Mixed Nuts & Seeds', calories: 200, protein: 8, carbs: 10, fat: 16, emoji: '🥜' },
      { name: 'Banana Peanut Butter', calories: 250, protein: 8, carbs: 30, fat: 12, emoji: '🍌' },
      { name: 'Roasted Chana', calories: 150, protein: 10, carbs: 22, fat: 3, emoji: '🫘' },
      { name: 'Fruit Chaat', calories: 120, protein: 2, carbs: 28, fat: 1, emoji: '🍎' },
      { name: 'Protein Shake', calories: 200, protein: 25, carbs: 15, fat: 4, emoji: '🥤' },
      { name: 'Makhana (Fox Nuts)', calories: 130, protein: 4, carbs: 20, fat: 2, emoji: '🌰' },
      { name: 'Boiled Eggs', calories: 140, protein: 12, carbs: 1, fat: 10, emoji: '🥚' },
      { name: 'Dark Chocolate & Almonds', calories: 180, protein: 4, carbs: 18, fat: 12, emoji: '🍫' },
      { name: 'Sprout Bhel', calories: 160, protein: 8, carbs: 24, fat: 4, emoji: '🌱' },
      { name: 'Yogurt with Berries', calories: 150, protein: 10, carbs: 20, fat: 4, emoji: '🫐' },
    ],
    vegetarian: [
      { name: 'Paneer Tikka Bites', calories: 180, protein: 12, carbs: 8, fat: 12, emoji: '🧀' },
      { name: 'Dhokla', calories: 160, protein: 6, carbs: 28, fat: 3, emoji: '🟡' },
      { name: 'Masala Buttermilk', calories: 80, protein: 3, carbs: 8, fat: 2, emoji: '🥛' },
    ],
  },
};

function generateStaticPlan({ likes, dislikes, allergies, goal, dietType, calorieTarget, numDays }) {
  const dayLabels = Array.from({ length: numDays }, (_, i) => `Day ${i + 1}`);
  const categories = ['breakfast', 'lunch', 'dinner', 'snack'];

  // Calorie splits per goal
  const splits = {
    weightloss:   { breakfast: 0.25, lunch: 0.30, dinner: 0.25, snack: 0.20 },
    bulking:      { breakfast: 0.25, lunch: 0.30, dinner: 0.30, snack: 0.15 },
    muscle:       { breakfast: 0.25, lunch: 0.30, dinner: 0.30, snack: 0.15 },
    maintenance:  { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack: 0.10 },
  };
  const split = splits[goal] || splits.maintenance;

  const likesLower = likes.map(l => l.toLowerCase());
  const dislikesLower = dislikes.map(d => d.toLowerCase());
  const allergiesLower = allergies.map(a => a.toLowerCase());

  function getMeals(category) {
    const dietKey = (dietType === 'vegetarian' || dietType === 'vegan') ? 'vegetarian' : 'any';
    const pool = [
      ...(MEAL_DB[category][dietKey] || []),
      ...(dietKey !== 'any' ? [] : []),
    ];

    // Filter out dislikes and allergies
    return pool.filter(meal => {
      const nameLower = meal.name.toLowerCase();
      const hasDislike = dislikesLower.some(d => nameLower.includes(d));
      const hasAllergen = allergiesLower.some(a => nameLower.includes(a));
      return !hasDislike && !hasAllergen;
    });
  }

  // Score meals: liked foods get priority
  function scoreMeal(meal) {
    const nameLower = meal.name.toLowerCase();
    return likesLower.some(l => nameLower.includes(l)) ? 10 : 1;
  }

  function pickMeal(pool, usedRecently) {
    // Filter out recently used
    let available = pool.filter(m => !usedRecently.includes(m.name));
    if (available.length === 0) available = pool; // reset if all used

    // Weighted random selection — prefer liked foods
    const weighted = [];
    for (const meal of available) {
      const score = scoreMeal(meal);
      for (let i = 0; i < score; i++) weighted.push(meal);
    }
    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  // Generate plan
  const recentlyUsed = { breakfast: [], lunch: [], dinner: [], snack: [] };
  const days = dayLabels.map(day => {
    const meals = categories.map(cat => {
      const pool = getMeals(cat);
      if (pool.length === 0) {
        return { name: 'Healthy Meal', category: cat, calories: Math.round(calorieTarget * split[cat]), protein: 20, carbs: 40, fat: 10, emoji: '🍽️' };
      }
      const meal = pickMeal(pool, recentlyUsed[cat]);

      // Track recently used (keep last 3)
      recentlyUsed[cat].push(meal.name);
      if (recentlyUsed[cat].length > 3) recentlyUsed[cat].shift();

      // Scale calories to match target
      const targetCal = Math.round(calorieTarget * split[cat]);
      const scale = targetCal / (meal.calories || 400);
      return {
        ...meal,
        calories: targetCal,
        protein: Math.round((meal.protein || 15) * scale),
        carbs: Math.round((meal.carbs || 40) * scale),
        fat: Math.round((meal.fat || 10) * scale),
      };
    });

    return { day, meals };
  });

  return { days };
}

export default { generatePersonalizedPlan };
