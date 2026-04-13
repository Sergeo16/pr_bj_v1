#!/bin/bash

# Script de setup pour PR 2026
# Usage: ./scripts/setup.sh

set -e

echo "🚀 Configuration de PR 2026..."

# Vérifier que .env existe
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp env.example .env
    echo "⚠️  Veuillez éditer .env avec vos paramètres de base de données"
fi

# Vérifier que PostgreSQL est accessible
echo "🔍 Vérification de la connexion PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql n'est pas installé. Assurez-vous que PostgreSQL est installé."
else
    echo "✅ psql trouvé"
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Exécuter les migrations
echo "🔄 Exécution des migrations..."
npm run migrate

# Ingérer les données
echo "🌱 Ingestion des données..."
npm run seed

echo "✅ Setup terminé!"
echo ""
echo "Pour démarrer le serveur de développement:"
echo "  npm run dev"
echo ""
echo "Pour démarrer avec Docker:"
echo "  docker-compose up -d"

