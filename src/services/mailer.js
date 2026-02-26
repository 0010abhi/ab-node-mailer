const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: '"MyApp" <no-reply@myapp.com>',
    to,
    subject,
    html
  });

  console.log("Message sent:", info.messageId);

  // 👇 THIS IS IMPORTANT
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

  return info;
}

module.exports = { sendEmail };