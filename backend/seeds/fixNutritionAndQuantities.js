// seeds/fixNutritionAndQuantities.js — Fix missing carbs, fats & ingredient quantities
// Run: node seeds/fixNutritionAndQuantities.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const recipeSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  ingredients: mongoose.Schema.Types.Mixed,
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  servingSize: String,
  image: String,
  emoji: String,
  steps: [String],
  tags: [String],
  isVeg: Boolean,
  prepTime: String,
  cookTime: String,
  totalServings: Number,
  healthTips: [String],
}, { timestamps: true });

const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);

// ═══════════════════════════════════════════════════════════════
// MACRO ESTIMATION
// ═══════════════════════════════════════════════════════════════

/**
 * Estimate carbs and fats from total calories and protein.
 * Uses standard macro energy values: Protein=4kcal/g, Carbs=4kcal/g, Fat=9kcal/g
 * Splits remaining calories based on category:
 *   - Breakfast: ~60% carbs, ~40% fat
 *   - High-protein: ~45% carbs, ~55% fat
 *   - Desserts: ~65% carbs, ~35% fat
 *   - Default: ~55% carbs, ~45% fat
 */
function estimateMacros(calories, protein, category) {
  const cal = calories || 300;
  const pro = protein || 10;
  const proteinCals = pro * 4;
  const remaining = Math.max(0, cal - proteinCals);

  const splits = {
    'breakfast':        { carbRatio: 0.60, fatRatio: 0.40 },
    'lunch':            { carbRatio: 0.55, fatRatio: 0.45 },
    'dinner':           { carbRatio: 0.50, fatRatio: 0.50 },
    'snacks':           { carbRatio: 0.50, fatRatio: 0.50 },
    'high-protein':     { carbRatio: 0.45, fatRatio: 0.55 },
    'fireless':         { carbRatio: 0.55, fatRatio: 0.45 },
    'healthy-desserts': { carbRatio: 0.65, fatRatio: 0.35 },
    'indian':           { carbRatio: 0.55, fatRatio: 0.45 },
  };

  const { carbRatio, fatRatio } = splits[category] || { carbRatio: 0.55, fatRatio: 0.45 };
  
  return {
    carbs: Math.round((remaining * carbRatio) / 4),
    fats: Math.round((remaining * fatRatio) / 9),
  };
}

// ═══════════════════════════════════════════════════════════════
// INGREDIENT QUANTITY ESTIMATION
// ═══════════════════════════════════════════════════════════════

const QUANTITY_MAP = {
  // ── Grains & Staples ──
  'rice': '1 cup (200g)',
  'basmati rice': '1 cup (200g)',
  'brown rice': '1 cup (200g)',
  'quinoa': '½ cup (90g)',
  'oats': '½ cup (40g)',
  'rolled oats': '½ cup (40g)',
  'flour': '1 cup (120g)',
  'wheat flour': '1 cup (120g)',
  'whole wheat flour': '1 cup (120g)',
  'atta': '1 cup (120g)',
  'besan': '½ cup (60g)',
  'gram flour': '½ cup (60g)',
  'bread': '2 slices',
  'whole wheat bread': '2 slices',
  'sourdough bread': '2 slices',
  'tortilla': '2 pieces',
  'naan': '2 pieces',
  'roti': '2 pieces',
  'pita bread': '2 pieces',
  'pasta': '200g',
  'noodles': '200g',
  'semolina': '½ cup (80g)',
  'rava': '½ cup (80g)',
  'suji': '½ cup (80g)',
  'poha': '2 cups (150g)',
  'sabudana': '1 cup (150g)',
  'corn': '1 cup (160g)',
  'cornflakes': '1 cup (30g)',
  'granola': '¼ cup (30g)',
  'muesli': '½ cup (50g)',

  // ── Proteins ──
  'chicken': '250g',
  'chicken breast': '200g (2 pieces)',
  'chicken thigh': '250g',
  'chicken drumstick': '4 pieces (300g)',
  'fish': '200g (2 fillets)',
  'salmon': '200g (2 fillets)',
  'tuna': '1 can (170g)',
  'prawns': '200g',
  'shrimp': '200g',
  'egg': '2 large',
  'eggs': '2 large',
  'paneer': '200g (1 block)',
  'cottage cheese': '200g',
  'tofu': '200g (1 block)',
  'mutton': '300g',
  'lamb': '300g',
  'turkey': '200g',
  'turkey breast': '200g',

  // ── Dairy ──
  'milk': '1 cup (240ml)',
  'curd': '1 cup (200g)',
  'yogurt': '1 cup (200g)',
  'greek yogurt': '¾ cup (170g)',
  'cream': '¼ cup (60ml)',
  'butter': '1 tbsp (14g)',
  'ghee': '1 tbsp (14g)',
  'cheese': '50g',
  'mozzarella': '50g',
  'parmesan': '2 tbsp (15g)',
  'cream cheese': '2 tbsp (30g)',
  'whipped cream': '¼ cup (60ml)',
  'buttermilk': '1 cup (240ml)',
  'condensed milk': '2 tbsp (30ml)',

  // ── Legumes & Pulses ──
  'dal': '1 cup (200g)',
  'moong dal': '½ cup (100g)',
  'toor dal': '½ cup (100g)',
  'masoor dal': '½ cup (100g)',
  'chana dal': '½ cup (100g)',
  'urad dal': '½ cup (100g)',
  'rajma': '1 cup (180g)',
  'kidney beans': '1 cup (180g)',
  'chickpeas': '1 cup (160g)',
  'chana': '1 cup (160g)',
  'chole': '1 cup (160g)',
  'lentils': '½ cup (100g)',
  'black beans': '1 cup (170g)',
  'sprouts': '1 cup (100g)',
  'moong sprouts': '1 cup (100g)',
  'peas': '½ cup (75g)',
  'green peas': '½ cup (75g)',
  'edamame': '1 cup (150g)',
  'soybean': '½ cup (90g)',

  // ── Vegetables ──
  'onion': '1 medium (150g)',
  'onions': '2 medium (300g)',
  'tomato': '2 medium (200g)',
  'tomatoes': '2 medium (200g)',
  'potato': '2 medium (300g)',
  'potatoes': '2 medium (300g)',
  'sweet potato': '1 large (200g)',
  'carrot': '1 medium (80g)',
  'carrots': '2 medium (160g)',
  'capsicum': '1 medium (120g)',
  'bell pepper': '1 medium (120g)',
  'spinach': '2 cups packed (60g)',
  'palak': '2 cups packed (60g)',
  'methi': '1 cup (30g)',
  'broccoli': '1 cup florets (90g)',
  'cauliflower': '2 cups florets (200g)',
  'cabbage': '2 cups shredded (180g)',
  'corn kernels': '½ cup (80g)',
  'mushroom': '1 cup sliced (70g)',
  'mushrooms': '1 cup sliced (70g)',
  'cucumber': '1 medium (200g)',
  'lettuce': '2 cups (100g)',
  'avocado': '1 medium (150g)',
  'zucchini': '1 medium (200g)',
  'eggplant': '1 medium (250g)',
  'brinjal': '1 medium (250g)',
  'baingan': '1 medium (250g)',
  'beetroot': '1 medium (130g)',
  'radish': '1 cup (120g)',
  'pumpkin': '1 cup cubed (120g)',
  'bottle gourd': '1 cup cubed (120g)',
  'okra': '1 cup (100g)',
  'bhindi': '1 cup (100g)',
  'beans': '1 cup (100g)',
  'french beans': '1 cup (100g)',
  'celery': '2 stalks (100g)',
  'asparagus': '6 spears (90g)',
  'kale': '2 cups (70g)',
  'mixed vegetables': '2 cups (200g)',
  'vegetables': '2 cups (200g)',
  'green beans': '1 cup (100g)',

  // ── Fruits ──
  'banana': '1 medium (120g)',
  'apple': '1 medium (180g)',
  'mango': '1 medium (200g)',
  'strawberries': '1 cup (150g)',
  'blueberries': '½ cup (75g)',
  'berries': '1 cup (150g)',
  'mixed berries': '1 cup (150g)',
  'raspberries': '½ cup (60g)',
  'orange': '1 medium (150g)',
  'lemon': '1 (juice + zest)',
  'lemon juice': '2 tbsp (30ml)',
  'lime': '1 (juice)',
  'lime juice': '1 tbsp (15ml)',
  'pineapple': '1 cup cubed (165g)',
  'grapes': '1 cup (150g)',
  'watermelon': '2 cups cubed (300g)',
  'papaya': '1 cup cubed (140g)',
  'pomegranate': '½ cup seeds (90g)',
  'dates': '4-5 pieces (40g)',
  'raisins': '2 tbsp (20g)',
  'dried fruits': '¼ cup (40g)',
  'coconut': '¼ cup shredded (20g)',
  'desiccated coconut': '2 tbsp (10g)',
  'coconut milk': '½ cup (120ml)',
  'coconut cream': '¼ cup (60ml)',
  'cranberries': '¼ cup (30g)',
  'peach': '1 medium (150g)',
  'peaches': '2 medium (300g)',
  'kiwi': '1 medium (75g)',
  'fig': '2 medium (80g)',
  'figs': '2 medium (80g)',
  'acai': '1 packet (100g)',
  'acai puree': '1 packet (100g)',
  'frozen berries': '1 cup (150g)',
  'frozen banana': '1 medium (120g)',
  'fruit': '1 cup mixed (150g)',

  // ── Nuts & Seeds ──
  'almonds': '10-12 pieces (15g)',
  'cashews': '10-12 pieces (15g)',
  'walnuts': '5-6 halves (15g)',
  'peanuts': '2 tbsp (20g)',
  'pistachios': '15 pieces (15g)',
  'chia seeds': '1 tbsp (12g)',
  'flax seeds': '1 tbsp (10g)',
  'flaxseed': '1 tbsp (10g)',
  'sunflower seeds': '1 tbsp (10g)',
  'pumpkin seeds': '1 tbsp (10g)',
  'sesame seeds': '1 tsp (5g)',
  'hemp seeds': '1 tbsp (10g)',
  'mixed nuts': '¼ cup (30g)',
  'nuts': '¼ cup (30g)',
  'peanut butter': '2 tbsp (32g)',
  'almond butter': '2 tbsp (32g)',
  'almond milk': '1 cup (240ml)',
  'coconut water': '1 cup (240ml)',
  'trail mix': '¼ cup (35g)',
  'makhana': '1 cup (30g)',
  'fox nuts': '1 cup (30g)',

  // ── Oils & Fats ──
  'oil': '2 tbsp (30ml)',
  'olive oil': '1 tbsp (15ml)',
  'coconut oil': '1 tbsp (15ml)',
  'vegetable oil': '2 tbsp (30ml)',
  'mustard oil': '2 tbsp (30ml)',
  'sesame oil': '1 tsp (5ml)',

  // ── Spices & Seasonings ──
  'salt': 'to taste',
  'black pepper': '¼ tsp',
  'pepper': '¼ tsp',
  'turmeric': '½ tsp',
  'turmeric powder': '½ tsp',
  'cumin': '1 tsp',
  'cumin seeds': '1 tsp',
  'jeera': '1 tsp',
  'coriander powder': '1 tsp',
  'coriander': '1 tsp',
  'red chili powder': '½ tsp',
  'chili powder': '½ tsp',
  'chili flakes': '½ tsp',
  'garam masala': '½ tsp',
  'cinnamon': '½ tsp or 1 stick',
  'cinnamon powder': '½ tsp',
  'cardamom': '2-3 pods',
  'cloves': '3-4 pieces',
  'bay leaf': '1-2 leaves',
  'mustard seeds': '1 tsp',
  'fennel seeds': '½ tsp',
  'fenugreek seeds': '½ tsp',
  'asafoetida': 'a pinch',
  'hing': 'a pinch',
  'paprika': '½ tsp',
  'oregano': '½ tsp',
  'basil': '1 tbsp fresh or ½ tsp dried',
  'thyme': '½ tsp',
  'rosemary': '½ tsp',
  'parsley': '1 tbsp chopped',
  'mint': '1 tbsp fresh leaves',
  'mint leaves': '8-10 leaves',
  'curry leaves': '8-10 leaves',
  'curry powder': '1 tsp',
  'soy sauce': '1 tbsp (15ml)',
  'vinegar': '1 tbsp (15ml)',
  'ketchup': '2 tbsp',
  'tomato paste': '2 tbsp',
  'tomato puree': '½ cup (120ml)',
  'tamarind': '1 tbsp paste',
  'ginger': '1 inch piece (10g)',
  'garlic': '3-4 cloves (10g)',
  'ginger-garlic paste': '1 tbsp',
  'green chili': '1-2 pieces',
  'green chilies': '2-3 pieces',
  'fresh coriander': '2 tbsp chopped',
  'cilantro': '2 tbsp chopped',

  // ── Sweeteners ──
  'sugar': '1 tbsp (12g)',
  'honey': '1 tbsp (21g)',
  'maple syrup': '1 tbsp (20ml)',
  'jaggery': '1 tbsp (15g)',
  'stevia': '1 tsp',
  'brown sugar': '1 tbsp (12g)',
  'powdered sugar': '2 tbsp (15g)',
  'agave': '1 tbsp (21g)',

  // ── Baking ──
  'baking powder': '1 tsp',
  'baking soda': '½ tsp',
  'vanilla extract': '1 tsp',
  'vanilla': '1 tsp extract',
  'cocoa powder': '2 tbsp (12g)',
  'dark chocolate': '50g',
  'chocolate chips': '¼ cup (45g)',
  'protein powder': '1 scoop (30g)',
  'whey protein': '1 scoop (30g)',

  // ── Misc ──
  'water': 'as needed',
  'ice': '4-5 cubes',
  'matcha': '1 tsp (2g)',
  'matcha powder': '1 tsp (2g)',
  'green tea': '1 tsp',
  'coffee': '1 tsp instant or 1 shot espresso',
};

function assignQuantity(ingredientName) {
  const name = ingredientName.toLowerCase().trim();
  
  // Direct match
  if (QUANTITY_MAP[name]) return QUANTITY_MAP[name];
  
  // Partial match — check if any key is contained in the ingredient name
  for (const [key, qty] of Object.entries(QUANTITY_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      return qty;
    }
  }
  
  // Smart fallback based on common patterns
  if (name.includes('powder')) return '1 tsp';
  if (name.includes('sauce')) return '1 tbsp (15ml)';
  if (name.includes('paste')) return '1 tbsp';
  if (name.includes('seed')) return '1 tsp (5g)';
  if (name.includes('leaf') || name.includes('leaves')) return '5-6 leaves';
  if (name.includes('juice')) return '2 tbsp (30ml)';
  if (name.includes('extract')) return '1 tsp';
  if (name.includes('dried')) return '1 tbsp';
  if (name.includes('fresh')) return '¼ cup (15g)';
  if (name.includes('frozen')) return '1 cup (150g)';
  if (name.includes('cooked')) return '1 cup (200g)';
  if (name.includes('chopped')) return '½ cup';
  if (name.includes('sliced')) return '½ cup';
  if (name.includes('diced')) return '½ cup';
  if (name.includes('ground')) return '250g';
  if (name.includes('dressing')) return '2 tbsp (30ml)';
  if (name.includes('syrup')) return '1 tbsp (15ml)';
  
  return '½ cup (as needed)';
}

// ═══════════════════════════════════════════════════════════════
// INGREDIENT-LEVEL NUTRITION ESTIMATION
// ═══════════════════════════════════════════════════════════════

const INGREDIENT_NUTRITION = {
  // Proteins
  'chicken': { calories: 165, protein: 31 },
  'chicken breast': { calories: 165, protein: 31 },
  'fish': { calories: 130, protein: 26 },
  'salmon': { calories: 208, protein: 20 },
  'egg': { calories: 155, protein: 13 },
  'eggs': { calories: 155, protein: 13 },
  'paneer': { calories: 265, protein: 18 },
  'tofu': { calories: 76, protein: 8 },
  'mutton': { calories: 250, protein: 25 },
  'prawns': { calories: 99, protein: 24 },
  // Dairy
  'milk': { calories: 60, protein: 3 },
  'yogurt': { calories: 60, protein: 4 },
  'greek yogurt': { calories: 100, protein: 10 },
  'curd': { calories: 60, protein: 4 },
  'cheese': { calories: 110, protein: 7 },
  'butter': { calories: 100, protein: 0 },
  'ghee': { calories: 120, protein: 0 },
  'cream': { calories: 50, protein: 1 },
  // Grains
  'rice': { calories: 130, protein: 3 },
  'oats': { calories: 150, protein: 5 },
  'bread': { calories: 140, protein: 5 },
  'roti': { calories: 120, protein: 3 },
  'quinoa': { calories: 120, protein: 4 },
  'pasta': { calories: 200, protein: 7 },
  // Legumes
  'dal': { calories: 120, protein: 9 },
  'chickpeas': { calories: 160, protein: 9 },
  'rajma': { calories: 120, protein: 9 },
  'lentils': { calories: 115, protein: 9 },
  // Veggies (per serving)
  'onion': { calories: 40, protein: 1 },
  'tomato': { calories: 20, protein: 1 },
  'potato': { calories: 130, protein: 3 },
  'spinach': { calories: 7, protein: 1 },
  'broccoli': { calories: 30, protein: 3 },
  'mushroom': { calories: 15, protein: 2 },
  'capsicum': { calories: 20, protein: 1 },
  'carrot': { calories: 25, protein: 1 },
  'avocado': { calories: 160, protein: 2 },
  'sweet potato': { calories: 115, protein: 2 },
  'corn': { calories: 90, protein: 3 },
  // Fruits
  'banana': { calories: 105, protein: 1 },
  'apple': { calories: 95, protein: 0 },
  'mango': { calories: 100, protein: 1 },
  'berries': { calories: 50, protein: 1 },
  'strawberries': { calories: 50, protein: 1 },
  'blueberries': { calories: 40, protein: 1 },
  'dates': { calories: 70, protein: 1 },
  'coconut': { calories: 70, protein: 1 },
  // Nuts
  'almonds': { calories: 90, protein: 3 },
  'cashews': { calories: 90, protein: 3 },
  'walnuts': { calories: 100, protein: 2 },
  'peanuts': { calories: 80, protein: 4 },
  'peanut butter': { calories: 190, protein: 7 },
  'chia seeds': { calories: 60, protein: 2 },
  // Oils
  'oil': { calories: 120, protein: 0 },
  'olive oil': { calories: 120, protein: 0 },
  // Misc
  'honey': { calories: 60, protein: 0 },
  'sugar': { calories: 50, protein: 0 },
  'protein powder': { calories: 120, protein: 24 },
  'cocoa powder': { calories: 20, protein: 2 },
  'dark chocolate': { calories: 170, protein: 2 },
};

function estimateIngredientNutrition(ingredientName) {
  const name = ingredientName.toLowerCase().trim();
  
  if (INGREDIENT_NUTRITION[name]) return INGREDIENT_NUTRITION[name];
  
  for (const [key, val] of Object.entries(INGREDIENT_NUTRITION)) {
    if (name.includes(key) || key.includes(name)) return val;
  }
  
  // Default for spices and small-quantity items
  if (name.includes('salt') || name.includes('pepper') || name.includes('powder') ||
      name.includes('masala') || name.includes('seeds') || name.includes('leaf')) {
    return { calories: 5, protein: 0 };
  }
  
  return { calories: 30, protein: 1 }; // Generic fallback
}


// ═══════════════════════════════════════════════════════════════
// MIGRATION
// ═══════════════════════════════════════════════════════════════

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const recipes = await Recipe.find({});
    console.log(`📋 Processing ${recipes.length} recipes...\n`);

    let macroFixed = 0;
    let qtyFixed = 0;

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const progress = `[${i + 1}/${recipes.length}]`;
      const updates = {};
      let changed = false;

      // ── Fix carbs & fats ──
      if (!recipe.carbs || recipe.carbs === 0 || !recipe.fats || recipe.fats === 0) {
        const macros = estimateMacros(recipe.calories, recipe.protein, recipe.category);
        updates.carbs = macros.carbs;
        updates.fats = macros.fats;
        macroFixed++;
        changed = true;
      }

      // ── Fix serving size ──
      if (!recipe.servingSize) {
        const servingDefaults = {
          'breakfast': '1 bowl (250g)',
          'lunch': '1 plate (350g)',
          'dinner': '1 plate (300g)',
          'snacks': '1 serving (100g)',
          'high-protein': '1 plate (300g)',
          'fireless': '1 serving (200g)',
          'healthy-desserts': '1 serving (150g)',
          'indian': '1 plate (350g)',
        };
        updates.servingSize = servingDefaults[recipe.category] || '1 serving (250g)';
        changed = true;
      }

      // ── Fix ingredient quantities & per-ingredient nutrition ──
      if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
        let ingredientUpdated = false;
        const updatedIngredients = recipe.ingredients.map(ing => {
          if (typeof ing === 'string') {
            // Convert string ingredient to object
            const nut = estimateIngredientNutrition(ing);
            ingredientUpdated = true;
            return {
              name: ing,
              quantity: assignQuantity(ing),
              calories: nut.calories,
              protein: nut.protein,
            };
          } else {
            const obj = { ...ing };
            if (!obj.quantity || obj.quantity.trim() === '') {
              obj.quantity = assignQuantity(obj.name || '');
              ingredientUpdated = true;
            }
            if (!obj.calories || obj.calories === 0) {
              const nut = estimateIngredientNutrition(obj.name || '');
              obj.calories = nut.calories;
              obj.protein = nut.protein;
              ingredientUpdated = true;
            }
            return obj;
          }
        });

        if (ingredientUpdated) {
          updates.ingredients = updatedIngredients;
          qtyFixed++;
          changed = true;
        }
      }

      if (changed) {
        await Recipe.findByIdAndUpdate(recipe._id, updates);
        console.log(`${progress} ✅ ${recipe.emoji || '🍽️'} ${recipe.name} — macros: ${updates.carbs || recipe.carbs}g C / ${updates.fats || recipe.fats}g F`);
      } else {
        console.log(`${progress} ⏭️ ${recipe.name} — already complete`);
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log(`🎉 Migration complete!`);
    console.log(`   🔢 Macros fixed: ${macroFixed}`);
    console.log(`   📏 Quantities added: ${qtyFixed}`);
    console.log('═══════════════════════════════════════');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
