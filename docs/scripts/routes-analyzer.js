#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { pathToRegexp } from 'path-to-regexp';

console.log('🔍 Analyse des routes en cours...\n');

class RoutesAnalyzer {
    constructor() {
        this.routes = [];
        this.routesDir = path.join(__dirname, '../../routes');
        this.outputFile = path.join(__dirname, '../generated/routes-summary.md');
    }

    // Analyser tous les fichiers de routes
    analyzeRoutes() {
        if (!fs.existsSync(this.routesDir)) {
            console.log('⚠️  Dossier routes/ non trouvé. Création d\'un exemple...');
            this.createExampleRoute();
            return;
        }

        const routeFiles = fs.readdirSync(this.routesDir).filter(file => file.endsWith('.js'));
        
        if (routeFiles.length === 0) {
            console.log('⚠️  Aucun fichier de route trouvé. Création d\'un exemple...');
            this.createExampleRoute();
            return;
        }

        routeFiles.forEach(file => {
            console.log(`📄 Analyse du fichier: ${file}`);
            this.analyzeRouteFile(path.join(this.routesDir, file), file);
        });
    }

    // Analyser un fichier de route spécifique
    analyzeRouteFile(filePath, fileName) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const routeInfo = {
                file: fileName,
                routes: []
            };

            // Extraire les routes avec regex
            const routePatterns = [
                /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]\s*,?\s*([^,\)]*),?\s*([^,\)]*)/g,
                /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]\s*,?\s*([^,\)]*),?\s*([^,\)]*)/g
            ];

            routePatterns.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const [, method, path, middleware, handler] = match;
                    
                    routeInfo.routes.push({
                        method: method.toUpperCase(),
                        path: path,
                        middleware: this.extractMiddleware(middleware),
                        handler: this.extractHandler(handler),
                        description: this.extractDescription(content, match.index),
                        parameters: this.extractParameters(path),
                        security: this.extractSecurity(middleware)
                    });
                }
            });

            if (routeInfo.routes.length > 0) {
                this.routes.push(routeInfo);
            }

        } catch (error) {
            console.error(`❌ Erreur lors de l'analyse de ${fileName}:`, error.message);
        }
    }

    // Extraire les middlewares
    extractMiddleware(middlewareStr) {
        if (!middlewareStr || middlewareStr.trim() === '') return [];
        
        const middlewares = [];
        if (middlewareStr.includes('auth')) middlewares.push('Authentication');
        if (middlewareStr.includes('admin')) middlewares.push('Admin Only');
        if (middlewareStr.includes('validate')) middlewares.push('Validation');
        if (middlewareStr.includes('rate')) middlewares.push('Rate Limiting');
        
        return middlewares;
    }

    // Extraire le nom du handler
    extractHandler(handlerStr) {
        if (!handlerStr) return 'Anonymous';
        
        const match = handlerStr.match(/(\w+)(?:\.\w+)?/);
        return match ? match[1] : 'Anonymous';
    }

    // Extraire la description depuis les commentaires
    extractDescription(content, matchIndex) {
        const lines = content.substring(0, matchIndex).split('\n');
        const lastLines = lines.slice(-5);
        
        for (let i = lastLines.length - 1; i >= 0; i--) {
            const line = lastLines[i].trim();
            if (line.startsWith('//') || line.startsWith('*')) {
                return line.replace(/^\/\/\s*|\*\s*/g, '').trim();
            }
        }
        
        return 'Aucune description disponible';
    }

    // Extraire les paramètres de l'URL
    extractParameters(path) {
        const params = [];
        const paramRegex = /:(\w+)/g;
        let match;
        
        while ((match = paramRegex.exec(path)) !== null) {
            params.push({
                name: match[1],
                type: 'path',
                required: true
            });
        }
        
        return params;
    }

    // Détecter les exigences de sécurité
    extractSecurity(middlewareStr) {
        const security = [];
        
        if (middlewareStr && middlewareStr.includes('auth')) {
            security.push('JWT Token Required');
        }
        if (middlewareStr && middlewareStr.includes('admin')) {
            security.push('Admin Role Required');
        }
        
        return security;
    }

    // Créer un exemple de route si aucune n'existe
    createExampleRoute() {
        const exampleRoute = `const express = require('express');
const router = express.Router();

// Liste des réservations
router.get('/', (req, res) => {
    res.json({ message: 'Liste des réservations' });
});

// Créer une réservation
router.post('/', (req, res) => {
    res.json({ message: 'Réservation créée' });
});

// Obtenir une réservation par ID
router.get('/:id', (req, res) => {
    res.json({ message: \`Réservation \${req.params.id}\` });
});

module.exports = router;
`;

        fs.writeFileSync(path.join(this.routesDir, 'reservations.js'), exampleRoute);
        console.log('✅ Fichier d\'exemple créé: routes/reservations.js');
        
        // Analyser l'exemple créé
        this.analyzeRouteFile(path.join(this.routesDir, 'reservations.js'), 'reservations.js');
    }

    // Générer le rapport markdown
    generateReport() {
        const totalRoutes = this.routes.reduce((sum, file) => sum + file.routes.length, 0);
        
        let markdown = `# 📋 Analyse des Routes API

> Rapport généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}

## 📊 Résumé

- **Nombre total de routes**: ${totalRoutes}
- **Fichiers analysés**: ${this.routes.length}
- **Date d'analyse**: ${new Date().toISOString()}

---

`;

        // Table de tous les endpoints
        markdown += `## 🎯 Vue d'ensemble des endpoints

| Méthode | Chemin | Fichier | Middleware | Sécurité |
|---------|--------|---------|------------|----------|
`;

        this.routes.forEach(fileInfo => {
            fileInfo.routes.forEach(route => {
                const middlewares = route.middleware.join(', ') || 'Aucun';
                const security = route.security.join(', ') || 'Public';
                
                markdown += `| ${route.method} | \`${route.path}\` | ${fileInfo.file} | ${middlewares} | ${security} |\n`;
            });
        });

        markdown += '\n---\n\n';

        // Détails par fichier
        this.routes.forEach(fileInfo => {
            markdown += `## 📁 Fichier: \`${fileInfo.file}\`\n\n`;
            
            fileInfo.routes.forEach(route => {
                markdown += `### ${route.method} \`${route.path}\`\n\n`;
                markdown += `**Description**: ${route.description}\n\n`;
                
                if (route.parameters.length > 0) {
                    markdown += `**Paramètres**:\n`;
                    route.parameters.forEach(param => {
                        markdown += `- \`${param.name}\` (${param.type}) - ${param.required ? 'Requis' : 'Optionnel'}\n`;
                    });
                    markdown += '\n';
                }
                
                if (route.middleware.length > 0) {
                    markdown += `**Middleware**: ${route.middleware.join(', ')}\n\n`;
                }
                
                if (route.security.length > 0) {
                    markdown += `**Sécurité**: ${route.security.join(', ')}\n\n`;
                }
                
                markdown += `**Handler**: \`${route.handler}\`\n\n`;
                markdown += '---\n\n';
            });
        });

        // Statistiques par méthode
        const methodStats = {};
        this.routes.forEach(fileInfo => {
            fileInfo.routes.forEach(route => {
                methodStats[route.method] = (methodStats[route.method] || 0) + 1;
            });
        });

        markdown += `## 📈 Statistiques par méthode HTTP\n\n`;
        Object.entries(methodStats).forEach(([method, count]) => {
            markdown += `- **${method}**: ${count} route(s)\n`;
        });

        markdown += `\n## 🔒 Analyse de sécurité\n\n`;
        const publicRoutes = [];
        const securedRoutes = [];

        this.routes.forEach(fileInfo => {
            fileInfo.routes.forEach(route => {
                if (route.security.length === 0) {
                    publicRoutes.push(`${route.method} ${route.path}`);
                } else {
                    securedRoutes.push(`${route.method} ${route.path}`);
                }
            });
        });

        markdown += `### Routes publiques (${publicRoutes.length})\n`;
        publicRoutes.forEach(route => {
            markdown += `- \`${route}\`\n`;
        });

        markdown += `\n### Routes sécurisées (${securedRoutes.length})\n`;
        securedRoutes.forEach(route => {
            markdown += `- \`${route}\`\n`;
        });

        markdown += `\n---\n\n*Rapport généré par routes-analyzer.js*`;

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
        console.log(`✅ Rapport sauvegardé: ${this.outputFile}`);
    }

    // Méthode principale
    run() {
        console.log('🚀 Démarrage de l\'analyse des routes...\n');
        this.analyzeRoutes();
        this.saveReport();
        console.log('\n🎉 Analyse terminée avec succès !');
        console.log(`📋 Consultez le rapport: docs/generated/routes-summary.md`);
    }
}

// Exécution du script
if (require.main === module) {
    const analyzer = new RoutesAnalyzer();
    analyzer.run();
}

module.exports = RoutesAnalyzer;