# 🔍 Guide de Débogage des Erreurs

## Erreurs Rencontrées

### 1. Erreur 500 sur `/api/votes`

**Symptôme** : Le serveur répond avec une erreur 500 (Internal Server Error) lors de la soumission d'un vote.

**Causes Possibles** :

#### A. Table `bureau_vote` manquante
- **Symptôme** : L'erreur contient "Table bureau_vote does not exist"
- **Solution** : Exécuter les migrations
  ```bash
  npm run migrate
  ```

#### B. Problème de connexion à la base de données
- **Symptôme** : Erreur "DATABASE_URL environment variable is not set" ou erreur de connexion
- **Solution** : 
  1. Vérifier que la variable `DATABASE_URL` est définie dans `.env.local` ou `.env`
  2. Vérifier que PostgreSQL est démarré
  3. Vérifier que l'URL de connexion est correcte

#### C. Contrainte NOT NULL sur `bureau_vote_id`
- **Symptôme** : Erreur SQL "null value in column bureau_vote_id violates not-null constraint"
- **Solution** : La migration 003 devrait avoir résolu ce problème, mais si ce n'est pas le cas :
  ```sql
  -- Vérifier s'il reste des votes sans bureau_vote_id
  SELECT COUNT(*) FROM vote WHERE bureau_vote_id IS NULL;
  
  -- Si le résultat est > 0, créer des bureaux par défaut
  -- (La migration 003 devrait avoir fait cela automatiquement)
  ```

#### D. Erreur de validation Zod
- **Symptôme** : L'erreur contient "Validation error" avec des détails
- **Solution** : Vérifier que tous les champs requis sont remplis et valides :
  - `fullName` : chaîne non vide (max 200 caractères)
  - `departementId`, `communeId`, `arrondissementId`, `villageId`, `centreId` : nombres entiers positifs
  - `bureauxVote` : tableau avec au moins un élément
  - Chaque bureau doit avoir : `bureauVoteId`, `inscrits`, `votants`, `bulletinsNuls`, `bulletinsBlancs`, `suffragesExprimes`, `voixWadagniTalata`, `voixHounkpeHounwanou`

#### E. IDs de référence invalides
- **Symptôme** : L'erreur contient "Invalid reference IDs"
- **Solution** : Vérifier que tous les IDs sélectionnés existent dans la base de données :
  - Le département, commune, arrondissement, village et centre doivent exister
  - Les relations hiérarchiques doivent être correctes

#### F. Erreur lors de la création/récupération des bureaux
- **Symptôme** : L'erreur contient "Error managing bureaux de vote"
- **Solution** : 
  1. Vérifier que la table `bureau_vote` existe
  2. Vérifier que la contrainte UNIQUE sur `(name, centre_id)` n'est pas violée
  3. Vérifier les logs du serveur pour plus de détails

### 2. Erreur 404 (Not Found)

**Symptôme** : Le serveur répond avec une erreur 404 pour une ressource.

**Causes Possibles** :

#### A. Route API manquante
- **Symptôme** : Une route API retourne 404
- **Solution** : Vérifier que la route existe dans `app/api/`
- **Routes disponibles** :
  - `/api/regions/departements` (GET)
  - `/api/regions/communes?departementId=X` (GET)
  - `/api/regions/arrondissements?communeId=X` (GET)
  - `/api/regions/villages?arrondissementId=X` (GET)
  - `/api/regions/centres?villageId=X` (GET)
  - `/api/regions/bureaux?centreId=X` (GET)
  - `/api/votes` (POST)
  - `/api/dashboard/stats` (GET)
  - `/api/dashboard/stream` (GET)
  - `/api/duos` (GET)

#### B. Paramètre manquant dans l'URL
- **Symptôme** : Route API retourne 400 au lieu de 404
- **Solution** : Vérifier que tous les paramètres requis sont présents dans l'URL

## 🔧 Comment Déboguer

### 1. Vérifier les Logs du Serveur

Les logs du serveur contiennent des informations détaillées sur les erreurs :

```bash
# Si vous utilisez npm run dev
# Les logs apparaissent dans le terminal où vous avez lancé le serveur

# Si vous utilisez Docker
docker-compose logs -f web
```

### 2. Vérifier la Structure de la Base de Données

```bash
# Se connecter à PostgreSQL
psql $DATABASE_URL

# Vérifier que toutes les tables existent
\dt

# Vérifier la structure de la table vote
\d vote

# Vérifier la structure de la table bureau_vote
\d bureau_vote

# Vérifier s'il y a des votes sans bureau_vote_id
SELECT COUNT(*) FROM vote WHERE bureau_vote_id IS NULL;
```

### 3. Tester les Routes API Manuellement

```bash
# Tester la route des départements
curl http://localhost:3000/api/regions/departements

# Tester la route des votes (avec des données de test)
curl -X POST http://localhost:3000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "departementId": 1,
    "communeId": 1,
    "arrondissementId": 1,
    "villageId": 1,
    "centreId": 1,
    "bureauxVote": [{
      "bureauVoteId": 1,
      "inscrits": 100,
      "votants": 80,
      "bulletinsNuls": 2,
      "bulletinsBlancs": 1,
      "suffragesExprimes": 77,
      "voixWadagniTalata": 40,
      "voixHounkpeHounwanou": 37,
      "observations": ""
    }]
  }'
```

### 4. Vérifier les Variables d'Environnement

```bash
# Vérifier que DATABASE_URL est définie
echo $DATABASE_URL

# Si vous utilisez un fichier .env.local
cat .env.local | grep DATABASE_URL
```

### 5. Vérifier les Migrations

```bash
# Exécuter les migrations
npm run migrate

# Vérifier que toutes les migrations ont été exécutées
# (Les migrations créent une table de suivi automatiquement)
```

## 📋 Checklist de Dépannage

Avant de signaler un bug, vérifiez :

- [ ] Les migrations ont été exécutées (`npm run migrate`)
- [ ] La base de données est démarrée et accessible
- [ ] La variable `DATABASE_URL` est définie et correcte
- [ ] Le serveur Next.js est démarré (`npm run dev`)
- [ ] Tous les champs du formulaire sont remplis correctement
- [ ] Les IDs sélectionnés existent dans la base de données
- [ ] Les logs du serveur ont été consultés pour plus de détails

## 🆘 Obtenir de l'Aide

Si le problème persiste :

1. **Collecter les informations suivantes** :
   - Message d'erreur complet (depuis la console du navigateur et les logs du serveur)
   - Requête HTTP complète (méthode, URL, headers, body)
   - Version de Node.js (`node --version`)
   - Version de PostgreSQL (`psql --version`)
   - Système d'exploitation

2. **Vérifier les logs détaillés** :
   - Console du navigateur (F12 → Console)
   - Logs du serveur Next.js
   - Logs de PostgreSQL (si accessible)

3. **Reproduire le problème** :
   - Noter les étapes exactes pour reproduire l'erreur
   - Tester avec des données minimales pour isoler le problème

