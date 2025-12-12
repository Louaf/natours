const { text } = require('express');
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });

  //2)define the email options options
  const mailOptions = {
    from: '"Yousif Albaqary" <hello@jonas.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html :
  };
  //console.log(options.email, options.subject, '\n\n\n', options.message);
  //console.log('hihi');
  await transporter.sendMail(mailOptions);
  //console.log('hi');
};

module.exports = sendEmail;
