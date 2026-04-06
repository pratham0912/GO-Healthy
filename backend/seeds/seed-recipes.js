/**
 * seed-recipes.js — Import all api_2 recipe data into MongoDB
 *
 * Usage:  node seeds/seed-recipes.js
 * Run from the backend/ directory.
 *
 * This script:
 *  1. Connects to MongoDB
 *  2. Reads all 8 category data files from api_2
 *  3. Clears existing recipes in the database
 *  4. Inserts 300+ recipes with proper category tags
 *  5. Copies uploaded images from api_2/uploads to backend/uploads
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// ESM shims
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import Recipe model
import Recipe from '../models/Recipe.js';

// ── Paths ────────────────────────────────────────────────────
const API2_DATA_DIR = path.join(__dirname, '..', '..', 'api_2', 'api_2', 'data');
const API2_UPLOADS_DIR = path.join(__dirname, '..', '..', 'api_2', 'api_2', 'uploads');
const BACKEND_UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// ── Category files to import ─────────────────────────────────
const CATEGORIES = [
  { file: 'high-protein',      category: 'high-protein' },
  { file: 'breakfast',         category: 'breakfast' },
  { file: 'lunch',             category: 'lunch' },
  { file: 'dinner',            category: 'dinner' },
  { file: 'snacks',            category: 'snacks' },
  { file: 'fireless',          category: 'fireless' },
  { file: 'healthy-desserts',  category: 'healthy-desserts' },
  { file: 'indian',            category: 'indian' },
];

// ── Copy uploaded images ─────────────────────────────────────
function copyUploads() {
  if (!fs.existsSync(API2_UPLOADS_DIR)) {
    console.log('⚠️  No api_2 uploads directory found, skipping image copy.');
    return 0;
  }

  if (!fs.existsSync(BACKEND_UPLOADS_DIR)) {
    fs.mkdirSync(BACKEND_UPLOADS_DIR, { recursive: true });
  }

  const files = fs.readdirSync(API2_UPLOADS_DIR);
  let copied = 0;

  for (const file of files) {
    const src = path.join(API2_UPLOADS_DIR, file);
    const dest = path.join(BACKEND_UPLOADS_DIR, file);

    // Skip if already exists
    if (fs.existsSync(dest)) continue;

    try {
      fs.copyFileSync(src, dest);
      copied++;
    } catch (err) {
      console.warn(`  ⚠️  Failed to copy ${file}: ${err.message}`);
    }
  }

  return copied;
}

// ── Load image overrides ─────────────────────────────────────
function loadImageOverrides() {
  const overridesFile = path.join(__dirname, '..', '..', 'api_2', 'api_2', 'image-overrides.json');
  try {
    if (fs.existsSync(overridesFile)) {
      const data = JSON.parse(fs.readFileSync(overridesFile, 'utf8'));
      console.log(`🖼️  Loaded ${Object.keys(data).length} image overrides`);
      return data;
    }
  } catch (e) {
    console.warn('⚠️  Could not load image overrides:', e.message);
  }
  return {};
}

// ── Main seed function ───────────────────────────────────────
async function seed() {
  console.log('\n🌱 Starting Recipe Seed...\n');

  // Connect to MongoDB
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gohealthy';
  await mongoose.connect(uri);
  console.log(`✅ Connected to MongoDB: ${uri}\n`);

  // Copy uploaded images first
  console.log('📁 Copying uploaded images...');
  const copiedCount = copyUploads();
  console.log(`   Copied ${copiedCount} new images to backend/uploads/\n`);

  // Load image overrides
  const imageOverrides = loadImageOverrides();

  // Load all recipe data
  let allRecipes = [];

  for (const { file, category } of CATEGORIES) {
    const filePath = path.join(API2_DATA_DIR, `${file}.js`);
    try {
      const data = require(filePath);
      const recipes = data.map(r => {
        // Check for image override
        const key = `${(r.name || '').trim().toLowerCase()}::${category}`;
        const overriddenImage = imageOverrides[key];

        return {
          name: r.name,
          category,
          description: r.description || '',
          ingredients: r.ingredients || [],   // string arrays from api_2
          calories: r.calories || 0,
          protein: r.protein || 0,
          image: overriddenImage || r.image || '',
        };
      });
      allRecipes.push(...recipes);
      console.log(`  📦 ${category}: ${recipes.length} recipes`);
    } catch (err) {
      console.warn(`  ⚠️  Could not load ${file}.js: ${err.message}`);
    }
  }

  console.log(`\n📊 Total recipes to seed: ${allRecipes.length}\n`);

  // Clear existing recipes
  const deleted = await Recipe.deleteMany({});
  console.log(`🗑️  Cleared ${deleted.deletedCount} existing recipes`);

  // Insert all recipes
  const inserted = await Recipe.insertMany(allRecipes);
  console.log(`✅ Inserted ${inserted.length} recipes into MongoDB\n`);

  // Summary by category
  for (const { category } of CATEGORIES) {
    const count = inserted.filter(r => r.category === category).length;
    console.log(`   ${category}: ${count}`);
  }

  await mongoose.disconnect();
  console.log('\n🎉 Seed complete! MongoDB disconnected.\n');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
