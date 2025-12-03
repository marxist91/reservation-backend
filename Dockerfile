# Dockerfile multi-stage pour la plateforme de réservation
# Optimisé pour différents environnements

# ========================================
# Stage 1: Base commune
# ========================================
FROM node:18-alpine AS base

# Métadonnées
LABEL maintainer="Plateforme de Réservation"
LABEL version="1.0.0"
LABEL description="Application de réservation Node.js avec MySQL et Redis"

# Variables d'environnement de base
ENV NODE_ENV=production
ENV PORT=3000
ENV APP_DIR=/app

# Créer l'utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Créer et configurer le répertoire de travail
WORKDIR $APP_DIR

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    curl \
    tzdata \
    tini \
    && rm -rf /var/cache/apk/*

# Définir le timezone (Lomé, Togo)
ENV TZ=Africa/Lome
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# ========================================
# Stage 2: Installation des dépendances
# ========================================
FROM base AS deps

# Copier les fichiers de configuration des dépendances
COPY package*.json ./
COPY yarn.lock* ./

# Installer toutes les dépendances (dev + prod)
RUN npm ci --include=dev && \
    npm cache clean --force

# ========================================
# Stage 3: Build de l'application
# ========================================
FROM deps AS build

# Copier le code source
COPY . .

# Build de l'application si nécessaire (TypeScript, etc.)
RUN if [ -f "tsconfig.json" ]; then npm run build; fi

# ========================================
# Stage 4: Production
# ========================================
FROM base AS production

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copier l'application buildée
#COPY --from=build --chown=nodejs:nodejs $APP_DIR/dist ./dist/ 2>/dev/null || true
#COPY --from=build --chown=nodejs:nodejs $APP_DIR/src ./src/ 2>/dev/null || true
#COPY --from=build --chown=nodejs:nodejs $APP_DIR/public ./public/ 2>/dev/null || true
#COPY --from=build --chown=nodejs:nodejs $APP_DIR/views ./views/ 2>/dev/null || true

# Copier les fichiers de configuration
COPY --chown=nodejs:nodejs config/ ./config/
COPY --chown=nodejs:nodejs scripts/docker-healthcheck.sh ./scripts/

# Créer les dossiers nécessaires
RUN mkdir -p uploads logs tmp && \
    chown -R nodejs:nodejs uploads logs tmp

# Rendre le script de health check exécutable
RUN chmod +x ./scripts/docker-healthcheck.sh

# Exposer le port
EXPOSE $PORT

# Configurer le health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ./scripts/docker-healthcheck.sh

# Passer à l'utilisateur non-root
USER nodejs

# Point d'entrée avec tini pour la gestion des signaux
ENTRYPOINT ["/sbin/tini", "--"]

# Commande par défaut
CMD ["node", "src/app.js"]

# ========================================
# Stage 5: Développement
# ========================================
FROM deps AS development

# Variables d'environnement pour le développement
ENV NODE_ENV=development
ENV LOG_LEVEL=debug

# Installer les outils de développement globaux
USER root
RUN npm install -g nodemon concurrently

# Copier tout le code source (avec hot reload)
COPY --chown=nodejs:nodejs . .

# Créer les dossiers de développement
RUN mkdir -p uploads logs tmp data/mysql data/redis && \
    chown -R nodejs:nodejs uploads logs tmp data

# Exposer les ports de développement
EXPOSE $PORT 9229

# Revenir à l'utilisateur nodejs
USER nodejs

# Commande de développement avec hot reload
CMD ["npm", "run", "dev"]

# ========================================
# Stage 6: Tests
# ========================================
FROM deps AS test

# Variables d'environnement pour les tests
ENV NODE_ENV=test
ENV LOG_LEVEL=silent

# Copier le code source
COPY --chown=nodejs:nodejs . .

# Installer les dépendances de test
USER root
RUN npm install -g jest supertest nyc

# Créer les dossiers de test
RUN mkdir -p coverage test-results && \
    chown -R nodejs:nodejs coverage test-results

USER nodejs

# Commande de test
CMD ["npm", "run", "test"]

# ========================================
# Stage 7: Production optimisée (optionnel)
# ========================================
FROM node:18-alpine AS production-minimal

# Installation minimale pour un déploiement ultra-léger
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copier uniquement les fichiers nécessaires depuis l'étape de build
COPY --from=production /app/node_modules ./node_modules
COPY --from=production /app/src ./src
COPY --from=production /app/package.json ./
COPY --from=production /app/scripts/docker-healthcheck.sh ./scripts/

# Utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p uploads logs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ./scripts/docker-healthcheck.sh

CMD ["node", "src/app.js"]