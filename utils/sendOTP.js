require('dotenv').config();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: String(process.env.EMAIL),
    pass: String(process.env.EMAIL_PASSWORD),
  },
});

const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Campus Connect" <${process.env.EMAIL}`,
      to: email,
      subject: 'Your OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #6C63FF;">Campus Connect</h2>
          <p>Your OTP for verification is:</p>
          <h1 style="color: #6C63FF; letter-spacing: 8px;">${otp}</h1>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return true;

  } catch (error) {
    console.log('FULL ERROR:', error);
    return false;
  }
};

module.exports = sendOTP;