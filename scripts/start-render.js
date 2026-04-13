#!/usr/bin/env node

/**
 * Script de démarrage pour Render avec migrations automatiques
 * Exécute les migrations de manière synchrone avant de démarrer le serveur
 */

const { execSync } = require('child_process');
const path = require('path');

async function main() {
  console.log('🚀 Démarrage de l\'application Render...');
  
  // Vérifier que DATABASE_URL est définie
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erreur: DATABASE_URL n\'est pas définie');
    console.error('💡 Assurez-vous que la variable d\'environnement DATABASE_URL est configurée dans Render');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL est définie');
  
  // Exécuter les migrations de manière synchrone
  console.log('\n🔄 Exécution des migrations...');
  try {
    execSync('npm run migrate', { 
      stdio: 'inherit',
      env: process.env,
      cwd: process.cwd(),
      timeout: 60000 // 60 secondes max pour les migrations
    });
    console.log('✅ Migrations terminées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error.message);
    // Ne pas bloquer le démarrage - les migrations peuvent échouer si les tables existent déjà
    // Mais on log l'erreur pour le débogage
    console.log('⚠️  Continuation du démarrage malgré l\'erreur de migration...');
    console.log('💡 Si les migrations échouent, exécutez-les manuellement via Render Dashboard');
  }
  
  // Démarrer le serveur Next.js
  console.log('\n🚀 Démarrage du serveur Next.js...');
  console.log(`   Port: ${process.env.PORT || '3000'}`);
  console.log(`   Hostname: 0.0.0.0`);
  
  try {
    // Utiliser next start qui gère automatiquement tous les fichiers statiques (CSS, images, etc.)
    // Le mode standalone nécessite une configuration supplémentaire pour les fichiers statiques
    // et n'est pas nécessaire sur Render qui gère bien les builds Next.js standard
    console.log('✅ Utilisation de next start (gestion automatique des fichiers statiques)');
    execSync('npx next start', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        HOSTNAME: '0.0.0.0',
        PORT: process.env.PORT || '3000'
      },
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

