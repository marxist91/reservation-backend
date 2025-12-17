import { Sequelize } from 'sequelize';

// Commented hard-coded credentials for security / cleanup reasons
// const sequelize = new Sequelize('reservation_salles', 'marcel_admin', 'Reservation2025!', {
//   host: 'localhost',
//   dialect: 'mysql',
// });

// Use environment variables instead (no literal credentials kept in code)
const DB_NAME = process.env.DB_NAME || 'reservation_salles';
// Default to root with empty password when not provided
const DB_USER = process.env.DB_USERNAME || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: process.env.DB_HOST || 'localhost',
  dialect: process.env.DB_DIALECT || 'mysql',
});

sequelize.authenticate()
  .then(() => {
    console.log("✅ Connexion réussie à MySQL via Sequelize !");
  })
  .catch((err) => {
    console.error("❌ Connexion échouée :", err);
  });