# Shadow Fitness System — Guide de déploiement

## Prérequis
- Compte Vercel (connecté à GitHub)
- Projet Neon créé ("Shadow Fitness System", PostgreSQL 17, eu-west-2)
- Neon connecté à Vercel (variables injectées automatiquement)

---

## 1. Variables d'environnement Vercel

### Neon Auth (Stack Auth) — Obligatoires
Aller sur https://app.stack-auth.com → Créer un projet → Copier :
```
NEXT_PUBLIC_STACK_PROJECT_ID=<uuid>
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_...
STACK_SECRET_SERVER_KEY=ssk_...
```

### Web Push VAPID — Générer les clés
```bash
npx web-push generate-vapid-keys
```
Puis ajouter dans Vercel :
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<clé publique>
VAPID_PRIVATE_KEY=<clé privée>
VAPID_SUBJECT=mailto:contact@shadow-fitness.app
```

### Sécurité Cron Jobs
```
CRON_SECRET=<random-string-32-chars>
```

### Admin (pour init DB)
```
ADMIN_SECRET=<random-string>
```

---

## 2. Déploiement initial

1. Push sur `main` → Vercel build automatiquement
2. Copier l'URL Vercel (ex: `shadow-fitness.vercel.app`)

---

## 3. Initialiser la base de données Neon

Après le premier déploiement :
```bash
curl -X POST https://[URL_VERCEL]/api/admin/init-db \
  -H "x-admin-secret: [ADMIN_SECRET]"
```

Cela crée toutes les tables + seed les recettes et jours de repos.

---

## 4. Configurer Strava OAuth

1. Aller sur https://www.strava.com/settings/api
2. Créer une application :
   - **Nom** : Shadow Fitness System
   - **URL du site** : `https://[URL_VERCEL]`
   - **URL de callback** : `https://[URL_VERCEL]/api/strava/callback`
3. Copier Client ID et Client Secret
4. Ajouter dans Vercel :
   ```
   STRAVA_CLIENT_ID=<id>
   STRAVA_CLIENT_SECRET=<secret>
   STRAVA_REDIRECT_URI=https://[URL_VERCEL]/api/strava/callback
   ```
5. Redéployer (ou `Redeploy` dans Vercel Dashboard)
6. Dans l'app → Profil → "Connecter Strava"

---

## 5. Configurer les Cron Jobs Vercel

Dans `vercel.json`, les crons sont déjà configurés. Pour les activer :
- S'assurer d'être sur un plan Vercel Pro (crons nécessitent Pro)
- Les crons s'authentifient avec `Authorization: Bearer [CRON_SECRET]`

**Crons configurés :**
| Path | Schedule | Description |
|------|----------|-------------|
| /api/cron/rappel-quotidien | 0 * * * * | Rappel séance à l'heure configurée |
| /api/cron/quete-urgente | 0 17,18 * * 1-5 | Quête urgente semaine (18-20h Paris) |
| /api/cron/quete-urgente-weekend | 0 6-18 * * 0,6 | Quête urgente weekend (8-20h Paris) |
| /api/cron/check-seance-manquee | 0 19 * * * | Alerte séance non faite à 21h Paris |
| /api/cron/rappels-repas | 0 5,10,16,18 * * * | Rappels repas 7h/12h/18h/20h Paris |
| /api/cron/rappels-eau | 0 6,8,12,14,16,18,20 * * * | Rappels eau 8h-22h Paris |
| /api/cron/strava-sync | 0 * * * * | Sync Strava toutes les heures |
| /api/cron/check-punition-hebdo | 0 19 * * 0 | Punition hebdo dimanche 21h Paris |

---

## 6. PWA — Installation iPhone

1. Ouvrir l'URL Vercel dans **Safari** (pas Chrome)
2. Appuyer sur le bouton **Partager** ↑
3. Sélectionner **"Sur l'écran d'accueil"**
4. Appuyer **Ajouter**

L'icône Shadow Fitness apparaît sur l'écran d'accueil.

---

## 7. Vérification post-déploiement

- [ ] Auth fonctionne (créer un compte)
- [ ] Profil créé dans Neon
- [ ] Dashboard affiche les données
- [ ] Séance génére les exercices au bon niveau
- [ ] Nutrition affiche les recettes
- [ ] Strava connecté (si configuré)
- [ ] Push notifications testées
- [ ] PWA installable sur iPhone 11

---

## Architecture

```
app/
├── dashboard/     → Dashboard principal
├── seance/        → Séance du jour
├── nutrition/     → Plan alimentaire
├── progression/   → Stats et graphiques
├── profil/        → Profil & paramètres
├── onboarding/    → Inscription PWA
└── api/
    ├── profile/   → CRUD profil chasseur
    ├── session/   → Logs séances
    ├── nutrition/ → Logs repas & eau
    ├── push/      → Subscriptions push
    ├── strava/    → OAuth & sync
    ├── cron/      → Vercel Cron Jobs
    └── admin/     → Init DB

lib/
├── db.ts          → Connexion Neon PostgreSQL
├── stack.ts       → Neon Auth (Stack Auth) server
├── stack-client.ts → Stack Auth client
├── grades.ts      → Système XP & grades
├── progression.ts → Niveaux exercices
├── push.ts        → Web Push VAPID
├── strava.ts      → API Strava OAuth
└── utils.ts       → Timezone Paris, formats
```

---

## Dépannage

**Build échoue sur Vercel** : Vérifier que toutes les variables d'env sont définies.

**Strava ne sync pas** : Vérifier `STRAVA_REDIRECT_URI` correspond exactement à l'URL de callback configurée sur Strava.

**Push ne fonctionnent pas** : Vérifier clés VAPID, tester sur appareil réel (les push ne fonctionnent pas en incognito).

**DB vide** : Relancer `curl /api/admin/init-db` avec le bon `ADMIN_SECRET`.
