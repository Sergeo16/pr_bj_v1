# ⚡ Déploiement Rapide sur Render

Guide rapide pour déployer sur Render en 5 minutes.

## 🚀 Étapes Rapides

### 1. Pousser sur GitHub
```bash
git add .
git commit -m "Préparation pour déploiement Render"
git push origin main
```

### 2. Créer un compte Render
- Allez sur [render.com](https://render.com)
- Créez un compte (connexion GitHub recommandée)

### 3. Déployer avec Blueprint
1. Dashboard Render → **"New +"** → **"Blueprint"**
2. Connectez votre dépôt GitHub
3. Sélectionnez `pr-2026-bj-v3`
4. Cliquez sur **"Apply"**
5. Render créera automatiquement le service web et la base de données

### 4. Configurer NEXT_PUBLIC_APP_URL
1. Attendez que le premier déploiement se termine
2. Notez l'URL de votre service (ex: `https://pr-2026-bj.onrender.com`)
3. Service web → **"Environment"** → Ajoutez :
   - **Key** : `NEXT_PUBLIC_APP_URL`
   - **Value** : `https://pr-2026-bj.onrender.com` (votre URL)
4. Cliquez sur **"Save Changes"**

### 5. Vérifier les migrations
1. Service web → **"Shell"**
2. Exécutez :
```bash
npm run migrate
npm run seed
```

### 6. Tester l'application
- Accédez à votre URL Render
- Testez le formulaire de vote
- Vérifiez le dashboard

## ✅ C'est tout !

Votre application est maintenant déployée. Chaque push sur `main` déclenchera un nouveau déploiement automatique.

## 📚 Documentation complète

Pour plus de détails, consultez **[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)**

## 🐛 Problèmes ?

1. Vérifiez les logs dans Render Dashboard
2. Vérifiez que toutes les variables d'environnement sont configurées
3. Consultez la section Dépannage dans [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)

