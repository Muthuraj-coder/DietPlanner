const User = require('../models/User');
const MealPlan = require('../models/MealPlan');
const dotenv = require('dotenv');
const { sendEmail } = require('../utils/email');

dotenv.config({ path: './config.env' });

// Enhanced meal notification function
async function sendMealNotification(to, subject, html) {
  try {
    await sendEmail({
      to,
      subject,
      html,
    });
    
    console.log(`✅ Meal notification sent to ${to}`);
    return { success: true, message: 'Meal notification sent' };
  } catch (error) {
    console.error("Resend Email Error:", error);
    throw error;
  }
}

// Function to create simple meal notification content (returns HTML)
function createMealNotification(mealType, meal, userName) {
  const mealEmojis = {
    breakfast: '🌅',
    lunch: '☀️',
    snack: '🍎',
    dinner: '🌙'
  };

  const mealTimes = {
    breakfast: 'Morning',
    lunch: 'Lunch Time',
    snack: 'Snack Time',
    dinner: 'Dinner Time'
  };

  const emoji = mealEmojis[mealType] || '🍽️';
  const timeLabel = mealTimes[mealType] || 'Meal Time';
  
  const subject = `${emoji} ${timeLabel} Reminder - NutriFlow`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #059669;">${emoji} ${timeLabel} Reminder</h2>
      <p>Hello <strong>${userName || 'there'}</strong>!</p>
      <p>Your ${mealType} is ready:</p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">🍽️ ${meal.name}</p>
        <p><strong>🔥 Calories:</strong> ${meal.calories}</p>
      </div>
      <p>Enjoy your meal and stay healthy! 💪</p>
      <p>Best regards,<br><strong>NutriFlow Team 🌱</strong></p>
    </div>
  `;

  return { subject, html };
}

// Function to send meal notifications to all users for a specific meal type
async function sendMealNotificationsForMealType(mealType) {
  try {
    console.log(`📢 Sending ${mealType} notifications to all users...`);
    
    const today = MealPlan.getTodayDate();
    
    // Get all meal plans for today that have the specified meal type
    const mealPlans = await MealPlan.find({ date: today }).populate('userId');
    
    let sentCount = 0;
    let skippedCount = 0;

    for (const mealPlan of mealPlans) {
      try {
        const user = mealPlan.userId;
        
        // Skip if user doesn't have email or notifications disabled
        if (!user || !user.email || user.notifications?.email === false) {
          skippedCount++;
          continue;
        }

        // Find the specific meal for this meal type
        const meal = mealPlan.meals.find(m => m.mealType === mealType);
        
        if (!meal) {
          console.log(`⏭️ No ${mealType} found for user ${user.name}`);
          skippedCount++;
          continue;
        }

        // Create and send notification
        const notification = createMealNotification(mealType, meal, user.name);
        
        const result = await sendMealNotification(
          user.email,
          notification.subject,
          notification.html
        );

        if (result.success) {
          sentCount++;
          console.log(`✅ ${mealType} notification sent to ${user.name} (${user.email})`);
        } else {
          console.log(`❌ Failed to send ${mealType} notification to ${user.name}`);
          skippedCount++;
        }

      } catch (userError) {
        console.error(`Error processing ${mealType} notification for user:`, userError);
        skippedCount++;
      }
    }

    console.log(`📊 ${mealType} notifications completed: ${sentCount} sent, ${skippedCount} skipped`);
    
    return {
      success: true,
      mealType,
      sent: sentCount,
      skipped: skippedCount,
      total: mealPlans.length
    };

  } catch (error) {
    console.error(`❌ Error sending ${mealType} notifications:`, error);
    return {
      success: false,
      mealType,
      error: error.message
    };
  }
}

// Individual meal notification functions
async function sendBreakfastNotifications() {
  console.log('🌅 Morning breakfast notification time!');
  return await sendMealNotificationsForMealType('breakfast');
}

async function sendLunchNotifications() {
  console.log('☀️ Lunch time notification!');
  return await sendMealNotificationsForMealType('lunch');
}

async function sendSnackNotifications() {
  console.log('🍎 Snack time notification!');
  return await sendMealNotificationsForMealType('snack');
}

async function sendDinnerNotifications() {
  console.log('🌙 Dinner time notification!');
  return await sendMealNotificationsForMealType('dinner');
}

// Test function to send notification to a specific user
async function testMealNotification(userId, mealType) {
  try {
    console.log(`🧪 Testing ${mealType} notification for user ${userId}...`);
    
    const today = MealPlan.getTodayDate();
    const mealPlan = await MealPlan.findOne({ userId, date: today }).populate('userId');
    
    if (!mealPlan) {
      return { success: false, message: 'No meal plan found for today' };
    }

    const user = mealPlan.userId;
    if (!user.email) {
      return { success: false, message: 'User has no email address' };
    }

    const meal = mealPlan.meals.find(m => m.mealType === mealType);
    if (!meal) {
      return { success: false, message: `No ${mealType} found in meal plan` };
    }

    const notification = createMealNotification(mealType, meal, user.name);
    const result = await sendMealNotification(user.email, notification.subject, notification.html);
    
    return {
      success: result.success,
      message: result.success ? 'Test notification sent successfully' : result.message,
      user: user.name,
      email: user.email,
      meal: meal.name
    };

  } catch (error) {
    console.error('Test notification error:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  sendBreakfastNotifications,
  sendLunchNotifications,
  sendSnackNotifications,
  sendDinnerNotifications,
  sendMealNotificationsForMealType,
  testMealNotification
};
