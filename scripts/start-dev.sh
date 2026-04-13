#!/bin/bash

# Script pour démarrer l'application en mode développement local
# Usage: ./scripts/start-dev.sh

set -e

echo "🚀 Démarrage de l'application en mode développement..."
echo ""

# Vérifier que Docker est démarré
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop."
    exit 1
fi

echo "✓ Docker est démarré"
echo ""

# Vérifier si le conteneur de base de données existe
if docker ps -a --format '{{.Names}}' | grep -q "^pr2026_db$"; then
    echo "📦 Conteneur de base de données trouvé"
    
    # Vérifier s'il est en cours d'exécution
    if docker ps --format '{{.Names}}' | grep -q "^pr2026_db$"; then
        echo "✓ Base de données déjà démarrée"
    else
        echo "🔄 Démarrage de la base de données..."
        docker start pr2026_db
        echo "⏳ Attente que PostgreSQL soit prêt..."
        sleep 5
        echo "✓ Base de données démarrée"
    fi
else
    echo "📦 Création du conteneur de base de données..."
    docker run -d \
      --name pr2026_db \
      -e POSTGRES_USER=pr2026_user \
      -e POSTGRES_PASSWORD=pr2026_password \
      -e POSTGRES_DB=pr2026_db \
      -p 5432:5432 \
      postgres:15-alpine
    echo "⏳ Attente que PostgreSQL soit prêt..."
    sleep 10
    echo "✓ Base de données créée et démarrée"
fi

echo ""
echo "🔍 Vérification de la base de données..."

# Vérifier si les tables existent
TABLES_EXIST=$(docker exec pr2026_db psql -U pr2026_user -d pr2026_db -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('departement', 'duo');" 2>/dev/null || echo "0")

if [ "$TABLES_EXIST" = "0" ] || [ -z "$TABLES_EXIST" ]; then
    echo "⚠️  Les tables n'existent pas. Exécution des migrations..."
    npm run migrate
    
    echo ""
    echo "📊 Chargement des données..."
    npm run seed
    echo ""
else
    echo "✓ Base de données déjà initialisée"
fi

echo ""
echo "🎯 Démarrage de Next.js..."
echo ""

# Démarrer Next.js
npm run dev

