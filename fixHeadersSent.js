import fs from "fs";
import path from "path";

const routesFolder = path.join(__dirname, "routes");
const fichiers = fs.readdirSync(routesFolder).filter(f => f.endsWith(".js"));

const regexListe = [
  { pattern: /(?<!return\s)(\s*)res\.json\(/, replace: "$1return res.json(" },
  { pattern: /(?<!return\s)(\s*)res\.send\(/, replace: "$1return res.send(" },
  { pattern: /(?<!return\s)(\s*)res\.status\(\d+\)\.json\(/, replace: "$1return res.status(" }
];

fichiers.forEach(fichier => {
  const chemin = path.join(routesFolder, fichier);
  let contenu = fs.readFileSync(chemin, "utf-8");
  let modifié = false;

  regexListe.forEach(({ pattern, replace }) => {
    if (pattern.test(contenu)) {
      contenu = contenu.replace(pattern, replace);
      modifié = true;
    }
  });

  if (modifié) {
    fs.writeFileSync(chemin, contenu, "utf-8");
    console.log(`✅ Corrigé : ${fichier}`);
  } else {
    console.log(`👍 Aucun problème détecté : ${fichier}`);
  }
});