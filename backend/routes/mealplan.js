const express = require('express');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const MealPlan = require('../models/MealPlan');

const router = express.Router();

// Utility: estimate maintenance calories (Mifflin-St Jeor without gender constant)
function estimateMaintenanceCalories({ age, height, weight }) {
  if (!age || !height || !weight) return 2000;
  const bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
  const activityFactor = 1.4; // light activity default
  return Math.max(1200, Math.round(bmr * activityFactor));
}

function targetCaloriesForGoal(maintenance, goal) {
  const g = (goal || 'maintenance').toLowerCase();
  if (g === 'weight-loss' || g === 'weightloss') return Math.round(maintenance * 0.85);
  if (g === 'muscle-gain' || g === 'musclegain') return Math.round(maintenance * 1.15);
  return maintenance;
}

function buildQuery({ country, region, foodStyle, mealType }) {
  const parts = [];
  if (country) parts.push(country);
  if (region && region !== 'no-preference') parts.push(region);
  if (mealType) parts.push(mealType);
  if ((foodStyle || '').toLowerCase() === 'veg') parts.push('vegetarian');
  // Fallback to ensure non-empty q
  const q = parts.filter(Boolean).join(' ').trim();
  return q.length > 0 ? q : (mealType || 'healthy');
}

function cuisineFromCountry(country) {
  if (!country) return null;
  const map = {
    india: 'Indian',
    usa: 'American',
    uk: 'British',
    canada: 'American',
    australia: 'Australian',
    germany: 'German',
    france: 'French',
    japan: 'Japanese',
    china: 'Chinese',
    brazil: 'Brazilian',
    mexico: 'Mexican'
  };
  const key = String(country).toLowerCase();
  return map[key] || null;
}

function regionKeywords(country, region, foodStyle, mealType) {
  const veg = (foodStyle || '').toLowerCase() === 'veg';
  const countryLower = String(country || '').toLowerCase();
  const regionLower = String(region || '').toLowerCase();
  
  // India-specific regional keywords
  if (countryLower === 'india') {
    const map = {
      south: veg
        ? {
            breakfast: ['idli', 'dosa', 'upma', 'pongal', 'uttapam'],
            lunch: ['sambar', 'rasam', 'curd rice', 'veg kootu', 'poriyal', 'thoran'],
            snack: ['sundal', 'banana chips', 'murukku'],
            dinner: ['dosa', 'uttapam', 'lemon rice', 'tomato rice']
          }
        : {
            breakfast: ['egg dosa', 'omelette dosa'],
            lunch: ['chicken chettinad', 'mutton curry', 'fish fry', 'egg curry'],
            snack: ['chicken 65', 'egg puffs'],
            dinner: ['chicken curry', 'prawn masala']
          },
      north: veg
        ? { breakfast: ['paratha', 'poha'], lunch: ['dal', 'rajma', 'chole', 'paneer'], snack: ['chaat','dahi puri'], dinner: ['roti', 'dal makhani', 'aloo gobi'] }
        : { breakfast: ['egg paratha'], lunch: ['butter chicken', 'keema'], snack: ['chicken tikka'], dinner: ['roti', 'mutton rogan josh'] },
      east: veg
        ? { breakfast: ['luchi aloo'], lunch: ['khichdi','chorchori','shukto'], snack: ['jhal muri'], dinner: ['veg pulao'] }
        : { breakfast: ['egg roll'], lunch: ['fish curry','prawn malai','ilish'], snack: ['chicken cutlet'], dinner: ['chicken kosha'] },
      west: veg
        ? { breakfast: ['poha', 'dhokla'], lunch: ['undhiyu','dal'], snack: ['thepla','khakra'], dinner: ['pav bhaji'] }
        : { breakfast: ['egg poha'], lunch: ['fish curry','chicken xacuti'], snack: ['prawn balchao'], dinner: ['fish fry'] },
    };
    const table = map[regionLower];
    if (table) {
      const list = table[(mealType || '').toLowerCase()] || [];
      return list.length ? list : (veg ? ['dal', 'sabzi'] : ['chicken curry']);
    }
    return veg ? ['dal', 'sabzi', 'roti'] : ['chicken curry', 'rice'];
  }
  
  // Other countries - return basic keywords
  if (veg) {
    return ['vegetarian', 'healthy', 'plant based'];
  }
  return ['healthy', 'protein'];
}

function pickBestRecipeByCalories(hits, targetPerServing) {
  if (!Array.isArray(hits) || hits.length === 0) return null;
  const scored = hits
    .map(h => {
      const r = h.recipe;
      const servings = r.yield || 1;
      const perServing = r.calories && servings ? r.calories / servings : 0;
      const score = Math.abs(perServing - targetPerServing);
      return { r, servings, perServing, score };
    })
    .sort((a, b) => a.score - b.score);
  return scored[0] || null;
}

function filterHitsByCuisine(hits, country) {
  if (!hits || hits.length === 0) return hits;
  
  const countryLower = String(country || '').toLowerCase();
  
  // For India, prefer Indian cuisine but don't be too strict
  if (countryLower === 'india') {
    const indianHits = hits.filter(h => {
      const ct = (h.recipe && h.recipe.cuisineType) || [];
      return ct.some(x => String(x).toLowerCase().includes('indian'));
    });
    // If we have Indian recipes, return them, otherwise return all
    return indianHits.length > 0 ? indianHits : hits;
  }
  
  // For other countries, return all hits
  return hits;
}

function extractMacrosPerServing(recipe) {
  const yieldServ = recipe.yield || 1;
  const tn = recipe.totalNutrients || {};
  const getQ = (key) => (tn[key] && tn[key].quantity ? tn[key].quantity / yieldServ : 0);
  return {
    protein: Math.round(getQ('PROCNT')),
    carbs: Math.round(getQ('CHOCDF')),
    fats: Math.round(getQ('FAT'))
  };
}

router.post('/generate', auth, async (req, res) => {
  try {
    const {
      name,
      email,
      accountUser,
      age,
      height,
      weight,
      foodStyle,
      country,
      region,
      healthGoals,
      app_id,
      app_key
    } = req.body || {};

    console.log('Meal plan request for:', { name, country, region, foodStyle, age, height, weight, healthGoals });

    const APP_ID = app_id || process.env.EDAMAM_APP_ID;
    const APP_KEY = app_key || process.env.EDAMAM_APP_KEY;
    if (!APP_ID || !APP_KEY) {
      return res.status(400).json({ message: 'Missing Edamam credentials' });
    }

    const maintenance = estimateMaintenanceCalories({ age, height, weight });
    const targetDaily = targetCaloriesForGoal(maintenance, healthGoals);

    const distribution = {
      breakfast: 0.25,
      lunch: 0.35,
      snack: 0.10,
      dinner: 0.30
    };

    function sanitizeUserId(val) {
      if (!val) return null;
      const s = String(val).trim().toLowerCase();
      // Always slugify: drop characters not allowed by Edamam (remove @ and others)
      const slug = s
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_.-]/g, '')
        .replace(/^[_\-.]+|[_\-.]+$/g, '')
        .slice(0, 64);
      return slug || null;
    }

    const accountUserHeader = sanitizeUserId(accountUser) || sanitizeUserId(email) || sanitizeUserId(name) || 'demo_user';

    async function fetchForMeal(mealType, percent) {
      const perMealTarget = Math.round(targetDaily * percent);
      let q = buildQuery({ country, region, foodStyle, mealType });
      const kws = regionKeywords(country, region, foodStyle, mealType);
      if (kws.length) {
        // Prefer a specific regional keyword to bias results
        const kw = kws[Math.floor(Math.random() * kws.length)];
        q = `${kw} ${q}`.trim();
      }

      const params = new URLSearchParams();
      params.set('type', 'public');
      params.set('q', q);
      params.set('app_id', APP_ID);
      params.set('app_key', APP_KEY);
      params.set('random', 'true');
      // limit fields to reduce payload
      ['label','ingredientLines','yield','calories','totalNutrients','image','url','source']
        .forEach(f => params.append('field', f));

      // mealType filter if supported
      const mealTypeMap = { breakfast: 'Breakfast', lunch: 'Lunch/Dinner', snack: 'Snack', dinner: 'Lunch/Dinner' };
      const mt = mealTypeMap[(mealType || '').toLowerCase()];
      if (mt) params.append('mealType', mt);

      // vegetarian health filter
      if ((foodStyle || '').toLowerCase() === 'veg') params.append('health', 'vegetarian');

      // cuisine type if we can infer
      const cuisine = cuisineFromCountry(country);
      if (cuisine) params.append('cuisineType', cuisine);

      let url = `https://api.edamam.com/api/recipes/v2?${params.toString()}`;
      let resp = await fetch(url, { headers: { 'Edamam-Account-User': accountUserHeader, 'Accept': 'application/json' } });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        console.error('Edamam API error', resp.status, text);
        throw new Error('Edamam API error');
      }
      let data = await resp.json();
      let hits = filterHitsByCuisine(data.hits, country);
      let best = pickBestRecipeByCalories(hits, perMealTarget);
      
      // Fallback 1: if no hits, try a simpler query with regional keywords
      if (!best && kws.length > 0) {
        const p2 = new URLSearchParams();
        p2.set('type', 'public');
        const fallbackKw = kws[0]; // Use first regional keyword
        p2.set('q', fallbackKw);
        p2.set('app_id', APP_ID);
        p2.set('app_key', APP_KEY);
        p2.set('random', 'true');
        ['label','ingredientLines','yield','calories','totalNutrients','image','url','source']
          .forEach(f => p2.append('field', f));
        if ((foodStyle || '').toLowerCase() === 'veg') p2.append('health', 'vegetarian');
        const cuisine2 = cuisineFromCountry(country);
        if (cuisine2) p2.append('cuisineType', cuisine2);

        const simpleUrl = `https://api.edamam.com/api/recipes/v2?${p2.toString()}`;
        const resp2 = await fetch(simpleUrl, { headers: { 'Edamam-Account-User': accountUserHeader, 'Accept': 'application/json' } });
        if (resp2.ok) {
          const d2 = await resp2.json();
          const hits2 = filterHitsByCuisine(d2.hits, country);
          best = pickBestRecipeByCalories(hits2, perMealTarget);
        }
      }
      
      // Fallback 2: if still no hits, try very basic query
      if (!best) {
        const p3 = new URLSearchParams();
        p3.set('type', 'public');
        p3.set('q', mealType || 'healthy');
        p3.set('app_id', APP_ID);
        p3.set('app_key', APP_KEY);
        p3.set('random', 'true');
        ['label','ingredientLines','yield','calories','totalNutrients','image','url','source']
          .forEach(f => p3.append('field', f));
        if ((foodStyle || '').toLowerCase() === 'veg') p3.append('health', 'vegetarian');

        const basicUrl = `https://api.edamam.com/api/recipes/v2?${p3.toString()}`;
        const resp3 = await fetch(basicUrl, { headers: { 'Edamam-Account-User': accountUserHeader, 'Accept': 'application/json' } });
        if (resp3.ok) {
          const d3 = await resp3.json();
          best = pickBestRecipeByCalories(d3.hits, perMealTarget);
        }
      }
      if (!best) return null;
      const { r, perServing } = best;
      const macros = extractMacrosPerServing(r);
      return {
        mealType,
        name: r.label,
        ingredients: r.ingredientLines || [],
        calories: Math.round(perServing),
        macronutrients: macros,
        source: r.source,
        url: r.url,
        image: r.image
      };
    }

    const [breakfast, lunch, snack, dinner] = await Promise.all([
      fetchForMeal('breakfast', distribution.breakfast),
      fetchForMeal('lunch', distribution.lunch),
      fetchForMeal('snack', distribution.snack),
      fetchForMeal('dinner', distribution.dinner)
    ]);

    const meals = [breakfast, lunch, snack, dinner].filter(Boolean);
    const totals = meals.reduce(
      (acc, m) => {
        acc.calories += m.calories || 0;
        acc.protein += m.macronutrients?.protein || 0;
        acc.carbs += m.macronutrients?.carbs || 0;
        acc.fats += m.macronutrients?.fats || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const mealPlanData = {
      user: { name, age, height, weight, foodStyle, country, region, healthGoals },
      targetDailyCalories: targetDaily,
      meals,
      summary: {
        totalCalories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fats: Math.round(totals.fats)
      }
    };

    // Store in database if user is authenticated
    if (req.user) {
      try {
        const today = MealPlan.getTodayDate();
        await MealPlan.findOneAndUpdate(
          { userId: req.user._id, date: today },
          {
            targetDailyCalories: targetDaily,
            meals: meals,
            summary: mealPlanData.summary
          },
          { upsert: true, new: true }
        );
      } catch (dbError) {
        console.error('Error saving meal plan to database:', dbError);
        // Continue without failing the request
      }
    }

    return res.json(mealPlanData);
  } catch (error) {
    console.error('Meal plan generation error:', error);
    res.status(500).json({ message: 'Failed to generate meal plan' });
  }
});

// Get today's meal plan
router.get('/today', auth, async (req, res) => {
  try {
    const today = MealPlan.getTodayDate();
    let mealPlan = await MealPlan.findOne({ userId: req.user._id, date: today });
    
    if (!mealPlan) {
      // No meal plan for today, generate one automatically
      const user = req.user;
      const profile = {
        name: user.name,
        email: user.email,
        age: user.age,
        height: user.height,
        weight: user.weight,
        foodStyle: user.foodStyle,
        country: user.country,
        region: user.region,
        healthGoals: user.healthGoals,
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY
      };

      // Generate meal plan (reuse generation logic)
      const maintenance = estimateMaintenanceCalories({ age: user.age, height: user.height, weight: user.weight });
      const targetDaily = targetCaloriesForGoal(maintenance, user.healthGoals);

      const distribution = {
        breakfast: 0.25,
        lunch: 0.35,
        snack: 0.10,
        dinner: 0.30
      };

      const accountUserHeader = user.email?.replace(/[^a-z0-9_.-]/g, '') || 'demo_user';

      // Generate meals (simplified version)
      const meals = [];
      for (const [mealType, percent] of Object.entries(distribution)) {
        const perMealTarget = Math.round(targetDaily * percent);
        const kws = regionKeywords(user.country, user.region, user.foodStyle, mealType);
        
        // Create a basic meal if API fails
        const basicMeal = {
          mealType,
          name: `Healthy ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
          ingredients: ['Nutritious ingredients'],
          calories: perMealTarget,
          macronutrients: {
            protein: Math.round(perMealTarget * 0.2 / 4),
            carbs: Math.round(perMealTarget * 0.5 / 4),
            fats: Math.round(perMealTarget * 0.3 / 9)
          },
          source: 'NutriFlow',
          url: '',
          image: ''
        };
        meals.push(basicMeal);
      }

      const totals = meals.reduce(
        (acc, m) => {
          acc.calories += m.calories || 0;
          acc.protein += m.macronutrients?.protein || 0;
          acc.carbs += m.macronutrients?.carbs || 0;
          acc.fats += m.macronutrients?.fats || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );

      // Create new meal plan
      mealPlan = new MealPlan({
        userId: req.user._id,
        date: today,
        targetDailyCalories: targetDaily,
        meals: meals,
        summary: {
          totalCalories: Math.round(totals.calories),
          protein: Math.round(totals.protein),
          carbs: Math.round(totals.carbs),
          fats: Math.round(totals.fats)
        }
      });

      await mealPlan.save();
    }

    // Update consumed calories
    mealPlan.updateConsumedCalories();
    
    res.json({
      mealPlan,
      consumedCalories: mealPlan.consumedCalories,
      remainingCalories: mealPlan.targetDailyCalories - mealPlan.consumedCalories
    });
  } catch (error) {
    console.error('Error fetching today\'s meal plan:', error);
    res.status(500).json({ message: 'Failed to fetch today\'s meal plan' });
  }
});

// Complete a meal
router.post('/complete-meal', auth, async (req, res) => {
  try {
    const { mealType } = req.body;
    const today = MealPlan.getTodayDate();
    
    const mealPlan = await MealPlan.findOne({ userId: req.user._id, date: today });
    if (!mealPlan) {
      return res.status(404).json({ message: 'No meal plan found for today' });
    }

    const success = mealPlan.completeMeal(mealType);
    if (!success) {
      return res.status(400).json({ message: 'Meal not found or already completed' });
    }

    await mealPlan.save();

    res.json({
      message: 'Meal marked as completed',
      consumedCalories: mealPlan.consumedCalories,
      remainingCalories: mealPlan.targetDailyCalories - mealPlan.consumedCalories,
      mealPlan
    });
  } catch (error) {
    console.error('Error completing meal:', error);
    res.status(500).json({ message: 'Failed to complete meal' });
  }
});

module.exports = router;


