# 🚀 Guide pour Mettre le Projet sur GitHub

## 📋 Prérequis

1. **Compte GitHub** : Si vous n'en avez pas, créez-en un sur [github.com](https://github.com)
2. **Git installé** : Vérifiez avec `git --version`
3. **GitHub CLI (optionnel)** : Pour faciliter l'authentification

---

## 🔧 Étape 1 : Vérifier que Git est installé

```bash
git --version
```

Si Git n'est pas installé :
- **macOS** : `brew install git` ou téléchargez depuis [git-scm.com](https://git-scm.com)
- **Linux** : `sudo apt-get install git` (Ubuntu/Debian) ou `sudo yum install git` (CentOS/RHEL)
- **Windows** : Téléchargez depuis [git-scm.com](https://git-scm.com)

---

## 🔧 Étape 2 : Configurer Git (si pas déjà fait)

```bash
# Configurer votre nom
git config --global user.name "Votre Nom"

# Configurer votre email (utilisez l'email de votre compte GitHub)
git config --global user.email "votre.email@example.com"

# Vérifier la configuration
git config --list
```

---

## 🔧 Étape 3 : Initialiser le dépôt Git dans le projet

```bash
# Naviguer vers le répertoire du projet
cd /Users/Sergeo/Documents/dev/pr_2026_v2

# Initialiser Git
git init

# Vérifier que .gitignore existe (il devrait déjà exister)
ls -la .gitignore
```

---

## 🔧 Étape 4 : Vérifier le fichier .gitignore

Le fichier `.gitignore` devrait déjà exister et contenir :
- `node_modules/`
- `.env`
- `.next/`
- etc.

Si nécessaire, vérifiez son contenu :
```bash
cat .gitignore
```

---

## 🔧 Étape 5 : Ajouter tous les fichiers au staging

```bash
# Voir les fichiers qui seront ajoutés
git status

# Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .

# Vérifier ce qui a été ajouté
git status
```

---

## 🔧 Étape 6 : Créer le premier commit

```bash
# Créer le commit initial
git commit -m "Initial commit: Plateforme de vote PR 2026 BJ"

# Vérifier le commit
git log --oneline
```

---

## 🔧 Étape 7 : Créer un dépôt sur GitHub

### Option A : Via l'interface web GitHub (Recommandé)

1. Allez sur [github.com](https://github.com)
2. Cliquez sur le bouton **"+"** en haut à droite → **"New repository"**
3. Remplissez les informations :
   - **Repository name** : `pr-2026-bj` (ou le nom de votre choix)
   - **Description** : `Plateforme de vote pour les élections PR 2026 au Bénin`
   - **Visibility** : Choisissez **Public** ou **Private**
   - **NE COCHEZ PAS** "Initialize this repository with a README" (on a déjà un README)
   - **NE COCHEZ PAS** "Add .gitignore" (on en a déjà un)
   - **NE COCHEZ PAS** "Choose a license" (pour l'instant)
4. Cliquez sur **"Create repository"**

### Option B : Via GitHub CLI (si installé)

```bash
# Installer GitHub CLI si nécessaire
# macOS: brew install gh
# Linux: voir https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Authentifier
gh auth login

# Créer le dépôt
gh repo create pr-2026-bj --public --description "Plateforme de vote pour les élections PR 2026 au Bénin"
```

---

## 🔧 Étape 8 : Lier le dépôt local à GitHub

**Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub :**

```bash
# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/pr-2026-bj.git

# Vérifier que le remote a été ajouté
git remote -v
```

**Si vous utilisez SSH (recommandé pour plus de sécurité) :**

```bash
# Ajouter le remote avec SSH
git remote add origin git@github.com:VOTRE_USERNAME/pr-2026-bj.git

# Vérifier
git remote -v
```

**Pour configurer SSH avec GitHub :**
1. Générez une clé SSH : `ssh-keygen -t ed25519 -C "votre.email@example.com"`
2. Ajoutez la clé à votre agent : `ssh-add ~/.ssh/id_ed25519`
3. Copiez la clé publique : `cat ~/.ssh/id_ed25519.pub`
4. Ajoutez-la sur GitHub : Settings → SSH and GPG keys → New SSH key

---

## 🔧 Étape 9 : Renommer la branche principale (optionnel mais recommandé)

```bash
# Renommer la branche en 'main' (standard GitHub)
git branch -M main

# Ou garder 'master' si vous préférez
# git branch -M master
```

---

## 🔧 Étape 10 : Pousser le code vers GitHub

```bash
# Pousser le code vers GitHub
git push -u origin main

# Si vous avez utilisé 'master' :
# git push -u origin master
```

**Si vous êtes demandé de vous authentifier :**
- **HTTPS** : Utilisez un Personal Access Token (pas votre mot de passe)
  - Créez un token : GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
  - Donnez-lui les permissions `repo`
- **SSH** : Aucune authentification nécessaire si votre clé SSH est configurée

---

## 🔧 Étape 11 : Vérifier sur GitHub

1. Allez sur votre dépôt GitHub : `https://github.com/VOTRE_USERNAME/pr-2026-bj`
2. Vérifiez que tous les fichiers sont présents
3. Vérifiez que le README s'affiche correctement

---

## 🔄 Mettre à Jour le Projet Local (Git Pull)

Si le projet a été modifié sur GitHub (par vous ou d'autres collaborateurs), vous devez mettre à jour votre copie locale pour qu'elle soit exactement conforme au contenu GitHub.

### Étape 1 : Vérifier l'état actuel

```bash
# Vérifier l'état de votre dépôt local
git status

# Voir les commits qui sont sur GitHub mais pas localement
git fetch origin
git log HEAD..origin/main --oneline
```

### Étape 2 : Mettre à jour le projet local

**Si vous n'avez pas de modifications locales non commitées :**

```bash
# Récupérer les dernières modifications depuis GitHub
git pull origin main

# Ou simplement (si la branche est déjà configurée)
git pull
```

**Si vous avez des modifications locales non commitées :**

Vous avez deux options :

**Option A : Sauvegarder vos modifications temporairement (recommandé)**

```bash
# Sauvegarder vos modifications dans un stash
git stash

# Mettre à jour depuis GitHub
git pull origin main

# Récupérer vos modifications sauvegardées
git stash pop
```

**Option B : Commiter vos modifications d'abord**

```bash
# Ajouter vos modifications
git add .

# Créer un commit
git commit -m "Description de vos modifications locales"

# Mettre à jour depuis GitHub
git pull origin main

# Résoudre les conflits si nécessaire (voir section Dépannage)
```

### Étape 3 : Vérifier que tout est synchronisé

```bash
# Vérifier l'état
git status

# Voir les derniers commits
git log --oneline -5

# Vérifier que vous êtes à jour avec GitHub
git log HEAD..origin/main --oneline
# (Si rien ne s'affiche, vous êtes à jour)
```

### Résumé des commandes pour mettre à jour

```bash
# 1. Vérifier l'état
git status

# 2. Récupérer les informations depuis GitHub
git fetch origin

# 3. Voir ce qui va être mis à jour
git log HEAD..origin/main --oneline

# 4. Mettre à jour le projet local
git pull origin main

# 5. Vérifier que tout est synchronisé
git status
```

### Cas particulier : Forcer la synchronisation complète

**⚠️ ATTENTION : Cette commande supprime toutes vos modifications locales non commitées !**

Si vous voulez que votre projet local soit **exactement** identique à GitHub (en supprimant toutes modifications locales) :

```bash
# Récupérer les dernières modifications
git fetch origin

# Réinitialiser complètement votre branche locale
git reset --hard origin/main

# Nettoyer les fichiers non suivis (optionnel)
git clean -fd
```

**⚠️ Utilisez cette commande uniquement si vous êtes sûr de vouloir perdre toutes vos modifications locales !**

---

## 📝 Commandes Utiles pour la Suite

### Voir l'état des fichiers
```bash
git status
```

### Ajouter des fichiers modifiés
```bash
git add .
# ou pour un fichier spécifique
git add nom-du-fichier
```

### Créer un commit
```bash
git commit -m "Description des modifications"
```

### Pousser vers GitHub
```bash
git push
```

### Récupérer les dernières modifications
```bash
# Méthode simple (si pas de modifications locales)
git pull

# Méthode recommandée (vérifie d'abord ce qui va être mis à jour)
git fetch origin
git pull origin main

# Voir la section "Mettre à Jour le Projet Local (Git Pull)" ci-dessus pour plus de détails
```

### Voir l'historique des commits
```bash
git log --oneline
```

### Créer une nouvelle branche
```bash
git checkout -b nom-de-la-branche
```

### Changer de branche
```bash
git checkout nom-de-la-branche
```

### Fusionner une branche
```bash
git checkout main
git merge nom-de-la-branche
```

---

## 🔒 Sécurité - Fichiers à NE JAMAIS commiter

Assurez-vous que ces fichiers sont dans `.gitignore` :
- `.env` (contient les mots de passe et secrets)
- `.env.local`
- `node_modules/`
- `.next/`
- Fichiers de données sensibles

**Vérification :**
```bash
# Vérifier que .env n'est pas suivi
git check-ignore .env

# Si rien ne s'affiche, c'est bon. Si le fichier est suivi, retirez-le :
# git rm --cached .env
```

---

## 🎯 Résumé des Commandes Essentielles

```bash
# 1. Initialiser Git
git init

# 2. Ajouter les fichiers
git add .

# 3. Créer le premier commit
git commit -m "Initial commit: Plateforme de vote PR 2026 BJ"

# 4. Ajouter le remote GitHub (remplacez VOTRE_USERNAME)
git remote add origin https://github.com/VOTRE_USERNAME/pr-2026-bj.git

# 5. Renommer la branche
git branch -M main

# 6. Pousser vers GitHub
git push -u origin main
```

---

## 🐛 Dépannage

### Erreur : "remote origin already exists"
```bash
# Supprimer le remote existant
git remote remove origin

# Puis réessayer
git remote add origin https://github.com/VOTRE_USERNAME/pr-2026-bj.git
```

### Erreur : "failed to push some refs"
```bash
# Si GitHub a créé un README automatiquement, récupérez-le d'abord
git pull origin main --allow-unrelated-histories

# Puis poussez à nouveau
git push -u origin main
```

### Erreur d'authentification
- Pour HTTPS : Utilisez un Personal Access Token au lieu du mot de passe
- Pour SSH : Vérifiez que votre clé SSH est ajoutée à GitHub

---

## ✅ Checklist Finale

- [ ] Git est installé et configuré
- [ ] Le dépôt Git est initialisé localement
- [ ] Le fichier .gitignore est correct
- [ ] Tous les fichiers sont ajoutés (sauf ceux dans .gitignore)
- [ ] Le premier commit est créé
- [ ] Le dépôt GitHub est créé
- [ ] Le remote est configuré
- [ ] Le code est poussé vers GitHub
- [ ] Le dépôt est visible sur GitHub avec tous les fichiers

---

**🎉 Félicitations ! Votre projet est maintenant sur GitHub !**

