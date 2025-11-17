const express = require('express');
const User = require('../models/User');
const MealPlan = require('../models/MealPlan');

const router = express.Router();

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-demo-key';

function verifyAdminKey(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== ADMIN_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized admin access' });
  }
  return next();
}

function sanitizeUserProfile(userDoc) {
  if (!userDoc) return null;
  const profile = typeof userDoc.getProfile === 'function' ? userDoc.getProfile() : userDoc;
  if (profile._id && profile._id.toString) {
    profile._id = profile._id.toString();
  }
  return profile;
}

function summarizeMealPlan(plan) {
  if (!plan) return null;
  const meals = plan.meals || [];
  return {
    _id: plan._id?.toString() || null,
    date: plan.date,
    targetDailyCalories: plan.targetDailyCalories,
    summary: plan.summary || { totalCalories: 0, protein: 0, carbs: 0, fats: 0 },
    mealsCompleted: meals.filter((meal) => meal.completed).length,
    mealsScheduled: meals.length,
  };
}

function recalculateMealPlan(plan) {
  if (!plan) return;
  const totals = (plan.meals || []).reduce(
    (acc, meal) => {
      acc.totalCalories += meal.calories || 0;
      acc.protein += meal.macronutrients?.protein || 0;
      acc.carbs += meal.macronutrients?.carbs || 0;
      acc.fats += meal.macronutrients?.fats || 0;
      return acc;
    },
    { totalCalories: 0, protein: 0, carbs: 0, fats: 0 },
  );

  plan.summary = {
    totalCalories: Math.round(totals.totalCalories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fats: Math.round(totals.fats),
  };

  if (typeof plan.updateConsumedCalories === 'function') {
    plan.updateConsumedCalories();
  }
}

router.use(verifyAdminKey);

router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    const userIds = users.map((user) => user._id);
    const latestMealPlans = await MealPlan.find({ userId: { $in: userIds } })
      .sort({ date: -1 })
      .lean();

    const latestPlanByUser = {};
    latestMealPlans.forEach((plan) => {
      const key = plan.userId?.toString();
      if (key && !latestPlanByUser[key]) {
        latestPlanByUser[key] = plan;
      }
    });

    const response = users.map((user) => {
      const profile = sanitizeUserProfile(user);
      return {
        ...profile,
        latestMealPlan: summarizeMealPlan(latestPlanByUser[profile._id]),
      };
    });

    res.json({ users: response });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mealPlans = await MealPlan.find({ userId })
      .sort({ date: -1 })
      .limit(10);

    res.json({
      user: sanitizeUserProfile(user),
      mealPlans,
    });
  } catch (error) {
    console.error('Admin user detail error:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const allowedFields = [
      'name',
      'email',
      'age',
      'height',
      'weight',
      'gender',
      'foodStyle',
      'country',
      'region',
      'healthGoals',
      'role',
      'notifications',
      'privacy',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: sanitizeUserProfile(updatedUser),
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await MealPlan.deleteMany({ userId });

    res.json({ message: 'User and related meal plans deleted successfully' });
  } catch (error) {
    console.error('Admin user delete error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

router.put('/users/:userId/meal-plans/:planId/meals/:mealId', async (req, res) => {
  try {
    const { userId, planId, mealId } = req.params;
    const mealPlan = await MealPlan.findOne({ _id: planId, userId });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    const meal = mealPlan.meals.id(mealId);
    if (!meal) {
      return res.status(404).json({ message: 'Meal entry not found' });
    }

    const { name, calories, mealType, ingredients, macronutrients, completed } = req.body;

    if (name !== undefined) meal.name = name;
    if (calories !== undefined) meal.calories = calories;
    if (mealType !== undefined) meal.mealType = mealType;
    if (Array.isArray(ingredients)) meal.ingredients = ingredients;
    if (macronutrients) {
      meal.macronutrients = {
        protein: macronutrients.protein ?? meal.macronutrients?.protein ?? 0,
        carbs: macronutrients.carbs ?? meal.macronutrients?.carbs ?? 0,
        fats: macronutrients.fats ?? meal.macronutrients?.fats ?? 0,
      };
    }
    if (completed !== undefined) {
      meal.completed = completed;
      meal.completedAt = completed ? new Date() : null;
    }

    recalculateMealPlan(mealPlan);
    await mealPlan.save();

    res.json({
      message: 'Meal updated successfully',
      mealPlan,
    });
  } catch (error) {
    console.error('Admin meal update error:', error);
    res.status(500).json({ message: 'Failed to update meal entry' });
  }
});

router.delete('/users/:userId/meal-plans/:planId/meals/:mealId', async (req, res) => {
  try {
    const { userId, planId, mealId } = req.params;
    const mealPlan = await MealPlan.findOne({ _id: planId, userId });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    const meal = mealPlan.meals.id(mealId);
    if (!meal) {
      return res.status(404).json({ message: 'Meal entry not found' });
    }

    meal.deleteOne();
    recalculateMealPlan(mealPlan);
    await mealPlan.save();

    res.json({
      message: 'Meal deleted successfully',
      mealPlan,
    });
  } catch (error) {
    console.error('Admin meal delete error:', error);
    res.status(500).json({ message: 'Failed to delete meal entry' });
  }
});

module.exports = router;

