#!/usr/bin/env node

/**
 * Compose Validator CLI - Audit des dépendances Docker Compose
 * Auteur : Copilot pour Marcel 🧠
 */

import fs from 'fs';
import yaml from 'js-yaml';

const FILES = ['docker-compose.yml', 'docker-compose.override.yml'];
const OUTPUT_REPORT = 'compose-validator-report.json';

function loadYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (err) {
    console.error(`❌ Erreur de lecture YAML : ${filePath}`, err.message);
    return null;
  }
}

function collectServices(composeFiles) {
  const allServices = new Set();
  for (const file of composeFiles) {
    const data = loadYaml(file);
    if (data?.services) {
      Object.keys(data.services).forEach(svc => allServices.add(svc));
    }
  }
  return allServices;
}

function validateDependsOn(composeFiles, allServices) {
  const report = {
    timestamp: new Date().toISOString(),
    invalidDependencies: [],
    checkedFiles: composeFiles,
  };

  for (const file of composeFiles) {
    const data = loadYaml(file);
    if (!data?.services) continue;

    for (const [svcName, svcDef] of Object.entries(data.services)) {
      const deps = svcDef.depends_on || [];
      for (const dep of deps) {
        if (!allServices.has(dep)) {
          report.invalidDependencies.push({
            service: svcName,
            depends_on: dep,
            file,
            reason: 'Service dépendant non défini dans aucun fichier compose',
          });
        }
      }
    }
  }

  return report;
}

function saveReport(report) {
  try {
    fs.writeFileSync(OUTPUT_REPORT, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📊 Rapport généré : ${OUTPUT_REPORT}`);
  } catch (err) {
    console.error(`❌ Erreur d’écriture du rapport JSON`, err.message);
  }
}

function runValidator() {
  const allServices = collectServices(FILES);
  const report = validateDependsOn(FILES, allServices);
  saveReport(report);

  if (report.invalidDependencies.length > 0) {
    console.warn(`⚠️ ${report.invalidDependencies.length} dépendances invalides détectées`);
    report.invalidDependencies.forEach(dep => {
      console.warn(`- ${dep.service} → ${dep.depends_on} (fichier: ${dep.file})`);
    });
    process.exitCode = 1;
  } else {
    console.log(`✅ Toutes les dépendances sont valides`);
  }
}

runValidator();