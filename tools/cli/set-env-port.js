const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../../.env");
const selectedPort = process.env.SELECTED_PORT || "3307"; // Valeur par défaut

fs.writeFileSync(envPath, `DB_PORT=${selectedPort}\n`, { encoding: "utf8" });
console.log(`✅ Port ${selectedPort} écrit dans .env`);