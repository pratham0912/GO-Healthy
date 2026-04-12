// seeds/addRecipeSteps.js — Generate detailed cooking instructions for all recipes
// Uses intelligent template-based generation from recipe ingredients & category
// Run: node seeds/addRecipeSteps.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// ─── Recipe Schema (inline to avoid ESM issues) ──────
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
// INTELLIGENT STEP GENERATOR
// Uses recipe name, category, and ingredients to produce
// realistic, practical cooking instructions
// ═══════════════════════════════════════════════════════════════

function getIngredientNames(recipe) {
  return (recipe.ingredients || [])
    .map(ing => typeof ing === 'string' ? ing : (ing.name || ''))
    .filter(Boolean)
    .map(n => n.toLowerCase().trim());
}

function getIngredientDisplay(recipe) {
  return (recipe.ingredients || [])
    .map(ing => {
      if (typeof ing === 'string') return ing;
      const name = ing.name || '';
      const qty = ing.quantity || '';
      return qty ? `${qty} ${name}` : name;
    })
    .filter(Boolean);
}

// ─── Detect cooking method from recipe name ──────────
function detectCookingMethod(name) {
  const n = name.toLowerCase();
  if (n.includes('grilled') || n.includes('grill')) return 'grill';
  if (n.includes('baked') || n.includes('bake')) return 'bake';
  if (n.includes('fried') || n.includes('fry') || n.includes('stir-fry') || n.includes('stir fry')) return 'fry';
  if (n.includes('roast') || n.includes('roasted')) return 'roast';
  if (n.includes('steam') || n.includes('steamed')) return 'steam';
  if (n.includes('boil') || n.includes('boiled')) return 'boil';
  if (n.includes('sauté') || n.includes('saute') || n.includes('sautéed')) return 'saute';
  if (n.includes('soup') || n.includes('stew') || n.includes('curry')) return 'simmer';
  if (n.includes('smoothie') || n.includes('shake') || n.includes('lassi')) return 'blend';
  if (n.includes('salad') || n.includes('raita') || n.includes('chaat')) return 'assemble';
  if (n.includes('sandwich') || n.includes('wrap') || n.includes('roll')) return 'assemble';
  if (n.includes('overnight') || n.includes('no-bake') || n.includes('no bake')) return 'nocook';
  if (n.includes('toast')) return 'toast';
  if (n.includes('pancake') || n.includes('crepe') || n.includes('chilla') || n.includes('dosa') || n.includes('cheela')) return 'pan';
  if (n.includes('roti') || n.includes('paratha') || n.includes('naan') || n.includes('chapati') || n.includes('thepla')) return 'flatbread';
  if (n.includes('rice') || n.includes('pulao') || n.includes('biryani') || n.includes('khichdi')) return 'rice';
  if (n.includes('dal') || n.includes('lentil')) return 'simmer';
  if (n.includes('tikka') || n.includes('tandoori') || n.includes('kebab')) return 'grill';
  if (n.includes('cake') || n.includes('muffin') || n.includes('brownie') || n.includes('cookie')) return 'bake';
  if (n.includes('pudding') || n.includes('kheer') || n.includes('halwa')) return 'simmer';
  return 'cook';
}

// ─── Detect key ingredient category ──────────────────
function detectProteinType(ings) {
  const all = ings.join(' ').toLowerCase();
  if (all.includes('chicken')) return 'chicken';
  if (all.includes('fish') || all.includes('salmon') || all.includes('tuna') || all.includes('prawns') || all.includes('shrimp')) return 'fish';
  if (all.includes('egg')) return 'egg';
  if (all.includes('paneer') || all.includes('cottage cheese')) return 'paneer';
  if (all.includes('tofu')) return 'tofu';
  if (all.includes('mutton') || all.includes('lamb')) return 'mutton';
  if (all.includes('turkey')) return 'turkey';
  if (all.includes('dal') || all.includes('lentil') || all.includes('moong') || all.includes('chana') || all.includes('rajma') || all.includes('chickpea')) return 'legume';
  if (all.includes('soy') || all.includes('tempeh')) return 'soy';
  if (all.includes('mushroom')) return 'mushroom';
  return 'other';
}

// ─── Time estimates by category and method ───────────
function estimateTimes(category, method) {
  const times = {
    breakfast: { prep: '10 mins', cook: '15 mins' },
    lunch: { prep: '15 mins', cook: '25 mins' },
    dinner: { prep: '15 mins', cook: '30 mins' },
    snacks: { prep: '10 mins', cook: '10 mins' },
    'high-protein': { prep: '15 mins', cook: '20 mins' },
    fireless: { prep: '15 mins', cook: '0 mins' },
    'healthy-desserts': { prep: '15 mins', cook: '20 mins' },
    indian: { prep: '15 mins', cook: '25 mins' },
  };

  const methodOverrides = {
    blend: { prep: '5 mins', cook: '0 mins' },
    assemble: { prep: '10 mins', cook: '0 mins' },
    nocook: { prep: '10 mins', cook: '0 mins' },
    toast: { prep: '5 mins', cook: '5 mins' },
    pan: { prep: '10 mins', cook: '15 mins' },
    bake: { prep: '15 mins', cook: '25 mins' },
    simmer: { prep: '10 mins', cook: '30 mins' },
    rice: { prep: '10 mins', cook: '20 mins' },
    flatbread: { prep: '15 mins', cook: '15 mins' },
    grill: { prep: '20 mins', cook: '15 mins' },
    roast: { prep: '15 mins', cook: '30 mins' },
  };

  if (methodOverrides[method]) return methodOverrides[method];
  return times[category] || { prep: '10 mins', cook: '20 mins' };
}

// ─── Health tips by category ─────────────────────────
function generateHealthTips(recipe, method, proteinType) {
  const tips = [];
  const n = recipe.name.toLowerCase();
  const cat = recipe.category;
  const isVeg = recipe.isVeg !== false;

  // Category-specific tips
  if (cat === 'breakfast') {
    tips.push('Having a protein-rich breakfast keeps you full longer and reduces mid-morning cravings.');
    tips.push('Pair with a glass of warm water and lemon to kickstart your metabolism.');
  } else if (cat === 'lunch') {
    tips.push('Include a variety of colorful vegetables to maximize your micronutrient intake.');
    tips.push('Eating slowly and mindfully during lunch helps with better digestion and portion control.');
  } else if (cat === 'dinner') {
    tips.push('Try to eat dinner at least 2-3 hours before bedtime for better digestion.');
    tips.push('Keep dinner lighter compared to lunch — your body needs less energy at night.');
  } else if (cat === 'snacks') {
    tips.push('Choose protein-rich snacks over sugary options to maintain steady energy levels.');
    tips.push('Mindful snacking = portion control. Pre-portion your servings before eating.');
  } else if (cat === 'high-protein') {
    tips.push('Spreading protein intake across meals (25-40g per meal) optimizes muscle synthesis.');
    tips.push('Combine with a source of fiber for sustained energy and satiety.');
  } else if (cat === 'fireless') {
    tips.push('No-cook recipes preserve heat-sensitive vitamins like vitamin C and B vitamins.');
    tips.push('Perfect for hot weather when you want nutritious food without heating up the kitchen.');
  } else if (cat === 'healthy-desserts') {
    tips.push('Use natural sweeteners like honey, dates, or stevia instead of refined sugar.');
    tips.push('Adding nuts and seeds to desserts increases protein and healthy fat content.');
  } else if (cat === 'indian') {
    tips.push('Indian spices like turmeric, cumin, and coriander have powerful anti-inflammatory properties.');
    tips.push('Use cold-pressed oils like coconut or mustard oil for added health benefits.');
  }

  // Protein-specific tips
  if (proteinType === 'chicken') {
    tips.push('Opt for skinless chicken breast for a leaner, lower-fat protein source.');
  } else if (proteinType === 'fish') {
    tips.push('Fatty fish like salmon provide essential omega-3 fatty acids for heart and brain health.');
  } else if (proteinType === 'egg') {
    tips.push('Whole eggs provide complete protein plus choline for brain health — don\'t skip the yolk!');
  } else if (proteinType === 'paneer') {
    tips.push('For a lower-fat option, try using low-fat paneer or replace with extra-firm tofu.');
  } else if (proteinType === 'legume') {
    tips.push('Legumes are excellent for plant-based protein and fiber — great for gut health.');
  }

  // Method-specific tips
  if (method === 'fry') {
    tips.push('For a healthier version, try air-frying or shallow pan-frying with minimal oil.');
  } else if (method === 'grill') {
    tips.push('Grilling keeps the recipe low-fat while adding a delicious smoky flavor.');
  }

  return tips.slice(0, 3); // Max 3 tips per recipe
}

// ═══════════════════════════════════════════════════════════════
// STEP GENERATION ENGINE
// ═══════════════════════════════════════════════════════════════

function generateSteps(recipe) {
  const name = recipe.name;
  const nameLower = name.toLowerCase();
  const ings = getIngredientNames(recipe);
  const ingDisplay = getIngredientDisplay(recipe);
  const method = detectCookingMethod(name);
  const proteinType = detectProteinType(ings);
  const isVeg = recipe.isVeg !== false;

  // Separate ingredient types
  const veggies = ings.filter(i => 
    i.includes('onion') || i.includes('tomato') || i.includes('pepper') || i.includes('carrot') ||
    i.includes('potato') || i.includes('spinach') || i.includes('broccoli') || i.includes('cauliflower') ||
    i.includes('capsicum') || i.includes('peas') || i.includes('beans') || i.includes('corn') ||
    i.includes('mushroom') || i.includes('cabbage') || i.includes('cucumber') || i.includes('lettuce') ||
    i.includes('zucchini') || i.includes('eggplant') || i.includes('brinjal') || i.includes('gourd') ||
    i.includes('beetroot') || i.includes('radish') || i.includes('palak') || i.includes('methi')
  );

  const spices = ings.filter(i =>
    i.includes('salt') || i.includes('pepper') || i.includes('turmeric') || i.includes('cumin') ||
    i.includes('coriander') || i.includes('chili') || i.includes('garam masala') || i.includes('paprika') ||
    i.includes('cinnamon') || i.includes('ginger') || i.includes('garlic') || i.includes('oregano') ||
    i.includes('basil') || i.includes('thyme') || i.includes('bay leaf') || i.includes('clove') ||
    i.includes('cardamom') || i.includes('mustard seed') || i.includes('fennel')
  );

  const steps = [];

  // ─── Pre-step: Preparation ───
  if (ingDisplay.length > 0) {
    if (veggies.length > 0) {
      steps.push(`Wash and prepare all your ingredients. ${veggies.length > 2 ? 'Finely chop ' + veggies.slice(0, 3).join(', ') + ' and set aside.' : 'Chop the vegetables as needed and set aside.'}`);
    } else {
      steps.push(`Gather and measure all your ingredients: ${ingDisplay.slice(0, 4).join(', ')}${ingDisplay.length > 4 ? ', and remaining items' : ''}.`);
    }
  } else {
    steps.push(`Gather all the ingredients needed for ${name}. Measure them out and keep everything within reach.`);
  }

  // ─── Method-specific cooking steps ───
  switch (method) {
    case 'blend':
      steps.push(`Add all the main ingredients into a blender or food processor.`);
      steps.push(`Blend on high speed for 1-2 minutes until you get a smooth, creamy consistency. Add a splash of water or milk if needed to adjust thickness.`);
      steps.push(`Pour into a serving glass or bowl. Taste and adjust sweetness if needed.`);
      steps.push(`Garnish with your choice of toppings — fresh fruits, nuts, seeds, or a drizzle of honey work great.`);
      break;

    case 'assemble':
      steps.push(`Prepare the base: arrange the main ingredients on a serving plate or in a bowl.`);
      steps.push(`Layer the remaining ingredients on top, distributing them evenly for the best taste in every bite.`);
      if (spices.length > 0) {
        steps.push(`Season with ${spices.slice(0, 3).join(', ')} and any dressing or seasoning. Toss gently to combine.`);
      } else {
        steps.push(`Season with salt, pepper, and any dressing of your choice. Toss gently to combine everything well.`);
      }
      steps.push(`Serve immediately while fresh. Garnish with herbs or a squeeze of lemon for extra flavor.`);
      break;

    case 'nocook':
      steps.push(`In a clean jar or bowl, combine the base ingredients together.`);
      steps.push(`Mix well, ensuring everything is evenly combined. Add liquid (milk, yogurt, or water) as specified.`);
      steps.push(`Cover tightly and refrigerate overnight (at least 6-8 hours) for the best texture and flavor.`);
      steps.push(`In the morning, give it a good stir. Add toppings like fresh fruits, nuts, or seeds before serving.`);
      steps.push(`Enjoy cold, straight from the fridge. Can be stored for up to 2 days.`);
      break;

    case 'toast':
      steps.push(`Toast the bread slices in a toaster or on a hot pan until golden brown and crispy on both sides.`);
      steps.push(`While the bread is toasting, prepare the topping. ${proteinType === 'egg' ? 'Cook the eggs to your preferred style (scrambled, poached, or fried).' : 'Mix and prepare your topping ingredients.'}`);
      steps.push(`Spread the prepared topping evenly over the warm toast. Press gently so it adheres well.`);
      steps.push(`Add any final toppings, a drizzle of seasoning, and serve immediately while warm and crispy.`);
      break;

    case 'pan':
      steps.push(`In a mixing bowl, prepare the batter by combining the dry and wet ingredients. Mix until smooth with no lumps. Let it rest for 5 minutes.`);
      steps.push(`Heat a non-stick pan or tawa over medium heat. Lightly grease with a few drops of oil or butter.`);
      steps.push(`Pour a ladleful of batter onto the center of the pan. Spread it in a circular motion to form an even round.`);
      steps.push(`Cook on medium heat for 2-3 minutes until the bottom turns golden. Flip carefully and cook the other side for 1-2 minutes.`);
      steps.push(`Remove from pan and serve hot with your favorite chutney, dip, or accompaniment.`);
      break;

    case 'flatbread':
      steps.push(`In a large bowl, combine the flour with salt and any spices. Add water gradually, kneading into a smooth, soft dough. Cover and rest for 15-20 minutes.`);
      steps.push(`Divide the dough into equal portions and roll each into a ball. Dust with dry flour and roll out into thin, even circles on a flat surface.`);
      steps.push(`Heat a tawa or flat pan over medium-high heat. Place the rolled dough on the hot tawa.`);
      steps.push(`Cook for 1-2 minutes until bubbles appear, then flip. Apply a thin layer of ghee or oil. Press gently with a cloth to puff up evenly.`);
      steps.push(`Remove when both sides have golden-brown spots. Serve hot with curry, dal, or raita.`);
      break;

    case 'rice':
      steps.push(`Wash the rice thoroughly under running water until the water runs clear (about 2-3 rinses). Soak for 15-20 minutes, then drain.`);
      if (veggies.length > 0 || proteinType !== 'other') {
        steps.push(`Heat oil or ghee in a heavy-bottomed pot. Add whole spices and let them splutter. Sauté ${veggies.length > 0 ? veggies.slice(0, 2).join(', ') : 'onions and aromatics'} until golden.`);
        steps.push(`Add the ${proteinType !== 'other' ? proteinType : 'remaining ingredients'} and cook for 3-4 minutes until well combined with the spices.`);
      } else {
        steps.push(`Heat oil or ghee in a heavy-bottomed pot. Add whole spices (cumin, bay leaf, cardamom) and let them splutter for 30 seconds.`);
      }
      steps.push(`Add the drained rice and stir gently to coat with the spices. Add water in a 1:2 ratio (rice:water). Bring to a boil.`);
      steps.push(`Reduce heat to the lowest setting, cover with a tight-fitting lid, and cook for 15-18 minutes. Do not open the lid during cooking.`);
      steps.push(`Turn off the heat and let it rest covered for 5 minutes. Fluff gently with a fork and serve hot, garnished with fresh herbs.`);
      break;

    case 'fry':
      steps.push(`Heat 2-3 tablespoons of oil in a deep pan or wok over medium-high heat. The oil should be hot but not smoking.`);
      if (proteinType !== 'other' && proteinType !== 'legume') {
        steps.push(`Season the ${proteinType} with spices and marinate for at least 10 minutes (longer for deeper flavor).`);
        steps.push(`Add the marinated ${proteinType} to the hot oil. Cook without stirring for 2-3 minutes to get a nice sear, then flip.`);
      } else {
        steps.push(`Add the aromatics (onion, ginger, garlic) to the hot oil. Sauté for 1-2 minutes until fragrant.`);
        steps.push(`Add the main ingredients and stir-fry on high heat for 3-4 minutes, tossing frequently for even cooking.`);
      }
      if (veggies.length > 0) {
        steps.push(`Add the chopped vegetables and stir-fry for another 2-3 minutes until they're cooked but still have a slight crunch.`);
      }
      steps.push(`Season with salt, pepper, and any remaining spices. Toss well and cook for 1 final minute.`);
      steps.push(`Remove from heat and serve hot. Garnish with fresh herbs, sesame seeds, or a squeeze of lime.`);
      break;

    case 'grill':
      steps.push(`Prepare the marinade by mixing together all the spices, yogurt or oil, and seasonings in a bowl.`);
      steps.push(`Coat the ${proteinType !== 'other' ? proteinType : 'main ingredient'} evenly with the marinade. Cover and refrigerate for at least 30 minutes (or up to 4 hours for best results).`);
      steps.push(`Preheat your grill, oven, or grill pan to medium-high heat (around 200°C / 400°F). Lightly oil the grill surface.`);
      steps.push(`Place the marinated pieces on the grill. Cook for 6-8 minutes per side, turning once, until charred and cooked through.`);
      steps.push(`Let it rest for 2-3 minutes after cooking. Serve hot with mint chutney, lemon wedges, and fresh onion rings.`);
      break;

    case 'bake':
      steps.push(`Preheat your oven to 180°C (350°F). Line a baking tray or dish with parchment paper or grease lightly.`);
      steps.push(`In a mixing bowl, combine the dry ingredients together. In another bowl, whisk the wet ingredients until well blended.`);
      steps.push(`Gradually fold the wet ingredients into the dry mixture. Mix gently until just combined — do not overmix.`);
      steps.push(`Pour or arrange the mixture in the prepared baking dish. Spread evenly for uniform cooking.`);
      steps.push(`Bake in the preheated oven for 20-25 minutes, or until golden on top and a toothpick inserted in the center comes out clean.`);
      steps.push(`Let it cool in the pan for 5 minutes before serving. Enjoy warm or at room temperature.`);
      break;

    case 'roast':
      steps.push(`Preheat your oven to 200°C (400°F). Line a baking sheet with parchment paper.`);
      steps.push(`Toss the main ingredients with olive oil, salt, pepper, and your choice of herbs and spices until evenly coated.`);
      steps.push(`Spread everything in a single layer on the baking sheet — avoid overcrowding for best results.`);
      steps.push(`Roast for 25-30 minutes, flipping halfway through, until golden brown and tender on the inside.`);
      steps.push(`Remove from oven and let cool slightly. Serve warm with a side salad or dipping sauce.`);
      break;

    case 'steam':
      steps.push(`Prepare the steamer: fill the base pot with water and bring to a rolling boil. Grease the steamer plate lightly.`);
      steps.push(`Prepare the mixture or arrange the ingredients in the steamer tray, leaving space between pieces for steam circulation.`);
      steps.push(`Place the tray in the steamer, cover tightly, and steam for 15-20 minutes over medium heat.`);
      steps.push(`Check for doneness — the food should be cooked through but still moist. Remove carefully using tongs.`);
      steps.push(`Let it cool for 2 minutes, then serve with your favorite chutney or dipping sauce.`);
      break;

    case 'boil':
      steps.push(`Bring a pot of water to a rolling boil. Add a pinch of salt.`);
      steps.push(`Add the main ingredients to the boiling water. Cook for the recommended time until tender.`);
      steps.push(`Drain well and set aside. Season immediately while still hot for the best flavor absorption.`);
      steps.push(`Prepare any topping, dressing, or accompaniment while the main ingredient is cooking.`);
      steps.push(`Combine everything together, adjust seasoning to taste, and serve hot.`);
      break;

    case 'saute':
      steps.push(`Heat 1-2 tablespoons of oil or butter in a wide pan over medium heat.`);
      steps.push(`Add the aromatics (garlic, onion, ginger) and sauté for 1-2 minutes until fragrant and lightly golden.`);
      steps.push(`Add the main ingredients and cook, stirring occasionally, for 5-7 minutes until tender and well-cooked.`);
      steps.push(`Season with salt, pepper, and your choice of herbs or spices. Toss well to combine.`);
      steps.push(`Serve hot, garnished with fresh herbs or a squeeze of lemon juice.`);
      break;

    case 'simmer':
      steps.push(`Heat oil or ghee in a deep pot or pressure cooker over medium heat. Add whole spices and let them crackle.`);
      if (veggies.length > 0) {
        steps.push(`Add chopped onions and sauté until golden brown (5-6 minutes). Then add ${veggies.filter(v => v !== 'onion').slice(0, 2).join(', ') || 'tomatoes'} and cook until soft.`);
      } else {
        steps.push(`Add chopped onions and sauté until golden brown (5-6 minutes). Add tomatoes and cook until they break down into a paste.`);
      }
      steps.push(`Add all the powdered spices (turmeric, chili, coriander) and sauté for 1 minute until fragrant. Splash a little water to prevent burning.`);
      steps.push(`Add the main ingredient along with enough water. Bring to a boil, then reduce heat and simmer for 20-25 minutes (or 3-4 whistles in a pressure cooker).`);
      steps.push(`Check seasoning, adjust salt and spice levels. Add a squeeze of lemon and fresh coriander.`);
      steps.push(`Serve hot with rice, roti, or naan.`);
      break;

    default: // 'cook' — generic cooking steps
      steps.push(`Heat oil in a pan over medium heat. Add aromatics like onion, garlic, or ginger if using, and cook until fragrant.`);
      steps.push(`Add the main ingredients and cook on medium heat, stirring occasionally, for 5-7 minutes.`);
      if (spices.length > 0) {
        steps.push(`Add the seasonings: ${spices.slice(0, 3).join(', ')}. Mix well to coat everything evenly.`);
      } else {
        steps.push(`Season with salt, pepper, and your preferred spices. Mix well to coat everything evenly.`);
      }
      steps.push(`Continue cooking until the ingredients are tender and flavors have melded together, about 10-15 minutes total.`);
      steps.push(`Taste and adjust the seasoning. Serve hot, garnished with fresh herbs or a squeeze of lemon.`);
      break;
  }

  return steps;
}

// ─── Servings estimate ──────────────────────────────
function estimateServings(category) {
  const servingsMap = {
    breakfast: 2,
    lunch: 2,
    dinner: 2,
    snacks: 4,
    'high-protein': 2,
    fireless: 2,
    'healthy-desserts': 4,
    indian: 3,
  };
  return servingsMap[category] || 2;
}


// ═══════════════════════════════════════════════════════════════
// MIGRATION
// ═══════════════════════════════════════════════════════════════

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find recipes with fewer than 3 steps
    const recipes = await Recipe.find({
      $or: [
        { steps: { $exists: false } },
        { steps: { $size: 0 } },
        { steps: { $size: 1 } },
        { steps: { $size: 2 } },
      ]
    });

    console.log(`📋 Found ${recipes.length} recipes needing detailed instructions\n`);

    if (recipes.length === 0) {
      console.log('✅ All recipes already have detailed instructions!');
      await mongoose.disconnect();
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const progress = `[${i + 1}/${recipes.length}]`;

      try {
        const method = detectCookingMethod(recipe.name);
        const proteinType = detectProteinType(getIngredientNames(recipe));
        const steps = generateSteps(recipe);
        const times = estimateTimes(recipe.category, method);
        const servings = estimateServings(recipe.category);
        const healthTips = generateHealthTips(recipe, method, proteinType);

        await Recipe.findByIdAndUpdate(recipe._id, {
          steps,
          prepTime: times.prep,
          cookTime: times.cook,
          totalServings: servings,
          healthTips,
        });

        console.log(`${progress} ✅ ${recipe.emoji || '🍽️'} ${recipe.name} → ${steps.length} steps | ${times.prep} prep | ${times.cook} cook`);
        successCount++;

      } catch (err) {
        console.error(`${progress} ❌ Failed for "${recipe.name}": ${err.message}`);
        failCount++;
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log(`🎉 Migration complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed:  ${failCount}`);
    console.log('═══════════════════════════════════════');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
