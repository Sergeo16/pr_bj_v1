# 🚀 Guide Rapide de Déploiement

## 📤 Push sur GitHub

```bash
# Vérifier les changements
git status

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit
git commit -m "Ajout configuration Railway et scripts de déploiement"

# Pousser sur GitHub
git push origin main
```

## 🚂 Déploiement sur Railway

### 1. Créer un compte et projet Railway

1. Allez sur [railway.app](https://railway.app) et créez un compte
2. Cliquez sur **"New Project"** → **"Deploy from GitHub repo"**
3. Sélectionnez votre dépôt `pr-2026-bj`

### 2. Ajouter PostgreSQL

1. Dans le projet, cliquez sur **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway créera automatiquement une base de données

### 3. Configurer les Variables d'Environnement

Dans votre service web, ajoutez ces variables dans **"Variables"** :

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
NODE_ENV=production
PORT=3000
```

**Important :** Remplacez `Postgres` par le nom exact de votre service PostgreSQL si différent.

### 4. Exécuter les Migrations

Une fois l'application déployée, exécutez les migrations :

**⭐ Option A : Via Railway CLI avec Shell Interactif (RECOMMANDÉ)**

Cette méthode ouvre un shell interactif directement dans le conteneur Railway.

1. **Installez Railway CLI** (si pas déjà fait) :
   ```bash
   npm install -g @railway/cli
   ```

2. **Connectez-vous** :
   ```bash
   railway login
   ```

3. **Liez votre projet** (sélectionnez le service WEB, pas Postgres) :
   ```bash
   railway link
   ```

4. **Ouvrez un shell interactif dans le conteneur** :
   ```bash
   railway shell
   ```
   ⚠️ **Important** : Si vous avez plusieurs services, spécifiez le service web :
   ```bash
   railway shell --service pr-2026-bj-v2
   ```

5. **Dans le shell interactif, exécutez les migrations** :
   ```bash
   npm run migrate
   ```

6. **Puis exécutez le seed** :
   ```bash
   npm run seed
   ```

7. **Quittez le shell** :
   ```bash
   exit
   ```

**Alternative : Via le Dashboard Railway**

Si votre plan Railway inclut cette fonctionnalité :
1. Allez dans votre service web → **"Deployments"**
2. Cliquez sur le **dernier déploiement**
3. Cherchez un onglet **"Shell"**, **"Terminal"**, **"Console"** ou **"Run Command"**
4. Si disponible, exécutez `npm run migrate` puis `npm run seed`

**Option B : Via Railway CLI (Alternative)**

⚠️ **Note** : Cette méthode peut avoir des problèmes car `railway run` exécute parfois les commandes localement. Si vous rencontrez des erreurs, utilisez l'Option A.

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Lier le projet (sélectionnez le service WEB, pas Postgres)
railway link

# Spécifier explicitement le service web pour exécuter dans le conteneur
railway run --service pr-2026-bj-v2 npm run migrate
railway run --service pr-2026-bj-v2 npm run seed
```

**Si vous obtenez des erreurs avec Railway CLI**, utilisez l'Option A (Dashboard Railway) qui est plus fiable.

### 5. Configurer le Domaine

1. Dans votre service web → **"Settings"**
2. Cliquez sur **"Generate Domain"** pour obtenir un domaine Railway gratuit
3. Ou configurez un domaine personnalisé

## ✅ Vérification

Une fois déployé, vérifiez que :
- ✅ L'application démarre sans erreur
- ✅ Les migrations sont exécutées
- ✅ Le seed est exécuté
- ✅ L'application est accessible via l'URL Railway
- ✅ Le formulaire de vote fonctionne
- ✅ Le dashboard fonctionne

## 📚 Documentation Complète

Pour plus de détails, consultez [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

