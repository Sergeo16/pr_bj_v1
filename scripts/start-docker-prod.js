#!/usr/bin/env node

/**
 * Script pour démarrer l'application avec Docker Compose (Production)
 * Fonctionne sur Windows, macOS et Linux
 */

const { execSync } = require('child_process');
const os = require('os');

const platform = os.platform();

// Fonction utilitaire pour attendre (fonctionne partout)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 Démarrage de l\'application avec Docker Compose (Production)...\n');

  try {
    // Vérifier que Docker est démarré
    try {
      execSync('docker info', { stdio: 'ignore' });
      console.log('✓ Docker est démarré\n');
    } catch (error) {
      console.error('❌ Docker n\'est pas démarré. Veuillez démarrer Docker Desktop.');
      process.exit(1);
    }

    // Arrêter et supprimer les conteneurs existants s'ils existent
    console.log('🧹 Nettoyage des conteneurs existants...');
    try {
      execSync('docker-compose down', { stdio: 'ignore' });
    } catch (error) {
      // Ignorer les erreurs si les conteneurs n'existent pas
    }

    // Forcer l'arrêt et la suppression des conteneurs par nom si nécessaire
    try {
      const containers = execSync('docker ps -a --format "{{.Names}}"', { encoding: 'utf-8' });
      if (containers.includes('pr2026_db')) {
        console.log('🛑 Arrêt du conteneur pr2026_db existant...');
        try {
          execSync('docker stop pr2026_db', { stdio: 'ignore' });
          execSync('docker rm pr2026_db', { stdio: 'ignore' });
        } catch (error) {
          // Ignorer les erreurs
        }
      }
      if (containers.includes('pr2026_web')) {
        console.log('🛑 Arrêt du conteneur pr2026_web existant...');
        try {
          execSync('docker stop pr2026_web', { stdio: 'ignore' });
          execSync('docker rm pr2026_web', { stdio: 'ignore' });
        } catch (error) {
          // Ignorer les erreurs
        }
      }
    } catch (error) {
      // Ignorer les erreurs
    }

    // Rebuild l'image pour inclure les dernières modifications
    console.log('🔨 Reconstruction de l\'image Docker avec les dernières modifications...');
    execSync('docker-compose build --no-cache', { stdio: 'inherit' });

    // Démarrer les services
    console.log('\n📦 Démarrage des services...');
    execSync('docker-compose up -d', { stdio: 'inherit' });

    console.log('\n⏳ Attente que les services soient prêts...');
    // Utiliser setTimeout natif de Node.js au lieu de commandes système
    // Cela fonctionne sur tous les systèmes, y compris Git Bash sur Windows
    await wait(5000);

    // Vérifier l'état des services
    console.log('\n📊 État des services:');
    execSync('docker-compose ps', { stdio: 'inherit' });

    console.log('\n✅ Application démarrée!\n');

    // Obtenir l'adresse IP locale du réseau
    let localIP = 'localhost';
    try {
      const { execSync: execSyncIP } = require('child_process');
      localIP = execSyncIP('node scripts/get-local-ip.js', { encoding: 'utf-8' }).trim();
    } catch (error) {
      // Utiliser localhost par défaut
    }

    console.log('🌐 Accès à l\'application:');
    console.log('   - Local:    http://localhost:3000');
    if (localIP !== 'localhost') {
      console.log(`   - Réseau:   http://${localIP}:3000`);
    }
    console.log('\n💡 Pour voir les logs: docker-compose logs -f web');
    console.log('💡 Pour arrêter: docker-compose down');

  } catch (error) {
    console.error('\n❌ Erreur lors du démarrage:', error.message);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main().catch(error => {
  console.error('\n❌ Erreur fatale:', error.message);
  process.exit(1);
});
