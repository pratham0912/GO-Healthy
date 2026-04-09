import Recipe from '../models/Recipe.js';

// GET /api/recipes
export const getRecipes = async (req, res) => {
  try {
    const { search, category, minCalories, maxCalories, minProtein, maxProtein, isVeg } = req.query;

    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (isVeg === 'true') filter.isVeg = true;
    if (minCalories || maxCalories) {
      filter.calories = {};
      if (minCalories) filter.calories.$gte = Number(minCalories);
      if (maxCalories) filter.calories.$lte = Number(maxCalories);
    }
    if (minProtein || maxProtein) {
      filter.protein = {};
      if (minProtein) filter.protein.$gte = Number(minProtein);
      if (maxProtein) filter.protein.$lte = Number(maxProtein);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Exclude beef recipes globally — filter by name AND ingredient names
    const beefExclusion = {
      $and: [
        { name: { $not: /beef/i } },
        { 'ingredients.name': { $not: /beef/i } },
        { description: { $not: /beef/i } },
      ]
    };

    const finalQuery = { ...filter, ...beefExclusion };

    const recipes = await Recipe.find(finalQuery).sort({ name: 1 }).limit(500);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/recipes/:id
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/recipes
export const createRecipe = async (req, res) => {
  try {
    const { name, category, description, ingredients, calories, protein, carbs, fats, servingSize, image, steps, tags } = req.body;
    const recipe = await Recipe.create({
      name, category, description,
      ingredients: typeof ingredients === 'string' ? JSON.parse(ingredients) : (ingredients || []),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
      servingSize: servingSize || '',
      image: req.file ? `/uploads/${req.file.filename}` : (image || ''),
      steps: steps || [],
      tags: tags || [],
    });
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/recipes/:id
export const updateRecipe = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = `/uploads/${req.file.filename}`;
    if (updates.calories) updates.calories = Number(updates.calories);
    if (updates.protein) updates.protein = Number(updates.protein);
    if (updates.carbs) updates.carbs = Number(updates.carbs);
    if (updates.fats) updates.fats = Number(updates.fats);
    if (updates.ingredients && typeof updates.ingredients === 'string') {
      updates.ingredients = JSON.parse(updates.ingredients);
    }

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/recipes/:id/image
export const updateRecipeImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { image: `/uploads/${req.file.filename}` },
      { new: true }
    );
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/recipes/:id
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
