#!/usr/bin/env node

/**
 * Script pour démarrer l'application avec Docker Compose (Développement)
 * Fonctionne sur Windows, macOS et Linux
 */

const { execSync } = require('child_process');

console.log('🚀 Démarrage de l\'application avec Docker Compose (Développement)...\n');

try {
  // Vérifier que Docker est démarré
  try {
    execSync('docker info', { stdio: 'ignore' });
    console.log('✓ Docker est démarré\n');
  } catch (error) {
    console.error('❌ Docker n\'est pas démarré. Veuillez démarrer Docker Desktop.');
    process.exit(1);
  }

  // Démarrer les services
  console.log('📦 Démarrage des services en mode développement...\n');
  execSync('docker-compose -f docker-compose.dev.yml up', { stdio: 'inherit' });

} catch (error) {
  console.error('\n❌ Erreur lors du démarrage:', error.message);
  process.exit(1);
}

