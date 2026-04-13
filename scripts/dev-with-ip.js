#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorer les adresses internes (non IPv4) et les adresses de bouclage
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return null;
}

const localIP = getLocalIP();
const port = process.env.PORT || 3000;

console.log('\n🚀 Démarrage du serveur de développement...\n');

if (localIP) {
  console.log(`  ✓ Local:        http://localhost:${port}`);
  console.log(`  ✓ Réseau:       http://${localIP}:${port}\n`);
} else {
  console.log(`  ✓ Local:        http://localhost:${port}\n`);
}

// Démarrer Next.js avec l'option -H 0.0.0.0
// Utiliser npx pour une compatibilité cross-platform
const platform = os.platform();

// Sur Windows, utiliser npx pour éviter les problèmes avec les scripts shell
// Sur Unix, on peut aussi utiliser npx pour la simplicité
const nextProcess = spawn('npx', ['next', 'dev', '-H', '0.0.0.0'], {
  stdio: 'inherit',
  shell: platform === 'win32', // Utiliser shell sur Windows
  env: process.env
});

nextProcess.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  process.exit(code || 0);
});

