const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('reservation_salles', 'marcel_admin', 'Reservation2025!', {
  host: 'localhost',
  dialect: 'mysql',
});

sequelize.authenticate()
  .then(() => {
    console.log("✅ Connexion réussie à MySQL via Sequelize !");
  })
  .catch((err) => {
    console.error("❌ Connexion échouée :", err);
  });