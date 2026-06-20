const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendOTP = require('../utils/sendOTP');

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check university email
    if (!email.endsWith('@cuchd.in')) {
      return res.status(400).json({ message: 'Only @cuchd.in emails are allowed!' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated OTP:', otp);

    // Send OTP email
    const emailSent = await sendOTP(email, otp);

    console.log('Email sent:', emailSent);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email!' });
    }

    // If user exists but not verified — update their details
    if (existingUser && !existingUser.isVerified) {
      existingUser.fullName = fullName;
      existingUser.password = hashedPassword;
      existingUser.otp = { code: otp, expiresAt: otpExpiresAt };
      await existingUser.save();

      return res.status(200).json({
        message: 'OTP sent to your email!',
        userId: existingUser._id,
      });
    }

    // Save new user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      otp: {
        code: otp,
        expiresAt: otpExpiresAt,
      },
    });

    res.status(201).json({
      message: 'OTP sent to your email!',
      userId: user._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Check OTP
    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP!' });
    }

    // Check OTP expiry
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired! Please request a new one.' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check university email
    // if (!email.endsWith('@cuchd.in')) {
    //   return res.status(400).json({ message: 'Only @cuchd.in emails are allowed!' });
    // }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first!' });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been suspended!' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password!' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin,
        profileComplete: user.profile.age ? true : false,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Send OTP email
    const emailSent = await sendOTP(user.email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email!' });
    }

    // Update OTP in database
    user.otp = { code: otp, expiresAt: otpExpiresAt };
    await user.save();

    res.status(200).json({ message: 'OTP resent successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check university email
    if (!email.endsWith('@cuchd.in')) {
      return res.status(400).json({ message: 'Only @cuchd.in emails are allowed!' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Send OTP email
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email!' });
    }

    // Save OTP
    user.otp = { code: otp, expiresAt: otpExpiresAt };
    await user.save();

    res.status(200).json({
      message: 'OTP sent to your email!',
      userId: user._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route POST /api/auth/verify-forgot-otp
const verifyForgotOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Check OTP
    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP!' });
    }

    // Check OTP expiry
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired! Please request a new one.' });
    }

    // Clear OTP
    user.otp = undefined;
    await user.save();

    res.status(200).json({
      message: 'OTP verified!',
      userId: user._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  resendOTP,
  forgotPassword,
  verifyForgotOTP,
  resetPassword,
};