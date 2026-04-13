#!/bin/bash

# Script de setup pour Docker
# Usage: ./scripts/docker-setup.sh

set -e

echo "🐳 Configuration de PR 2026 avec Docker..."

# Démarrer les services
echo "🚀 Démarrage des services Docker..."
docker-compose up -d db

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL..."
sleep 5

# Exécuter les migrations
echo "🔄 Exécution des migrations..."
docker-compose exec -T db psql -U pr2026_user -d pr2026_db < migrations/001_initial_schema.sql || {
    echo "⚠️  Erreur lors des migrations. Tentative avec le conteneur web..."
    docker-compose run --rm web npm run migrate
}

# Ingérer les données
echo "🌱 Ingestion des données..."
docker-compose run --rm web npm run seed

# Démarrer tous les services
echo "🚀 Démarrage de tous les services..."
docker-compose up -d

echo "✅ Setup Docker terminé!"
echo ""
echo "L'application est accessible sur: http://localhost:3000"
echo "Pour voir les logs: docker-compose logs -f"

