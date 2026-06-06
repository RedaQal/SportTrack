# SportTrack — Plateforme de Suivi Sportif & Santé

Application web full-stack permettant aux utilisateurs de suivre leurs activités sportives, surveiller leur état de santé et atteindre leurs objectifs personnels grâce à des statistiques et des tableaux de bord interactifs.

## Tech Stack

- **Frontend** — Next.js 16, TypeScript, Redux Toolkit, Recharts, React Hook Form + Zod, Tailwind CSS
- **Backend** — Next.js API Route Handlers
- **ORM** — Prisma 7
- **Base de données** — MySQL (XAMPP)
- **Auth** — JWT (jsonwebtoken + bcryptjs)

## Prérequis

- Node.js 18+
- XAMPP (MySQL)
- npm

## Installation

### 1. Cloner le projet

```bash
git clone 
cd sport-tracker
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Générer les secrets JWT :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copier la valeur générée dans `.env` pour `JWT_SECRET` et `NEXTAUTH_SECRET`.

### 4. Démarrer MySQL

Ouvrir XAMPP et démarrer le service **MySQL**.

Créer la base de données dans phpMyAdmin (`http://localhost/phpmyadmin`) :

```sql
CREATE DATABASE sporttracker;
```

### 5. Initialiser la base de données

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 6. Démarrer le projet

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le serveur de production |
| `npx prisma db push` | Synchronise le schéma avec la base de données |
| `npx prisma db seed` | Peuple la base de données avec les exercices |
| `npx prisma studio --url "mysql://root:@localhost:3306/sporttracker"` | Interface visuelle de la base de données |

## Structure du projet

```
sport-tracker/
├── app/
│   ├── api/
│   │   ├── auth/                    # Register, Login, Me
│   │   ├── users/[id]/              # Profil utilisateur
│   │   ├── sessions/                # Séances d'entraînement
│   │   ├── goals/                   # Objectifs
│   │   ├── exercises/               # Exercices
│   │   └── stats/                   # Statistiques dashboard
│   ├── dashboard/
│   ├── workouts/
│   ├── history/
│   ├── goals/
│   └── profile/
├── components/
│   ├── layout/                      # Sidebar, Header, AppShell
│   ├── pages/                       # Dashboard, Workouts, History, Goals, Profile
│   └── ui/                          # Notifications
├── lib/
│   ├── slices/                      # Redux slices (auth, workout, ui)
│   ├── store/                       # Redux store
│   ├── prisma.ts                    # Prisma client singleton
│   └── auth.ts                      # JWT helpers
├── prisma/
│   ├── schema.prisma                # Modèles de données
│   └── seed.ts                      # Données initiales
├── types/                           # Types TypeScript
├── generated/prisma/                # Client Prisma généré
├── .env.example                     # Template variables d'environnement
└── middleware.ts                    # Protection des routes
```
## Fonctionnalités

- **Authentification** — Inscription, connexion sécurisée avec JWT
- **Dashboard** — Statistiques hebdomadaires, graphiques interactifs
- **Entraînements** — Catalogue d'exercices, enregistrement de séances
- **Historique** — Filtrage par période et catégorie, visualisation des tendances
- **Objectifs** — Suivi de progression, badges de récompenses
- **Profil** — Gestion des informations personnelles, calcul IMC

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion MySQL |
| `JWT_SECRET` | Clé secrète pour les tokens JWT |
| `NEXTAUTH_SECRET` | Clé secrète NextAuth |