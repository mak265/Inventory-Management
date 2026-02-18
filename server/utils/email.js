const nodemailer = require('nodemailer');

let cachedTransporter = null;

const buildTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const smtpUrl = process.env.SMTP_URL;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;

  let transporter;
  if (smtpUrl) {
    transporter = nodemailer.createTransport(smtpUrl);
  } else if (smtpHost && smtpPort && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });
  } else if (mailUser && mailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: mailUser, pass: mailPass }
    });
  } else {
    return null;
  }

  await transporter.verify();
  cachedTransporter = transporter;
  return cachedTransporter;
};

// Original OTP Template logic kept for safety
const getEmailTemplate = (subject, otp) => {
  let title = 'Welcome to NE Devs!';
  let message = 'Thank you for registering with us. To complete your registration, please verify your email address using the OTP code below:';
  
  const isPasswordReset = subject.toLowerCase().includes('password reset');
  if (isPasswordReset) {
    title = 'Password Reset Request';
    message = 'We received a request to reset your password. Use the OTP code below to proceed:';
  }

  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1>${title}</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hello!</p>
            <p>${message}</p>
            <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 10px 0;">${otp}</div>
            </div>
            <p style="text-align: center;"><a href="http://167.71.120.114/" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Login Page</a></p>
          </div>
        </div>
      </body>
    </html>`;
};

// UPDATED: Added 'htmlContent' as 4th parameter
const sendEmail = async (to, subject, text, htmlContent) => {
  try {
    const transporter = await buildTransporter();
    if (!transporter) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[SIMULATION] Email to ${to}: ${subject}`);
        return { simulated: true };
      }
      throw new Error('Email is not configured');
    }

    const from = process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.MAIL_USER || process.env.SMTP_USER;

    // FIX: If htmlContent is provided (from users.js), use it. 
    // Otherwise, try to extract OTP for the old template.
    let finalHtml = htmlContent;
    if (!finalHtml) {
      const otpMatch = text.match(/\d{6}/);
      const otp = otpMatch ? otpMatch[0] : '------';
      finalHtml = getEmailTemplate(subject, otp);
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html: finalHtml
    });

    return { messageId: info.messageId };
  } catch (err) {
    console.error('Email send failed:', err);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;
