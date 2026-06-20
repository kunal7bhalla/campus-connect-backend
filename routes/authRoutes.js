const express=require('express');
const router=express.Router();
const {register,verifyOTP,login,resendOTP,forgotPassword,verifyForgotOTP,resetPassword,}=require('../controllers/authController');

// Register
router.post('/register', register);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Login
router.post('/login', login);

// Resend OTP
router.post('/resend-otp', resendOTP);

// Forgot Password
router.post('/forgot-password', forgotPassword);

// Verify Forgot OTP
router.post('/verify-forgot-otp', verifyForgotOTP);

// Reset Password
router.post('/reset-password', resetPassword);

module.exports = router;