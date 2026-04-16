# PR 2026 - Plateforme de Vote

Plateforme complète de vote avec tableau de bord en temps réel, ultra-scalable et prête pour la production.

## 🚀 Stack Technique

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + DaisyUI
- **Base de données**: PostgreSQL (lib `pg` native, sans ORM)
- **Temps réel**: Server-Sent Events (SSE)
- **Sécurité**: Validation Zod, rate-limiting par IP, sanitization

## 📋 Prérequis

- Node.js 20+
- PostgreSQL 15+ (ou Docker)
- npm ou yarn

## 🚀 Démarrage Rapide (Après le démarrage de l'ordinateur)

### 📊 Comparaison des Méthodes de Démarrage

| Critère | Développement Local | Docker Production | Docker Développement |
|---------|---------------------|-------------------|----------------------|
| **Vitesse de démarrage** | ⚡ Rapide | 🐢 Plus lent (build) | 🐢 Plus lent (build) |
| **Hot-reload** | ✅ Oui | ❌ Non | ✅ Oui |
| **Modifications de code** | ✅ Immédiat | ❌ Rebuild nécessaire | ✅ Immédiat |
| **Isolation** | ⚠️ Partielle | ✅ Complète | ✅ Complète |
| **Ressources** | 💚 Faible | 💛 Moyenne | 💛 Moyenne |
| **Production** | ❌ Non | ✅ Oui | ❌ Non |
| **Dépendances** | Node.js + Docker | Docker uniquement | Docker uniquement |
| **Base de données** | Conteneur séparé | Conteneur intégré | Conteneur intégré |
| **Recommandé pour** | Développement quotidien | Production/Déploiement | Développement avec isolation |

**💡 Recommandation :**
- **Développement quotidien** → Utilisez **Développement Local** (Scénario 1)
- **Test en conditions réelles** → Utilisez **Docker Production** (Scénario 2)
- **Développement avec isolation complète** → Utilisez **Docker Développement** (Scénario 3)

### 🔍 Explications Détaillées des Différences

#### **Scénario 1 : Développement Local**
**Comment ça fonctionne :**
- Next.js s'exécute directement sur votre machine (via Node.js)
- Seule la base de données PostgreSQL tourne dans Docker
- Votre code est exécuté directement par Node.js local

**Avantages :**
- ✅ Démarrage très rapide (pas de build Docker)
- ✅ Hot-reload instantané (modifications visibles immédiatement)
- ✅ Débogage facile (outils de développement natifs)
- ✅ Consommation mémoire réduite
- ✅ Accès direct aux fichiers et outils locaux

**Inconvénients :**
- ⚠️ Nécessite Node.js installé sur votre machine
- ⚠️ Peut avoir des différences avec l'environnement de production
- ⚠️ Dépend de votre configuration système locale

**Quand l'utiliser :**
- Développement quotidien et itérations rapides
- Quand vous avez besoin de performance maximale
- Pour le débogage approfondi

---

#### **Scénario 2 : Docker Production**
**Comment ça fonctionne :**
- Next.js est compilé et exécuté dans un conteneur Docker
- La base de données est aussi dans un conteneur Docker
- Tout est isolé et identique à la production

**Avantages :**
- ✅ Environnement identique à la production
- ✅ Isolation complète (pas d'impact sur votre système)
- ✅ Reproducible sur n'importe quelle machine
- ✅ Pas besoin de Node.js installé localement
- ✅ Facile à déployer (même image Docker)

**Inconvénients :**
- ❌ Plus lent à démarrer (build de l'image)
- ❌ Pas de hot-reload (modifications nécessitent rebuild)
- ❌ Consommation mémoire plus élevée
- ❌ Débogage plus complexe

**Quand l'utiliser :**
- Tests en conditions de production
- Déploiement en production
- Quand vous voulez tester l'environnement exact de production

---

#### **Scénario 3 : Docker Développement**
**Comment ça fonctionne :**
- Next.js s'exécute dans Docker mais avec volumes montés
- Votre code local est monté dans le conteneur
- Hot-reload fonctionne grâce aux volumes

**Avantages :**
- ✅ Isolation complète (comme production)
- ✅ Hot-reload fonctionnel (modifications visibles)
- ✅ Environnement reproductible
- ✅ Pas besoin de Node.js installé localement

**Inconvénients :**
- ❌ Plus lent que le développement local
- ❌ Consommation mémoire plus élevée
- ❌ Débogage plus complexe qu'en local
- ❌ Dépendance à Docker

**Quand l'utiliser :**
- Développement avec isolation complète
- Quand vous voulez tester l'environnement Docker sans rebuild
- Pour s'assurer que tout fonctionne dans Docker avant le déploiement

---

### Scénario 1: Développement Local (Recommandé pour le développement)

**Étape 1 : Ouvrir le terminal et naviguer vers le projet**
```bash
cd /Users/Sergeo/Documents/dev/pr_2026_v2
```

**Étape 2 : Vérifier que Docker est démarré**
```bash
# Vérifier que Docker Desktop est lancé
docker ps
```

**Étape 3 : Démarrer uniquement la base de données PostgreSQL**
```bash
# Si le conteneur n'existe pas encore
docker run -d \
  --name pr2026_db \
  -e POSTGRES_USER=pr2026_user \
  -e POSTGRES_PASSWORD=pr2026_password \
  -e POSTGRES_DB=pr2026_db \
  -p 5432:5432 \
  postgres:15-alpine

# OU si le conteneur existe déjà mais est arrêté
docker start pr2026_db
```

**Étape 4 : Vérifier que la base de données est prête**
```bash
# Attendre quelques secondes, puis vérifier
docker ps | grep pr2026_db
```

**Étape 5 : Démarrer l'application Next.js**
```bash
npm run dev
# OU utiliser le script d'aide
npm run start:dev
```

**Résultat attendu :**
```
🚀 Démarrage du serveur de développement...

  ✓ Local:        http://localhost:3000
  ✓ Réseau:       http://192.168.1.XXX:3000

✓ Ready in Xs
```

**Étape 6 : Accéder à l'application**
- Ouvrir votre navigateur sur : `http://localhost:3000`
- Pour accéder depuis un autre terminal du réseau : `http://VOTRE_IP_LOCALE:3000`

---

### Scénario 2: Docker Compose - Production (Recommandé pour la production)

**Étape 1 : Ouvrir le terminal et naviguer vers le projet**
```bash
cd /Users/Sergeo/Documents/dev/pr_2026_v2
```

**Étape 2 : Vérifier que Docker est démarré**
```bash
docker ps
```

**Étape 3 : Démarrer tous les services**
```bash
docker-compose up -d
# OU utiliser le script d'aide
npm run start:docker:prod
```

**Étape 4 : Vérifier que les conteneurs sont démarrés**
```bash
docker-compose ps
```

Vous devriez voir :
- `pr2026_db` - Status: Up (healthy)
- `pr2026_web` - Status: Up

**Étape 5 : Vérifier les logs (optionnel)**
```bash
docker-compose logs web
```

**Étape 6 : Accéder à l'application**
- Ouvrir votre navigateur sur : `http://localhost:3000`
- Pour accéder depuis un autre terminal du réseau : `http://VOTRE_IP_LOCALE:3000`

**Note :** Si c'est la première fois, vous devrez exécuter les migrations et le seed :
```bash
docker-compose exec web npm run migrate
docker-compose exec web npm run seed
```

**Note :** Pour réinitialiser la base de données avec les nouvelles données du fichier `BENIN_centres_vote_complet.json`, consultez la section [Réinitialiser la base de données avec les nouvelles données](#réinitialiser-la-base-de-données-avec-les-nouvelles-données) dans le dépannage.

---

### Scénario 3: Docker Compose - Développement (Avec hot-reload)

**Étape 1 : Ouvrir le terminal et naviguer vers le projet**
```bash
cd /Users/Sergeo/Documents/dev/pr_2026_v2
```

**Étape 2 : Vérifier que Docker est démarré**
```bash
docker ps
```

**Étape 3 : Démarrer tous les services en mode développement**
```bash
npm run docker:dev
# OU utiliser le script d'aide
npm run start:docker:dev
# ou directement
docker-compose -f docker-compose.dev.yml up
```

**Étape 4 : Attendre que les services démarrent**
Vous verrez les logs en temps réel. Attendez que vous voyiez :
```
pr2026_web_dev  | ✓ Ready in Xs
```

**Étape 5 : Accéder à l'application**
- Ouvrir votre navigateur sur : `http://localhost:3000`
- Pour accéder depuis un autre terminal du réseau : `http://VOTRE_IP_LOCALE:3000`

**Note :** Les modifications de code sont automatiquement reflétées grâce au hot-reload.

---

## 🔧 Commandes Utiles pour le Démarrage

### Vérifier l'état des services
```bash
# Vérifier les conteneurs Docker
docker ps

# Vérifier les conteneurs Docker Compose
docker-compose ps

# Voir les logs
docker-compose logs -f web
```

### Arrêter les services
```bash
# Arrêter Docker Compose (production)
docker-compose down

# Arrêter Docker Compose (développement)
docker-compose -f docker-compose.dev.yml down

# Arrêter uniquement la base de données locale
docker stop pr2026_db
```

### Redémarrer les services
```bash
# Redémarrer Docker Compose (production)
docker-compose restart

# Redémarrer Docker Compose (développement)
docker-compose -f docker-compose.dev.yml restart

# Redémarrer uniquement la base de données locale
docker restart pr2026_db
```

### Trouver votre IP locale (pour l'accès réseau)
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# ou plus simple
hostname -I

# Windows
ipconfig
```

---

## 🛠️ Installation Initiale (Première fois uniquement)

### Option 1: Développement Local

1. **Cloner le projet et installer les dépendances**:
```bash
npm install
```

2. **Configurer les variables d'environnement**:
```bash
cp .env.example .env
```

Éditer `.env` et configurer:
```env
DATABASE_URL=postgresql://pr2026_user:pr2026_password@localhost:5432/pr2026_db
NEXT_PUBLIC_APP_URL=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

3. **Démarrer PostgreSQL** (si pas déjà démarré):
```bash
# Avec Docker
docker run -d \
  --name pr2026_db \
  -e POSTGRES_USER=pr2026_user \
  -e POSTGRES_PASSWORD=pr2026_password \
  -e POSTGRES_DB=pr2026_db \
  -p 5432:5432 \
  postgres:15-alpine
```

4. **Exécuter les migrations**:
```bash
npm run migrate
```

5. **Ingérer les données**:
```bash
npm run seed
```

6. **Démarrer le serveur de développement**:
```bash
npm run dev
```

L'application sera accessible sur :
- **Local**: http://localhost:3000
- **Réseau**: http://VOTRE_IP_LOCALE:3000 (l'adresse IP sera affichée automatiquement au démarrage)

💡 Pour accéder depuis un autre terminal du même réseau, utilisez l'adresse IP affichée dans la console.

### Option 2: Docker Compose (Production)

1. **Démarrer tous les services**:
```bash
docker-compose up -d
```

2. **Exécuter les migrations** (dans le conteneur web):
```bash
docker-compose exec web npm run migrate
```

3. **Ingérer les données**:
```bash
docker-compose exec web npm run seed
```

4. **Accéder à l'application**:
   - Web: [http://localhost:3000](http://localhost:3000) ou http://VOTRE_IP_LOCALE:3000
   - PostgreSQL: `localhost:5432`

### Option 3: Docker Compose (Développement avec hot-reload)

1. **Démarrer tous les services en mode développement**:
```bash
npm run docker:dev
# ou
docker-compose -f docker-compose.dev.yml up
```

2. **Exécuter les migrations** (depuis votre machine hôte):
```bash
npm run migrate
npm run seed
```

3. **Accéder à l'application**:
   - Web: [http://localhost:3000](http://localhost:3000) ou http://VOTRE_IP_LOCALE:3000
   - Les modifications de code sont reflétées automatiquement grâce aux volumes montés

## 📜 Scripts Disponibles

### Scripts de Démarrage (Recommandés)
- `npm run start:dev` - Démarrage automatique en mode développement local (démarre la DB + Next.js)
- `npm run start:docker:prod` - Démarrage automatique avec Docker Compose (production)
- `npm run start:docker:dev` - Démarrage automatique avec Docker Compose (développement avec hot-reload)

### Scripts de Développement
- `npm run dev` - Démarrer le serveur de développement (affiche automatiquement l'IP réseau)
- `npm run dev:next` - Démarrer Next.js directement (sans affichage IP)
- `npm run build` - Construire l'application pour la production
- `npm run start` - Démarrer le serveur de production (écoute sur 0.0.0.0)

### Scripts de Base de Données
- `npm run migrate` - Exécuter les migrations SQL
- `npm run seed` - Ingérer les données JSON en base

### Scripts Docker
- `npm run docker:dev` - Démarrer Docker Compose en mode développement
- `npm run docker:dev:build` - Construire et démarrer Docker Compose en mode développement

### Scripts Utilitaires
- `npm test` - Exécuter les tests
- `npm run lint` - Vérifier le code avec ESLint

## 🗄️ Structure de la Base de Données

### Tables Principales

- `duo` - Les trois duos (pré-remplis: Duo 1, Duo 2, Duo 3)
- `departement` - Départements
- `commune` - Communes (liées aux départements)
- `arrondissement` - Arrondissements (liés aux communes)
- `village` - Villages (liés aux arrondissements)
- `centre` - Centres de vote (liés aux villages)
- `vote` - Votes enregistrés (avec toutes les relations)

### Index et Performance

- Index sur toutes les clés étrangères
- Index composite `(duo_id, centre_id)` pour les requêtes d'agrégation
- Pool de connexions PostgreSQL réutilisable

## 🔌 API Endpoints

### Régions (Hiérarchiques)

- `GET /api/regions/departements` - Liste des départements
- `GET /api/regions/communes?departementId=X` - Communes d'un département
- `GET /api/regions/arrondissements?communeId=X` - Arrondissements d'une commune
- `GET /api/regions/villages?arrondissementId=X` - Villages d'un arrondissement
- `GET /api/regions/centres?villageId=X` - Centres d'un village

### Votes

- `POST /api/votes` - Enregistrer un vote
  ```json
  {
    "fullName": "Nom Prénom",
    "duoId": 1,
    "departementId": 1,
    "communeId": 1,
    "arrondissementId": 1,
    "villageId": 1,
    "centreId": 1,
    "count": 100
  }
  ```

### Dashboard

- `GET /api/dashboard/stats` - Statistiques complètes
- `GET /api/dashboard/stream` - Stream SSE en temps réel

### Utilitaires

- `GET /api/duos` - Liste des duos disponibles

## 🎨 Pages

### `/` - Formulaire de Vote

Formulaire avec champs dépendants:
- Nom et prénoms
- Sélection du duo
- Sélection hiérarchique: Département → Commune → Arrondissement → Village → Centre
- Nombre de votants

### `/dashboard` - Tableau de Bord

- Totaux nationaux par duo (avec pourcentages)
- Graphiques (barres et camembert)
- Filtres par niveau géographique
- Tableaux filtrables
- Export CSV
- Mise à jour en temps réel via SSE

## 🔒 Sécurité

- **Validation Zod**: Tous les inputs sont validés
- **Sanitization**: Nettoyage des chaînes de caractères
- **Rate Limiting**: Limitation par IP (100 requêtes/minute par défaut)
- **Transactions SQL**: Intégrité des données garantie
- **Vérification des références**: Validation des IDs avant insertion

## 🧪 Tests

```bash
npm test
```

Tests disponibles:
- Tests API (`__tests__/api/`)
- Tests de seed (`__tests__/scripts/`)

## 📦 Déploiement

### Déploiement sur Render (Recommandé)

Pour déployer sur Render après avoir pushé sur GitHub, consultez le guide complet : **[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)**

**Résumé rapide :**
1. Poussez votre code sur GitHub
2. Créez un compte sur [Render.com](https://render.com)
3. Créez un nouveau service "Blueprint" et connectez votre dépôt GitHub
4. Render détectera automatiquement `render.yaml` et configurera tout
5. Les migrations et le seed s'exécutent automatiquement au démarrage

### Déploiement sur Vercel (plan Hobby)

Guide détaillé, variables d’environnement et scripts CLI : **[VERCEL.md](./VERCEL.md)**.

### Production avec Docker

1. **Construire l'image**:
```bash
docker-compose build
```

2. **Démarrer les services**:
```bash
docker-compose up -d
```

3. **Exécuter les migrations**:
```bash
docker-compose exec web npm run migrate
docker-compose exec web npm run seed
```

### Variables d'Environnement Production

```env
DATABASE_URL=postgresql://user:password@db_host:5432/pr2026_db
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
NODE_ENV=production
```

## 📊 Performance

- Pool de connexions PostgreSQL réutilisable (max 20 connexions)
- Requêtes préparées pour éviter les injections SQL
- Index optimisés sur les clés étrangères
- Mise en cache côté client pour les listes déroulantes
- SSE pour les mises à jour en temps réel (polling toutes les 2 secondes)

## 🐛 Dépannage

### Erreur de connexion à la base de données

Vérifier que:
- PostgreSQL est démarré
- `DATABASE_URL` est correcte dans `.env`
- Les ports ne sont pas bloqués

### Erreur lors du seed

Vérifier que:
- Le fichier `data/BENIN_centres_vote_complet.json` existe
- Le fichier JSON est valide
- Les migrations ont été exécutées

### Rate limit atteint

Ajuster dans `.env`:
```env
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=60000
```

### Réinitialiser la base de données avec les nouvelles données

Si vous avez mis à jour le fichier `data/BENIN_centres_vote_complet.json` et que vous voulez réinitialiser complètement la base de données pour prendre en compte les nouvelles données, suivez les instructions ci-dessous selon votre environnement.

#### ⚠️ Attention
**La réinitialisation supprime toutes les données existantes** (départements, communes, arrondissements, villages, centres et votes). Si vous avez des votes enregistrés que vous voulez conserver, faites une sauvegarde avant.

#### Pour Docker Compose (Production)

**Option 1 : Réinitialisation complète (recommandée)**

```bash
# 1. Arrêter tous les conteneurs
docker-compose down

# 2. Supprimer le volume de données PostgreSQL
# Sur Windows (PowerShell)
docker volume rm pr_2026_v2_postgres_data

# Sur macOS/Linux
docker volume rm pr_2026_v2_postgres_data

# 3. Rebuild et démarrer (le script fait tout automatiquement)
npm run start:docker:prod

# 4. Attendre que les conteneurs soient prêts (10-15 secondes)
# Sur Windows (PowerShell)
timeout /t 15

# Sur macOS/Linux
sleep 15

# 5. Exécuter les migrations
docker-compose exec web npm run migrate

# 6. Exécuter le seed avec les nouvelles données
docker-compose exec web npm run seed
```

**Option 2 : Réinitialisation sans supprimer le volume (plus rapide)**

Le script de seed supprime déjà toutes les données avant de réinsérer, donc vous pouvez simplement :

```bash
# 1. S'assurer que les conteneurs sont démarrés
docker-compose ps

# 2. Si les conteneurs ne sont pas démarrés
docker-compose up -d

# 3. Attendre que les conteneurs soient prêts
# Sur Windows (PowerShell)
timeout /t 10

# Sur macOS/Linux
sleep 10

# 4. Exécuter le seed (supprime et réinsère toutes les données)
docker-compose exec web npm run seed
```

#### Pour Développement Local

```bash
# 1. Arrêter la base de données
docker stop pr2026_db

# 2. Supprimer le conteneur et son volume
docker rm -v pr2026_db

# 3. Recréer la base de données
# Sur Windows (PowerShell)
docker run -d --name pr2026_db -e POSTGRES_USER=pr2026_user -e POSTGRES_PASSWORD=pr2026_password -e POSTGRES_DB=pr2026_db -p 5432:5432 postgres:15-alpine

# Sur macOS/Linux
docker run -d \
  --name pr2026_db \
  -e POSTGRES_USER=pr2026_user \
  -e POSTGRES_PASSWORD=pr2026_password \
  -e POSTGRES_DB=pr2026_db \
  -p 5432:5432 \
  postgres:15-alpine

# 4. Attendre que la base soit prête
# Sur Windows (PowerShell)
timeout /t 5

# Sur macOS/Linux
sleep 5

# 5. Exécuter les migrations
npm run migrate

# 6. Exécuter le seed avec les nouvelles données
npm run seed
```

#### Pour Docker Compose (Développement)

```bash
# 1. Arrêter les conteneurs
docker-compose -f docker-compose.dev.yml down

# 2. Supprimer le volume de données
# Sur Windows (PowerShell)
docker volume rm pr_2026_v2_postgres_data_dev

# Sur macOS/Linux
docker volume rm pr_2026_v2_postgres_data_dev

# 3. Redémarrer les services
docker-compose -f docker-compose.dev.yml up -d

# 4. Attendre que les conteneurs soient prêts
# Sur Windows (PowerShell)
timeout /t 15

# Sur macOS/Linux
sleep 15

# 5. Exécuter les migrations
docker-compose -f docker-compose.dev.yml exec web npm run migrate

# 6. Exécuter le seed avec les nouvelles données
docker-compose -f docker-compose.dev.yml exec web npm run seed
```

#### Sauvegarder la base de données avant réinitialisation

Si vous voulez sauvegarder vos données avant de réinitialiser :

**Pour Docker Compose (Production) :**
```bash
# Sur Windows (PowerShell)
docker-compose exec db pg_dump -U pr2026_user pr2026_db > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Sur macOS/Linux
docker-compose exec db pg_dump -U pr2026_user pr2026_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Pour Développement Local :**
```bash
# Sur Windows (PowerShell)
docker exec pr2026_db pg_dump -U pr2026_user pr2026_db > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Sur macOS/Linux
docker exec pr2026_db pg_dump -U pr2026_user pr2026_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Restaurer une sauvegarde

```bash
# Sur Windows (PowerShell)
docker-compose exec -T db psql -U pr2026_user pr2026_db < backup_YYYYMMDD_HHMMSS.sql

# Sur macOS/Linux
docker-compose exec -T db psql -U pr2026_user pr2026_db < backup_YYYYMMDD_HHMMSS.sql
```

---

## 📝 Notes

- Le script de seed est **idempotent** (peut être exécuté plusieurs fois)
- Les migrations utilisent `IF NOT EXISTS` pour éviter les erreurs
- Le dashboard se met à jour automatiquement toutes les 2 secondes
- L'export CSV est limité aux données filtrées affichées

## 👥 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

## 📤 Mise en Ligne sur GitHub

Pour mettre ce projet sur GitHub, consultez le guide complet : **[GITHUB_SETUP.md](./GITHUB_SETUP.md)**

**Résumé rapide :**
```bash
git init
git add .
git commit -m "Initial commit: Plateforme de vote PR 2026 BJ"
git remote add origin https://github.com/VOTRE_USERNAME/pr-2026-bj.git
git branch -M main
git push -u origin main
```

**Pour récupérer les changements depuis GitHub :**
```bash
git pull origin main
```

**Pour remplacer complètement votre version locale par celle de GitHub :**

⚠️ **ATTENTION :** Cette opération va **écraser toutes vos modifications locales** non sauvegardées sur GitHub. Assurez-vous d'avoir sauvegardé ou commité vos changements importants avant de continuer.

**Méthode 1 : Reset complet (Recommandée si vous voulez vraiment tout écraser)**
```bash
# 1. Récupérer toutes les informations du dépôt distant
git fetch origin

# 2. Réinitialiser votre branche locale pour qu'elle corresponde exactement à la branche distante
git reset --hard origin/main

# 3. Nettoyer tous les fichiers non suivis (optionnel, mais recommandé)
git clean -fd
```

**Explication :**
- `git fetch origin` : Télécharge les dernières informations du dépôt distant sans modifier vos fichiers locaux
- `git reset --hard origin/main` : Réinitialise votre branche locale `main` pour qu'elle corresponde exactement à `origin/main`. **Toutes vos modifications locales non commitées seront perdues**
- `git clean -fd` : Supprime tous les fichiers et dossiers non suivis par Git (fichiers créés localement mais jamais ajoutés à Git)

**Méthode 2 : Checkout direct (Alternative simple)**
```bash
# 1. Récupérer les dernières informations
git fetch origin

# 2. Forcer le checkout de la branche distante
git checkout -f origin/main

# 3. Déplacer votre branche locale sur cette version
git branch -f main origin/main

# 4. Revenir sur votre branche locale
git checkout main
```

**Explication :**
- `git fetch origin` : Télécharge les informations du dépôt distant
- `git checkout -f origin/main` : Force le checkout de la version distante (ignore les modifications locales)
- `git branch -f main origin/main` : Force votre branche locale `main` à pointer vers `origin/main`
- `git checkout main` : Revenir sur votre branche locale (maintenant identique à la distante)

**Méthode 3 : Supprimer et cloner à nouveau (Solution radicale)**
```bash
# 1. Sortir du dossier du projet
cd ..

# 2. Supprimer complètement le dossier local (⚠️ ATTENTION : tout sera supprimé)
# Sur macOS/Linux
rm -rf pr-2026-bj

# Sur Windows (PowerShell)
Remove-Item -Recurse -Force pr-2026-bj

# 3. Cloner à nouveau depuis GitHub
git clone https://github.com/VOTRE_USERNAME/pr-2026-bj.git

# 4. Entrer dans le dossier
cd pr-2026-bj
```

**Explication :**
Cette méthode supprime complètement votre copie locale et la recrée depuis GitHub. C'est la méthode la plus radicale mais aussi la plus sûre pour garantir une copie identique.

**Quand utiliser quelle méthode ?**
- **Méthode 1** : Si vous êtes dans le dossier du projet et voulez rapidement synchroniser
- **Méthode 2** : Si vous préférez une approche étape par étape
- **Méthode 3** : Si vous avez des problèmes avec Git ou voulez repartir de zéro

**💡 Astuce :** Avant d'écraser votre version locale, vous pouvez sauvegarder vos modifications :
```bash
# Créer une branche de sauvegarde (au cas où)
# Sur macOS/Linux
git branch sauvegarde-locale-$(date +%Y%m%d-%H%M%S)

# Sur Windows (PowerShell)
git branch sauvegarde-locale-$(Get-Date -Format "yyyyMMdd-HHmmss")

# Puis exécuter la méthode 1 ou 2
```