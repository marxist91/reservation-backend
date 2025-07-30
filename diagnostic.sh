#!/bin/bash

# Script de diagnostic complet pour le backend de réservation de salles
# Exécutez ce script à la racine de votre projet reservation-backend

echo "🔍 DIAGNOSTIC BACKEND - PLATEFORME RESERVATION SALLES"
echo "=================================================="
echo "Analyse démarrée le: $(date)"
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les titres
print_section() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

# Fonction pour vérifier l'existence d'un fichier/dossier
check_exists() {
    if [ -e "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (manquant)"
        return 1
    fi
}

# 1. INFORMATIONS GÉNÉRALES DU PROJET
print_section "INFORMATIONS GÉNÉRALES"
echo "Répertoire de travail: $(pwd)"
echo "Utilisateur: $(whoami)"
echo ""

# 2. STRUCTURE DES DOSSIERS
print_section "STRUCTURE DES DOSSIERS"
echo "Structure arborescente du projet:"
if command -v tree &> /dev/null; then
    tree -I 'node_modules|.git|__pycache__|*.pyc|venv|env' -L 3
else
    find . -type d -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/venv/*' -not -path '*/__pycache__/*' | head -20
fi
echo ""

# 3. FICHIERS DE CONFIGURATION
print_section "FICHIERS DE CONFIGURATION"
config_files=(
    "package.json"
    "requirements.txt"
    "Pipfile"
    "docker-compose.yml"
    "Dockerfile"
    ".env"
    ".env.example"
    "config.js"
    "config.py"
    "settings.py"
    "app.js"
    "server.js"
    "main.py"
    "app.py"
    "manage.py"
)

for file in "${config_files[@]}"; do
    check_exists "$file"
done

# 4. ANALYSE DES TECHNOLOGIES
print_section "TECHNOLOGIES DÉTECTÉES"

# Node.js/JavaScript
if [ -f "package.json" ]; then
    echo -e "${GREEN}🟢 Node.js/JavaScript détecté${NC}"
    echo "Dependencies principales:"
    if command -v jq &> /dev/null; then
        jq -r '.dependencies | keys[]' package.json 2>/dev/null | head -10 | sed 's/^/  - /'
    else
        grep -A 20 '"dependencies"' package.json | grep '"' | head -10 | sed 's/^/  /'
    fi
    echo ""
fi

# Python
if [ -f "requirements.txt" ] || [ -f "Pipfile" ] || [ -f "manage.py" ]; then
    echo -e "${GREEN}🟢 Python détecté${NC}"
    if [ -f "requirements.txt" ]; then
        echo "Packages Python (requirements.txt):"
        head -10 requirements.txt | sed 's/^/  - /'
    fi
    echo ""
fi

# 5. BASE DE DONNÉES
print_section "CONFIGURATION BASE DE DONNÉES"
db_files=(
    "models/"
    "models.js"
    "models.py"
    "migrations/"
    "database.js"
    "database.py"
    "db.js"
    "db.py"
    "schema.sql"
    "init.sql"
)

echo "Fichiers/dossiers liés à la BDD:"
for item in "${db_files[@]}"; do
    check_exists "$item"
done

# Recherche de configurations DB dans les fichiers
echo ""
echo "Configurations de base de données trouvées:"
if [ -f ".env" ]; then
    echo "Dans .env:"
    grep -i "db\|database\|mongo\|mysql\|postgres" .env 2>/dev/null | sed 's/^/  /' || echo "  Aucune configuration DB trouvée"
fi

# 6. MODÈLES DE DONNÉES
print_section "MODÈLES DE DONNÉES"
echo "Recherche des modèles/schémas:"

# Recherche de modèles dans différents types de fichiers
find . -name "*.js" -o -name "*.py" -o -name "*.ts" | grep -v node_modules | grep -v __pycache__ | xargs grep -l -i "schema\|model\|table" 2>/dev/null | head -10 | while read file; do
    echo "📄 $file"
    # Extraire les noms de modèles
    grep -i "model\|schema\|table\|class.*:" "$file" 2>/dev/null | head -3 | sed 's/^/    /'
done

# 7. ROUTES/ENDPOINTS API
print_section "ROUTES ET ENDPOINTS API"
echo "Fichiers de routes détectés:"

routes_files=(
    "routes/"
    "api/"
    "controllers/"
    "views/"
    "endpoints/"
)

for item in "${routes_files[@]}"; do
    if [ -d "$item" ]; then
        echo -e "${GREEN}✓${NC} Dossier $item trouvé"
        echo "  Fichiers dans $item:"
        ls -la "$item" | grep -E '\.(js|py|ts)$' | awk '{print "    " $9}'
    fi
done

# Recherche d'endpoints dans les fichiers
echo ""
echo "Endpoints API trouvés:"
find . -name "*.js" -o -name "*.py" -o -name "*.ts" | grep -v node_modules | grep -v __pycache__ | xargs grep -h -E "(app\.|router\.|@app\.)(get|post|put|delete|patch)" 2>/dev/null | head -15 | sed 's/^/  /'

# 8. MIDDLEWARE ET AUTHENTIFICATION
print_section "MIDDLEWARE ET AUTHENTIFICATION"
echo "Recherche de middleware d'authentification:"
find . -name "*.js" -o -name "*.py" -o -name "*.ts" | grep -v node_modules | xargs grep -l -i "auth\|jwt\|token\|middleware" 2>/dev/null | head -5 | while read file; do
    echo "📄 $file"
    grep -i "auth\|jwt\|token" "$file" 2>/dev/null | head -2 | sed 's/^/    /'
done

# 9. TESTS
print_section "TESTS"
test_dirs=("test/" "tests/" "__tests__/" "spec/")
test_files_found=false

for dir in "${test_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} Dossier de tests: $dir"
        echo "  Fichiers de test:"
        find "$dir" -name "*.js" -o -name "*.py" -o -name "*.ts" | head -10 | sed 's/^/    /'
        test_files_found=true
    fi
done

if [ "$test_files_found" = false ]; then
    echo -e "${RED}✗${NC} Aucun dossier de tests trouvé"
fi

# 10. DOCUMENTATION
print_section "DOCUMENTATION"
doc_files=(
    "README.md"
    "README.txt"
    "docs/"
    "documentation/"
    "API.md"
    "INSTALL.md"
    "SETUP.md"
)

for item in "${doc_files[@]}"; do
    check_exists "$item"
done

# 11. SCRIPTS ET AUTOMATISATION
print_section "SCRIPTS ET AUTOMATISATION"
if [ -f "package.json" ]; then
    echo "Scripts npm disponibles:"
    if command -v jq &> /dev/null; then
        jq -r '.scripts | keys[]' package.json 2>/dev/null | sed 's/^/  - /'
    else
        grep -A 10 '"scripts"' package.json | grep '"' | sed 's/^/  /'
    fi
fi

# 12. SÉCURITÉ
print_section "VÉRIFICATIONS SÉCURITÉ"
echo "Vérification des fichiers sensibles:"

sensitive_files=(
    ".env"
    "config/database.yml"
    "config/secrets.yml"
    "private.key"
    "*.pem"
)

for pattern in "${sensitive_files[@]}"; do
    if ls $pattern 1> /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️${NC}  Fichier sensible trouvé: $pattern"
    fi
done

# Vérification .gitignore
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓${NC} .gitignore présent"
    echo "  Éléments ignorés:"
    head -10 .gitignore | sed 's/^/    /'
else
    echo -e "${RED}✗${NC} .gitignore manquant"
fi

# 13. ÉTAT DU PROJET
print_section "ANALYSE DE L'ÉTAT DU PROJET"

# Compter les fichiers de code
js_files=$(find . -name "*.js" -not -path "*/node_modules/*" | wc -l)
py_files=$(find . -name "*.py" -not -path "*/venv/*" -not -path "*/__pycache__/*" | wc -l)
total_files=$(($js_files + $py_files))

echo "Statistiques du code:"
echo "  - Fichiers JavaScript: $js_files"
echo "  - Fichiers Python: $py_files"
echo "  - Total fichiers de code: $total_files"

# Dernières modifications
echo ""
echo "Dernières modifications (Git):"
if [ -d ".git" ]; then
    git log --oneline -5 2>/dev/null | sed 's/^/  /' || echo "  Erreur lors de la lecture de l'historique Git"
else
    echo "  Pas de repository Git initialisé"
fi

# 14. RECOMMANDATIONS
print_section "RECOMMANDATIONS ET PROCHAINES ÉTAPES"

echo -e "${YELLOW}📝 À FAIRE:${NC}"

# Vérifications basiques
if [ ! -f "README.md" ]; then
    echo "  - Créer un fichier README.md avec la documentation"
fi

if [ ! -f ".gitignore" ]; then
    echo "  - Créer un fichier .gitignore"
fi

if [ ! -d "test" ] && [ ! -d "tests" ]; then
    echo "  - Ajouter des tests unitaires"
fi

if [ ! -f ".env.example" ]; then
    echo "  - Créer un fichier .env.example pour les variables d'environnement"
fi

echo "  - Vérifier la sécurité des endpoints API"
echo "  - Implémenter la validation des données d'entrée"
echo "  - Ajouter des logs pour le monitoring"
echo "  - Configurer la gestion d'erreurs globale"

# 15. RÉSUMÉ FINAL
print_section "RÉSUMÉ EXÉCUTIF"
echo -e "${GREEN}✅ Diagnostic terminé!${NC}"
echo ""
echo "Pour continuer le développement, partagez ce rapport avec votre équipe de développement."
echo "Les sections marquées en rouge nécessitent une attention particulière."
echo ""
echo "Rapport généré le: $(date)"
echo "=================================================="