const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'snack', 'dinner'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  ingredients: [String],
  calories: {
    type: Number,
    required: true
  },
  macronutrients: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 }
  },
  source: String,
  url: String,
  image: String,
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  targetDailyCalories: {
    type: Number,
    required: true
  },
  meals: [mealSchema],
  summary: {
    totalCalories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 }
  },
  consumedCalories: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
mealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

// Method to calculate consumed calories from completed meals
mealPlanSchema.methods.updateConsumedCalories = function() {
  this.consumedCalories = this.meals
    .filter(meal => meal.completed)
    .reduce((total, meal) => total + meal.calories, 0);
  return this.consumedCalories;
};

// Method to mark meal as completed
mealPlanSchema.methods.completeMeal = function(mealType) {
  const meal = this.meals.find(m => m.mealType === mealType);
  if (meal && !meal.completed) {
    meal.completed = true;
    meal.completedAt = new Date();
    this.updateConsumedCalories();
    return true;
  }
  return false;
};

// Method to get today's date in YYYY-MM-DD format
mealPlanSchema.statics.getTodayDate = function() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

module.exports = mongoose.model('MealPlan', mealPlanSchema);
