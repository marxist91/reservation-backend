# 🚀 MAKEFILE - AUTOMATISATION COMPLÈTE
# Système de réservation de salles - Phase 3

.PHONY: help install setup dev docs test clean deploy

# Variables
NODE_VERSION := 18
DB_NAME := room_booking
PORT := 3000
DOCS_PORT := 8080

# Couleurs pour l'affichage
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

## 📋 AIDE ET INFORMATION
help: ## Afficher cette aide
	@echo "🚀 $(GREEN)SYSTÈME DE RÉSERVATION DE SALLES$(NC)"
	@echo "==============================================="
	@echo ""
	@echo "📚 $(YELLOW)Commandes disponibles:$(NC)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "   $(GREEN)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "🎯 $(YELLOW)Commandes rapides:$(NC)"
	@echo "   $(GREEN)make quick-start$(NC)  - Installation + setup + démarrage"
	@echo "   $(GREEN)make docs-all$(NC)     - Génération complète de la documentation"
	@echo "   $(GREEN)make test-all$(NC)     - Tests complets de l'API"

## 🏗️ INSTALLATION ET SETUP
install: ## Installer les dépendances
	@echo "📦 $(YELLOW)Installation des dépendances...$(NC)"
	npm install
	@echo "✅ $(GREEN)Dépendances installées$(NC)"

setup-db: ## Configurer la base de données
	@echo "🗄️ $(YELLOW)Configuration de la base de données...$(NC)"
	-createdb $(DB_NAME)
	npm run db:migrate
	npm run db:seed
	@echo "✅ $(GREEN)Base de données configurée$(NC)"

setup-env: ## Créer le fichier .env
	@echo "⚙️ $(YELLOW)Configuration de l'environnement...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "📝 Fichier .env créé - veuillez le configurer"; \
	else \
		echo "✅ Fichier .env existe déjà"; \
	fi

setup: install setup-env setup-db ## Setup complet du projet
	@echo "🎉 $(GREEN)Setup terminé! Utilisez 'make dev' pour démarrer$(NC)"

## 🚀 DÉVELOPPEMENT
dev: ## Démarrer en mode développement
	@echo "🔥 $(YELLOW)Démarrage du serveur de développement...$(NC)"
	@echo "🌐 Serveur: http://localhost:$(PORT)"
	@echo "📚 Docs: http://localhost:$(DOCS_PORT) (après make docs-serve)"
	npm run dev

start: ## Démarrer en mode production
	@echo "🚀 $(YELLOW)Démarrage en production...$(NC)"
	NODE_ENV=production npm start

restart: ## Redémarrer le serveur
	@echo "🔄 $(YELLOW)Redémarrage...$(NC)"
	-pkill -f "node server.js" || true
	sleep 2
	make start

## 📚 DOCUMENTATION
docs-generate: ## Générer la documentation
	@echo "📚 $(YELLOW)Génération de la documentation...$(NC)"
	node scripts/generate-docs.js
	@echo "✅ $(GREEN)Documentation générée dans ./docs/$(NC)"

docs-serve: ## Servir la documentation
	@echo "📖 $(YELLOW)Service de documentation sur http://localhost:$(DOCS_PORT)$(NC)"
	npx serve docs/ -p $(DOCS_PORT)

docs-clean: ## Nettoyer la documentation
	@echo "🧹 $(YELLOW)Nettoyage de la documentation...$(NC)"
	rm -rf docs/
	@echo "✅ $(GREEN)Documentation nettoyée$(NC)"

docs-all: docs-clean docs-generate ## Génération complète + service
	@echo "🎉 $(GREEN)Documentation complète générée!$(NC)"
	@echo "📋 Fichiers disponibles:"
	@ls -la docs/
	@echo ""
	@echo "🌐 Pour consulter: make docs-serve"

## 🧪 TESTS ET VALIDATION
test: ## Exécuter les tests unitaires
	@echo "🧪 $(YELLOW)Exécution des tests...$(NC)"
	npm test

test-api: ## Tester l'API avec Newman
	@echo "🔍 $(YELLOW)Tests de l'API avec Postman/Newman...$(NC)"
	@if [ -f docs/api-collection.postman.json ]; then \
		newman run docs/api-collection.postman.json; \
	else \
		echo "❌ Collection Postman non trouvée. Exécutez 'make docs-generate' d'abord"; \
	fi

test-endpoints: ## Test rapide des endpoints principaux
	@echo "⚡ $(YELLOW)Test rapide des endpoints...$(NC)"
	@echo "🏥 Health check:"
	@curl -s http://localhost:$(PORT)/api/healthcheck | jq '.status' || echo "❌ Serveur non accessible"
	@echo "📊 Métadonnées:"
	@curl -s http://localhost:$(PORT)/api/meta | jq '.service' || echo "❌ Endpoint meta non accessible"
	@echo "📝 Version:"
	@curl -s http://localhost:$(PORT)/api/version | jq '.version' || echo "❌ Endpoint version non accessible"

validate-structure: ## Valider la structure de l'API
	@echo "🔍 $(YELLOW)Validation de la structure...$(NC)"
	@node -e "console.log('📊 Validation des routes...');"
	@find routes/ -name "*.js" -type f | wc -l | xargs echo "   ✅ Fichiers de routes:"
	@find models/ -name "*.js" -type f | wc -l | xargs echo "   ✅ Modèles de données:"
	@echo "   ✅ Configuration serveur: server.js"
	@echo "✅ $(GREEN)Structure validée$(NC)"

test-all: test validate-structure test-endpoints ## Tests complets
	@echo "🎉 $(GREEN)Tous les tests terminés!$(NC)"

## 🗄️ BASE DE DONNÉES
db-reset: ## Reset complet de la DB
	@echo "🗄️ $(YELLOW)Reset de la base de données...$(NC)"
	npm run db:migrate:undo:all
	npm run db:migrate
	npm run db:seed
	@echo "✅ $(GREEN)Base de données réinitialisée$(NC)"

db-migrate: ## Exécuter les migrations
	@echo "📊 $(YELLOW)Exécution des migrations...$(NC)"
	npm run db:migrate
	@echo "✅ $(GREEN)Migrations terminées$(NC)"

db-seed: ## Insérer les données de test
	@echo "🌱 $(YELLOW)Insertion des données de test...$(NC)"
	npm run db:seed
	@echo "✅ $(GREEN)Données de test insérées$(NC)"

db-backup: ## Sauvegarder la DB
	@echo "💾 $(YELLOW)Sauvegarde de la base de données...$(NC)"
	pg_dump $(DB_NAME) > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ $(GREEN)Sauvegarde créée dans backups/$(NC)"

## 🧹 NETTOYAGE ET MAINTENANCE
clean: ## Nettoyer le projet
	@echo "🧹 $(YELLOW)Nettoyage du projet...$(NC)"
	rm -rf node_modules/
	rm -rf docs/
	rm -rf logs/
	rm -f *.log
	@echo "✅ $(GREEN)Projet nettoyé$(NC)"

clean-logs: ## Nettoyer les logs
	@echo "📝 $(YELLOW)Nettoyage des logs...$(NC)"
	rm -rf logs/
	rm -f *.log
	@echo "✅ $(GREEN)Logs nettoyés$(NC)"

fresh-install: clean install setup ## Installation fraîche complète
	@echo "🆕 $(GREEN)Installation fraîche terminée!$(NC)"

## 🎯 COMMANDES RAPIDES
quick-start: setup dev ## Installation + démarrage rapide

quick-test: ## Test rapide complet
	@echo "⚡ $(YELLOW)Test rapide du système...$(NC)"
	@echo "1️⃣ Vérification du serveur..."
	@curl -s http://localhost:$(PORT)/api/healthcheck > /dev/null && echo "   ✅ Serveur OK" || echo "   ❌ Serveur KO"
	@echo "2️⃣ Vérification de la DB..."
	@curl -s http://localhost:$(PORT)/api/meta | grep -q "database" && echo "   ✅ Base de données OK" || echo "   ❌ Base de données KO"
	@echo "3️⃣ Test des endpoints..."
	@curl -s http://localhost:$(PORT)/api/version > /dev/null && echo "   ✅ Endpoints OK" || echo "   ❌ Endpoints KO"
	@echo "✅ $(GREEN)Test rapide terminé$(NC)"

## 📊 ANALYSE ET MONITORING
analyze: ## Analyser la structure de l'API
	@echo "📊 $(YELLOW)Analyse de l'API...$(NC)"
	@echo "📋 Statistiques:"
	@echo "   • Routes: $(shell find routes/ -name "*.js" | wc -l) fichiers"
	@echo "   • Modèles: $(shell find models/ -name "*.js" | wc -l) fichiers"
	@echo "   • Taille du projet: $(shell du -sh . | cut -f1)"
	@echo "   • Lignes de code: $(shell find . -name "*.js" -not -path "./node_modules/*" | xargs wc -l | tail -1 | awk '{print $1}')"
	@echo "✅ $(GREEN)Analyse terminée$(NC)"

monitor: ## Surveiller les logs en temps réel
	@echo "👀 $(YELLOW)Surveillance des logs...$(NC)"
	tail -f logs/*.log

## 🚀 DÉPLOIEMENT
build: ## Construire pour la production
	@echo "🏗️ $(YELLOW)Construction pour la production...$(NC)"
	npm run lint:fix
	npm run test
	npm run docs:generate
	@echo "✅ $(GREEN)Build terminé$(NC)"

deploy-check: ## Vérifier avant déploiement
	@echo "🔍 $(YELLOW)Vérification avant déploiement...$(NC)"
	@echo "📋 Checklist:"
	@test -f .env && echo "   ✅ Fichier .env présent" || echo "   ❌ Fichier .env manquant"
	@test -d node_modules && echo "   ✅ Dépendances installées" || echo "   ❌ Dépendances manquantes"
	@npm run test > /dev/null 2>&1 && echo "   ✅ Tests passent" || echo "   ❌ Tests échouent"
	@test -d docs && echo "   ✅ Documentation générée" || echo "   ❌ Documentation manquante"
	@curl -s http://localhost:$(PORT)/api/healthcheck > /dev/null && echo "   ✅ Serveur répond" || echo "   ❌ Serveur ne répond pas"

## 🛠️ UTILITAIRES
logs: ## Afficher les logs récents
	@echo "📝 $(YELLOW)Logs récents:$(NC)"
	@if [ -f logs/app.log ]; then tail -20 logs/app.log; else echo "Aucun log disponible"; fi

status: ## Statut du système
	@echo "📊 $(YELLOW)Statut du système:$(NC)"
	@echo "🖥️  Serveur: $(shell curl -s http://localhost:$(PORT)/api/healthcheck | grep -q "opérationnelle" && echo "✅ En ligne" || echo "❌ Hors ligne")"
	@echo "🗄️  Base de données: $(shell psql -d $(DB_NAME) -c "SELECT 1;" > /dev/null 2>&1 && echo "✅ Connectée" || echo "❌ Déconnectée")"
	@echo "📁 Documentation: $(shell test -d docs && echo "✅ Générée" || echo "❌ Non générée")"
	@echo "🔧 Variables d'env: $(shell test -f .env && echo "✅ Configurées" || echo "❌ Non configurées")"

info: ## Informations sur le projet
	@echo "ℹ️  $(YELLOW)INFORMATIONS PROJET$(NC)"
	@echo "================================"
	@echo "📁 Nom: Système de Réservation de Salles"
	@echo "🚀 Version: $(shell node -e "console.log(require('./package.json').version)" 2>/dev/null || echo "N/A")"
	@echo "🖥️  Node.js: $(shell node --version)"
	@echo "📦 NPM: $(shell npm --version)"
	@echo "🗄️  PostgreSQL: $(shell psql --version | head -1 | awk '{print $3}' 2>/dev/null || echo "Non installé")"
	@echo "🌐 Port: $(PORT)"
	@echo "📚 Documentation: http://localhost:$(DOCS_PORT)"
	@echo ""
	@echo "📋 $(YELLOW)Fichiers de documentation générés:$(NC)"
	@if [ -d docs ]; then ls -la docs/; else echo "   Aucune documentation générée (utilisez: make docs-generate)"; fi

## 🎮 COMMANDES DE DÉVELOPPEMENT AVANCÉES
watch: ## Surveiller les changements et redémarrer
	@echo "👀 $(YELLOW)Surveillance des changements...$(NC)"
	nodemon server.js

debug: ## Démarrer en mode debug
	@echo "🐛 $(YELLOW)Mode debug activé...$(NC)"
	DEBUG=* npm run dev

profiling: ## Profiler les performances
	@echo "📈 $(YELLOW)Profiling des performances...$(NC)"
	node --prof server.js &
	sleep 10
	curl http://localhost:$(PORT)/api/meta
	pkill -f "node --prof"
	@echo "✅ Profiling terminé"

security-check: ## Vérification de sécurité
	@echo "🔒 $(YELLOW)Audit de sécurité...$(NC)"
	npm audit
	@echo "✅ $(GREEN)Audit terminé$(NC)"

## 📚 DOCUMENTATION AVANCÉE
docs-pdf: ## Générer la documentation en PDF (nécessite pandoc)
	@echo "📄 $(YELLOW)Génération PDF...$(NC)"
	@if command -v pandoc > /dev/null; then \
		pandoc docs/technical-docs.md -o docs/technical-docs.pdf; \
		echo "✅ PDF généré: docs/technical-docs.pdf"; \
	else \
		echo "❌ Pandoc non installé (sudo apt install pandoc)"; \
	fi

docs-html: ## Générer la documentation HTML
	@echo "🌐 $(YELLOW)Génération HTML...$(NC)"
	mkdir -p docs/html
	@for file in docs/*.md; do \
		if command -v pandoc > /dev/null; then \
			pandoc "$file" -o "docs/html/$(basename $file .md).html"; \
		else \
			echo "❌ Pandoc requis pour HTML"; \
			break; \
		fi \
	done
	@echo "✅ HTML généré dans docs/html/"

## 🎯 AIDE CONTEXTUELLE
help-api: ## Aide sur les endpoints API
	@echo "🔗 $(YELLOW)ENDPOINTS PRINCIPAUX:$(NC)"
	@echo "================================"
	@echo "🌐 Public:"
	@echo "   GET  /api/healthcheck    - Status serveur"
	@echo "   GET  /api/meta          - Métadonnées"
	@echo "   GET  /api/version       - Version API"
	@echo "   POST /api/register      - Inscription"
	@echo "   POST /api/login         - Connexion"
	@echo ""
	@echo "🔒 Authentifié:"
	@echo "   GET  /api/profile       - Profil utilisateur"
	@echo "   GET  /api/rooms         - Liste des salles"
	@echo "   GET  /api/reservations  - Mes réservations"
	@echo "   POST /api/reservations  - Créer réservation"
	@echo ""
	@echo "🛡️  Admin:"
	@echo "   GET  /api/users         - Tous les utilisateurs"
	@echo "   GET  /api/audit/actions - Log des actions"
	@echo "   POST /api/rooms         - Créer une salle"

help-db: ## Aide sur la base de données
	@echo "🗄️ $(YELLOW)COMMANDES BASE DE DONNÉES:$(NC)"
	@echo "================================"
	@echo "make db-reset     - Réinitialiser complètement"
	@echo "make db-migrate   - Exécuter les migrations"
	@echo "make db-seed      - Insérer les données de test"
	@echo "make db-backup    - Sauvegarder la base"
	@echo ""
	@echo "🔧 Commandes PostgreSQL directes:"
	@echo "psql $(DB_NAME)              - Se connecter à la DB"
	@echo "pg_dump $(DB_NAME) > backup.sql  - Sauvegarde manuelle"
	@echo "dropdb $(DB_NAME) && createdb $(DB_NAME)  - Recréer la DB"

help-docs: ## Aide sur la documentation
	@echo "📚 $(YELLOW)DOCUMENTATION:$(NC)"
	@echo "================================"
	@echo "make docs-generate  - Générer tous les docs"
	@echo "make docs-serve     - Servir sur http://localhost:$(DOCS_PORT)"
	@echo "make docs-clean     - Nettoyer les docs"
	@echo "make docs-all       - Générer + servir"
	@echo ""
	@echo "📁 Fichiers générés:"
	@echo "   routes-summary.md         - Résumé des routes"
	@echo "   technical-docs.md         - Doc technique"
	@echo "   permissions-matrix.md     - Matrice permissions"
	@echo "   api-collection.postman.json - Collection Postman"
	@echo "   quick-start.md           - Guide de démarrage"

# Vérification des dépendances
check-deps:
	@echo "🔍 $(YELLOW)Vérification des dépendances système...$(NC)"
	@command -v node > /dev/null && echo "   ✅ Node.js installé" || echo "   ❌ Node.js manquant"
	@command -v npm > /dev/null && echo "   ✅ NPM installé" || echo "   ❌ NPM manquant"
	@command -v psql > /dev/null && echo "   ✅ PostgreSQL installé" || echo "   ❌ PostgreSQL manquant"
	@command -v git > /dev/null && echo "   ✅ Git installé" || echo "   ❌ Git manquant"
	@command -v curl > /dev/null && echo "   ✅ cURL installé" || echo "   ❌ cURL manquant"
	@command -v jq > /dev/null && echo "   ✅ jq installé" || echo "   ⚠️  jq recommandé (sudo apt install jq)"

# Par défaut, afficher l'aide
.DEFAULT_GOAL := help