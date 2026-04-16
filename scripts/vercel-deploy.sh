#!/usr/bin/env bash
# Déploiement Vercel (CLI). Prérequis : compte Vercel + repo Git.
# Usage : depuis la racine du projet — ./scripts/vercel-deploy.sh [preview|prod]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${1:-prod}"

if ! command -v npx &>/dev/null; then
  echo "npx est requis (Node.js/npm)."
  exit 1
fi

VERCEL_BIN=(npx vercel@latest)

if [[ ! -f .vercel/project.json ]]; then
  echo "Projet non lié. Lancement de « vercel link »…"
  "${VERCEL_BIN[@]}" link
fi

if [[ "$MODE" == "preview" ]]; then
  echo "Déploiement preview…"
  "${VERCEL_BIN[@]}" deploy
else
  echo "Déploiement production…"
  "${VERCEL_BIN[@]}" deploy --prod
fi

echo "Terminé. Vérifiez les URL dans la sortie ci-dessus ou sur https://vercel.com/dashboard"
