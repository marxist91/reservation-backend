#!/bin/bash

echo "🚀 Lancement du pipeline CI/CD cockpit local..."

# Étape 1 : Installation
echo "📦 Installation des dépendances..."
npm ci

# Étape 2 : Lint + Tests
echo "🧪 Lint du code..."
npm run lint || exit 1

echo "🧪 Tests unitaires..."
npm test || exit 1

# Étape 3 : Audit Docker Compose
echo "🔍 Audit de la structure Docker Compose..."
npm run audit:compose || exit 1

# Étape 4 : Validation des dépendances
echo "✅ Validation des dépendances entre services..."
npm run validate:compose || exit 1

# Étape 5 : Organisation des rapports
echo "📊 Organisation des rapports cockpit..."
mkdir -p reports
mv -f compose-cleaner-report.json reports/
mv -f compose-validator-report.json reports/

# Étape 6 : Lancement Docker Compose
echo "🐳 Lancement des services Docker..."
docker compose --env-file .env up -d --build || exit 1

echo "🎉 Pipeline terminé avec succès."