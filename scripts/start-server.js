#!/usr/bin/env node

/**
 * Script de démarrage pour Railway
 * Garantit que le serveur écoute sur 0.0.0.0 et utilise le port fourni par Railway
 */

// S'assurer que PORT est défini (Railway le fournit automatiquement)
const port = parseInt(process.env.PORT || '3000', 10);

// Définir les variables d'environnement pour Next.js standalone
// Next.js standalone utilise PORT et HOSTNAME automatiquement
// Forcer l'écoute sur toutes les interfaces (0.0.0.0) pour Railway
process.env.PORT = port.toString();
process.env.HOSTNAME = '0.0.0.0';

console.log(`🚀 Démarrage du serveur Next.js...`);
console.log(`   Port: ${port}`);
console.log(`   Hostname: 0.0.0.0`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);

// Intercepter le module 'http' pour forcer l'écoute sur 0.0.0.0
const http = require('http');
const originalListen = http.Server.prototype.listen;

http.Server.prototype.listen = function(...args) {
  // Si le premier argument est un nombre (port), forcer hostname à 0.0.0.0
  if (typeof args[0] === 'number') {
    args[0] = port;
    if (args.length === 1 || typeof args[1] === 'function') {
      args.splice(1, 0, '0.0.0.0');
    } else if (typeof args[1] === 'string') {
      args[1] = '0.0.0.0';
    }
  } else if (typeof args[0] === 'object' && args[0] !== null) {
    // Si c'est un objet d'options
    args[0].port = port;
    args[0].host = '0.0.0.0';
  }
  
  console.log(`   Configuration d'écoute: port=${port}, host=0.0.0.0`);
  return originalListen.apply(this, args);
};

// Importer et démarrer le serveur Next.js standalone
// server.js est à la racine du répertoire de travail (/app/server.js)
console.log('📂 Chemin de travail:', process.cwd());

const fs = require('fs');
const path = require('path');
const serverPath = path.join(process.cwd(), 'server.js');
console.log('📂 Chemin vers server.js:', serverPath);
console.log('📂 server.js existe:', fs.existsSync(serverPath));

try {
  require('../server.js');
  console.log('✅ server.js chargé avec succès');
} catch (error) {
  console.error('❌ Erreur lors du démarrage du serveur:', error);
  console.error('❌ Message:', error.message);
  console.error('❌ Stack:', error.stack);
  process.exit(1);
}

