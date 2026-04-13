# 🚂 Guide de Déploiement sur Railway

Ce guide vous explique comment déployer l'application PR 2026 sur Railway.

## 📋 Prérequis

1. Un compte GitHub avec le dépôt du projet
2. Un compte Railway (gratuit disponible sur [railway.app](https://railway.app))
3. Le projet doit être pushé sur GitHub

## 🚀 Étapes de Déploiement

### Étape 1 : Créer un projet sur Railway

1. Connectez-vous à [Railway](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Autorisez Railway à accéder à votre compte GitHub si nécessaire
5. Sélectionnez le dépôt `pr-2026-bj`

### Étape 2 : Ajouter une base de données PostgreSQL

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"Add PostgreSQL"**
3. Railway créera automatiquement une base de données PostgreSQL
4. Notez les informations de connexion (elles seront disponibles dans les variables d'environnement)

### Étape 3 : Configurer les Variables d'Environnement

Dans votre service web (l'application Next.js), ajoutez les variables d'environnement suivantes :

1. Allez dans votre service web → **"Variables"**
2. Ajoutez les variables suivantes :

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
NODE_ENV=production
PORT=3000
```

**Note importante :**
- `DATABASE_URL` : Railway génère automatiquement cette variable depuis le service PostgreSQL. Utilisez la référence `${{Postgres.DATABASE_URL}}` où `Postgres` est le nom de votre service PostgreSQL.
- `NEXT_PUBLIC_APP_URL` : Utilisez `${{RAILWAY_PUBLIC_DOMAIN}}` pour obtenir automatiquement l'URL publique de votre application.

#### Si vous avez déjà des variables d'environnement

Si Railway a déjà créé automatiquement des variables ou si vous en avez ajouté manuellement :

1. **Vérifiez les variables existantes** dans votre service web → **"Variables"**

2. **Variables à garder/modifier** :
   - ✅ `DATABASE_URL` : Si elle existe déjà, vérifiez qu'elle utilise la référence `${{Postgres.DATABASE_URL}}` (remplacez `Postgres` par le nom exact de votre service PostgreSQL si différent)
   - ✅ `NEXT_PUBLIC_APP_URL` : Modifiez-la pour utiliser `${{RAILWAY_PUBLIC_DOMAIN}}` si elle n'utilise pas déjà cette référence
   - ✅ `NODE_ENV` : Gardez-la si elle existe, sinon ajoutez-la avec la valeur `production`
   - ✅ `PORT` : Railway définit généralement `PORT` automatiquement, vous pouvez la garder ou la définir à `3000`

3. **Variables à ajouter** (si elles n'existent pas) :
   - ➕ `RATE_LIMIT_MAX_REQUESTS=100`
   - ➕ `RATE_LIMIT_WINDOW_MS=60000`

4. **Variables à supprimer** (si elles existent et ne sont pas nécessaires) :
   - ❌ Variables de développement comme `NODE_ENV=development` (remplacez par `production`)
   - ❌ Variables obsolètes ou non utilisées par l'application
   - ❌ Variables avec des valeurs hardcodées qui devraient utiliser des références Railway

5. **Variables générées automatiquement par Railway** (ne pas modifier) :
   - 🔒 `RAILWAY_ENVIRONMENT`
   - 🔒 `RAILWAY_PROJECT_ID`
   - 🔒 `RAILWAY_SERVICE_ID`
   - 🔒 `RAILWAY_PUBLIC_DOMAIN` (utilisez-la dans `NEXT_PUBLIC_APP_URL`)

**Exemple de configuration finale** :
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
NODE_ENV=production
PORT=3000
```

**⚠️ Important** : Après avoir modifié les variables, Railway redéploiera automatiquement votre application. Assurez-vous que toutes les variables sont correctement configurées avant de sauvegarder.

#### Guide détaillé pour vos variables actuelles

Si vous avez les variables suivantes (générées automatiquement par Railway) :

**✅ Variables à GARDER et VÉRIFIER** :

1. **`DATABASE_URL`** 
   - **Action** : Vérifiez qu'elle utilise `${{Postgres.DATABASE_URL}}` (ou le nom exact de votre service PostgreSQL)
   - **Si elle contient une URL directe** : Remplacez-la par `${{Postgres.DATABASE_URL}}`
   - **Pourquoi** : Cette référence se met à jour automatiquement si Railway change la configuration de la base de données

2. **`NEXT_PUBLIC_APP_URL`**
   - **Action** : Vérifiez qu'elle utilise `${{RAILWAY_PUBLIC_DOMAIN}}`
   - **Si elle contient une URL hardcodée** : Remplacez-la par `${{RAILWAY_PUBLIC_DOMAIN}}`
   - **Pourquoi** : Cette variable est nécessaire pour que Next.js génère les bonnes URLs côté client

3. **`NODE_ENV`**
   - **Action** : Vérifiez qu'elle est définie à `production`
   - **Si elle vaut `development`** : Changez-la en `production`

4. **`PORT`**
   - **Action** : Gardez-la telle quelle (Railway la gère automatiquement)
   - **Valeur recommandée** : `3000` (mais Railway peut la définir automatiquement)

5. **`RATE_LIMIT_MAX_REQUESTS`**
   - **Action** : Vérifiez qu'elle vaut `100` (déjà présente ✅)

6. **`RATE_LIMIT_WINDOW_MS`**
   - **Action** : Vérifiez qu'elle vaut `60000` (déjà présente ✅)

**🔒 Variables générées par Railway - NE PAS MODIFIER** (mais vous pouvez les garder) :

Ces variables sont créées automatiquement par Railway et ne doivent pas être modifiées manuellement :

- `DATABASE_PUBLIC_URL` - URL publique de la base de données (générée par Railway)
- `PGDATA`, `PGDATABASE`, `PGHOST`, `PGPASSWORD`, `PGPORT`, `PGUSER` - Variables PostgreSQL individuelles (générées par Railway)
- `POSTGRES_DB`, `POSTGRES_PASSWORD`, `POSTGRES_USER` - Variables PostgreSQL (générées par Railway)
- `RAILWAY_DEPLOYMENT_DRAINING_SECONDS` - Configuration Railway (générée automatiquement)
- `SSL_CERT_DAYS` - Configuration SSL (générée par Railway)

**❌ Variables à SUPPRIMER** (optionnel, mais recommandé pour nettoyer) :

Vous pouvez supprimer ces variables car elles ne sont pas utilisées par votre application Next.js. Elles sont redondantes si `DATABASE_URL` est correctement configurée :

- `DATABASE_PUBLIC_URL` (redondant avec `DATABASE_URL`)
- `PGDATA`
- `PGDATABASE`
- `PGHOST`
- `PGPASSWORD`
- `PGPORT`
- `PGUSER`
- `POSTGRES_DB`
- `POSTGRES_PASSWORD`
- `POSTGRES_USER`

**⚠️ Note** : Ces variables PostgreSQL individuelles (`PG*` et `POSTGRES_*`) sont créées automatiquement par Railway pour le service PostgreSQL, mais votre application Next.js utilise uniquement `DATABASE_URL`. Vous pouvez les supprimer du service web pour garder la configuration propre, mais ce n'est pas obligatoire.

**📋 Configuration finale recommandée pour votre service web** :

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
PORT=3000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

Toutes les autres variables (`PG*`, `POSTGRES_*`, `RAILWAY_*`, etc.) peuvent être supprimées du service web car elles ne sont pas nécessaires pour votre application Next.js.

### Étape 4 : Configurer le Service Web

1. Railway détectera automatiquement le Dockerfile
2. Le build se lancera automatiquement
3. Une fois le build terminé, Railway démarrera l'application

### Étape 5 : Exécuter les Migrations et le Seed

Après le premier déploiement, vous devez exécuter les migrations et le seed :

#### Option 1 : Via Railway CLI (Recommandé)

1. Installez Railway CLI :
```bash
# Windows (PowerShell)
iwr https://railway.app/install.sh | iex

# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh
```

2. Connectez-vous :
```bash
railway login
```

3. Liez votre projet :
```bash
railway link
# Sélectionnez votre projet et environnement
# ⚠️ IMPORTANT : Sélectionnez le service WEB (pas Postgres) ou appuyez sur ESC pour ne pas sélectionner de service
```

4. Exécutez les migrations dans le service web :
```bash
# Spécifiez explicitement le service web
railway run --service <nom-du-service-web> npm run migrate

# Ou si vous avez lié le service web, simplement :
railway run npm run migrate
```

5. Exécutez le seed :
```bash
# Spécifiez explicitement le service web
railway run --service <nom-du-service-web> npm run seed

# Ou si vous avez lié le service web, simplement :
railway run npm run seed
```

**⚠️ Important** : 
- Vous devez exécuter les commandes dans le **service web** (pas dans le service Postgres)
- Si vous avez lié le service Postgres par erreur, utilisez `--service` pour spécifier le service web
- Les migrations doivent s'exécuter dans le conteneur web où `DATABASE_URL` pointe vers le service PostgreSQL interne

#### Option 2 : Via Railway Dashboard (Plus Simple - Recommandé ⭐)

**Cette méthode est la plus simple et la plus fiable !**

**Étapes détaillées** :

1. **Ouvrez Railway Dashboard** :
   - Allez sur [railway.app](https://railway.app)
   - Connectez-vous si nécessaire

2. **Sélectionnez votre projet** :
   - Cliquez sur votre projet `fortunate-enchantment`
   - Vous verrez vos services (Postgres et votre service web)

3. **Ouvrez votre service web** :
   - ⚠️ **IMPORTANT** : Cliquez sur le **service web** (celui qui contient votre application Next.js), PAS sur le service Postgres
   - Le service web devrait avoir un nom comme `web`, `app`, ou le nom de votre dépôt GitHub

4. **Accédez au terminal** :
   - Cliquez sur l'onglet **"Deployments"** en haut
   - Cliquez sur le **dernier déploiement** (celui qui est actif/running)
   - Vous verrez plusieurs onglets : **"Logs"**, **"Metrics"**, **"Shell"**
   - Cliquez sur **"Shell"** (ou **"Run Command"** selon votre version de Railway)

5. **Exécutez les migrations** :
   - Un terminal intégré s'ouvre
   - Tapez la commande suivante et appuyez sur Entrée :
   ```bash
   npm run migrate
   ```
   - Attendez que la migration se termine (vous devriez voir "✅ Migrations terminées avec succès")

6. **Exécutez le seed** :
   - Dans le même terminal, tapez :
   ```bash
   npm run seed
   ```
   - Attendez que le seed se termine (vous devriez voir les statistiques des données chargées)

**✅ Avantages de cette méthode** :
- ✅ Pas besoin de Railway CLI
- ✅ Les commandes s'exécutent directement dans le conteneur web
- ✅ Toutes les variables d'environnement sont déjà configurées
- ✅ Vous voyez les résultats en temps réel
- ✅ Pas de problème de connexion réseau

**📸 Aide visuelle** :
Si vous ne trouvez pas l'onglet "Shell", cherchez :
- Un bouton **"Terminal"** ou **"Console"**
- Un bouton **"Run Command"**
- Un onglet **"Shell"** dans les détails du déploiement

### Étape 6 : Configurer le Domaine Public

1. Dans votre service web, allez dans **"Settings"**
2. Cliquez sur **"Generate Domain"** pour obtenir un domaine Railway gratuit
3. Ou configurez un domaine personnalisé dans **"Custom Domain"**

## 🔧 Configuration Avancée

### Script de Démarrage avec Migrations Automatiques

Si vous voulez que les migrations s'exécutent automatiquement au démarrage, vous pouvez créer un script de démarrage :

1. Créez un fichier `scripts/start-railway.js` :
```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');

async function main() {
  try {
    console.log('🔄 Exécution des migrations...');
    execSync('npm run migrate', { stdio: 'inherit' });
    console.log('✅ Migrations terminées');
    
    console.log('🚀 Démarrage de l\'application...');
    execSync('node server.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
```

2. Modifiez le `railway.json` pour utiliser ce script :
```json
{
  "deploy": {
    "startCommand": "node scripts/start-railway.js"
  }
}
```

**⚠️ Note :** Cette approche peut ralentir le démarrage. Il est recommandé d'exécuter les migrations manuellement la première fois, puis seulement lors des mises à jour de schéma.

### Monitoring et Logs

- **Logs** : Accessibles via le dashboard Railway dans la section "Deployments"
- **Métriques** : Railway fournit des métriques de base (CPU, RAM, réseau)
- **Alertes** : Configurez des alertes dans les paramètres du projet

## 🐛 Dépannage

### L'application ne démarre pas

1. Vérifiez les logs dans Railway Dashboard
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que `DATABASE_URL` pointe vers le bon service PostgreSQL

### Erreur de connexion à la base de données

1. Vérifiez que le service PostgreSQL est démarré
2. Vérifiez que `DATABASE_URL` utilise la référence correcte : `${{Postgres.DATABASE_URL}}`
3. Vérifiez que les migrations ont été exécutées

### Erreur "ENOTFOUND postgres.railway.internal" avec Railway CLI

Si vous obtenez cette erreur lors de l'exécution de `railway run npm run migrate` :

**Cause** : La commande s'exécute localement avec les variables Railway, mais `postgres.railway.internal` n'est accessible que depuis les conteneurs Railway.

**Solutions** :

1. **Utiliser le Dashboard Railway** (Recommandé) :
   - Allez dans votre service web → **"Deployments"** → **"Shell"** ou **"Run Command"**
   - Exécutez `npm run migrate` et `npm run seed` directement dans le terminal intégré

2. **Spécifier le service web avec Railway CLI** :
   ```bash
   # Voir les services disponibles
   railway service
   
   # Exécuter dans le service web (remplacez <nom-service-web> par le nom réel)
   railway run --service <nom-service-web> npm run migrate
   railway run --service <nom-service-web> npm run seed
   ```

3. **Relier le bon service** :
   ```bash
   railway link
   # Sélectionnez votre projet
   # Sélectionnez l'environnement (production)
   # ⚠️ IMPORTANT : Sélectionnez le service WEB (pas Postgres) ou appuyez sur ESC
   ```

### Erreur "DATABASE_URL environment variable is not set"

Si vous voyez cette erreur dans les logs Railway :

**Cause** : La variable `DATABASE_URL` n'est pas définie dans les variables d'environnement du service web.

**Solution immédiate** :

1. **Allez dans Railway Dashboard** :
   - Ouvrez votre projet Railway
   - Cliquez sur votre **service web** (pas Postgres)

2. **Ouvrez les Variables** :
   - Cliquez sur l'onglet **"Variables"** en haut
   - Vérifiez si `DATABASE_URL` existe

3. **Ajoutez ou corrigez DATABASE_URL** :
   - Si `DATABASE_URL` n'existe pas, cliquez sur **"New Variable"**
   - Nom : `DATABASE_URL`
   - Valeur : `${{Postgres.DATABASE_URL}}` (remplacez `Postgres` par le nom exact de votre service PostgreSQL dans Railway)
   - Cliquez sur **"Add"** ou **"Save"**

4. **Vérifiez le nom du service PostgreSQL** :
   - Dans votre projet Railway, regardez le nom exact de votre service PostgreSQL
   - Il peut s'appeler `Postgres`, `PostgreSQL`, `postgres`, ou un autre nom
   - Utilisez ce nom exact dans la référence : `${{NomExactDuService.DATABASE_URL}}`

5. **Redéployez** :
   - Railway redéploiera automatiquement votre application après avoir ajouté/modifié la variable
   - Attendez que le déploiement se termine

6. **Vérifiez les logs** :
   - Après le redéploiement, vérifiez les logs
   - L'erreur `DATABASE_URL environment variable is not set` ne devrait plus apparaître

**Exemple** :
Si votre service PostgreSQL s'appelle `Postgres` :
```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
```

Si votre service PostgreSQL s'appelle `PostgreSQL` :
```
DATABASE_URL = ${{PostgreSQL.DATABASE_URL}}
```

### Erreur "Application error: a client-side exception has occurred" - Listes déroulantes vides

Si vous voyez cette erreur et que les listes déroulantes ne se chargent pas :

**Causes possibles** :
1. ❌ **`DATABASE_URL` n'est pas définie** (erreur la plus fréquente - voir ci-dessus)
2. ❌ Les migrations n'ont pas été exécutées (base de données vide)
3. ❌ Le seed n'a pas été exécuté (pas de données)
4. ❌ Erreur de connexion à la base de données
5. ❌ Variables d'environnement incorrectes

**Diagnostic étape par étape** :

1. **Vérifier les logs Railway** :
   - Allez dans votre service web → **"Deployments"** → **"Logs"**
   - Cherchez des erreurs comme :
     - `DATABASE_URL environment variable is not set`
     - `Error connecting to database`
     - `relation "duo" does not exist` (migrations non exécutées)
     - `relation "departement" does not exist` (migrations non exécutées)

2. **Vérifier les variables d'environnement** :
   - Allez dans votre service web → **"Variables"**
   - Vérifiez que `DATABASE_URL` existe et utilise `${{Postgres.DATABASE_URL}}` (remplacez `Postgres` par le nom exact de votre service PostgreSQL)
   - Vérifiez que `NEXT_PUBLIC_APP_URL` existe et utilise `${{RAILWAY_PUBLIC_DOMAIN}}`

3. **Vérifier si les migrations ont été exécutées** :
   - Allez dans votre service web → **"Deployments"** → **"Shell"**
   - Exécutez :
   ```bash
   # Vérifier si les tables existent
   psql $DATABASE_URL -c "\dt"
   ```
   - Vous devriez voir les tables : `duo`, `departement`, `commune`, `arrondissement`, `village`, `centre`, `vote`
   - Si les tables n'existent pas, exécutez les migrations :
   ```bash
   npm run migrate
   ```

4. **Vérifier si les données ont été chargées** :
   - Dans le même shell, exécutez :
   ```bash
   # Vérifier si les départements existent
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM departement;"
   ```
   - Si le résultat est `0`, exécutez le seed :
   ```bash
   npm run seed
   ```

5. **Tester les API directement** :
   - Ouvrez votre navigateur et allez sur :
   - `https://pr-2026-bj-production.up.railway.app/api/duos`
   - `https://pr-2026-bj-production.up.railway.app/api/regions/departements`
   - Vous devriez voir du JSON. Si vous voyez une erreur, vérifiez les logs Railway.

**Solution complète** :

Si les migrations et le seed n'ont pas été exécutés :

1. Allez dans votre service web → **"Deployments"** → **"Shell"**
2. Exécutez dans l'ordre :
   ```bash
   npm run migrate
   npm run seed
   ```
3. Attendez que les deux commandes se terminent avec succès
4. Rafraîchissez votre application dans le navigateur

**Vérification finale** :

Après avoir exécuté les migrations et le seed, vérifiez que tout fonctionne :

1. Les API doivent retourner des données :
   - `https://pr-2026-bj-production.up.railway.app/api/duos` → doit retourner 3 duos
   - `https://pr-2026-bj-production.up.railway.app/api/regions/departements` → doit retourner 12 départements

2. L'application doit charger les listes déroulantes sans erreur

3. Ouvrez la console du navigateur (F12) et vérifiez qu'il n'y a pas d'erreurs JavaScript

### Build échoue

1. Vérifiez les logs de build dans Railway
2. Vérifiez que le Dockerfile est correct
3. Vérifiez que toutes les dépendances sont dans `package.json`

## 📊 Coûts

Railway offre :
- **Plan gratuit** : $5 de crédit gratuit par mois
- **Plan Hobby** : $20/mois pour plus de ressources
- **Plan Pro** : À partir de $20/mois avec plus de fonctionnalités

Pour une application de vote comme celle-ci, le plan gratuit devrait suffire pour commencer.

## 🔄 Mises à Jour

Pour mettre à jour l'application :

1. Poussez vos changements sur GitHub :
```bash
git add .
git commit -m "Mise à jour de l'application"
git push origin main
```

2. Railway détectera automatiquement les changements et redéploiera
3. Si vous avez modifié le schéma de base de données, exécutez les migrations :
```bash
railway run npm run migrate
```

## 📚 Ressources

- [Documentation Railway](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Exemples Railway](https://github.com/railwayapp/examples)

## ✅ Checklist de Déploiement

- [ ] Projet créé sur Railway
- [ ] Service PostgreSQL ajouté
- [ ] Variables d'environnement configurées
- [ ] Application déployée avec succès
- [ ] Migrations exécutées
- [ ] Seed exécuté
- [ ] Domaine public configuré
- [ ] Application accessible et fonctionnelle

---

**Bon déploiement ! 🚀**

