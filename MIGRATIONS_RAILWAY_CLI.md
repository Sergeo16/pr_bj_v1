# 🚀 Guide Rapide : Exécuter les Migrations sur Railway (Plan Gratuit)

## ⚡ Solution Rapide (5 minutes)

### Étape 1 : Installer Railway CLI

```bash
# Windows (PowerShell)
iwr https://railway.app/install.sh | iex

# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Ou via npm (si vous avez Node.js)
npm install -g @railway/cli
```

### Étape 2 : Se connecter et lier le projet

```bash
# Se connecter à Railway
railway login

# Lier le projet (sélectionnez le service WEB "pr-2026-bj-v2")
railway link
```

Quand `railway link` vous demande :
- **Workspace** : `sergeo16's Projects`
- **Project** : `artistic-illumination`
- **Environment** : `production`
- **Service** : `pr-2026-bj-v2` ⚠️ **IMPORTANT : Sélectionnez le service WEB, pas Postgres**

### Étape 3 : Ouvrir un shell dans le conteneur Railway

```bash
railway shell --service pr-2026-bj-v2
```

⚠️ **Important** : Vous DEVEZ spécifier `--service pr-2026-bj-v2` pour être sûr d'être dans le bon conteneur.

### Étape 4 : Exécuter les migrations

Une fois dans le shell Railway, vous verrez un prompt comme :
```
/app $ 
```

Exécutez :
```bash
npm run migrate
```

Vous devriez voir :
```
🔄 Démarrage des migrations...
📋 3 migration(s) trouvée(s)

🔄 Exécution de 001_initial_schema.sql...
✅ 001_initial_schema.sql exécutée avec succès

🔄 Exécution de 002_bureaux_vote.sql...
✅ 002_bureaux_vote.sql exécutée avec succès

🔄 Exécution de 003_cleanup_old_structure.sql...
✅ 003_cleanup_old_structure.sql exécutée avec succès

✅ Toutes les migrations terminées avec succès
```

### Étape 5 : Quitter le shell

```bash
exit
```

## ✅ Vérification

1. **Vérifiez les logs Railway** :
   - Allez dans Railway Dashboard → votre service web → "Deployments" → "Logs"
   - L'application devrait fonctionner sans erreurs

2. **Testez l'application** :
   - Ouvrez votre application Railway
   - Essayez de créer un vote
   - Les erreurs 404/500 devraient avoir disparu

## 🐛 Dépannage

### Erreur "command not found: railway"

**Solution** : Installez Railway CLI (voir Étape 1)

### Erreur "not logged in"

**Solution** : Exécutez `railway login`

### Erreur "ENOTFOUND postgres.railway.internal"

**Cause** : Vous avez utilisé `railway run` au lieu de `railway shell`

**Solution** : Utilisez `railway shell --service pr-2026-bj-v2` pour ouvrir un shell dans le conteneur

### Le shell ne s'ouvre pas

**Vérifications** :
1. Êtes-vous connecté ? (`railway login`)
2. Avez-vous lié le projet ? (`railway link`)
3. Avez-vous spécifié le bon service ? (`--service pr-2026-bj-v2`)

### Les migrations échouent avec "table already exists"

**C'est normal !** Les migrations sont idempotentes. Si vous voyez des messages "already exists", cela signifie que certaines tables existent déjà. Les migrations continueront et créeront seulement ce qui manque.

## 📝 Notes

- ⚠️ Les migrations sont **idempotentes** : vous pouvez les exécuter plusieurs fois sans problème
- ⚠️ Exécutez toujours les migrations dans le **service web**, pas dans le service Postgres
- ⚠️ Utilisez `railway shell` (pas `railway run`) pour être sûr d'être dans le conteneur

## 🎯 Prochaines Étapes

Une fois les migrations exécutées, vous pouvez :
1. Push les changements pour activer les migrations automatiques au démarrage
2. Tester votre application
3. Vérifier que tout fonctionne correctement

Pour plus de détails, consultez [FIX_RAILWAY_MIGRATIONS.md](./FIX_RAILWAY_MIGRATIONS.md)

