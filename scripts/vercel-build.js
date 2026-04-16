#!/usr/bin/env node
/**
 * Pipeline de build Vercel : migrations (selon l’environnement), puis `next build`.
 * Référence : VERCEL.md
 */

const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(cmd, opts = {}) {
  execSync(cmd, {
    stdio: 'inherit',
    cwd: root,
    env: process.env,
    ...opts,
  });
}

const isVercel = process.env.VERCEL === '1';
const hasDb = Boolean(process.env.DATABASE_URL);
const vercelEnv = process.env.VERCEL_ENV || '';
const previewMigrate = process.env.VERCEL_PREVIEW_RUN_MIGRATE === '1';

let runMigrate = false;
if (hasDb) {
  if (!isVercel) {
    runMigrate = true;
  } else if (vercelEnv === 'production') {
    runMigrate = true;
  } else if (vercelEnv === 'preview' && previewMigrate) {
    runMigrate = true;
  }
}

if (runMigrate) {
  console.log(
    '[vercel-build] Exécution des migrations (VERCEL=%s VERCEL_ENV=%s)…',
    isVercel ? '1' : '0',
    vercelEnv || '(local)'
  );
  run('npm run migrate');
} else if (!hasDb) {
  console.warn('[vercel-build] DATABASE_URL absente : migrations ignorées.');
} else if (vercelEnv === 'preview') {
  console.log(
    '[vercel-build] Preview : migrations ignorées (définir VERCEL_PREVIEW_RUN_MIGRATE=1 pour les lancer).'
  );
} else {
  console.log('[vercel-build] Migrations ignorées pour cet environnement.');
}

console.log('[vercel-build] next build…');
run('npx next build');
