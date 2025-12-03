#!/usr/bin/env node

/**
 * Compose Cleaner CLI - Audit & Nettoyage des overrides Docker Compose
 * Auteur : Copilot pour Marcel 🧠
 */

import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const MAIN_FILE = 'docker-compose.yml';
const OVERRIDE_FILE = 'docker-compose.override.yml';
const OUTPUT_REPORT = 'compose-cleaner-report.json';
const CONFLICT_SERVICES = ['mysql']; // Services à supprimer

function loadYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (err) {
    console.error(`❌ Erreur de lecture YAML : ${filePath}`, err.message);
    return null;
  }
}

function cleanOverride(main, override) {
  const report = {
    timestamp: new Date().toISOString(),
    removedServices: [],
    conflicts: [],
    overrideBefore: override,
    overrideAfter: JSON.parse(JSON.stringify(override)),
  };

  if (!override.services) return report;

  for (const svc of Object.keys(override.services)) {
    if (CONFLICT_SERVICES.includes(svc)) {
      delete override.services[svc];
      report.removedServices.push(svc);
    } else if (main.services?.[svc]) {
      report.conflicts.push({
        service: svc,
        reason: 'Redéfini dans override alors qu’il existe dans le fichier principal',
      });
    }
  }

  return report;
}

function saveYaml(filePath, data) {
  try {
    const yamlStr = yaml.dump(data, { noRefs: true });
    fs.writeFileSync(filePath, yamlStr, 'utf8');
    console.log(`✅ Fichier nettoyé : ${filePath}`);
  } catch (err) {
    console.error(`❌ Erreur d’écriture YAML : ${filePath}`, err.message);
  }
}

function saveReport(report) {
  try {
    fs.writeFileSync(OUTPUT_REPORT, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📊 Rapport généré : ${OUTPUT_REPORT}`);
  } catch (err) {
    console.error(`❌ Erreur d’écriture du rapport JSON`, err.message);
  }
}

function runCleaner() {
  const main = loadYaml(MAIN_FILE);
  const override = loadYaml(OVERRIDE_FILE);

  if (!main || !override) return;

  const report = cleanOverride(main, override);
  saveYaml(OVERRIDE_FILE, report.overrideAfter);
  saveReport(report);
}

runCleaner();