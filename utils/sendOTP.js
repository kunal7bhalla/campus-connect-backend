const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const SendOTP = async (email, otp) => {
  try {
    const response = await resend.emails.send({
      from: 'Campus Connect <noreply@campuslink.co.in>',
      to: email,
      subject: 'Your OTP for Campus Connect',
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

    console.log('Email sent:', response);
    return true;

  } catch (error) {
    console.error(`Error sending OTP: ${error.message}`);
    return false;
  }
};

module.exports = SendOTP;