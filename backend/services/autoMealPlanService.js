const User = require('../models/User');
const MealPlan = require('../models/MealPlan');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// Setup email transporter with better error handling for production
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,    // 5 seconds
  socketTimeout: 10000,     // 10 seconds
  tls: {
    rejectUnauthorized: false
  }
});

// Email sending function with better error handling
async function sendEmail(to, subject, text) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email credentials not configured, skipping email send');
      return { success: false, message: 'Email not configured' };
    }

    // Add timeout wrapper
    const emailPromise = transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: text.replace(/\n/g, '<br>')
    });

    // Set 15 second timeout for email sending
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout after 15 seconds')), 15000)
    );

    await Promise.race([emailPromise, timeoutPromise]);
    
    console.log(`✅ Email sent successfully to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    if (error.message.includes('timeout')) {
      console.error('⏰ Email timeout - continuing without email');
    } else {
      console.error('❌ Error sending email:', error.message);
    }
    return { success: false, message: 'Failed to send email', error: error.message };
  }
}

// Function to format meal plan for email
function formatMealPlanForEmail(mealPlan, userProfile) {
  const { targetDailyCalories, meals, summary } = mealPlan;
  
  let emailContent = `🍽️ Your Daily Meal Plan (Auto-Generated)\n\n`;
  emailContent += `Hello ${userProfile.name || 'there'}!\n\n`;
  emailContent += `Here's your automatically generated meal plan for today:\n\n`;
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
  
  emailContent += `🤖 This meal plan was automatically generated for you!\n`;
  emailContent += `💡 Tips:\n`;
  emailContent += `• Stay hydrated throughout the day\n`;
  emailContent += `• Follow portion sizes as recommended\n`;
  emailContent += `• Complete meals in the app to track progress\n`;
  emailContent += `• You can still generate up to 3 custom plans today\n\n`;
  
  emailContent += `Happy eating!\n`;
  emailContent += `The NutriFlow Team 🌱`;
  
  return emailContent;
}

// Utility: estimate maintenance calories using gender-specific Mifflin-St Jeor formula
function estimateMaintenanceCalories({ age, height, weight, gender }) {
  if (!age || !height || !weight) return 2000;
  
  let bmr;
  if (gender === 'male') {
    bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5;
  } else if (gender === 'female') {
    bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 161;
  } else {
    // Default calculation if gender not specified
    bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 78;
  }
  
  const activityMultiplier = 1.4; // Lightly active
  return Math.round(bmr * activityMultiplier);
}

// Fallback meals when API fails
const fallbackMeals = {
  breakfast: [
    { name: "Oatmeal with Fruits", calories: 350, protein: 12, carbs: 65, fats: 8 },
    { name: "Scrambled Eggs with Toast", calories: 400, protein: 20, carbs: 35, fats: 18 },
    { name: "Greek Yogurt with Granola", calories: 320, protein: 15, carbs: 45, fats: 10 }
  ],
  lunch: [
    { name: "Grilled Chicken Salad", calories: 450, protein: 35, carbs: 25, fats: 22 },
    { name: "Vegetable Rice Bowl", calories: 420, protein: 12, carbs: 75, fats: 8 },
    { name: "Lentil Curry with Rice", calories: 480, protein: 18, carbs: 78, fats: 12 }
  ],
  snack: [
    { name: "Mixed Nuts", calories: 200, protein: 6, carbs: 8, fats: 18 },
    { name: "Apple with Peanut Butter", calories: 180, protein: 4, carbs: 25, fats: 8 },
    { name: "Greek Yogurt", calories: 150, protein: 15, carbs: 12, fats: 5 }
  ],
  dinner: [
    { name: "Grilled Fish with Vegetables", calories: 380, protein: 30, carbs: 20, fats: 18 },
    { name: "Chicken Stir Fry", calories: 420, protein: 28, carbs: 35, fats: 16 },
    { name: "Vegetable Pasta", calories: 400, protein: 12, carbs: 70, fats: 10 }
  ]
};

// Function to search recipes from Edamam API (Updated to v2)
async function searchRecipes(query, calories, excluded = []) {
  const edamam = {
    app_id: process.env.EDAMAM_APP_ID,
    app_key: process.env.EDAMAM_APP_KEY
  };

  // Updated to Recipe Search API v2
  const excludedQuery = excluded.length > 0 ? `&excluded=${excluded.join(',')}` : '';
  const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&app_id=${edamam.app_id}&app_key=${edamam.app_key}&calories=${calories-100}-${calories+100}&random=true${excludedQuery}`;
  
  try {
    console.log(`🔍 Searching recipes: ${query} (${calories-100}-${calories+100} cal)`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Edamam API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`✅ Found ${data.hits?.length || 0} recipes for: ${query}`);
    return data.hits || [];
  } catch (error) {
    console.error('❌ Edamam API error:', error);
    return [];
  }
}

// Function to get fallback meal when API fails
function getFallbackMeal(mealType, targetCalories) {
  const meals = fallbackMeals[mealType] || fallbackMeals.lunch;
  const randomMeal = meals[Math.floor(Math.random() * meals.length)];
  
  console.log(`🔄 Using fallback meal for ${mealType}: ${randomMeal.name}`);
  
  return {
    recipe: {
      label: randomMeal.name,
      calories: randomMeal.calories,
      totalNutrients: {
        PROCNT: { quantity: randomMeal.protein },
        CHOCDF: { quantity: randomMeal.carbs },
        FAT: { quantity: randomMeal.fats }
      },
      ingredientLines: ["Nutritious ingredients"],
      url: "#"
    }
  };
}

// Function to generate meal plan for a user
async function generateMealPlanForUser(user) {
  try {
    console.log(`Generating auto meal plan for user: ${user.name} (${user.email})`);
    
    const targetDaily = estimateMaintenanceCalories({
      age: user.age,
      height: user.height,
      weight: user.weight,
      gender: user.gender
    });

    const mealDistribution = {
      breakfast: 0.25,
      lunch: 0.35,
      snack: 0.10,
      dinner: 0.30
    };

    const meals = [];
    const excluded = [];

    // Generate meals for each type
    for (const [mealType, percentage] of Object.entries(mealDistribution)) {
      const targetCalories = Math.round(targetDaily * percentage);
      
      // Create region-specific queries
      let queries = [];
      if (user.country === 'India' && user.region) {
        const regionQueries = {
          'North': ['punjabi', 'north indian', 'roti', 'naan', 'dal'],
          'South': ['south indian', 'dosa', 'idli', 'sambar', 'rasam'],
          'East': ['bengali', 'fish curry', 'rice', 'mishti'],
          'West': ['gujarati', 'maharashtrian', 'dhokla', 'pav bhaji']
        };
        queries = regionQueries[user.region] || ['indian'];
      } else {
        queries = ['healthy', 'nutritious', 'balanced'];
      }

      // Add dietary preferences
      if (user.foodStyle === 'vegetarian') {
        queries = queries.map(q => `vegetarian ${q}`);
      } else if (user.foodStyle === 'vegan') {
        queries = queries.map(q => `vegan ${q}`);
      }

      let recipes = [];
      
      // Try different queries until we find recipes
      for (const query of queries) {
        recipes = await searchRecipes(`${mealType} ${query}`, targetCalories, excluded);
        if (recipes.length > 0) break;
      }

      // Fallback queries if no recipes found
      if (recipes.length === 0) {
        const fallbackQueries = [`${mealType} healthy`, `${mealType}`, 'healthy meal'];
        for (const query of fallbackQueries) {
          recipes = await searchRecipes(query, targetCalories, excluded);
          if (recipes.length > 0) break;
        }
      }

      let selectedRecipe;
      
      if (recipes.length > 0) {
        selectedRecipe = recipes[0];
      } else {
        // Use fallback meal system when API completely fails
        console.log(`⚠️ No recipes found for ${mealType}, using fallback meal`);
        selectedRecipe = getFallbackMeal(mealType, targetCalories);
      }

      const recipe = selectedRecipe.recipe;
      const meal = {
        mealType,
        name: recipe.label,
        ingredients: recipe.ingredientLines || ["Nutritious ingredients"],
        calories: Math.round(recipe.calories / (recipe.yield || 1)),
        macronutrients: {
          protein: Math.round((recipe.totalNutrients?.PROCNT?.quantity || 0) / (recipe.yield || 1)),
          carbs: Math.round((recipe.totalNutrients?.CHOCDF?.quantity || 0) / (recipe.yield || 1)),
          fats: Math.round((recipe.totalNutrients?.FAT?.quantity || 0) / (recipe.yield || 1))
        },
        source: recipe.source || "NutriFlow",
        url: recipe.url || "#",
        image: recipe.image || null,
        completed: false
      };
      
      meals.push(meal);
      excluded.push(recipe.label);
    }

    // Calculate totals
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + (meal.macronutrients?.protein || 0),
        carbs: acc.carbs + (meal.macronutrients?.carbs || 0),
        fats: acc.fats + (meal.macronutrients?.fats || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const mealPlanData = {
      targetDailyCalories: targetDaily,
      meals,
      summary: {
        totalCalories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fats: Math.round(totals.fats)
      }
    };

    // Save to database
    const today = MealPlan.getTodayDate();
    const existingPlan = await MealPlan.findOne({ userId: user._id, date: today });
    
    if (existingPlan) {
      // Update existing plan with auto-generation
      existingPlan.targetDailyCalories = targetDaily;
      existingPlan.meals = meals;
      existingPlan.summary = mealPlanData.summary;
      existingPlan.isAutoGenerated = true;
      existingPlan.lastAutoGeneration = new Date();
      existingPlan.generatedAt = new Date();
      await existingPlan.save();
    } else {
      // Create new auto-generated plan
      await MealPlan.create({
        userId: user._id,
        date: today,
        targetDailyCalories: targetDaily,
        meals: meals,
        summary: mealPlanData.summary,
        isAutoGenerated: true,
        lastAutoGeneration: new Date(),
        manualGenerationCount: 0,
        dailyGenerationCount: 0,
        generatedAt: new Date()
      });
    }

    // Send email notification
    if (user.email && user.notifications?.email !== false) {
      try {
        const formattedMealPlan = formatMealPlanForEmail(mealPlanData, {
          name: user.name,
          healthGoals: user.healthGoals,
          region: user.region
        });
        
        await sendEmail(
          user.email,
          "🤖 Your Auto-Generated Daily Meal Plan 🍲",
          formattedMealPlan
        );
        console.log(`✅ Auto-generated meal plan email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    console.log(`✅ Auto meal plan generated successfully for ${user.name}`);
    return { success: true, mealPlan: mealPlanData };

  } catch (error) {
    console.error(`❌ Error generating auto meal plan for ${user.name}:`, error);
    return { success: false, error: error.message };
  }
}

// Main function to generate meal plans for all eligible users
async function generateAutoMealPlans() {
  try {
    console.log('🤖 Starting automatic meal plan generation...');
    
    // Get all users who need auto-generation
    const users = await User.find({});
    let generatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        // Check if user needs auto-generation
        const needsGeneration = await MealPlan.needsAutoGeneration(user._id);
        
        if (needsGeneration) {
          const result = await generateMealPlanForUser(user);
          if (result.success) {
            generatedCount++;
          }
        } else {
          skippedCount++;
          console.log(`⏭️ Skipping ${user.name} - already has auto-generated plan for today`);
        }
      } catch (userError) {
        console.error(`Error processing user ${user.name}:`, userError);
      }
    }

    console.log(`🎉 Auto meal plan generation completed!`);
    console.log(`📊 Generated: ${generatedCount}, Skipped: ${skippedCount}, Total Users: ${users.length}`);
    
    return { 
      success: true, 
      generated: generatedCount, 
      skipped: skippedCount, 
      total: users.length 
    };

  } catch (error) {
    console.error('❌ Error in auto meal plan generation:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateAutoMealPlans,
  generateMealPlanForUser
};
