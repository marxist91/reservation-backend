const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // utilise true si tu es en 465 SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

module.exports = async function sendMail({ to, subject, html }) {
  try {
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("✅ Email envoyé :", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi d’email :", error.message);
    throw error;
  }
};