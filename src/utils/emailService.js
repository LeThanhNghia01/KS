// src/utils/emailService.js
const nodemailer = require('nodemailer');

// Cấu hình transporter cho nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'letin17617@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'nghia123@@'
  }
});

// Hàm gửi email
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'letin17617@gmail.com',
      to,
      subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
};

module.exports = { sendEmail };