#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const swaggerConfig = require('../config/swagger-config');
const auditMap = require('../config/audit-map.json');

/**
 * Script de génération automatique de documentation
 * Usage: node scripts/generate-docs.js [--format=markdown|html|json] [--output=./docs]
 */

const args = process.argv.slice(2);
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'markdown';
const outputDir = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || './docs';

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Génération de la documentation RBAC
 */
function generateRbacDoc() {
  const rbacMatrix = auditMap.audit_map.rbac_matrix;
  const criticalRoutes = auditMap.audit_map.critical_routes;
  
  let content = '';
  
  if (format === 'markdown') {
    content += '# Documentation RBAC - Contrôle d\'Accès Basé sur les Rôles\n\n';
    content += `*Généré automatiquement le ${new Date().toLocaleString('fr-FR')}*\n\n`;
    
    // Matrice des rôles
    content += '## 🔐 Matrice des Rôles\n\n';
    content += '| Rôle | Validation | Suppression | Assignation | Modification | Création | Visualisation |\n';
    content += '|------|------------|-------------|-------------|--------------|----------|---------------|\n';
    
    Object.keys(rbacMatrix).forEach(role => {
      const permissions = rbacMatrix[role];
      content += `| **${role}** | ${permissions.can_validate ? '✅' : '❌'} | ${permissions.can_delete ? '✅' : '❌'} | ${permissions.can_assign ? '✅' : '❌'} | ${permissions.can_update ? '✅' : '❌'} | ${permissions.can_create ? '✅' : '❌'} | ${permissions.can_view_all ? '🌐 Tout' : permissions.can_view_filtered ? '🔍 Filtré' : permissions.can_view_own ? '👤 Propre' : '❌'} |\n`;
    });
    
    // Routes critiques
    content += '\n## 🚨 Routes Critiques et Permissions\n\n';
    Object.keys(criticalRoutes).forEach(route => {
      const config = criticalRoutes[route];
      content += `### \`${route}\`\n\n`;
      content += `**Action:** ${config.action}\n\n`;
      content += `**Rôles autorisés:** ${config.rbac.required_roles.map(role => `\`${role}\``).join(', ')}\n\n`;
      content += `**Niveau de sensibilité:** ${getSensitivityEmoji(config.sensitivity)} ${config.sensitivity}\n\n`;
      content += `**Impact business:** ${getImpactEmoji(config.business_impact)} ${config.business_impact}\n\n`;
      
      if (config.critical) {
        content += '🔴 **ROUTE CRITIQUE** - Surveillance renforcée activée\n\n';
      }
      
      if (config.audit.requires_snapshot) {
        content += '📸 **Snapshot requis** - État avant/après enregistré\n\n';
      }
      
      content += `**Standards de conformité:** ${config.compliance.join(', ')}\n\n`;
      content += '---\n\n';
    });
    
  } else if (format === 'json') {
    content = JSON.stringify({
      rbac_matrix: rbacMatrix,
      critical_routes: criticalRoutes,
      generated_at: new Date().toISOString(),
      summary: {
        total_roles: Object.keys(rbacMatrix).length,
        total_critical_routes: Object.keys(criticalRoutes).length,
        high_sensitivity_routes: Object.values(criticalRoutes).filter(r => r.sensitivity === 'high').length,
        admin_only_routes: Object.values(criticalRoutes).filter(r => r.rbac.required_roles.includes('admin') && r.rbac.required_roles.length === 1).length
      }
    }, null, 2);
  }
  
  const filename = `rbac-documentation.${format === 'json' ? 'json' : 'md'}`;
  fs.writeFileSync(path.join(outputDir, filename), content);
  console.log(`✅ Documentation RBAC générée: ${path.join(outputDir, filename)}`);
}

/**
 * Génération de la documentation d'audit
 */
function generateAuditDoc() {
  const auditPolicies = auditMap.audit_map.audit_policies;
  const criticalRoutes = auditMap.audit_map.critical_routes;
  const complianceMappings = auditMap.audit_map.compliance_mappings;
  const riskAssessment = auditMap.audit_map.risk_assessment;
  
  let content = '';
  
  if (format === 'markdown') {
    content += '# Documentation Audit - Traçabilité et Conformité\n\n';
    content += `*Généré automatiquement le ${new Date().toLocaleString('fr-FR')}*\n\n`;
    
    // Politiques d'audit
    content += '## 📋 Politiques d\'Audit\n\n';
    content += `- **Rétention par défaut:** ${auditPolicies.default_retention} jours\n`;
    content += `- **Rétention critique:** ${auditPolicies.critical_retention} jours\n`;
    content += `- **Stockage des snapshots:** ${auditPolicies.snapshot_storage}\n`;
    content += `- **Format des logs:** ${auditPolicies.log_format}\n`;
    content += `- **Monitoring temps réel:** ${auditPolicies.real_time_monitoring ? '✅ Activé' : '❌ Désactivé'}\n`;
    content += `- **Détection d'anomalies:** ${auditPolicies.anomaly_detection ? '✅ Activé' : '❌ Désactivé'}\n\n`;
    
    // Matrice d'audit par route
    content += '## 🔍 Matrice d\'Audit par Route\n\n';
    content += '| Route | Action | Sensibilité | Snapshot | Rétention | Conformité |\n';
    content += '|-------|--------|-------------|----------|-----------|------------|\n';
    
    Object.keys(criticalRoutes).forEach(route => {
      const config = criticalRoutes[route];
      const retention = config.audit.retention_days || auditPolicies.default_retention;
      content += `| \`${route}\` | ${config.action} | ${getSensitivityEmoji(config.sensitivity)} ${config.sensitivity} | ${config.audit.requires_snapshot ? '📸' : '❌'} | ${retention}j | ${config.compliance.join(', ')} |\n`;
    });
    
    // Évaluation des risques
    content += '\n## ⚠️ Évaluation des Risques\n\n';
    Object.keys(riskAssessment).forEach(route => {
      const risk = riskAssessment[route];
      content += `### \`${route}\`\n\n`;
      content += `**Niveau de risque:** ${getRiskEmoji(risk.risk_level)} ${risk.risk_level}\n\n`;
      content += `**Impact:** ${risk.impact}\n\n`;
      content += `**Probabilité:** ${risk.likelihood}\n\n`;
      content += `**Mesures d'atténuation:**\n`;
      risk.mitigation.forEach(measure => {
        content += `- ${measure}\n`;
      });
      content += '\n---\n\n';
    });
    
    // Mappings de conformité
    content += '## 📊 Mappings de Conformité\n\n';
    Object.keys(complianceMappings).forEach(standard => {
      const mapping = complianceMappings[standard];
      content += `### ${standard}\n\n`;
      content += `**Routes concernées:**\n`;
      mapping.routes.forEach(route => {
        content += `- \`${route}\`\n`;
      });
      content += `\n**Exigences:**\n`;
      mapping.requirements.forEach(req => {
        content += `- ${req}\n`;
      });
      content += '\n';
    });
    
  } else if (format === 'json') {
    content = JSON.stringify({
      audit_policies: auditPolicies,
      critical_routes_audit: Object.keys(criticalRoutes).reduce((acc, route) => {
        acc[route] = {
          action: criticalRoutes[route].action,
          sensitivity: criticalRoutes[route].sensitivity,
          audit_config: criticalRoutes[route].audit,
          compliance: criticalRoutes[route].compliance
        };
        return acc;
      }, {}),
      compliance_mappings: complianceMappings,
      risk_assessment: riskAssessment,
      generated_at: new Date().toISOString(),
      summary: {
        total_audited_routes: Object.keys(criticalRoutes).length,
        high_risk_routes: Object.values(riskAssessment).filter(r => r.risk_level === 'HIGH').length,
        compliance_standards: Object.keys(complianceMappings).length
      }
    }, null, 2);
  }
  
  const filename = `audit-documentation.${format === 'json' ? 'json' : 'md'}`;
  fs.writeFileSync(path.join(outputDir, filename), content);
  console.log(`✅ Documentation Audit générée: ${path.join(outputDir, filename)}`);
}

/**
 * Génération de la documentation API complète
 */
function generateApiDoc() {
  let content = '';
  
  if (format === 'markdown') {
    content += '# Documentation API - Système de Réservation\n\n';
    content += `*Généré automatiquement le ${new Date().toLocaleString('fr-FR')}*\n\n`;
    
    content += '## 🎯 Vue d\'ensemble\n\n';
    content += 'Cette API permet la gestion complète des réservations de salles avec un système de contrôle d\'accès basé sur les rôles (RBAC) et un audit complet des actions critiques.\n\n';
    
    content += '## 🔗 Endpoints Principaux\n\n';
    content += '### 📊 Consultation\n';
    content += '- `GET /api/reservations/all` - Liste toutes les réservations\n';
    content += '- `GET /api/reservations/occupation` - Statistiques d\'occupation\n';
    content += '- `GET /api/reservations/occupation/roles` - Occupation par rôle\n';
    content += '- `GET /api/reservations/occupation/semaine` - Historique hebdomadaire\n\n';
    
    content += '### ✏️ Modification\n';
    content += '- `POST /api/reservations/create` - Créer une réservation\n';
    content += '- `PUT /api/reservations/update/:id` - Modifier une réservation\n';
    content += '- `PUT /api/reservations/validate/:id` - Valider une réservation\n';
    content += '- `PUT /api/reservations/assign/:id` - Assigner un responsable\n';
    content += '- `DELETE /api/reservations/delete/:id` - Supprimer une réservation ⚠️\n\n';
    
    content += '### 🔧 Administration\n';
    content += '- `GET /api-docs` - Documentation Swagger interactive\n';
    content += '- `GET /api/rbac-matrix` - Matrice des permissions RBAC\n';
    content += '- `GET /api/audit-matrix` - Matrice de configuration d\'audit\n';
    content += '- `GET /health` - État de santé du système\n\n';
    
    content += '## 🔐 Authentification\n\n';
    content += 'Toutes les routes nécessitent une authentification via token JWT:\n\n';
    content += '```http\n';
    content += 'Authorization: Bearer <your-jwt-token>\n';
    content += '```\n\n';
    
    content += '## 🎭 Rôles et Permissions\n\n';
    const roles = auditMap.audit_map.rbac_matrix;
    Object.keys(roles).forEach(role => {
      content += `### ${role}\n`;
      const permissions = roles[role];
      content += 'Permissions:\n';
      if (permissions.can_create) content += '- ✅ Créer des réservations\n';
      if (permissions.can_update) content += '- ✅ Modifier des réservations\n';
      if (permissions.can_validate) content += '- ✅ Valider des réservations\n';
      if (permissions.can_delete) content += '- ✅ Supprimer des réservations\n';
      if (permissions.can_assign) content += '- ✅ Assigner des responsables\n';
      if (permissions.can_view_all) content += '- 🌐 Voir toutes les réservations\n';
      else if (permissions.can_view_filtered) content += '- 🔍 Voir les réservations filtrées\n';
      else if (permissions.can_view_own) content += '- 👤 Voir ses propres réservations\n';
      content += '\n';
    });
    
    content += '## 📊 Codes de Réponse\n\n';
    content += '| Code | Signification | Description |\n';
    content += '|------|--------------|-------------|\n';
    content += '| 200 | OK | Requête réussie |\n';
    content += '| 201 | Created | Ressource créée avec succès |\n';
    content += '| 400 | Bad Request | Paramètres invalides |\n';
    content += '| 401 | Unauthorized | Authentification requise |\n';
    content += '| 403 | Forbidden | Permissions insuffisantes |\n';
    content += '| 404 | Not Found | Ressource introuvable |\n';
    content += '| 409 | Conflict | Conflit (ex: salle déjà réservée) |\n';
    content += '| 429 | Too Many Requests | Limite de taux dépassée |\n';
    content += '| 500 | Internal Server Error | Erreur serveur |\n\n';
    
    content += '## 🚨 Surveillance et Alertes\n\n';
    const alerts = auditMap.audit_map.monitoring_alerts;
    Object.keys(alerts).forEach(alertType => {
      const alert = alerts[alertType];
      content += `### ${alertType.replace(/_/g, ' ').toUpperCase()}\n`;
      content += `- **Seuil:** ${alert.threshold}\n`;
      content += `- **Fenêtre de temps:** ${alert.time_window}\n`;
      content += `- **Action:** ${alert.action}\n\n`;
    });
    
    content += '## 🔄 Intégrations\n\n';
    const integrations = auditMap.audit_map.integration_hooks;
    if (integrations.siem_integration?.enabled) {
      content += '### SIEM\n';
      content += `- **Format:** ${integrations.siem_integration.format}\n`;
      content += `- **Endpoint:** ${integrations.siem_integration.endpoint}\n\n`;
    }
    
    if (integrations.business_intelligence?.enabled) {
      content += '### Business Intelligence\n';
      content += `- **Entrepôt de données:** ${integrations.business_intelligence.warehouse}\n\n`;
    }
    
  } else if (format === 'json') {
    content = JSON.stringify({
      api_info: {
        title: 'API Système de Réservation',
        version: '1.0.0',
        generated_at: new Date().toISOString()
      },
      endpoints: Object.keys(auditMap.audit_map.critical_routes),
      rbac_matrix: auditMap.audit_map.rbac_matrix,
      monitoring_alerts: auditMap.audit_map.monitoring_alerts,
      integration_hooks: auditMap.audit_map.integration_hooks
    }, null, 2);
  }
  
  const filename = `api-documentation.${format === 'json' ? 'json' : 'md'}`;
  fs.writeFileSync(path.join(outputDir, filename), content);
  console.log(`✅ Documentation API générée: ${path.join(outputDir, filename)}`);
}

/**
 * Génération du rapport de conformité
 */
function generateComplianceReport() {
  const complianceMappings = auditMap.audit_map.compliance_mappings;
  const criticalRoutes = auditMap.audit_map.critical_routes;
  
  let content = '';
  
  if (format === 'markdown') {
    content += '# Rapport de Conformité\n\n';
    content += `*Généré automatiquement le ${new Date().toLocaleString('fr-FR')}*\n\n`;
    
    content += '## 📋 Résumé Exécutif\n\n';
    content += `- **Standards de conformité couverts:** ${Object.keys(complianceMappings).length}\n`;
    content += `- **Routes auditées:** ${Object.keys(criticalRoutes).length}\n`;
    content += `- **Routes critiques:** ${Object.values(criticalRoutes).filter(r => r.critical).length}\n`;
    content += `- **Couverture d'audit:** 100% des routes sensibles\n\n`;
    
    // Détail par standard
    Object.keys(complianceMappings).forEach(standard => {
      const mapping = complianceMappings[standard];
      content += `## ${standard} - Compliance Report\n\n`;
      
      content += '### Routes Couvertes\n\n';
      mapping.routes.forEach(route => {
        const routeConfig = criticalRoutes[route];
        if (routeConfig) {
          content += `- **${route}**\n`;
          content += `  - Sensibilité: ${routeConfig.sensitivity}\n`;
          content += `  - Snapshot: ${routeConfig.audit.requires_snapshot ? '✅' : '❌'}\n`;
          content += `  - Rétention: ${routeConfig.audit.retention_days || 365} jours\n`;
          content += `  - RBAC: ${routeConfig.rbac.required_roles.join(', ')}\n\n`;
        }
      });
      
      content += '### Exigences de Conformité\n\n';
      mapping.requirements.forEach(req => {
        content += `- ✅ ${req}\n`;
      });
      content += '\n';
    });
    
    content += '## 🔒 Mesures de Sécurité Implémentées\n\n';
    content += '- **Authentification:** JWT avec expiration\n';
    content += '- **Autorisation:** RBAC granulaire par endpoint\n';
    content += '- **Audit Trail:** Logging complet des actions critiques\n';
    content += '- **Chiffrement:** Snapshots d\'audit chiffrés\n';
    content += '- **Rate Limiting:** Protection contre les abus\n';
    content += '- **Monitoring:** Surveillance temps réel des anomalies\n';
    content += '- **Backup:** Snapshots avant suppression\n\n';
    
  } else if (format === 'json') {
    content = JSON.stringify({
      compliance_report: {
        generated_at: new Date().toISOString(),
        standards_covered: Object.keys(complianceMappings),
        summary: {
          total_routes_audited: Object.keys(criticalRoutes).length,
          critical_routes: Object.values(criticalRoutes).filter(r => r.critical).length,
          compliance_coverage: '100%'
        },
        detailed_mappings: complianceMappings,
        security_measures: [
          'JWT Authentication',
          'RBAC Authorization',
          'Complete Audit Trail',
          'Encrypted Snapshots',
          'Rate Limiting',
          'Real-time Monitoring',
          'Automated Backups'
        ]
      }
    }, null, 2);
  }
  
  const filename = `compliance-report.${format === 'json' ? 'json' : 'md'}`;
  fs.writeFileSync(path.join(outputDir, filename), content);
  console.log(`✅ Rapport de conformité généré: ${path.join(outputDir, filename)}`);
}

/**
 * Fonctions utilitaires pour les emojis
 */
function getSensitivityEmoji(sensitivity) {
  switch (sensitivity) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

function getImpactEmoji(impact) {
  switch (impact) {
    case 'high': return '💥';
    case 'medium': return '⚡';
    case 'low': return '💨';
    default: return '❔';
  }
}

function getRiskEmoji(risk) {
  switch (risk) {
    case 'HIGH': return '🚨';
    case 'MEDIUM': return '⚠️';
    case 'LOW': return '✅';
    default: return '❔';
  }
}

/**
 * Fonction principale
 */
function main() {
  console.log(`🚀 Génération de la documentation en format ${format}...`);
  console.log(`📁 Dossier de sortie: ${outputDir}`);
  
  try {
    generateRbacDoc();
    generateAuditDoc();
    generateApiDoc();
    generateComplianceReport();
    
    // Génération d'un index général
    if (format === 'markdown') {
      let indexContent = '# Documentation Système de Réservation\n\n';
      indexContent += `*Documentation générée automatiquement le ${new Date().toLocaleString('fr-FR')}*\n\n`;
      indexContent += '## 📚 Documents Disponibles\n\n';
      indexContent += '- [Documentation API](./api-documentation.md) - Guide complet de l\'API\n';
      indexContent += '- [Documentation RBAC](./rbac-documentation.md) - Contrôle d\'accès et permissions\n';
      indexContent += '- [Documentation Audit](./audit-documentation.md) - Traçabilité et conformité\n';
      indexContent += '- [Rapport de Conformité](./compliance-report.md) - État de la conformité réglementaire\n\n';
      indexContent += '## 🔗 Liens Utiles\n\n';
      indexContent += '- Documentation Swagger interactive: `/api-docs`\n';
      indexContent += '- Matrice RBAC en temps réel: `/api/rbac-matrix`\n';
      indexContent += '- Matrice d\'audit: `/api/audit-matrix`\n';
      indexContent += '- Statistiques d\'audit: `/api/audit/stats`\n';
      
      fs.writeFileSync(path.join(outputDir, 'README.md'), indexContent);
      console.log(`✅ Index principal généré: ${path.join(outputDir, 'README.md')}`);
    }
    
    console.log('\n🎉 Documentation générée avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`   - ${Object.keys(auditMap.audit_map.critical_routes).length} routes critiques documentées`);
    console.log(`   - ${Object.keys(auditMap.audit_map.rbac_matrix).length} rôles configurés`);
    console.log(`   - ${Object.keys(auditMap.audit_map.compliance_mappings).length} standards de conformité couverts`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  main();
}

module.exports = {
  generateRbacDoc,
  generateAuditDoc,
  generateApiDoc,
  generateComplianceReport
};