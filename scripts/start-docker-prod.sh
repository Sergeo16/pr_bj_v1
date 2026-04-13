#!/bin/bash

# Script pour démarrer l'application avec Docker Compose (Production)
# Usage: ./scripts/start-docker-prod.sh

set -e

echo "🚀 Démarrage de l'application avec Docker Compose (Production)..."
echo ""

# Vérifier que Docker est démarré
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop."
    exit 1
fi

echo "✓ Docker est démarré"
echo ""

# Arrêter et supprimer les conteneurs existants s'ils existent
echo "🧹 Nettoyage des conteneurs existants..."
docker-compose down 2>/dev/null || true

# Forcer l'arrêt et la suppression des conteneurs par nom si nécessaire
if docker ps -a --format '{{.Names}}' | grep -q "^pr2026_db$"; then
    echo "🛑 Arrêt du conteneur pr2026_db existant..."
    docker stop pr2026_db 2>/dev/null || true
    docker rm pr2026_db 2>/dev/null || true
fi

if docker ps -a --format '{{.Names}}' | grep -q "^pr2026_web$"; then
    echo "🛑 Arrêt du conteneur pr2026_web existant..."
    docker stop pr2026_web 2>/dev/null || true
    docker rm pr2026_web 2>/dev/null || true
fi

# Rebuild l'image pour inclure les dernières modifications
echo "🔨 Reconstruction de l'image Docker avec les dernières modifications..."
docker-compose build --no-cache

# Démarrer les services
echo "📦 Démarrage des services..."
docker-compose up -d

echo ""
echo "⏳ Attente que les services soient prêts..."
sleep 5

# Vérifier l'état des services
echo ""
echo "📊 État des services:"
docker-compose ps

echo ""
echo "✅ Application démarrée!"
echo ""

# Obtenir l'adresse IP locale du réseau
LOCAL_IP=$(node scripts/get-local-ip.js 2>/dev/null || echo "localhost")

echo "🌐 Accès à l'application:"
echo "   - Local:    http://localhost:3000"
if [ "$LOCAL_IP" != "localhost" ]; then
    echo "   - Réseau:   http://$LOCAL_IP:3000"
fi
echo ""
echo "💡 Pour voir les logs: docker-compose logs -f web"
echo "💡 Pour arrêter: docker-compose down"

