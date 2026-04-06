import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number,
      default: 0,
    },
    quantity: { type: Number, default: 1 },
    unit: {
      type: String,
      enum: ['serving', 'g', 'oz', 'cup', 'piece'],
      default: 'serving',
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-calculate calories from macros if calories not provided
MealSchema.pre('save', function (next) {
  if (this.isModified('protein') || this.isModified('carbs') || this.isModified('fat')) {
    const macroCalories = Math.round((this.protein * 4) + (this.carbs * 4) + (this.fat * 9));
    if (!this.calories || this.calories === 0) {
      this.calories = macroCalories;
    }
  }
  next();
});

MealSchema.index({ userId: 1, loggedAt: -1 });

export default mongoose.model('Meal', MealSchema);
