const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Resend API key not configured, skipping email send');
      return { success: false, message: 'Email not configured' };
    }

    console.log(`📤 Attempting to send email via Resend to: ${to}`);
    
    const response = await resend.emails.send({
      from: 'Meal Plan App <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    
    console.log("✅ Email sent via Resend:", response);
    return { success: true, message: 'Email sent successfully', response };
  } catch (err) {
    console.error("❌ Resend Email Error:", err);
    console.error("Resend Error Details:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
    throw err;
  }
};

module.exports = { sendEmail };

