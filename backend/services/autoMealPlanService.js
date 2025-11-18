const User = require('../models/User');
const MealPlan = require('../models/MealPlan');
const dotenv = require('dotenv');
const { sendEmail } = require('../utils/email');

dotenv.config({ path: './config.env' });

// Function to format meal plan for email (returns HTML)
function formatMealPlanForEmail(mealPlan, userProfile) {
  const { targetDailyCalories, meals, summary } = mealPlan;
  
  let html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">`;
  html += `<h2 style="color: #059669;">🍽️ Your Daily Meal Plan (Auto-Generated)</h2>`;
  html += `<p>Hello <strong>${userProfile.name || 'there'}</strong>!</p>`;
  html += `<p>Here's your automatically generated meal plan for today:</p>`;
  html += `<p><strong>📊 Daily Target:</strong> ${targetDailyCalories} calories</p>`;
  html += `<p><strong>🎯 Health Goal:</strong> ${userProfile.healthGoals || 'General Health'}</p>`;
  html += `<p><strong>🌍 Region:</strong> ${userProfile.region || 'Global'} cuisine</p>`;
  html += `<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">`;
  
  meals.forEach((meal) => {
    const mealEmojis = {
      breakfast: '🌅',
      lunch: '☀️',
      snack: '🍎',
      dinner: '🌙'
    };
    
    html += `<div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">`;
    html += `<h3 style="color: #059669; margin-top: 0;">${mealEmojis[meal.mealType] || '🍽️'} ${meal.mealType.toUpperCase()}</h3>`;
    html += `<p style="font-size: 18px; font-weight: bold; margin: 10px 0;">${meal.name}</p>`;
    html += `<p><strong>Calories:</strong> ${meal.calories}</p>`;
    html += `<p><strong>Protein:</strong> ${meal.macronutrients?.protein || 0}g | <strong>Carbs:</strong> ${meal.macronutrients?.carbs || 0}g | <strong>Fats:</strong> ${meal.macronutrients?.fats || 0}g</p>`;
    
    if (meal.ingredients && meal.ingredients.length > 0) {
      html += `<p><strong>Ingredients:</strong> ${meal.ingredients.slice(0, 5).join(', ')}${meal.ingredients.length > 5 ? '...' : ''}</p>`;
    }
    
    if (meal.url) {
      html += `<p><a href="${meal.url}" style="color: #059669;">View Recipe</a></p>`;
    }
    
    html += `</div>`;
  });
  
  html += `<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">`;
  html += `<h3 style="color: #059669;">📈 Daily Summary:</h3>`;
  html += `<p><strong>Total Calories:</strong> ${summary?.totalCalories || 0}</p>`;
  html += `<p><strong>Protein:</strong> ${summary?.protein || 0}g | <strong>Carbs:</strong> ${summary?.carbs || 0}g | <strong>Fats:</strong> ${summary?.fats || 0}g</p>`;
  html += `<p><strong>🤖 This meal plan was automatically generated for you!</strong></p>`;
  html += `<h3 style="color: #059669;">💡 Tips:</h3>`;
  html += `<ul>`;
  html += `<li>Stay hydrated throughout the day</li>`;
  html += `<li>Follow portion sizes as recommended</li>`;
  html += `<li>Complete meals in the app to track progress</li>`;
  html += `<li>You can still generate up to 3 custom plans today</li>`;
  html += `</ul>`;
  html += `<p>Happy eating!<br><strong>The NutriFlow Team 🌱</strong></p>`;
  html += `</div>`;
  
  return html;
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
        const emailHtml = formatMealPlanForEmail(mealPlanData, {
          name: user.name,
          healthGoals: user.healthGoals,
          region: user.region
        });
        
        await sendEmail({
          to: user.email,
          subject: "🤖 Your Auto-Generated Daily Meal Plan 🍲",
          html: emailHtml,
        });
        console.log(`✅ Auto-generated meal plan email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Resend Email Error (autoMealPlanService):", emailError);
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
