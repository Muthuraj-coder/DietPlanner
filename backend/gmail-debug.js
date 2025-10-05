const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

async function debugGmail() {
  console.log('🔍 Gmail Authentication Debug Tool\n');
  
  console.log('📋 Current Configuration:');
  console.log(`Email: ${process.env.EMAIL_USER}`);
  console.log(`Password Length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0} characters`);
  console.log(`Password Preview: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) + '...' : 'Not set'}\n`);
  
  // Test different Gmail configurations
  const configs = [
    {
      name: 'Standard Gmail',
      config: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
    },
    {
      name: 'Gmail with explicit host',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
    },
    {
      name: 'Gmail SSL (port 465)',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
    }
  ];
  
  for (const { name, config } of configs) {
    console.log(`🧪 Testing: ${name}`);
    try {
      const transporter = nodemailer.createTransport(config);
      await transporter.verify();
      console.log(`✅ ${name}: Connection successful!\n`);
      
      // If verification succeeds, try sending an email
      console.log(`📤 Attempting to send test email via ${name}...`);
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'raviprashanth9786@gmail.com',
        subject: `🧪 NutriFlow Test - ${name}`,
        text: `Hello Ravi!

This test email was sent successfully using: ${name}

🎉 Gmail authentication is working!

Configuration details:
- Service: ${name}
- From: ${process.env.EMAIL_USER}
- Time: ${new Date().toLocaleString()}

Best regards,
NutriFlow Team 🌱`
      });
      
      console.log(`🎉 SUCCESS! Email sent via ${name}`);
      console.log(`Message ID: ${info.messageId}`);
      console.log(`📬 Check Ravi's inbox!\n`);
      break; // Stop testing other configs if one works
      
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}\n`);
    }
  }
  
  console.log('💡 Troubleshooting Tips:');
  console.log('1. 🔐 Double-check App Password generation:');
  console.log('   → https://myaccount.google.com/apppasswords');
  console.log('   → Must have 2FA enabled first');
  console.log('   → Generate new password for "Mail" app');
  console.log('');
  console.log('2. 🔍 Verify account settings:');
  console.log('   → https://myaccount.google.com/security');
  console.log('   → Check if "Less secure app access" is needed');
  console.log('');
  console.log('3. 🆕 Try a fresh Gmail account:');
  console.log('   → Create new Gmail specifically for NutriFlow');
  console.log('   → Enable 2FA and generate App Password');
  console.log('');
  console.log('4. 🔄 Alternative: Use different email service');
  console.log('   → Outlook/Hotmail (easier setup)');
  console.log('   → SendGrid, Mailgun (for production)');
}

debugGmail();
