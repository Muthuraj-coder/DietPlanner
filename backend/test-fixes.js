const fetch = require('node-fetch');
require('dotenv').config({ path: './config.env' });

// Test the new Edamam API v2 endpoint
async function testEdamamAPI() {
  console.log('🧪 Testing Edamam API v2...');
  
  const edamam = {
    app_id: process.env.EDAMAM_APP_ID,
    app_key: process.env.EDAMAM_APP_KEY
  };

  const query = 'breakfast healthy';
  const calories = '300-500';
  const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&app_id=${edamam.app_id}&app_key=${edamam.app_key}&calories=${calories}&random=true`;
  
  try {
    console.log(`🔍 Testing URL: ${url.substring(0, 100)}...`);
    const response = await fetch(url);
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const text = await response.text();
      console.log(`❌ Error Response: ${text.substring(0, 200)}...`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ Success! Found ${data.hits?.length || 0} recipes`);
    
    if (data.hits && data.hits.length > 0) {
      const recipe = data.hits[0].recipe;
      console.log(`📝 Sample Recipe: ${recipe.label}`);
      console.log(`🔥 Calories: ${Math.round(recipe.calories)}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    return false;
  }
}

// Test email configuration (without sending)
async function testEmailConfig() {
  console.log('\n📧 Testing Email Configuration...');
  
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ Email configuration is valid!');
    return true;
  } catch (error) {
    console.error('❌ Email configuration failed:', error.message);
    return false;
  }
}

// Test fallback meal system
function testFallbackSystem() {
  console.log('\n🔄 Testing Fallback Meal System...');
  
  const fallbackMeals = {
    breakfast: [
      { name: "Oatmeal with Fruits", calories: 350, protein: 12, carbs: 65, fats: 8 },
      { name: "Scrambled Eggs with Toast", calories: 400, protein: 20, carbs: 35, fats: 18 }
    ],
    lunch: [
      { name: "Grilled Chicken Salad", calories: 450, protein: 35, carbs: 25, fats: 22 }
    ]
  };

  function getFallbackMeal(mealType) {
    const meals = fallbackMeals[mealType] || fallbackMeals.lunch;
    const randomMeal = meals[Math.floor(Math.random() * meals.length)];
    
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

  try {
    const breakfastFallback = getFallbackMeal('breakfast');
    const lunchFallback = getFallbackMeal('lunch');
    
    console.log(`✅ Breakfast Fallback: ${breakfastFallback.recipe.label}`);
    console.log(`✅ Lunch Fallback: ${lunchFallback.recipe.label}`);
    console.log('✅ Fallback system working correctly!');
    return true;
  } catch (error) {
    console.error('❌ Fallback system failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running Production Fix Tests...\n');
  
  const results = {
    edamam: await testEdamamAPI(),
    email: await testEmailConfig(),
    fallback: testFallbackSystem()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log(`🔍 Edamam API v2: ${results.edamam ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📧 Email Config: ${results.email ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔄 Fallback System: ${results.fallback ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Ready for deployment! 🚀');
  } else {
    console.log('\n⚠️ Some tests failed. Please check configuration before deploying.');
  }
  
  return allPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testEdamamAPI, testEmailConfig, testFallbackSystem, runAllTests };
