#!/bin/sh

# Script pour afficher l'IP réseau dans Docker
# Dans Docker, on ne peut pas facilement obtenir l'IP de l'hôte depuis le conteneur
# Mais Next.js avec -H 0.0.0.0 sera accessible via l'IP de l'hôte

PORT=${PORT:-3000}

echo ""
echo "🚀 Démarrage du serveur de développement dans Docker..."
echo ""
echo "  ✓ Local (conteneur):  http://localhost:${PORT}"
echo "  ✓ Réseau:             http://VOTRE_IP_LOCALE:${PORT}"
echo ""
echo "💡 Pour trouver votre IP locale, exécutez sur votre machine hôte:"
echo "   - macOS/Linux: ifconfig | grep 'inet ' | grep -v 127.0.0.1"
echo "   - Windows: ipconfig"
echo ""

# Démarrer Next.js
exec npm run dev:next

