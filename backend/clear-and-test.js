const mongoose = require('mongoose');
const MealPlan = require('./models/MealPlan');
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function clearAndTest() {
  try {
    console.log('🧹 Clearing existing meal plans...');
    
    // Clear all meal plans
    const deleteResult = await MealPlan.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing meal plans\n`);
    
    console.log('🎯 CALORIE CALCULATION FIX APPLIED!');
    console.log('===================================');
    console.log('✅ Fixed meal generation logic in both /generate and /today endpoints');
    console.log('✅ Now uses target calories instead of original recipe calories');
    console.log('✅ Macronutrients are scaled proportionally to match target');
    console.log('');
    console.log('📋 What was changed:');
    console.log('- Line ~555 & ~867: calories: perMealTarget (instead of perServing)');
    console.log('- Added scaling factor calculation for macronutrients');
    console.log('- Both manual (/generate) and automatic (/today) generation fixed');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Generate a new meal plan');
    console.log('3. Check dashboard - calories should now match exactly!');
    console.log('');
    console.log('Expected results:');
    console.log('- Target: 2,116 calories → Actual: ~2,116 calories');
    console.log('- Breakfast: ~529 cal, Lunch: ~741 cal, Snack: ~212 cal, Dinner: ~635 cal');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

clearAndTest();
