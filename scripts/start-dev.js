#!/usr/bin/env node

/**
 * Script pour démarrer l'application en mode développement local
 * Détecte automatiquement l'OS et exécute le bon script
 */

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const platform = os.platform();

console.log('[*] Demarrage de l\'application en mode developpement...\n');

if (platform === 'win32') {
  // Windows - utiliser PowerShell avec encodage UTF-8
  const scriptPath = path.join(__dirname, 'start-dev.ps1');
  try {
    execSync(`powershell -ExecutionPolicy Bypass -NoProfile -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '${scriptPath}'"`, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });
  } catch (error) {
    console.error('[X] Erreur lors de l\'execution du script:', error.message);
    process.exit(1);
  }
} else {
  // Linux/macOS - utiliser bash
  const scriptPath = path.join(__dirname, 'start-dev.sh');
  try {
    execSync(`bash "${scriptPath}"`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('[X] Erreur lors de l\'execution du script:', error.message);
    process.exit(1);
  }
}

