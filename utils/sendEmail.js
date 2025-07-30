const nodemailer = require("nodemailer");

module.exports = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "ton.email@gmail.com",
      pass: "motdepasse_app"
    }
  });

  await transporter.sendMail({
    from: '"Réservation App" <ton.email@gmail.com>',
    to,
    subject,
    text
  });
};