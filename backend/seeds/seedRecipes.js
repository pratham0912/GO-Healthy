// seeds/seedRecipes.js — seeds all api_2 recipe data into MongoDB
// Run: node seeds/seedRecipes.js

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically build Recipe schema inline to avoid ESM circular issues
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

const DATA_DIR = path.join(__dirname, '../../api_2/data');

const categoryFiles = [
  { file: 'breakfast',       category: 'breakfast'       },
  { file: 'lunch',           category: 'lunch'           },
  { file: 'dinner',          category: 'dinner'          },
  { file: 'snacks',          category: 'snacks'          },
  { file: 'high-protein',    category: 'high-protein'    },
  { file: 'fireless',        category: 'fireless'        },
  { file: 'healthy-desserts',category: 'healthy-desserts'},
  { file: 'indian',          category: 'indian'          },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Load image overrides map: "recipe_name::category" → "/uploads/filename"
    const overridesPath = path.join(DATA_DIR, '../image-overrides.json');
    let imageOverrides = {};
    try {
      imageOverrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
      console.log(`🖼️  Loaded ${Object.keys(imageOverrides).length} image overrides`);
    } catch (e) {
      console.warn('⚠️  Could not load image-overrides.json:', e.message);
    }

    // Same key format as api_2: "name::category"
    const getKey = (name, category) =>
      `${(name || '').trim().toLowerCase()}::${(category || '').trim().toLowerCase()}`;

    // Clear existing recipes
    await Recipe.deleteMany({});
    console.log('🗑️  Cleared existing recipes');

    let totalInserted = 0;

    for (const { file, category } of categoryFiles) {
      const filePath = path.join(DATA_DIR, file);
      let items;
      try {
        items = require(filePath);
      } catch (e) {
        console.warn(`⚠️  Skipping ${file}: ${e.message}`);
        continue;
      }

      const docs = items.map(r => {
        // Override image takes priority over the Unsplash placeholder in the data file
        const key = getKey(r.name, category);
        const image = imageOverrides[key] || r.image || '';

        return {
          name: r.name,
          category,
          description: r.description || '',
          calories: r.calories || 0,
          protein: r.protein || 0,
          carbs: r.carbs || 0,
          fats: r.fats || r.fat || 0,
          servingSize: r.servingSize || '',
          image,
          emoji: r.emoji || '',
          steps: r.steps || [],
          tags: r.tags || [],
          prepTime: r.prepTime || '',
          cookTime: r.cookTime || '',
          totalServings: r.totalServings || 2,
          healthTips: r.healthTips || [],
          ingredients: Array.isArray(r.ingredients)
            ? r.ingredients.map(ing => {
                if (typeof ing === 'string') {
                  return { name: ing, quantity: '', calories: 0, protein: 0 };
                }
                return {
                  name: ing.name || ing,
                  quantity: ing.quantity || '',
                  calories: ing.calories || 0,
                  protein: ing.protein || 0,
                };
              })
            : [],
        };
      });

      await Recipe.insertMany(docs);
      const overrideCount = docs.filter(d => d.image.startsWith('/uploads')).length;
      console.log(`  ✅ Inserted ${docs.length} ${category} recipes (${overrideCount} with custom images)`);
      totalInserted += docs.length;
    }

    console.log(`\n🎉 Seeding complete — ${totalInserted} total recipes inserted.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}


seed();
