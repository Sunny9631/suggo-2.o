const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS  // Your Gmail app password
  }
});

// Generate OTP
const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SUGGO - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">SUGGO</h1>
            <p style="color: #6B7280; margin: 5px 0;">Chat Application</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0 0 15px 0;">Email Verification</h2>
            <p style="color: #6B7280; margin: 0 0 20px 0;">
              Thank you for registering with SUGGO! To complete your registration, please use the following OTP to verify your email address:
            </p>
            
            <div style="background: #4F46E5; color: white; font-size: 32px; font-weight: bold; 
                        text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            
            <p style="color: #6B7280; margin: 20px 0 0 0; font-size: 14px;">
              This OTP will expire in <strong>10 minutes</strong>. Please do not share this code with anyone.
            </p>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>If you didn't request this verification, please ignore this email.</p>
            <p style="margin-top: 10px;">© 2025 SUGGO. All rights reserved "SUNNY GOLDI".</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready to use');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  generateOTP,
  verifyEmailConfig
};
