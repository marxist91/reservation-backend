// generate-frontend-spec.js
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
const role = process.argv[2]; // Ex: 'admin'

//const swagger = require('../../swagger.json'); // ou openapi.json si c’est ce nom là

const rootDir = path.resolve(__dirname, './');
const allFiles = fs.readdirSync(rootDir);

console.log("📂 Fichiers détectés dans le dossier racine :");
allFiles.forEach(f => {
  console.log(" -", f);
});

const possibleFiles = ['swagger.json', 'openapi.json', 'swagger.yaml', 'openapi.yaml'];
const found = allFiles.filter(f => possibleFiles.includes(f));

if (found.length === 0) {
  console.log("\n⚠️ Aucun fichier Swagger reconnu parmi :", possibleFiles.join(', '));
  console.log("💡 Renomme ton fichier en swagger.json ou openapi.yaml, ou modifie le script pour l'adapter.");
  process.exit(1);
}




if (!role) {
  console.error('❌ Rôle manquant. Syntaxe attendue : node generate-frontend-spec.js <role>');
  process.exit(1);
}




// 🔍 Détection du fichier Swagger
//const possibleFiles = ['swagger.json', 'openapi.json', 'swagger.yaml', 'openapi.yaml'];
let swagger = null;

for (const file of possibleFiles) {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    swagger = file.endsWith('.yaml') ? yaml.load(content) : JSON.parse(content);
    console.log(`✅ Swagger détecté : ${file}`);
    break;
  }
}

if (!swagger) {
  console.error('❌ Aucun fichier Swagger trouvé dans le dossier racine.');
  process.exit(1);
}


if (allFiles.includes('swagger-config.js')) {
  try {
    const swagger = require(path.join(rootDir, 'swagger-config.js'));
    if (swagger.openapi || swagger.swagger || swagger.paths) {
      console.log("\n✅ Swagger trouvé dans swagger-config.js");
      // continue avec le traitement...
    } else {
      console.log("\n⚠️ swagger-config.js détecté mais ne semble pas contenir un Swagger valide (pas de 'paths', 'openapi'...)");
    }
  } catch (e) {
    console.log("\n❌ Erreur en chargeant swagger-config.js :", e.message);
  }
}
// 🎯 Filtrage par rôle
const filteredPaths = {};
for (const [pathKey, methods] of Object.entries(swagger.paths || {})) {
  for (const [method, config] of Object.entries(methods)) {
    const rbac = config['x-rbac'] || [];
    if (rbac.includes(role)) {
      if (!filteredPaths[pathKey]) filteredPaths[pathKey] = {};
      filteredPaths[pathKey][method] = {
        summary: config.summary,
        tags: config.tags,
        parameters: config.parameters,
        requestBody: config.requestBody,
        responses: config.responses,
      };
    }
  }
}

// 🧩 Construction du spec frontend
const spec = {
  openapi: swagger.openapi || '3.0.0',
  info: {
    title: `${swagger.info?.title || 'API'} - Frontend (${role})`,
    version: swagger.info?.version || '1.0.0',
  },
  paths: filteredPaths,
  components: {
    schemas: swagger.components?.schemas || {},
  },
};

const outPath = path.resolve(__dirname, `frontend-api-schema-${role}.json`);
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`🎉 Spec frontend générée : ${outPath}`);