require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

console.log("🔍 Débogage Express - Version:", require('express/package.json').version);

// Test progressif des routes
console.log("📝 Test 1: Route simple");
app.get("/simple", (req, res) => {
  res.json({ message: "Route simple OK" });
});

console.log("📝 Test 2: Route avec paramètre");
try {
  app.get("/param/:id", (req, res) => {
    res.json({ message: "Route avec paramètre OK", id: req.params.id });
  });
  console.log("✅ Route avec paramètre créée");
} catch (error) {
  console.error("❌ Erreur route avec paramètre:", error.message);
}

console.log("📝 Test 3: Route avec multiple paramètres");
try {
  app.get("/multi/:userId/posts/:postId", (req, res) => {
    res.json({ 
      message: "Route multi-paramètres OK", 
      userId: req.params.userId,
      postId: req.params.postId 
    });
  });
  console.log("✅ Route multi-paramètres créée");
} catch (error) {
  console.error("❌ Erreur route multi-paramètres:", error.message);
}

console.log("📝 Test 4: Import du middleware verifyRole");
try {
  const verifyRole = require("./middlewares/verifyRole");
  console.log("✅ verifyRole importé avec succès");
  
  // Test d'utilisation du middleware
  app.get("/protected/:id", verifyRole(["admin"]), (req, res) => {
    res.json({ message: "Route protégée OK" });
  });
  console.log("✅ Route protégée créée");
  
} catch (error) {
  console.error("❌ Erreur avec verifyRole:", error.message);
}

console.log("📝 Test 5: Import du modèle User");
try {
  const { User } = require("./models");
  console.log("✅ Modèle User importé");
} catch (error) {
  console.error("❌ Erreur modèle User:", error.message);
}

console.log("🚀 Tentative de démarrage...");

app.listen(PORT, () => {
  console.log(`✅ Serveur debug démarré sur http://localhost:${PORT}`);
}).on('error', (error) => {
  console.error("❌ Erreur démarrage serveur:", error);
});