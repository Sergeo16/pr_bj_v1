# 🔧 Guide de Correction des Migrations Railway

## Problème Actuel

Les migrations n'ont pas été exécutées sur Railway, ce qui cause des erreurs 404/500 sur `/api/votes` car la structure de la base de données est obsolète.

## Solution Immédiate : Exécuter les Migrations Manuellement

### Option 1 : Via Railway CLI avec Shell Interactif (RECOMMANDÉ ⭐ - Plan Gratuit)

Cette méthode fonctionne sur tous les plans Railway, y compris le plan gratuit.

1. **Installez Railway CLI** (si pas déjà fait) :
   ```bash
   # Windows (PowerShell)
   iwr https://railway.app/install.sh | iex
   
   # macOS/Linux
   curl -fsSL https://railway.app/install.sh | sh
   
   # Ou via npm
   npm install -g @railway/cli
   ```

2. **Connectez-vous à Railway** :
   ```bash
   railway login
   ```

3. **Liez votre projet** (si pas déjà fait) :
   ```bash
   railway link
   # Sélectionnez votre projet "artistic-illumination"
   # Sélectionnez l'environnement "production"
   # ⚠️ IMPORTANT : Sélectionnez le service WEB "pr-2026-bj-v2" (pas Postgres)
   ```

4. **Ouvrez un shell interactif dans le conteneur Railway** :
   ```bash
   railway shell --service pr-2026-bj-v2
   ```
   
   ⚠️ **Important** : Si vous avez plusieurs services, vous DEVEZ spécifier `--service pr-2026-bj-v2` pour vous assurer d'être dans le bon conteneur.

5. **Dans le shell interactif, exécutez les migrations** :
   ```bash
   npm run migrate
   ```
   
   Vous devriez voir des messages comme :
   ```
   🔄 Démarrage des migrations...
   📋 3 migration(s) trouvée(s)
   🔄 Exécution de 001_initial_schema.sql...
   ✅ 001_initial_schema.sql exécutée avec succès
   ...
   ✅ Toutes les migrations terminées avec succès
   ```

6. **Optionnel : Exécutez le seed** (si vous avez besoin de données de test) :
   ```bash
   npm run seed
   ```

7. **Quittez le shell** :
   ```bash
   exit
   ```

**✅ Avantages de cette méthode** :
- ✅ Fonctionne sur le plan gratuit
- ✅ Les commandes s'exécutent directement dans le conteneur Railway
- ✅ Toutes les variables d'environnement sont disponibles
- ✅ `postgres.railway.internal` est accessible depuis le conteneur
- ✅ Vous voyez les résultats en temps réel

### Option 2 : Via Railway Dashboard (Si disponible sur votre plan)

⚠️ **Note** : Cette option n'est disponible que sur les plans payants de Railway. Si vous êtes sur le plan gratuit, utilisez l'Option 1.

1. **Ouvrez Railway Dashboard** :
   - Allez sur [railway.app](https://railway.app)
   - Connectez-vous si nécessaire

2. **Sélectionnez votre projet** :
   - Cliquez sur votre projet `artistic-illumination`
   - Vous verrez vos services (Postgres et votre service web `pr-2026-bj-v2`)

3. **Ouvrez votre service web** :
   - ⚠️ **IMPORTANT** : Cliquez sur le **service web** (`pr-2026-bj-v2`), PAS sur le service Postgres

4. **Accédez au terminal** :
   - Cliquez sur l'onglet **"Deployments"** en haut
   - Cliquez sur le **dernier déploiement** (celui qui est actif/running)
   - Cherchez un onglet **"Shell"**, **"Terminal"**, **"Console"** ou **"Run Command"**

5. **Exécutez les migrations** :
   ```bash
   npm run migrate
   ```

## Solution à Long Terme : Migrations Automatiques

Après avoir push les changements suivants, les migrations s'exécuteront automatiquement au démarrage :

### Fichiers Modifiés

1. **`scripts/start-railway.js`** : Script de démarrage qui exécute les migrations avant de démarrer le serveur
2. **`scripts/migrate.ts`** : Amélioré pour gérer les erreurs non critiques
3. **`Dockerfile`** : Modifié pour utiliser `scripts/start-railway.js` au démarrage
4. **`railway.json`** : Mis à jour pour utiliser le nouveau script de démarrage

### Déploiement

1. **Commit et push les changements** :
   ```bash
   git add .
   git commit -m "Ajout migrations automatiques pour Railway"
   git push origin main
   ```

2. **Railway redéploiera automatiquement** :
   - Les migrations s'exécuteront automatiquement au démarrage
   - Le serveur démarrera après les migrations

## Vérification

Après avoir exécuté les migrations, vérifiez que tout fonctionne :

1. **Vérifiez les logs Railway** :
   - Allez dans votre service web → "Deployments" → "Logs"
   - Vous devriez voir "✅ Migrations terminées avec succès"

2. **Testez l'API** :
   - Essayez de créer un vote via l'interface web
   - Vérifiez que l'erreur 500 a disparu

## Dépannage

### Erreur "ENOTFOUND postgres.railway.internal"

Cette erreur se produit quand vous essayez d'exécuter les migrations depuis votre machine locale avec `railway run` (sans shell).

**Solution** : Utilisez `railway shell --service pr-2026-bj-v2` pour ouvrir un shell interactif DANS le conteneur Railway, où `postgres.railway.internal` sera accessible.

**Exemple correct** :
```bash
# ❌ INCORRECT - s'exécute localement
railway run npm run migrate

# ✅ CORRECT - s'exécute dans le conteneur
railway shell --service pr-2026-bj-v2
# Puis dans le shell :
npm run migrate
```

### Erreur "DATABASE_URL environment variable is not set"

Vérifiez que la variable `DATABASE_URL` est bien configurée dans Railway :

1. Allez dans votre service web → "Variables"
2. Vérifiez que `DATABASE_URL` existe et utilise `${{Postgres.DATABASE_URL}}` (remplacez `Postgres` par le nom exact de votre service PostgreSQL)

### Les migrations échouent mais le serveur démarre quand même

C'est normal ! Le script de démarrage continue même si certaines migrations échouent (par exemple si les tables existent déjà). Vérifiez les logs pour voir quelles migrations ont échoué et pourquoi.

## Notes Importantes

- ⚠️ Les migrations sont maintenant **idempotentes** : elles peuvent être exécutées plusieurs fois sans problème
- ⚠️ Les erreurs non critiques (comme "table already exists") sont ignorées
- ⚠️ Le serveur démarre même si certaines migrations échouent (pour éviter de bloquer le déploiement)

