#!/bin/bash

# Script pour démarrer l'application avec Docker Compose (Développement)
# Usage: ./scripts/start-docker-dev.sh

set -e

echo "🚀 Démarrage de l'application avec Docker Compose (Développement)..."
echo ""

# Vérifier que Docker est démarré
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop."
    exit 1
fi

echo "✓ Docker est démarré"
echo ""

# Démarrer les services
echo "📦 Démarrage des services en mode développement..."
docker-compose -f docker-compose.dev.yml up

