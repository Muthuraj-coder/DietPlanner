const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Pass configured:', process.env.EMAIL_PASS ? 'Yes' : 'No');
  console.log('');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    console.log('📤 Sending test email to Ravi...');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'muthurajias3232@gmail.com',
      subject: '🧪 NutriFlow Email Test',
      text: `Hello Muthu!

This is a test email from NutriFlow to verify that email notifications are working correctly.

🍽️ Sample Meal Plan Preview:
─────────────────────────────

🌅 BREAKFAST
Masala Dosa with Sambar
Calories: 450
Protein: 12g | Carbs: 65g | Fats: 15g

☀️ LUNCH  
Chicken Chettinad with Rice
Calories: 650
Protein: 45g | Carbs: 55g | Fats: 25g

🍎 SNACK
Banana Chips
Calories: 200
Protein: 2g | Carbs: 35g | Fats: 8g

🌙 DINNER
Fish Curry with Appam
Calories: 550
Protein: 35g | Carbs: 45g | Fats: 20g

─────────────────────────────
📈 Daily Summary:
Total Calories: 1850
Protein: 94g | Carbs: 200g | Fats: 68g

💡 Tips:
• Stay hydrated throughout the day
• Follow portion sizes as recommended  
• Complete meals in the app to track progress

If you received this email, the NutriFlow email notification system is working perfectly! 🎉

Happy eating!
The NutriFlow Team 🌱`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🧪 NutriFlow Email Test</h2>
        <p>Hello <strong>Ravi</strong>!</p>
        <p>This is a test email from NutriFlow to verify that email notifications are working correctly.</p>
        
        <h3 style="color: #059669;">🍽️ Sample Meal Plan Preview:</h3>
        <hr>
        
        <div style="margin: 20px 0;">
          <h4>🌅 BREAKFAST</h4>
          <p><strong>Masala Dosa with Sambar</strong><br>
          Calories: 450<br>
          Protein: 12g | Carbs: 65g | Fats: 15g</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h4>☀️ LUNCH</h4>
          <p><strong>Chicken Chettinad with Rice</strong><br>
          Calories: 650<br>
          Protein: 45g | Carbs: 55g | Fats: 25g</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h4>🍎 SNACK</h4>
          <p><strong>Banana Chips</strong><br>
          Calories: 200<br>
          Protein: 2g | Carbs: 35g | Fats: 8g</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h4>🌙 DINNER</h4>
          <p><strong>Fish Curry with Appam</strong><br>
          Calories: 550<br>
          Protein: 35g | Carbs: 45g | Fats: 20g</p>
        </div>
        
        <hr>
        <h3 style="color: #059669;">📈 Daily Summary:</h3>
        <p><strong>Total Calories:</strong> 1850<br>
        <strong>Protein:</strong> 94g | <strong>Carbs:</strong> 200g | <strong>Fats:</strong> 68g</p>
        
        <h3 style="color: #059669;">💡 Tips:</h3>
        <ul>
          <li>Stay hydrated throughout the day</li>
          <li>Follow portion sizes as recommended</li>
          <li>Complete meals in the app to track progress</li>
        </ul>
        
        <p style="background: #d1fae5; padding: 15px; border-radius: 8px; color: #059669;">
          <strong>If you received this email, the NutriFlow email notification system is working perfectly! 🎉</strong>
        </p>
        
        <p>Happy eating!<br>
        <strong>The NutriFlow Team 🌱</strong></p>
      </div>`
    });

    console.log('✅ SUCCESS! Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('📬 Check Ravi\'s inbox at: raviprashanth9786@gmail.com');
    console.log('\n🎉 Email notification system is working correctly!');
    
  } catch (error) {
    console.error('❌ FAILED! Error sending email:');
    console.error(error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. Gmail 2FA is enabled');
      console.log('2. App password is correct (not regular password)');
      console.log('3. EMAIL_USER and EMAIL_PASS are set correctly in config.env');
    }
  }
}

testEmail();
