#!/usr/bin/env node

/**
 * Script de démarrage pour Railway avec migrations automatiques
 * Exécute les migrations une seule fois au démarrage, puis démarre le serveur
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MIGRATION_FLAG_FILE = path.join(__dirname, '../.migrations-done');

async function main() {
  // Toujours démarrer le serveur, même si les migrations échouent
  // Les migrations peuvent échouer si les tables existent déjà, ce qui est OK
  
  const runMigrations = async () => {
    // Vérifier si les migrations ont déjà été exécutées
    const migrationsDone = fs.existsSync(MIGRATION_FLAG_FILE);
    
    if (migrationsDone) {
      console.log('✅ Migrations déjà exécutées (flag trouvé)');
      return;
    }
    
    console.log('🔄 Tentative d\'exécution des migrations...');
    
    try {
      // Exécuter les migrations avec un timeout
      execSync('npm run migrate', { 
        stdio: 'inherit',
        env: process.env,
        timeout: 30000 // 30 secondes max
      });
      console.log('✅ Migrations terminées');
      
      console.log('🌱 Exécution du seed...');
      execSync('npm run seed', { 
        stdio: 'inherit',
        env: process.env,
        timeout: 60000 // 60 secondes max pour le seed
      });
      console.log('✅ Seed terminé');
      
      // Créer le fichier flag pour indiquer que les migrations sont faites
      fs.writeFileSync(MIGRATION_FLAG_FILE, new Date().toISOString());
      console.log('📝 Flag de migrations créé');
    } catch (error) {
      console.error('⚠️  Erreur lors des migrations/seed:', error.message);
      console.log('⚠️  Les tables existent peut-être déjà. Continuation du démarrage...');
      // Ne pas bloquer le démarrage - les migrations peuvent échouer si les tables existent déjà
    }
  };
  
  // Exécuter les migrations en arrière-plan (non-bloquant)
  runMigrations().catch(err => {
    console.error('⚠️  Erreur lors de l\'exécution des migrations:', err.message);
    console.log('⚠️  Continuation du démarrage...');
  });
  
  // Attendre un peu pour que les migrations commencent, puis démarrer le serveur
  // Ne pas attendre la fin des migrations pour démarrer le serveur
  setTimeout(() => {
    console.log('🚀 Démarrage du serveur Next.js...');
    
    try {
      // Importer et démarrer le serveur Next.js standalone
      require('./start-server.js');
    } catch (error) {
      console.error('❌ Erreur lors du démarrage du serveur:', error);
      process.exit(1);
    }
  }, 2000); // Attendre 2 secondes pour que les migrations commencent
}

main();

