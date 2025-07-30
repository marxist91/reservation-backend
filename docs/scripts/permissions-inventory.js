#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 Inventaire des permissions en cours...\n');

class PermissionsInventory {
    constructor() {
        this.permissions = new Map();
        this.roles = new Map();
        this.middlewarePermissions = [];
        this.routePermissions = [];
        this.outputFile = path.join(__dirname, '../generated/permissions-inventory.md');
    }

    // Analyser les middlewares de permissions
    analyzeMiddleware() {
        const middlewareDir = path.join(__dirname, '../../middleware');
        
        if (!fs.existsSync(middlewareDir)) {
            console.log('⚠️  Dossier middleware/ non trouvé. Création d\'exemples...');
            this.createExampleMiddleware();
            return;
        }

        const middlewareFiles = fs.readdirSync(middlewareDir).filter(file => file.endsWith('.js'));
        
        if (middlewareFiles.length === 0) {
            console.log('⚠️  Aucun middleware trouvé. Création d\'exemples...');
            this.createExampleMiddleware();
            return;
        }

        middlewareFiles.forEach(file => {
            console.log(`🔍 Analyse du middleware: ${file}`);
            this.analyzeMiddlewareFile(path.join(middlewareDir, file), file);
        });
    }

    // Analyser un fichier middleware spécifique
    analyzeMiddlewareFile(filePath, fileName) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Rechercher les patterns de permissions
            const permissionPatterns = [
                /role\s*===?\s*['"`](\w+)['"`]/gi,
                /hasRole\s*\(\s*['"`](\w+)['"`]\s*\)/gi,
                /hasPermission\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/gi,
                /checkPermission\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/gi,
                /requireRole\s*\(\s*['"`](\w+)['"`]\s*\)/gi
            ];

            const permissions = new Set();
            
            permissionPatterns.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    permissions.add(match[1]);
                }
            });

            if (permissions.size > 0) {
                this.middlewarePermissions.push({
                    file: fileName,
                    permissions: Array.from(permissions),
                    type: 'middleware'
                });

                // Ajouter aux permissions globales
                permissions.forEach(perm => {
                    if (!this.permissions.has(perm)) {
                        this.permissions.set(perm, {
                            name: perm,
                            type: this.determinePermissionType(perm),
                            usedIn: [],
                            description: this.generatePermissionDescription(perm)
                        });
                    }
                    this.permissions.get(perm).usedIn.push(`middleware/${fileName}`);
                });
            }

        } catch (error) {
            console.error(`❌ Erreur lors de l'analyse de ${fileName}:`, error.message);
        }
    }

    // Analyser les routes pour les permissions
    analyzeRoutes() {
        const routesDir = path.join(__dirname, '../../routes');
        
        if (!fs.existsSync(routesDir)) {
            console.log('⚠️  Dossier routes/ non trouvé.');
            return;
        }

        const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
        
        routeFiles.forEach(file => {
            console.log(`🛣️  Analyse des routes: ${file}`);
            this.analyzeRouteFile(path.join(routesDir, file), file);
        });
    }

    // Analyser un fichier de route pour les permissions
    analyzeRouteFile(filePath, fileName) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Rechercher les middleware de permissions dans les routes
            const routePermissionPatterns = [
                /router\.\w+\([^,]+,\s*([^,]*auth[^,]*),/gi,
                /router\.\w+\([^,]+,\s*([^,]*admin[^,]*),/gi,
                /router\.\w+\([^,]+,\s*([^,]*permission[^,]*),/gi
            ];

            const routePermissions = [];
            
            routePermissionPatterns.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const middlewareCall = match[1].trim();
                    routePermissions.push({
                        middleware: middlewareCall,
                        context: this.extractRouteContext(content, match.index)
                    });
                }
            });

            if (routePermissions.length > 0) {
                this.routePermissions.push({
                    file: fileName,
                    permissions: routePermissions,
                    type: 'route'
                });
            }

        } catch (error) {
            console.error(`❌ Erreur lors de l'analyse des routes ${fileName}:`, error.message);
        }
    }

    // Extraire le contexte de la route
    extractRouteContext(content, matchIndex) {
        const lines = content.substring(0, matchIndex).split('\n');
        const currentLine = lines[lines.length - 1];
        
        // Extraire la méthode et le chemin
        const routeMatch = currentLine.match(/router\.(\w+)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (routeMatch) {
            return {
                method: routeMatch[1].toUpperCase(),
                path: routeMatch[2]
            };
        }
        
        return { method: 'UNKNOWN', path: 'unknown' };
    }

    // Déterminer le type de permission
    determinePermissionType(permission) {
        const perm = permission.toLowerCase();
        
        if (perm.includes('admin')) return 'role';
        if (perm.includes('user')) return 'role';
        if (perm.includes('guest')) return 'role';
        if (perm.includes('read')) return 'action';
        if (perm.includes('write')) return 'action';
        if (perm.includes('delete')) return 'action';
        if (perm.includes('create')) return 'action';
        if (perm.includes('update')) return 'action';
        
        return 'custom';
    }

    // Générer une description automatique
    generatePermissionDescription(permission) {
        const perm = permission.toLowerCase();
        
        const descriptions = {
            'admin': 'Accès administrateur complet',
            'user': 'Utilisateur standard authentifié',
            'guest': 'Utilisateur invité non authentifié',
            'read': 'Permission de lecture/consultation',
            'write': 'Permission d\'écriture/modification',
            'delete': 'Permission de suppression',
            'create': 'Permission de création',
            'update': 'Permission de mise à jour'
        };

        for (const [key, desc] of Object.entries(descriptions)) {
            if (perm.includes(key)) {
                return desc;
            }
        }

        return `Permission personnalisée: ${permission}`;
    }

    // Créer des exemples de middleware de permissions
    createExampleMiddleware() {
        const middlewareDir = path.join(__dirname, '../../middleware');
        if (!fs.existsSync(middlewareDir)) {
            fs.mkdirSync(middlewareDir, { recursive: true });
        }

        // Middleware d'authentification
        const authMiddleware = `const jwt = require('jsonwebtoken');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\\'accès requis' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Middleware de vérification du rôle admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Accès administrateur requis' });
    }
};

// Middleware de vérification des permissions
const hasPermission = (permission) => {
    return (req, res, next) => {
        if (req.user && req.user.permissions && req.user.permissions.includes(permission)) {
            next();
        } else {
            res.status(403).json({ error: \`Permission requise: \${permission}\` });
        }
    };
};

module.exports = {
    authenticateToken,
    requireAdmin,
    hasPermission
};
`;

        fs.writeFileSync(path.join(middlewareDir, 'auth.js'), authMiddleware);
        console.log('✅ Middleware d\'authentification créé: middleware/auth.js');

        // Analyser l'exemple créé
        this.analyzeMiddlewareFile(path.join(middlewareDir, 'auth.js'), 'auth.js');
    }

    // Générer le rapport d'inventaire
    generateReport() {
        const totalPermissions = this.permissions.size;
        const totalMiddleware = this.middlewarePermissions.length;
        const totalRoutes = this.routePermissions.length;

        let markdown = `# 🔐 Inventaire des Permissions

> Rapport généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}

## 📊 Résumé

- **Permissions uniques identifiées**: ${totalPermissions}
- **Fichiers middleware analysés**: ${totalMiddleware}
- **Fichiers routes analysés**: ${totalRoutes}
- **Date d'analyse**: ${new Date().toISOString()}

---

## 🎯 Liste des permissions

| Permission | Type | Description | Utilisée dans |
|------------|------|-------------|---------------|
`;

        for (const [name, info] of this.permissions) {
            const usedIn = info.usedIn.join(', ');
            markdown += `| \`${name}\` | ${info.type} | ${info.description} | ${usedIn} |\n`;
        }

        markdown += '\n---\n\n';

        // Détails par middleware
        if (this.middlewarePermissions.length > 0) {
            markdown += `## 🛡️ Middleware de permissions\n\n`;
            
            this.middlewarePermissions.forEach(middleware => {
                markdown += `### 📁 \`${middleware.file}\`\n\n`;
                markdown += `**Permissions détectées**:\n`;
                middleware.permissions.forEach(perm => {
                    const permInfo = this.permissions.get(perm);
                    markdown += `- \`${perm}\` (${permInfo?.type || 'unknown'}) - ${permInfo?.description || 'Aucune description'}\n`;
                });
                markdown += '\n';
            });
        }

        // Détails par routes
        if (this.routePermissions.length > 0) {
            markdown += `## 🛣️ Permissions dans les routes\n\n`;
            
            this.routePermissions.forEach(route => {
                markdown += `### 📁 \`${route.file}\`\n\n`;
                route.permissions.forEach(perm => {
                    markdown += `- **${perm.context.method} \`${perm.context.path}\`** - Middleware: \`${perm.middleware}\`\n`;
                });
                markdown += '\n';
            });
        }

        // Statistiques par type
        const typeStats = {};
        for (const [, info] of this.permissions) {
            typeStats[info.type] = (typeStats[info.type] || 0) + 1;
        }

        markdown += `## 📈 Statistiques par type\n\n`;
        Object.entries(typeStats).forEach(([type, count]) => {
            markdown += `- **${type}**: ${count} permission(s)\n`;
        });

        // Recommandations de sécurité
        markdown += `\n## 🔒 Recommandations de sécurité\n\n`;
        
        const publicRoutes = this.routePermissions.length === 0;
        if (publicRoutes) {
            markdown += `⚠️ **Attention**: Aucune protection détectée dans les routes. Considérez ajouter des middleware d'authentification.\n\n`;
        }

        if (totalPermissions === 0) {
            markdown += `⚠️ **Attention**: Aucune permission détectée. Implémentez un système de permissions.\n\n`;
        }

        markdown += `### Bonnes pratiques recommandées:\n`;
        markdown += `- Utilisez le principe du moindre privilège\n`;
        markdown += `- Implémentez une authentification JWT robuste\n`;
        markdown += `- Validez les permissions à chaque requête sensible\n`;
        markdown += `- Loggez les tentatives d'accès non autorisées\n`;
        markdown += `- Effectuez des audits réguliers des permissions\n`;

        markdown += `\n---\n\n*Rapport généré par permissions-inventory.js*`;

        return markdown;
    }

    // Sauvegarder le rapport
    saveReport() {
        const report = this.generateReport();
        
        // Créer le dossier s'il n'existe pas
        const outputDir = path.dirname(this.outputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(this.outputFile, report);
        console.log(`✅ Inventaire sauvegardé: ${this.outputFile}`);
    }

    // Méthode principale
    run() {
        console.log('🚀 Démarrage de l\'inventaire des permissions...\n');
        this.analyzeMiddleware();
        this.analyzeRoutes();
        this.saveReport();
        console.log('\n🎉 Inventaire terminé avec succès !');
        console.log(`📋 Consultez le rapport: docs/generated/permissions-inventory.md`);
    }
}

// Exécution du script
if (require.main === module) {
    const inventory = new PermissionsInventory();
    inventory.run();
}

module.exports = PermissionsInventory;