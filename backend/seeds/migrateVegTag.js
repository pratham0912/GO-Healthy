// seeds/migrateVegTag.js — One-time migration to tag recipes as veg/non-veg
// Run: node seeds/migrateVegTag.js

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
  image: String,
  emoji: String,
  steps: [String],
  tags: [String],
  isVeg: { type: Boolean, default: true },
}, { timestamps: true });

const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);

// Common non-veg ingredients (case-insensitive match)
const NON_VEG_KEYWORDS = [
  'chicken', 'mutton', 'lamb', 'fish', 'prawn', 'shrimp', 'crab', 'lobster',
  'salmon', 'tuna', 'sardine', 'mackerel', 'pomfret', 'hilsa', 'rohu',
  'egg', 'eggs', 'omelette', 'omelet',
  'pork', 'bacon', 'ham', 'sausage', 'salami', 'pepperoni',
  'beef', 'steak', 'veal',
  'meat', 'keema', 'mince',
  'turkey', 'duck', 'quail',
  'squid', 'octopus', 'oyster', 'mussel', 'clam',
  'anchovy', 'anchovies',
  'gelatin', 'lard',
  'tandoori chicken', 'butter chicken', 'Bison',
];

function isNonVeg(recipe) {
  const searchText = [
    recipe.name || '',
    recipe.description || '',
    ...(Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map(i => typeof i === 'string' ? i : (i?.name || ''))
      : []),
  ].join(' ').toLowerCase();

  return NON_VEG_KEYWORDS.some(keyword => {
    // Word boundary matching to avoid false positives (e.g. "eggplant" != "egg")
    const regex = new RegExp(`\\b${keyword}s?\\b`, 'i');
    return regex.test(searchText);
  });
}

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const recipes = await Recipe.find({});
    console.log(`📦 Found ${recipes.length} recipes`);

    let vegCount = 0, nonVegCount = 0;

    for (const recipe of recipes) {
      const nonVeg = isNonVeg(recipe);
      recipe.isVeg = !nonVeg;
      await recipe.save();
      if (nonVeg) {
        nonVegCount++;
        console.log(`  🔴 Non-Veg: ${recipe.name}`);
      } else {
        vegCount++;
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`  🟢 Veg: ${vegCount}`);
    console.log(`  🔴 Non-Veg: ${nonVegCount}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
