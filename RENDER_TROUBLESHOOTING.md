# 🔧 Dépannage des Erreurs de Déploiement Render

## ❌ Erreur : "Deploy failed - Exited with status 1"

### 🔍 Comment identifier le problème

1. **Allez dans votre service sur Render Dashboard**
2. **Cliquez sur l'onglet "Logs"**
3. **Cherchez les erreurs dans les logs de build**

### 🐛 Causes courantes et solutions

#### 1. Erreur TypeScript

**Symptômes :**
```
error TS2307: Cannot find module '...'
error TS2339: Property '...' does not exist on type '...'
```

**Solutions :**
- Vérifiez que tous les imports sont corrects
- Vérifiez que `tsconfig.json` est présent et correct
- Vérifiez que les types sont installés (`@types/*`)

**Commande pour tester localement :**
```bash
npm run build
```

#### 2. Fichiers de configuration manquants

**Fichiers requis :**
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `tsconfig.json`
- ✅ `tailwind.config.js`
- ✅ `postcss.config.js`

**Vérification :**
```bash
# Vérifier que tous les fichiers sont présents
ls -la | grep -E "(package.json|next.config|tsconfig|tailwind|postcss)"
```

#### 3. Problème avec les dépendances

**Symptômes :**
```
npm ERR! code ERESOLVE
npm ERR! Could not resolve dependency
```

**Solutions :**
- Vérifiez que `package-lock.json` est présent
- Essayez de supprimer `node_modules` et `package-lock.json` localement, puis :
  ```bash
  npm install
  git add package-lock.json
  git commit -m "Update package-lock.json"
  git push
  ```

#### 4. Erreur de build Next.js

**Symptômes :**
```
Error: Cannot find module '...'
Failed to compile
```

**Solutions :**
- Vérifiez que toutes les dépendances sont dans `dependencies` et non seulement dans `devDependencies`
- Pour les scripts de migration, `tsx` doit être disponible (il est dans devDependencies, ce qui est OK car le build l'inclut)

#### 5. Problème de mémoire pendant le build

**Symptômes :**
```
FATAL ERROR: Reached heap limit
JavaScript heap out of memory
```

**Solutions :**
- Augmentez la mémoire disponible dans `package.json` :
  ```json
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
  ```

#### 6. Erreur avec les variables d'environnement

**Symptômes :**
```
Error: DATABASE_URL is not defined
```

**Solutions :**
- Vérifiez que `DATABASE_URL` est configurée dans Render Dashboard
- Pour le build, certaines variables peuvent ne pas être nécessaires, mais `DATABASE_URL` est requise au démarrage

### 🔧 Solutions rapides

#### Solution 1 : Vérifier le build localement

```bash
# Nettoyer
rm -rf .next node_modules package-lock.json

# Réinstaller
npm install

# Tester le build
npm run build
```

Si le build fonctionne localement mais pas sur Render, le problème vient de la configuration Render.

#### Solution 2 : Améliorer le buildCommand

Modifiez `render.yaml` :

```yaml
buildCommand: npm ci && npm run build
```

`npm ci` est plus fiable pour les builds de production car il utilise exactement les versions de `package-lock.json`.

#### Solution 3 : Ajouter des variables d'environnement pour le build

Dans Render Dashboard, ajoutez temporairement :
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`

#### Solution 4 : Vérifier les logs complets

1. Allez dans **"Events"** dans Render Dashboard
2. Cliquez sur le déploiement qui a échoué
3. Regardez les logs complets (pas seulement les erreurs)
4. Cherchez la première erreur qui apparaît

### 📋 Checklist de vérification

Avant de redéployer, vérifiez :

- [ ] Le build fonctionne localement (`npm run build`)
- [ ] Tous les fichiers de configuration sont présents
- [ ] `package-lock.json` est à jour
- [ ] Les variables d'environnement sont configurées dans Render
- [ ] La base de données est créée et accessible
- [ ] Le fichier `render.yaml` est valide

### 🆘 Si rien ne fonctionne

1. **Créer un nouveau service manuellement** (sans Blueprint) :
   - Créez le service web manuellement
   - Configurez les variables d'environnement
   - Testez le déploiement

2. **Vérifier la version de Node.js** :
   - Render utilise Node.js 20 par défaut
   - Vérifiez que votre projet est compatible

3. **Contacter le support Render** :
   - Avec les logs complets
   - Avec la configuration `render.yaml`
   - Avec les erreurs spécifiques

### 📝 Logs à partager pour le support

Si vous avez besoin d'aide, partagez :
1. Les logs complets du build (depuis "Events")
2. Le contenu de `render.yaml`
3. Le contenu de `package.json`
4. L'erreur exacte (copier-coller)

---

## ✅ Vérification rapide

Exécutez ces commandes localement pour vérifier que tout est prêt :

```bash
# 1. Vérifier les fichiers
ls -la package.json next.config.js tsconfig.json tailwind.config.js postcss.config.js

# 2. Nettoyer et réinstaller
rm -rf node_modules .next
npm install

# 3. Tester le build
npm run build

# 4. Vérifier que le build a créé .next/standalone
ls -la .next/standalone
```

Si toutes ces étapes fonctionnent localement, le problème vient probablement de la configuration Render ou des variables d'environnement.

