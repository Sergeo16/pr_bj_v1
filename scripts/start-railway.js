#!/usr/bin/env node

/**
 * Script de démarrage pour Railway avec migrations automatiques
 * Exécute les migrations de manière synchrone avant de démarrer le serveur
 */

const { execSync } = require('child_process');
const path = require('path');

async function main() {
  console.log('🚀 Démarrage de l\'application Railway...');
  
  // Vérifier que DATABASE_URL est définie
  if (!process.env.DATABASE_URL) {
    console.error('❌ Erreur: DATABASE_URL n\'est pas définie');
    console.error('💡 Assurez-vous que la variable d\'environnement DATABASE_URL est configurée dans Railway');
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
    console.log('💡 Si les migrations échouent, exécutez-les manuellement via Railway Dashboard');
  }
  
  // Démarrer le serveur Next.js
  console.log('\n🚀 Démarrage du serveur Next.js...');
  try {
    // Next.js standalone utilise server.js à la racine
    execSync('node server.js', { 
      stdio: 'inherit',
      env: process.env,
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

