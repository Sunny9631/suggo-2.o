const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { sendOTPEmail, generateOTP } = require('../services/emailService');

const router = express.Router();

// Rate limiting for OTP requests
const otpRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 OTP requests per 5 minutes
  message: { message: 'Too many OTP requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Send OTP for email verification
router.post('/send-otp', otpRateLimit, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email is already registered and verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already registered and verified' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update or create user with OTP
    if (existingUser) {
      existingUser.emailVerificationOTP = otp;
      existingUser.emailVerificationOTPExpires = otpExpires;
      await existingUser.save();
    } else {
      // Create temporary user record with OTP
      await User.create({
        email,
        emailVerificationOTP: otp,
        emailVerificationOTPExpires: otpExpires,
        username: `temp_${Date.now()}`, // Temporary username
        passwordHash: 'temp', // Will be updated during registration
      });
    }

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ 
      message: 'OTP sent successfully to your email',
      email: email
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user with the email and valid OTP
    const user = await User.findOne({
      email,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP fields
    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpires = null;
    user.isEmailVerified = true;
    await user.save();

    res.json({ 
      message: 'Email verified successfully',
      email: email,
      isEmailVerified: true
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Check if email is verified
router.get('/check/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ isEmailVerified: false, message: 'Email not found' });
    }

    res.json({ 
      isEmailVerified: user.isEmailVerified,
      message: user.isEmailVerified ? 'Email is verified' : 'Email not verified'
    });
  } catch (error) {
    console.error('Check email verification error:', error);
    res.status(500).json({ message: 'Failed to check email verification' });
  }
});

module.exports = router;
