# Hébergement sur Vercel (plan Hobby)

Ce document décrit le déploiement de **PR 2026** sur Vercel en conservant un comportement proche de **Render** (Next.js + PostgreSQL + SSE).

## Prérequis

- Compte [Vercel](https://vercel.com) (gratuit).
- Dépôt Git (souvent GitHub) connecté à Vercel.
- Une base **PostgreSQL** accessible depuis Internet (Vercel n’embarque pas Postgres). Exemples gratuits : [Neon](https://neon.tech), [Supabase](https://supabase.com).
- Node.js 20+ en local pour les scripts.

## Variables d’environnement (obligatoire)

Dans le projet Vercel : **Settings → Environment Variables**.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL (souvent avec `?sslmode=require`). Même format que sur Render. |

Optionnel :

| Variable | Description |
|----------|-------------|
| `PG_POOL_MAX` | Taille max du pool `pg` (défaut **10** sur Vercel, **20** ailleurs). Augmentez avec prudence si la base limite les connexions. |
| `RATE_LIMIT_MAX_REQUESTS` / `RATE_LIMIT_WINDOW_MS` | Identique au README (rate limiting). |
| `VERCEL_PREVIEW_RUN_MIGRATE` | Mettre à `1` sur l’environnement **Preview** si vous voulez exécuter les migrations SQL au build des previews (voir ci-dessous). |

**Important :** pour Preview, utilisez de préférence une **base dédiée** (ou un schéma isolé) afin de ne pas appliquer des migrations de test sur la base de production.

## Comportement du build sur Vercel

Le fichier `vercel.json` définit :

```text
buildCommand → node scripts/vercel-build.js
```

Ce script :

1. Exécute **`npm run migrate`** uniquement si :
   - **Production Vercel** (`VERCEL_ENV=production`) et `DATABASE_URL` est définie, ou
   - **Preview** avec `VERCEL_PREVIEW_RUN_MIGRATE=1` et `DATABASE_URL` est définie, ou
   - **En local** (sans `VERCEL=1`) lorsque vous lancez `npm run build:vercel` avec `DATABASE_URL` — pratique pour tester le pipeline.
2. Lance ensuite **`next build`**.

Les déploiements **Preview** par défaut **ne migrent pas** la base (évite d’exécuter des migrations contre la prod par erreur).

## Différences vs Render (à connaître)

- **Serverless** : chaque requête API peut s’exécuter dans un conteneur éphémère. Le pool PostgreSQL est dimensionné automatiquement plus petit sur Vercel (`PG_POOL_MAX` surcharge ce défaut).
- **SSE** (`/api/dashboard/stream`) : la connexion est limitée dans le temps (jusqu’à **60 s** sur le plan Hobby). Le navigateur **reconnecte** en général tout seul via `EventSource` après une coupure.
- **Sortie `standalone`** : désactivée automatiquement quand `VERCEL=1` au build (recommandé pour Vercel). Docker / Render local continuent d’utiliser `output: 'standalone'` hors Vercel.

## Déploiement via le tableau de bord Vercel

1. **Add New → Project** → importer le dépôt.
2. Laisser **Framework Preset** sur Next.js (détection automatique).
3. Le **Build Command** est lu depuis `vercel.json` (`vercel-build.js`).
4. Ajouter `DATABASE_URL` (Production au minimum).
5. **Deploy**.

Après le premier déploiement production, vérifiez les logs de build : les migrations doivent se terminer sans erreur bloquante.

## Scripts en ligne de commande

### Rendre le script shell exécutable (une fois)

```bash
chmod +x scripts/vercel-deploy.sh
```

### Lier le dossier local au projet Vercel

```bash
npm run vercel:link
```

### Récupérer les variables Vercel en local (fichier gitignored recommandé)

```bash
npm run vercel:env-pull
```

Puis chargez `.env.vercel.local` si vous testez en local (Vercel CLI le fait pour `vercel dev`).

### Déploiement automatisé

- **Production** (équivalent `vercel deploy --prod`) :

```bash
./scripts/vercel-deploy.sh prod
```

ou :

```bash
npm run vercel:deploy
```

- **Preview** :

```bash
./scripts/vercel-deploy.sh preview
```

ou :

```bash
npm run vercel:deploy:preview
```

Le script `vercel-deploy.sh` appelle `npx vercel@latest` : aucune dépendance `vercel` permanente dans `package.json`.

### Tester le même build que sur Vercel (local / CI)

```bash
npm run build:vercel
```

Avec `DATABASE_URL` exportée, les migrations s’exécutent avant `next build` (comme en prod Render via `start-render.js`, mais au moment du build).

## Seed des données

Comme sur Render, le **seed** n’est pas exécuté automatiquement au build (trop dépendant du contexte). Après la première mise en prod :

```bash
DATABASE_URL="postgresql://..." npm run seed
```

(en local, en pointant vers la même base que Vercel).

## Dépannage

- **Build : `DATABASE_URL` manquante** : ajoutez la variable pour l’environnement qui build (Production / Preview).
- **Trop de connexions Postgres** : baissez `PG_POOL_MAX` ou utilisez l’URL **pooler** fournie par Neon (souvent `-pooler` dans le host).
- **SSE qui se coupe** : attendu au-delà de la limite ; le client se reconnecte. Pour des sessions infinies sans coupure, il faudrait un worker longue durée (hors scope du plan Hobby classique).

## Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `vercel.json` | `buildCommand` personnalisé |
| `scripts/vercel-build.js` | Migrations conditionnelles + `next build` |
| `scripts/vercel-deploy.sh` | Déploiement CLI prod / preview |
| `next.config.js` | `standalone` seulement hors Vercel |
| `lib/db.ts` | Pool adapté serverless |
| `lib/serverless-route.ts` | `maxDuration = 60` pour les routes API |
