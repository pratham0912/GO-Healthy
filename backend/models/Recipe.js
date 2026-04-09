import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'high-protein', 'fireless', 'healthy-desserts', 'indian'],
  },
  description: { type: String, default: '' },
  // Accepts both string arrays ["Chicken", "Rice"] and object arrays [{name, quantity, calories, protein}]
  ingredients: { type: [mongoose.Schema.Types.Mixed], default: [] },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  servingSize: { type: String, default: '' },
  image: { type: String, default: '' },
  emoji: { type: String, default: '' },
  steps: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  isVeg: { type: Boolean, default: true },
}, { timestamps: true });

// Full-text search index
recipeSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Recipe', recipeSchema);
