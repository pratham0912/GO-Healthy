// services/calorieService.js — Calorie calculation from macronutrients
// Standard formula: (protein × 4) + (carbs × 4) + (fat × 9)

/**
 * Calculate total calories from macro breakdown.
 * @param {{ protein?: number, carbs?: number, fat?: number }} macros
 * @returns {number} Rounded calorie count
 */
export function calculateCalories({ protein = 0, carbs = 0, fat = 0 }) {
  return Math.round((protein * 4) + (carbs * 4) + (fat * 9));
}

/**
 * Calculate BMI from height (cm) and weight (kg).
 * @param {number} heightCm
 * @param {number} weightKg
 * @returns {{ bmi: number, category: string }}
 */
export function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return { bmi: null, category: 'unknown' };
  }

  const heightM = heightCm / 100;
  const bmi = +(weightKg / (heightM * heightM)).toFixed(1);

  let category;
  if (bmi < 16)        category = 'Severely Underweight';
  else if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25)   category = 'Normal';
  else if (bmi < 30)   category = 'Overweight';
  else if (bmi < 35)   category = 'Obese (Class I)';
  else                 category = 'Obese (Class II+)';

  return { bmi, category };
}

/**
 * Optional: Look up nutrition info from Open Food Facts.
 * Returns null on failure — caller should fall back to manual entry.
 */
export async function lookupNutrition(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=1`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.products || data.products.length === 0) return null;

    const p = data.products[0].nutriments || {};
    return {
      name: data.products[0].product_name || query,
      calories: Math.round(p['energy-kcal_100g'] || 0),
      protein:  Math.round(p.proteins_100g || 0),
      carbs:    Math.round(p.carbohydrates_100g || 0),
      fat:      Math.round(p.fat_100g || 0),
      per:      '100g',
    };
  } catch {
    return null;
  }
}
