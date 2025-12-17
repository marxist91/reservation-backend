# Dockerfile simple pour Railway
FROM node:18-alpine

# Métadonnées
LABEL maintainer="Port Autonome de Lomé"
LABEL description="Backend API de réservation de salles"

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Africa/Lome

# Créer l'utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Définir le timezone
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Copier tout le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p uploads logs tmp && \
    chown -R nodejs:nodejs /app

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/api/health || exit 1

# Commande de démarrage
CMD ["node", "server.js"]
