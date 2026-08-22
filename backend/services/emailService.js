const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize or get Nodemailer Transporter
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || 587,
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
    console.log(`[LearnAI Email Service] Connected to SMTP Host: ${SMTP_HOST}`);
  } else {
    // Development / Test Fallback with Ethereal SMTP
    console.log('[LearnAI Email Service] No production SMTP configured. Creating local Ethereal test transporter...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[LearnAI Email Service] Ethereal test account ready: ${testAccount.user}`);
    } catch (err) {
      // Streamlined JSON transport fallback if offline
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      console.log('[LearnAI Email Service] Using JSON transport fallback.');
    }
  }

  return transporter;
};

/**
 * Send Account Verification Email
 */
const sendVerificationEmail = async ({ to, name, verificationUrl }) => {
  const mailTransporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || '"LearnAI Platform" <no-reply@learnai.com>';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f8fc; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .logo { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; display: inline-block; text-decoration: none; }
    .logo span { color: #4f46e5; }
    h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 16px 0; }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
    .url-text { font-size: 12px; color: #64748b; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <a href="#" class="logo">Learn<span>AI</span></a>
    <h1>Welcome to LearnAI, ${name || 'Student'}!</h1>
    <p>Thank you for registering. Please verify your email address to activate your student account and access your study library.</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="${verificationUrl}" class="btn" target="_blank">Verify Email Address</a>
    </div>

    <p>This verification link will expire in <strong>1 hour</strong> for your security.</p>
    
    <div class="footer">
      <p style="margin-bottom: 6px;">If the button above does not work, copy and paste this URL into your browser:</p>
      <p class="url-text">${verificationUrl}</p>
      <p style="margin-top: 16px; margin-bottom: 0;">If you did not sign up for a LearnAI account, please safely disregard this email.</p>
    </div>
  </div>
</body>
</html>
`;

  const info = await mailTransporter.sendMail({
    from: fromAddress,
    to,
    subject: 'Verify your LearnAI account',
    text: `Welcome to LearnAI, ${name}! Please verify your email by clicking: ${verificationUrl}`,
    html: htmlContent,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n======================================================`);
    console.log(`📩 [LearnAI Email Sent to ${to}]`);
    console.log(`🔗 Verification Link: ${verificationUrl}`);
    console.log(`🌐 Ethereal Web Preview: ${previewUrl}`);
    console.log(`======================================================\n`);
  } else {
    console.log(`[LearnAI Email Service] Verification email sent to: ${to}`);
  }

  return info;
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const mailTransporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || '"LearnAI Platform" <no-reply@learnai.com>';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f8fc; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .logo { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; display: inline-block; text-decoration: none; }
    .logo span { color: #4f46e5; }
    h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 16px 0; }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
    .url-text { font-size: 12px; color: #64748b; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <a href="#" class="logo">Learn<span>AI</span></a>
    <h1>Password Reset Request</h1>
    <p>We received a request to reset your LearnAI account password. Click the button below to choose a new password.</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
    </div>

    <p>This password reset link will expire in <strong>1 hour</strong>.</p>
    
    <div class="footer">
      <p style="margin-bottom: 6px;">If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

  const info = await mailTransporter.sendMail({
    from: fromAddress,
    to,
    subject: 'Reset your LearnAI password',
    text: `Hello ${name}! Reset your LearnAI password by clicking: ${resetUrl}`,
    html: htmlContent,
  });

  return info;
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
