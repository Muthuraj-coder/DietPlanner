const cron = require('node-cron');
const { generateAutoMealPlans } = require('./services/autoMealPlanService');
const { 
  sendBreakfastNotifications,
  sendLunchNotifications,
  sendSnackNotifications,
  sendDinnerNotifications
} = require('./services/mealNotificationService');

console.log('🕐 Meal Plan Scheduler & Notifications initialized');

// PRIMARY: Schedule auto meal plan generation every day at 12:00 AM (MIDNIGHT)
cron.schedule('0 0 * * *', async () => {
  console.log('🌙 Running MIDNIGHT auto meal plan generation at 12:00 AM...');
  try {
    const result = await generateAutoMealPlans();
    if (result.success) {
      console.log(`✅ Midnight generation completed: ${result.generated} plans generated, ${result.skipped} skipped`);
    } else {
      console.error('❌ Midnight generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Midnight scheduler error:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Indian timezone
});

// BACKUP: Schedule auto meal plan generation every day at 6:00 AM (for missed users)
cron.schedule('0 6 * * *', async () => {
  console.log('🌅 Running BACKUP meal plan generation at 6:00 AM...');
  try {
    const result = await generateAutoMealPlans();
    if (result.success) {
      console.log(`✅ Backup generation completed: ${result.generated} plans generated, ${result.skipped} skipped`);
    } else {
      console.error('❌ Backup generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Backup scheduler error:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Indian timezone
});

// Also schedule at 12:00 PM as backup
cron.schedule('0 12 * * *', async () => {
  console.log('🤖 Running backup meal plan generation at 12:00 PM...');
  try {
    const result = await generateAutoMealPlans();
    if (result.success) {
      console.log(`✅ Backup generation completed: ${result.generated} plans generated, ${result.skipped} skipped`);
    } else {
      console.error('❌ Backup generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Backup scheduler error:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// =============================================================================
// MEAL TIME NOTIFICATIONS SCHEDULER
// =============================================================================

// Breakfast notification at 8:00 AM IST
cron.schedule('0 8 * * *', async () => {
  console.log('🌅 Sending breakfast notifications at 8:00 AM...');
  try {
    const result = await sendBreakfastNotifications();
    if (result.success) {
      console.log(`✅ Breakfast notifications: ${result.sent} sent, ${result.skipped} skipped`);
    } else {
      console.error('❌ Breakfast notifications failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Breakfast notification scheduler error:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Lunch notification at 1:00 PM IST
cron.schedule('0 13 * * *', async () => {
  console.log('☀️ Sending lunch notifications at 1:00 PM...');
  try {
    const result = await sendLunchNotifications();
    if (result.success) {
      console.log(`✅ Lunch notifications: ${result.sent} sent, ${result.skipped} skipped`);
    } else {
      console.error('❌ Lunch notifications failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Lunch notification scheduler error:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Snack notification at 4:00 PM IST
cron.schedule('0 16 * * *', async () => {
  console.log('🍎 Sending snack notifications at 4:00 PM...');
  try {
    const result = await sendSnackNotifications();
    if (result.success) {
      console.log(`✅ Snack notifications: ${result.sent} sent, ${result.skipped} skipped`);
    } else {
      console.error('❌ Snack notifications failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Snack notification scheduler error:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Dinner notification at 8:00 PM IST
cron.schedule('0 20 * * *', async () => {
  console.log('🌙 Sending dinner notifications at 8:00 PM...');
  try {
    const result = await sendDinnerNotifications();
    if (result.success) {
      console.log(`✅ Dinner notifications: ${result.sent} sent, ${result.skipped} skipped`);
    } else {
      console.error('❌ Dinner notifications failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Dinner notification scheduler error:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Manual trigger endpoint for testing
const express = require('express');
const router = express.Router();

router.post('/trigger-auto-generation', async (req, res) => {
  try {
    console.log('🧪 Manual trigger for auto meal plan generation...');
    const result = await generateAutoMealPlans();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Auto meal plan generation completed successfully',
        generated: result.generated,
        skipped: result.skipped,
        total: result.total
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Auto meal plan generation failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Manual trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Manual trigger failed',
      error: error.message
    });
  }
});

// Manual trigger for meal notifications
router.post('/trigger-breakfast-notifications', async (req, res) => {
  try {
    console.log('🧪 Manual trigger for breakfast notifications...');
    const result = await sendBreakfastNotifications();
    res.json({
      success: result.success,
      message: 'Breakfast notifications completed',
      sent: result.sent,
      skipped: result.skipped
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/trigger-lunch-notifications', async (req, res) => {
  try {
    console.log('🧪 Manual trigger for lunch notifications...');
    const result = await sendLunchNotifications();
    res.json({
      success: result.success,
      message: 'Lunch notifications completed',
      sent: result.sent,
      skipped: result.skipped
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/trigger-snack-notifications', async (req, res) => {
  try {
    console.log('🧪 Manual trigger for snack notifications...');
    const result = await sendSnackNotifications();
    res.json({
      success: result.success,
      message: 'Snack notifications completed',
      sent: result.sent,
      skipped: result.skipped
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/trigger-dinner-notifications', async (req, res) => {
  try {
    console.log('🧪 Manual trigger for dinner notifications...');
    const result = await sendDinnerNotifications();
    res.json({
      success: result.success,
      message: 'Dinner notifications completed',
      sent: result.sent,
      skipped: result.skipped
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

console.log('📅 Scheduled tasks:');
console.log('  - 🌙 PRIMARY: Auto meal plan generation at 12:00 AM IST (MIDNIGHT)');
console.log('  - 🌅 BACKUP: Auto meal plan generation at 6:00 AM IST');
console.log('  - 🔄 BACKUP: Auto meal plan generation at 12:00 PM IST');
console.log('  - 🌅 Breakfast notifications at 8:00 AM IST');
console.log('  - ☀️ Lunch notifications at 1:00 PM IST');
console.log('  - 🍎 Snack notifications at 4:00 PM IST');
console.log('  - 🌙 Dinner notifications at 8:00 PM IST');
console.log('');
console.log('🔧 Manual triggers available:');
console.log('  - POST /api/scheduler/trigger-auto-generation');
console.log('  - POST /api/scheduler/trigger-breakfast-notifications');
console.log('  - POST /api/scheduler/trigger-lunch-notifications');
console.log('  - POST /api/scheduler/trigger-snack-notifications');
console.log('  - POST /api/scheduler/trigger-dinner-notifications');

module.exports = router;
