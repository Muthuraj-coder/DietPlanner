const express = require('express');
const auth = require('../middleware/auth');
const MealPlan = require('../models/MealPlan');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const router = express.Router();

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email sending function
async function sendEmail(to, subject, text) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured, skipping email send');
      return { success: false, message: 'Email not configured' };
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: text.replace(/\n/g, '<br>')
    });
    
    console.log(`Email sent successfully to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send email' };
  }
}

// Function to format meal plan for email
function formatMealPlanForEmail(mealPlan, userProfile) {
  const { name, targetDailyCalories, meals, summary } = mealPlan;
  
  let emailContent = `🍽️ Your Personalized Daily Meal Plan\n\n`;
  emailContent += `Hello ${userProfile.name || 'there'}!\n\n`;
  emailContent += `Here's your customized meal plan for today:\n\n`;
  emailContent += `📊 Daily Target: ${targetDailyCalories} calories\n`;
  emailContent += `🎯 Health Goal: ${userProfile.healthGoals || 'General Health'}\n`;
  emailContent += `🌍 Region: ${userProfile.region || 'Global'} cuisine\n\n`;
  
  emailContent += `═══════════════════════════════════════\n\n`;
  
  meals.forEach((meal, index) => {
    const mealEmojis = {
      breakfast: '🌅',
      lunch: '☀️',
      snack: '🍎',
      dinner: '🌙'
    };
    
    emailContent += `${mealEmojis[meal.mealType] || '🍽️'} ${meal.mealType.toUpperCase()}\n`;
    emailContent += `${meal.name}\n`;
    emailContent += `Calories: ${meal.calories}\n`;
    emailContent += `Protein: ${meal.macronutrients?.protein || 0}g | `;
    emailContent += `Carbs: ${meal.macronutrients?.carbs || 0}g | `;
    emailContent += `Fats: ${meal.macronutrients?.fats || 0}g\n`;
    
    if (meal.ingredients && meal.ingredients.length > 0) {
      emailContent += `Ingredients: ${meal.ingredients.slice(0, 5).join(', ')}`;
      if (meal.ingredients.length > 5) emailContent += '...';
      emailContent += '\n';
    }
    
    if (meal.url) {
      emailContent += `Recipe: ${meal.url}\n`;
    }
    
    emailContent += `\n`;
  });
  
  emailContent += `═══════════════════════════════════════\n\n`;
  emailContent += `📈 Daily Summary:\n`;
  emailContent += `Total Calories: ${summary?.totalCalories || 0}\n`;
  emailContent += `Protein: ${summary?.protein || 0}g\n`;
  emailContent += `Carbs: ${summary?.carbs || 0}g\n`;
  emailContent += `Fats: ${summary?.fats || 0}g\n\n`;
  
  emailContent += `💡 Tips:\n`;
  emailContent += `• Stay hydrated throughout the day\n`;
  emailContent += `• Follow portion sizes as recommended\n`;
  emailContent += `• Complete meals in the app to track progress\n\n`;
  
  emailContent += `Happy eating!\n`;
  emailContent += `The NutriFlow Team 🌱`;
  
  return emailContent;
}

// Utility: estimate maintenance calories using gender-specific Mifflin-St Jeor formula
function estimateMaintenanceCalories({ age, height, weight, gender }) {
  if (!age || !height || !weight) return 2000;
  
  // Mifflin-St Jeor BMR formula with gender-specific constants
  let bmr;
  if (gender === 'male') {
    // Male: BMR = 10 × weight + 6.25 × height – 5 × age + 5
    bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5;
  } else if (gender === 'female') {
    // Female: BMR = 10 × weight + 6.25 × height – 5 × age – 161
    bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 161;
  } else {
    // Fallback for missing gender (use average of male/female constants)
    bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 78;
  }
  
  const activityFactor = 1.4; // light activity default
  const maintenanceCalories = Math.max(1200, Math.round(bmr * activityFactor));
  
  console.log(`BMR Calculation - Gender: ${gender || 'not specified'}, Age: ${age}, Height: ${height}cm, Weight: ${weight}kg`);
  console.log(`BMR: ${Math.round(bmr)}, Maintenance Calories: ${maintenanceCalories}`);
  
  return maintenanceCalories;
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
    const mealKeywords = {
      south: {
        veg: {
          breakfast: [
            "idli", "dosa", "uttapam", "pongal", "upma", "adai", "appam", "paniyaram"
          ],
          lunch: [
            "sambar", "rasam", "curd rice", "vegetable biryani", "avial", "kootu",
            "thoran", "poriyal", "puli kulambu", "lemon rice", "tamarind rice"
          ],
          snack: [
            "murukku", "sundal", "banana bajji", "pakoda", "masala vada", "mangalore bonda"
          ],
          dinner: [
            "chapati with kurma", "vegetable upma", "idiyappam", "vegetable stew",
            "appam with kurma", "vegetable dosa"
          ]
        },
        nonveg: {
          breakfast: [
            "egg dosa", "chicken dosa", "mutton keema dosa", "egg curry with appam"
          ],
          lunch: [
            "chicken chettinad", "mutton biryani", "fish curry", "meen kuzhambu",
            "prawn thokku", "egg curry", "nethili fry"
          ],
          snack: [
            "chicken pakora", "egg puff", "fish cutlet", "chicken samosa"
          ],
          dinner: [
            "chicken stew with appam", "mutton pepper fry", "egg masala with chapati",
            "fish fry with rasam rice"
          ]
        }
      },

      north: {
        veg: {
          breakfast: [
            "aloo paratha", "paneer paratha", "poha", "chole bhature", "thepla",
            "besan chilla", "stuffed puri", "upma"
          ],
          lunch: [
            "rajma chawal", "chole chawal", "dal makhani with rice", "baingan bharta",
            "paneer butter masala", "kadhi chawal", "bhindi masala", "methi paratha"
          ],
          snack: [
            "samosa", "kachori", "pakora", "dahi puri", "golgappa", "bread pakora"
          ],
          dinner: [
            "roti with palak paneer", "paneer tikka masala", "dal tadka with jeera rice",
            "veg pulao", "stuffed capsicum", "aloo gobi"
          ]
        },
        nonveg: {
          breakfast: [
            "egg paratha", "keema paratha", "chicken sandwich", "boiled eggs with toast"
          ],
          lunch: [
            "butter chicken", "mutton rogan josh", "chicken curry with rice", "egg curry",
            "chicken biryani", "mutton korma"
          ],
          snack: [
            "chicken tikka", "seekh kebab", "egg roll", "tandoori momos"
          ],
          dinner: [
            "tandoori chicken", "chicken tikka masala", "mutton kebab", "fish curry with rice"
          ]
        }
      },

      east: {
        veg: {
          breakfast: [
            "luchi aloo dum", "chire doi gur", "pakhala bhata", "sattu paratha"
          ],
          lunch: [
            "shukto", "aloo posto", "dalma", "ghugni", "begun bhaja", "mochar ghonto"
          ],
          snack: [
            "ghugni chaat", "veg chop", "puchka", "telebhaja"
          ],
          dinner: [
            "cholar dal with luchi", "vegetable pulao", "chhana curry with rice"
          ]
        },
        nonveg: {
          breakfast: [
            "egg roll", "chicken momo", "egg chowmein"
          ],
          lunch: [
            "machher jhol", "ilish curry", "mutton curry", "chicken kosha", "prawn malai curry"
          ],
          snack: [
            "fish cutlet", "egg devil", "chicken pakora", "momo with chutney"
          ],
          dinner: [
            "egg curry with rice", "chicken pulao", "fish fry with dal rice"
          ]
        }
      },

      west: {
        veg: {
          breakfast: [
            "dhokla", "khaman", "thepla", "fafda jalebi", "handvo", "upma"
          ],
          lunch: [
            "dal dhokli", "undhiyu", "sev tamatar", "bajra roti with lasun chutney",
            "vegetable kadhi", "stuffed bhindi", "methi thepla with curd"
          ],
          snack: [
            "pav bhaji", "vada pav", "khandvi", "sev puri", "ragda pattice"
          ],
          dinner: [
            "khichdi with kadhi", "vegetable pulao", "masala puri", "veg handi with roti"
          ]
        },
        nonveg: {
          breakfast: [
            "egg bhurji pav", "chicken frankie", "omelette pav"
          ],
          lunch: [
            "chicken handi", "fish curry", "mutton sukka", "egg curry with rice"
          ],
          snack: [
            "chicken frankie roll", "egg puff", "fish fry", "chicken lollipop"
          ],
          dinner: [
            "prawns curry with rice", "chicken kheema pav", "mutton curry with roti"
          ]
        }
      }
    };

    const foodStyleKey = veg ? 'veg' : 'nonveg';
    const regionData = mealKeywords[regionLower];
    if (regionData && regionData[foodStyleKey]) {
      const kws = regionData[foodStyleKey][(mealType || '').toLowerCase()];
      if (kws && kws.length > 0) {
        const keyword = kws[Math.floor(Math.random() * kws.length)];
        return [keyword];
      }
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
    // Check daily generation limit first
    const generationStatus = await MealPlan.checkDailyGenerationLimit(req.user._id);
    if (!generationStatus.canGenerate) {
      return res.status(429).json({ 
        message: 'Daily generation limit reached. You can generate up to 3 meal plans per day.',
        remainingGenerations: generationStatus.remainingGenerations,
        generationCount: generationStatus.generationCount
      });
    }

    const {
      name,
      email,
      accountUser,
      age,
      height,
      weight,
      gender,
      foodStyle,
      country,
      region,
      healthGoals,
      app_id,
      app_key
    } = req.body || {};

    console.log('Meal plan request for:', { name, country, region, foodStyle, age, height, weight, gender, healthGoals });

    const APP_ID = app_id || process.env.EDAMAM_APP_ID;
    const APP_KEY = app_key || process.env.EDAMAM_APP_KEY;
    if (!APP_ID || !APP_KEY) {
      return res.status(400).json({ message: 'Missing Edamam credentials' });
    }

    const maintenance = estimateMaintenanceCalories({ age, height, weight, gender });
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
      user: { name, age, height, weight, gender, foodStyle, country, region, healthGoals },
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
        const existingPlan = await MealPlan.findOne({ userId: req.user._id, date: today });
        
        if (existingPlan) {
          // Update existing plan and increment MANUAL generation count
          existingPlan.targetDailyCalories = targetDaily;
          existingPlan.meals = meals;
          existingPlan.summary = mealPlanData.summary;
          existingPlan.manualGenerationCount = (existingPlan.manualGenerationCount || 0) + 1;
          existingPlan.dailyGenerationCount = (existingPlan.dailyGenerationCount || 0) + 1;
          existingPlan.lastGenerationDate = new Date();
          existingPlan.generatedAt = new Date();
          existingPlan.isAutoGenerated = false; // This is a manual generation
          await existingPlan.save();
        } else {
          // Create new plan (manual generation)
          await MealPlan.create({
            userId: req.user._id,
            date: today,
            targetDailyCalories: targetDaily,
            meals: meals,
            summary: mealPlanData.summary,
            manualGenerationCount: 1,
            dailyGenerationCount: 1,
            lastGenerationDate: new Date(),
            generatedAt: new Date(),
            isAutoGenerated: false
          });
        }
      } catch (dbError) {
        console.error('Error saving meal plan to database:', dbError);
        // Continue without failing the request
      }
    }

    // Send email notification if user has email and notifications enabled
    let emailResult = { success: false, message: 'Email not sent' };
    if (req.user && req.user.email && req.user.notifications?.email !== false) {
      try {
        const formattedMealPlan = formatMealPlanForEmail(mealPlanData, {
          name: req.user.name,
          healthGoals: req.user.healthGoals,
          region: req.user.region
        });
        
        emailResult = await sendEmail(
          req.user.email,
          "Your Daily Meal Plan 🍲",
          formattedMealPlan
        );
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        emailResult = { success: false, message: 'Email failed to send' };
      }
    }

    return res.json({
      ...mealPlanData,
      emailSent: emailResult.success,
      emailMessage: emailResult.message
    });
  } catch (error) {
    console.error('Meal plan generation error:', error);
    res.status(500).json({ message: 'Failed to generate meal plan' });
  }
});

// Get today's meal plan
router.get('/today', auth, async (req, res) => {
  try {
    console.log('=== /today endpoint called ===');
    console.log('User:', { id: req.user._id, name: req.user.name, email: req.user.email });
    console.log('User profile:', { 
      age: req.user.age, 
      height: req.user.height, 
      weight: req.user.weight, 
      gender: req.user.gender,
      country: req.user.country,
      region: req.user.region,
      foodStyle: req.user.foodStyle,
      healthGoals: req.user.healthGoals
    });
    
    const today = MealPlan.getTodayDate();
    console.log('Today date:', today);
    console.log('Today date type:', typeof today);
    
    let mealPlan = await MealPlan.findOne({ userId: req.user._id, date: today });
    console.log('Existing meal plan found:', !!mealPlan);
    if (mealPlan) {
      console.log('Meal plan date:', mealPlan.date);
      console.log('Meal plan meals count:', mealPlan.meals?.length || 0);
    }
    
    if (!mealPlan) {
      // No meal plan for today, generate one automatically using the full API logic
      const user = req.user;
      
      console.log('Auto-generating meal plan for:', { 
        name: user.name, 
        country: user.country, 
        region: user.region, 
        foodStyle: user.foodStyle 
      });

      const APP_ID = process.env.EDAMAM_APP_ID;
      const APP_KEY = process.env.EDAMAM_APP_KEY;
      
      console.log('Edamam credentials check:', { APP_ID: !!APP_ID, APP_KEY: !!APP_KEY });
      
      if (!APP_ID || !APP_KEY) {
        console.error('Missing Edamam credentials for auto-generation');
        return res.status(500).json({ message: 'Missing Edamam credentials' });
      }

      const maintenance = estimateMaintenanceCalories({ 
        age: user.age, 
        height: user.height, 
        weight: user.weight,
        gender: user.gender 
      });
      const targetDaily = targetCaloriesForGoal(maintenance, user.healthGoals);

      const distribution = {
        breakfast: 0.25,
        lunch: 0.35,
        snack: 0.10,
        dinner: 0.30
      };

      function sanitizeUserId(val) {
        if (!val) return null;
        const s = String(val).trim().toLowerCase();
        const slug = s
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_.-]/g, '')
          .replace(/^[_\-.]+|[_\-.]+$/g, '')
          .slice(0, 64);
        return slug || null;
      }

      const accountUserHeader = sanitizeUserId(user.email) || sanitizeUserId(user.name) || 'demo_user';

      async function fetchForMeal(mealType, percent) {
        const perMealTarget = Math.round(targetDaily * percent);
        let q = buildQuery({ 
          country: user.country, 
          region: user.region, 
          foodStyle: user.foodStyle, 
          mealType 
        });
        const kws = regionKeywords(user.country, user.region, user.foodStyle, mealType);
        if (kws.length) {
          const kw = kws[Math.floor(Math.random() * kws.length)];
          q = `${kw} ${q}`.trim();
        }

        const params = new URLSearchParams();
        params.set('type', 'public');
        params.set('q', q);
        params.set('app_id', APP_ID);
        params.set('app_key', APP_KEY);
        params.set('random', 'true');
        ['label','ingredientLines','yield','calories','totalNutrients','image','url','source']
          .forEach(f => params.append('field', f));

        const mealTypeMap = { breakfast: 'Breakfast', lunch: 'Lunch/Dinner', snack: 'Snack', dinner: 'Lunch/Dinner' };
        const mt = mealTypeMap[(mealType || '').toLowerCase()];
        if (mt) params.append('mealType', mt);

        if ((user.foodStyle || '').toLowerCase() === 'veg') params.append('health', 'vegetarian');

        const cuisine = cuisineFromCountry(user.country);
        if (cuisine) params.append('cuisineType', cuisine);

        let url = `https://api.edamam.com/api/recipes/v2?${params.toString()}`;
        let resp = await fetch(url, { 
          headers: { 
            'Edamam-Account-User': accountUserHeader, 
            'Accept': 'application/json' 
          } 
        });
        
        if (!resp.ok) {
          console.error('Edamam API error', resp.status);
          throw new Error('Edamam API error');
        }
        
        let data = await resp.json();
        let hits = filterHitsByCuisine(data.hits, user.country);
        let best = pickBestRecipeByCalories(hits, perMealTarget);
        
        // Fallback 1: if no hits, try a simpler query with regional keywords
        if (!best && kws.length > 0) {
          const p2 = new URLSearchParams();
          p2.set('type', 'public');
          const fallbackKw = kws[0];
          p2.set('q', fallbackKw);
          p2.set('app_id', APP_ID);
          p2.set('app_key', APP_KEY);
          p2.set('random', 'true');
          ['label','ingredientLines','yield','calories','totalNutrients','image','url','source']
            .forEach(f => p2.append('field', f));
          if ((user.foodStyle || '').toLowerCase() === 'veg') p2.append('health', 'vegetarian');
          const cuisine2 = cuisineFromCountry(user.country);
          if (cuisine2) p2.append('cuisineType', cuisine2);

          const simpleUrl = `https://api.edamam.com/api/recipes/v2?${p2.toString()}`;
          const resp2 = await fetch(simpleUrl, { 
            headers: { 
              'Edamam-Account-User': accountUserHeader, 
              'Accept': 'application/json' 
            } 
          });
          if (resp2.ok) {
            const d2 = await resp2.json();
            const hits2 = filterHitsByCuisine(d2.hits, user.country);
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
          if ((user.foodStyle || '').toLowerCase() === 'veg') p3.append('health', 'vegetarian');

          const basicUrl = `https://api.edamam.com/api/recipes/v2?${p3.toString()}`;
          const resp3 = await fetch(basicUrl, { 
            headers: { 
              'Edamam-Account-User': accountUserHeader, 
              'Accept': 'application/json' 
            } 
          });
          if (resp3.ok) {
            const d3 = await resp3.json();
            best = pickBestRecipeByCalories(d3.hits, perMealTarget);
          }
        }
        
        if (!best) {
          // Final fallback with proper meal data
          return {
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
        }
        
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

      // Generate all meals using the proper API
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

      // Create new meal plan with real API data
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
      console.log('Auto-generated meal plan with real recipes:', meals.map(m => m.name));
    }

    // Update consumed calories
    console.log('Updating consumed calories...');
    mealPlan.updateConsumedCalories();
    console.log('Consumed calories updated:', mealPlan.consumedCalories);
    
    console.log('Preparing response...');
    const response = {
      mealPlan,
      consumedCalories: mealPlan.consumedCalories,
      remainingCalories: mealPlan.targetDailyCalories - mealPlan.consumedCalories
    };
    console.log('Sending response with meal plan ID:', mealPlan._id);
    
    res.json(response);
  } catch (error) {
    console.error('=== ERROR in /today endpoint ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('User data:', req.user ? { id: req.user._id, name: req.user.name } : 'No user');
    res.status(500).json({ message: 'Failed to fetch today\'s meal plan', error: error.message });
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

// Check daily generation limit
router.get('/generation-status', auth, async (req, res) => {
  try {
    const status = await MealPlan.checkDailyGenerationLimit(req.user._id);
    res.json(status);
  } catch (error) {
    console.error('Error checking generation status:', error);
    res.status(500).json({ message: 'Failed to check generation status' });
  }
});

module.exports = router;


