require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Test route ultra-simple
app.get("/test", (req, res) => {
  res.json({ message: "Test minimal OK" });
});

app.get("/test/:id", (req, res) => {
  res.json({ message: "Test avec paramètre OK", id: req.params.id });
});

console.log("🚀 Démarrage serveur minimal...");

app.listen(PORT, () => {
  console.log(`✅ Serveur minimal démarré sur http://localhost:${PORT}`);
  console.log("📋 Routes disponibles:");
  console.log("- GET /test");
  console.log("- GET /test/:id");
});