# ⚡ SupaHub

> **La plateforme tout-en-un pour monitorer, maintenir éveillés et sauvegarder l'ensemble de vos projets Supabase.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare%20R2-F38020?style=flat&logo=cloudflare)](https://developers.cloudflare.com/r2/)
[![Chariow](https://img.shields.io/badge/Payments-Chariow-purple?style=flat)](https://chariow.com)

---

## 🎯 Problématique

Sur le plan gratuit de Supabase, les bases de données sont automatiquement **mises en pause après 7 jours d'inactivité**, provoquant des coupures applicatives et des risques de pertes de données. De plus, les développeurs jonglent souvent avec plusieurs organisations et projets sans vue unifiée.

**SupaHub résout ces problèmes en automatisant le maintien en activité (Keep-Alive), les sauvegardes de schémas et la gestion centralisée multi-organisations.**

---

## ✨ Fonctionnalités Clés

- 🔄 **Keep-Alive Automatique** : Ping régulier et intelligent programmé par Vercel Cron pour empêcher l'hibernation de vos bases Supabase gratuites.
- 🏢 **Multi-Organisations & Liaison PAT** : Connectez vos organisations Supabase via *Personal Access Token (PAT)* ou par ajout manuel pour une synchronisation instantanée.
- 💾 **Sauvegardes & Snapshots de Schéma** : Génération et export en 1 clic de la structure DDL de vos tables, stockées de manière chiffrée sur **Cloudflare R2**.
- 📊 **Monitoring & Métriques en Temps Réel** : Suivi de la santé, du statut d'activité, de la taille des données et des connexions actives.
- 💳 **Passage au Plan PRO via Chariow** : Système de monétisation intégré avec checkout sécurisé Chariow et déblocage instantané via Webhook cryptographique (HMAC-SHA256).
- 🔐 **Sécurité & Chiffrement AES-256** : Chiffrement des tokens sensibles et clés d'accès en base de données avec clé secrète dédiée.

---

## 🛠️ Stack Technique

- **Frontend & Fullstack** : [Next.js 15 (App Router)](https://nextjs.org/), React 19, TypeScript
- **Styling & UI** : Tailwind CSS, Radix UI, Lucide Icons, Framer Motion
- **Base de données & Authentification** : [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security + OAuth / Magic Link)
- **Stockage Objets** : [Cloudflare R2](https://developers.cloudflare.com/r2/) (Sauvegardes & Snapshots)
- **Tâches programmées** : Vercel Cron (`/api/cron/keep-alive`)
- **Paiements & Licences** : [Chariow API](https://chariow.dev) & Webhooks Pulse

---

## 🚀 Démarrage Rapide

### 1. Cloner le repository

```bash
git clone https://github.com/Dxne-Dev/SupaHub.git
cd SupaHub
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copiez le fichier d'exemple et renseignez vos clés :

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase SupaHub |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète `service_role` (actions serveurs / webhooks) |
| `ENCRYPTION_KEY` | Clé secrète hexadécimale de 32 octets pour le chiffrement des tokens |
| `CLOUDFLARE_R2_*` | Identifiants Cloudflare R2 pour le stockage des sauvegardes |
| `CRON_SECRET` | Jeton secret pour sécuriser l'endpoint Vercel Cron |
| `CHARIOW_API_KEY` | Clé API Chariow (`sk_live_...`) |
| `CHARIOW_PRODUCT_ID` | ID du produit SupaHub PRO sur Chariow (`prd_...`) |
| `CHARIOW_PULSE_SECRET` | Secret de signature Webhook Chariow (`whsec_...`) |
| `NEXT_PUBLIC_SITE_URL` | URL de base de votre application (ex: `https://supahub.app`) |

### 4. Appliquer les migrations Supabase

Exécutez les fichiers SQL suivants dans l'éditeur SQL de votre projet Supabase :
1. `supabase/schema.sql` (schéma initial)
2. `supabase/migrations/v1_1_add_missing_columns.sql` (colonnes PRO & monitoring)

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

---

## 📦 Structure du Projet

```text
├── public/                 # Assets statiques et médias
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── actions.ts      # Server Actions (Chariow checkout, Supabase sync)
│   │   ├── api/
│   │   │   ├── cron/       # Keep-alive Vercel Cron
│   │   │   └── webhooks/   # Webhook Chariow Pulse (HMAC verified)
│   │   ├── auth/           # Routes OAuth & session callback
│   │   ├── dashboard/      # Vues Projets, Sauvegardes, Paramètres
│   │   └── login/          # Page d'authentification
│   ├── components/         # Composants UI, modales et visualisations
│   └── lib/                # Moteurs de chiffrement, Supabase client/admin, API helpers
├── supabase/
│   ├── schema.sql          # Schéma DDL principal Supabase
│   └── migrations/         # Scripts de migrations incrementales
└── vercel.json             # Configuration Vercel Cron jobs
```

---

## 🔒 Sécurité

- Toutes les requêtes sensibles sont exécutées côté serveur via **Next.js Server Actions**.
- Les clés API et jetons PAT des utilisateurs sont chiffrés avec **AES-256-GCM** avant d'être persistés en base.
- Les webhooks Chariow sont vérifiés cryptographiquement via signature **HMAC-SHA256** sur le corps de requête brut (`request.text()`).
- Row Level Security (RLS) actif sur toutes les tables utilisateurs.

---

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

---

Développé avec ❤️ par **[Dxne-Dev](https://github.com/Dxne-Dev)**.
