# 🚀 Guide de Déploiement sur Render

Ce guide vous explique comment déployer l'application PR 2026 sur Render après avoir poussé le code sur GitHub.

## 📋 Prérequis

1. ✅ Un compte GitHub avec le dépôt du projet
2. ✅ Un compte Render (gratuit disponible sur [render.com](https://render.com))
3. ✅ Le projet doit être pushé sur GitHub

## 🎯 Vue d'ensemble

Render déploiera automatiquement votre application à chaque push sur la branche principale de GitHub. Le processus comprend :

1. **Service Web** : Application Next.js
2. **Base de données PostgreSQL** : Base de données gérée par Render
3. **Déploiement automatique** : À chaque push sur GitHub

---

## 🚀 Étape 1 : Préparer le dépôt GitHub

### 1.1 Vérifier que le projet est sur GitHub

Assurez-vous que votre projet est bien pushé sur GitHub :

```bash
# Vérifier le remote
git remote -v

# Si pas de remote GitHub, ajoutez-le :
git remote add origin https://github.com/VOTRE_USERNAME/pr-2026-bj-v3.git
git branch -M main
git push -u origin main
```

### 1.2 Vérifier les fichiers nécessaires

Les fichiers suivants doivent être présents dans votre dépôt :

- ✅ `render.yaml` - Configuration Render
- ✅ `scripts/start-render.js` - Script de démarrage pour Render
- ✅ `package.json` - Avec le script `start:render`
- ✅ `next.config.js` - Configuration Next.js avec `output: 'standalone'`
- ✅ `Dockerfile` - (optionnel, Render peut utiliser directement Node.js)

---

## 🚀 Étape 2 : Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Get Started for Free"**
3. Créez un compte avec GitHub (recommandé pour l'intégration automatique)

---

## 🚀 Étape 3 : Créer un nouveau service Web

### Option A : Utiliser render.yaml (Recommandé - Configuration automatique)

1. Dans votre dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Blueprint"**
3. Connectez votre dépôt GitHub
4. Sélectionnez le dépôt `pr-2026-bj-v3`
5. Render détectera automatiquement le fichier `render.yaml`
6. Cliquez sur **"Apply"**

Render créera automatiquement :
- ✅ Le service web Next.js
- ✅ La base de données PostgreSQL
- ✅ La plupart des variables d'environnement nécessaires

**Important :** Après le déploiement, vous devrez ajouter manuellement la variable `NEXT_PUBLIC_APP_URL` avec l'URL de votre service (voir Étape 4).

### Option B : Configuration manuelle

Si vous préférez configurer manuellement :

#### 3.1 Créer la base de données PostgreSQL

1. Dans votre dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"PostgreSQL"**
3. Configurez :
   - **Name** : `pr-2026-db`
   - **Database** : `pr2026_db`
   - **User** : `pr2026_user`
   - **Plan** : `Starter` (gratuit) ou `Standard` (payant)
4. Cliquez sur **"Create Database"**
5. **Notez les informations de connexion** (elles seront nécessaires plus tard)

#### 3.2 Créer le service Web

1. Dans votre dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Connectez votre dépôt GitHub
4. Sélectionnez le dépôt `pr-2026-bj-v3`
5. Configurez le service :

   **Informations de base :**
   - **Name** : `pr-2026-bj`
   - **Region** : Choisissez la région la plus proche de vos utilisateurs
   - **Branch** : `main` (ou la branche que vous utilisez)
   - **Root Directory** : `/` (laisser vide si à la racine)

   **Build & Deploy :**
   - **Environment** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `node scripts/start-render.js`

   **Plan :**
   - **Free** : Gratuit (avec limitations)
   - **Starter** : $7/mois (recommandé pour la production)
   - **Standard** : $25/mois (pour plus de ressources)

6. Cliquez sur **"Advanced"** pour configurer les variables d'environnement

---

## 🔧 Étape 4 : Configurer les Variables d'Environnement

### Si vous avez utilisé render.yaml

La plupart des variables d'environnement sont configurées automatiquement. **Vous devez ajouter manuellement** `NEXT_PUBLIC_APP_URL` après le premier déploiement :

1. Allez dans votre service web
2. Cliquez sur **"Environment"**
3. Ajoutez la variable :
   - **Key** : `NEXT_PUBLIC_APP_URL`
   - **Value** : `https://pr-2026-bj.onrender.com` (remplacez par votre URL réelle)
4. Cliquez sur **"Save Changes"**
5. Render redéploiera automatiquement avec la nouvelle variable

### Si vous avez configuré manuellement

Dans votre service web, allez dans l'onglet **"Environment"** et ajoutez les variables suivantes :

#### Variables requises

```env
NODE_ENV=production
DATABASE_URL=<URL_DE_CONNEXION_POSTGRESQL>
NEXT_PUBLIC_APP_URL=https://votre-app.onrender.com
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

#### Comment obtenir DATABASE_URL

1. Allez dans votre service PostgreSQL sur Render
2. Dans l'onglet **"Info"**, vous trouverez :
   - **Internal Database URL** : Utilisez celle-ci pour la variable `DATABASE_URL`
   - Format : `postgresql://pr2026_user:password@dpg-xxxxx-a.oregon-postgres.render.com/pr2026_db`

#### Comment obtenir NEXT_PUBLIC_APP_URL

1. Une fois votre service web déployé, Render vous donnera une URL
2. Format : `https://pr-2026-bj.onrender.com`
3. Utilisez cette URL pour `NEXT_PUBLIC_APP_URL`

**Note importante :** Si vous utilisez un domaine personnalisé, utilisez ce domaine au lieu de l'URL Render.

---

## 🚀 Étape 5 : Déployer l'application

### Déploiement automatique (recommandé)

1. Une fois la configuration terminée, Render commencera automatiquement le déploiement
2. Vous pouvez suivre le processus dans l'onglet **"Events"** ou **"Logs"**
3. Le déploiement prend généralement 5-10 minutes

### Déclencher un déploiement manuel

Si vous voulez redéployer manuellement :

1. Allez dans votre service web
2. Cliquez sur **"Manual Deploy"**
3. Sélectionnez **"Deploy latest commit"**

---

## 🔄 Étape 6 : Exécuter les migrations et le seed

Après le premier déploiement, vous devez exécuter les migrations et le seed de la base de données.

### Option A : Via Render Shell (Recommandé)

1. Allez dans votre service web sur Render
2. Cliquez sur l'onglet **"Shell"**
3. Exécutez les commandes suivantes :

```bash
npm run migrate
npm run seed
```

### Option B : Via les logs Render

Les migrations sont exécutées automatiquement au démarrage grâce au script `start-render.js`. Vérifiez les logs pour confirmer :

1. Allez dans votre service web
2. Cliquez sur l'onglet **"Logs"**
3. Cherchez les messages :
   - `✅ Migrations terminées avec succès`
   - Si vous voyez des erreurs, exécutez manuellement via Shell

---

## ✅ Étape 7 : Vérifier le déploiement

1. **Vérifier l'URL** : Votre application devrait être accessible sur `https://votre-app.onrender.com`
2. **Tester l'application** :
   - Accédez à la page d'accueil
   - Testez le formulaire de vote
   - Vérifiez le dashboard
3. **Vérifier les logs** : Assurez-vous qu'il n'y a pas d'erreurs dans les logs

---

## 🔄 Déploiement automatique après push GitHub

Une fois configuré, chaque push sur la branche principale déclenchera automatiquement un nouveau déploiement :

```bash
# Faire des modifications
git add .
git commit -m "Vos modifications"
git push origin main
```

Render détectera automatiquement le push et redéploiera l'application.

---

## 🔧 Configuration avancée

### Utiliser un domaine personnalisé

1. Allez dans votre service web
2. Cliquez sur **"Settings"**
3. Dans **"Custom Domains"**, ajoutez votre domaine
4. Suivez les instructions pour configurer le DNS
5. Mettez à jour `NEXT_PUBLIC_APP_URL` avec votre domaine personnalisé

### Variables d'environnement sensibles

Pour les variables sensibles (comme les clés API), utilisez les **"Secret Files"** de Render ou les variables d'environnement sécurisées.

### Plan de déploiement

- **Free** : Déploiement automatique activé par défaut
- **Starter/Standard** : Vous pouvez configurer les conditions de déploiement automatique

---

## 🐛 Dépannage

### L'application ne démarre pas

1. **Vérifier les logs** :
   - Allez dans **"Logs"** de votre service web
   - Cherchez les erreurs de démarrage

2. **Vérifier les variables d'environnement** :
   - Assurez-vous que `DATABASE_URL` est correcte
   - Vérifiez que `NEXT_PUBLIC_APP_URL` correspond à l'URL de votre service

3. **Vérifier le build** :
   - Allez dans **"Events"** pour voir les erreurs de build
   - Vérifiez que `npm run build` s'exécute sans erreur

### Erreur de connexion à la base de données

1. **Vérifier DATABASE_URL** :
   - Utilisez l'**Internal Database URL** (pas l'External)
   - Format : `postgresql://user:password@host:port/database`

2. **Vérifier que la base de données est active** :
   - Allez dans votre service PostgreSQL
   - Vérifiez qu'il est en état **"Available"**

3. **Vérifier les migrations** :
   - Exécutez `npm run migrate` via Shell
   - Vérifiez les logs pour les erreurs

### L'application se met en veille (Free Plan)

Sur le plan gratuit, Render met les services en veille après 15 minutes d'inactivité. Le premier démarrage après la veille peut prendre 30-60 secondes.

**Solutions :**
- Utiliser un service de ping automatique (comme [UptimeRobot](https://uptimerobot.com))
- Passer au plan Starter ($7/mois) pour éviter la mise en veille

### Les migrations échouent

1. **Exécuter manuellement** :
   ```bash
   # Via Render Shell
   npm run migrate
   ```

2. **Vérifier les permissions** :
   - Assurez-vous que l'utilisateur de la base de données a les permissions nécessaires

3. **Vérifier les logs** :
   - Les erreurs de migration sont affichées dans les logs
   - Certaines erreurs non critiques sont ignorées (ex: table already exists)

### Le seed échoue

1. **Vérifier que les migrations sont terminées** :
   ```bash
   npm run migrate
   ```

2. **Exécuter le seed manuellement** :
   ```bash
   npm run seed
   ```

3. **Vérifier le fichier de données** :
   - Assurez-vous que `data/BENIN_centres_vote_complet.json` existe
   - Vérifiez que le fichier est valide JSON

---

## 📊 Monitoring et Logs

### Consulter les logs

1. Allez dans votre service web
2. Cliquez sur **"Logs"**
3. Les logs sont en temps réel et conservés pendant 7 jours (Free) ou plus (plans payants)

### Monitoring

Render fournit des métriques de base :
- **CPU Usage**
- **Memory Usage**
- **Request Count**
- **Response Time**

Pour un monitoring avancé, vous pouvez intégrer des services externes.

---

## 🔒 Sécurité

### Variables d'environnement

- ✅ Ne jamais commiter les variables d'environnement dans le code
- ✅ Utiliser les variables d'environnement Render pour les secrets
- ✅ Utiliser `NEXT_PUBLIC_` uniquement pour les variables accessibles côté client

### Base de données

- ✅ Utiliser l'**Internal Database URL** (pas accessible depuis l'extérieur)
- ✅ Ne jamais exposer les credentials de la base de données
- ✅ Utiliser des mots de passe forts

---

## 📝 Checklist de déploiement

Avant de déployer, vérifiez :

- [ ] Le projet est pushé sur GitHub
- [ ] Le fichier `render.yaml` est présent (ou configuration manuelle)
- [ ] Le script `start-render.js` existe
- [ ] `package.json` contient le script `start:render`
- [ ] `next.config.js` a `output: 'standalone'`
- [ ] Les variables d'environnement sont configurées
- [ ] La base de données PostgreSQL est créée
- [ ] Les migrations sont exécutées
- [ ] Le seed est exécuté
- [ ] L'application est accessible et fonctionnelle

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur Render ! 🚀

Chaque push sur GitHub déclenchera automatiquement un nouveau déploiement.

---

## 📚 Ressources supplémentaires

- [Documentation Render](https://render.com/docs)
- [Guide Next.js sur Render](https://render.com/docs/deploy-nextjs)
- [Configuration PostgreSQL sur Render](https://render.com/docs/databases)

---

## 💡 Astuces

1. **Déploiement automatique** : Configurez une branche spécifique pour la production (ex: `main`) et une autre pour le développement (ex: `dev`)

2. **Environnements multiples** : Vous pouvez créer plusieurs services Render pour différents environnements (staging, production)

3. **Rollback** : Si un déploiement échoue, vous pouvez revenir à une version précédente via **"Manual Deploy"** → **"Deploy previous release"**

4. **Notifications** : Configurez les notifications Render pour être alerté des déploiements et erreurs

---

## ❓ Support

Si vous rencontrez des problèmes :

1. Consultez les logs de votre service
2. Vérifiez la [documentation Render](https://render.com/docs)
3. Consultez les [forums Render](https://community.render.com)

---

**Bon déploiement ! 🚀**

