# État du Projet - Veco IA (Property Management Dashboard)

## Description
Ceci est une application de gestion immobilière (Property Management) développée avec **Next.js (App Router)**. L'application permet de gérer des biens immobiliers, des locataires, des contrats de location, des paiements, des quittances, des incidents et des abonnements.

## Technologies Utilisées
- **Framework :** Next.js (v16.2.9) - App Router
- **Langage :** TypeScript / React (v19.2.7)
- **Base de données / Backend :** Supabase (`@supabase/supabase-js`)
- **Paiements :** PayDunya (intégration via `lib/paydunya.ts`)
- **Cartographie :** Google Maps (`@react-google-maps/api`)
- **Icônes :** Lucide React
- **Graphiques :** Recharts
- **Style :** CSS natif (`globals.css`) et modules CSS

## Structure du Projet (Workspace)

```
/
├── app/                      # Dossier principal de l'application (Next.js App Router)
│   ├── (auth)/               # Routes liées à l'authentification
│   ├── (dashboard)/          # Interface principale (Tableau de bord)
│   │   ├── abonnement/       # Gestion des abonnements
│   │   ├── biens/            # Gestion des propriétés/biens immobiliers
│   │   ├── contrats/         # Gestion des contrats de bail
│   │   ├── dashboard/        # Vue d'ensemble du tableau de bord
│   │   ├── incidents/        # Suivi des incidents (tickets)
│   │   ├── locataires/       # Gestion des locataires
│   │   ├── paiements/        # Suivi des paiements
│   │   └── quittances/       # Génération et gestion des quittances de loyer
│   │   └── layout.tsx        # Layout du tableau de bord (Sidebar, Header, etc.)
│   ├── api/                  # Routes d'API (Backend Next.js)
│   ├── pay/                  # Routes liées au processus de paiement
│   ├── globals.css           # Styles globaux
│   └── page.tsx              # Page d'accueil (Landing page)
├── components/               # Composants React réutilisables
│   ├── MapModule.tsx         # Composant d'intégration Google Maps
│   └── MapModuleWrapper.tsx
├── lib/                      # Utilitaires et configuration
│   ├── paydunya.ts           # Logique et API PayDunya
│   ├── store.ts              # Gestion de l'état (Zustand ou Context ?)
│   ├── supabase.ts           # Client Supabase
│   ├── types.ts              # Définitions des types TypeScript
│   └── utils.ts              # Fonctions utilitaires
├── public/                   # Fichiers statiques (images, etc.)
├── package.json              # Dépendances et scripts NPM
├── supabase_schema.sql       # Schéma de la base de données Supabase
└── .env.local                # Variables d'environnement (Supabase URL, clés API, etc.)
```

## État Actuel (Ce qui a été fait)
- L'architecture de base Next.js App Router est en place.
- La structure du tableau de bord avec ses différentes sections (`biens`, `locataires`, `contrats`, `paiements`, etc.) a été initialisée.
- La configuration de base de données est définie via Supabase (avec le schéma `supabase_schema.sql`).
- Intégration de l'authentification et des composants d'interface utilisateur (avec des cartes et des graphiques via `recharts`).
- Modules spécifiques mis en place : Intégration de cartes (`MapModule.tsx`) et paiements (`paydunya.ts`).
- La page d'accueil principale est très étoffée (`app/page.tsx` fait ~54ko).
- Gestion de l'état centralisé ou des données initialisée dans `lib/store.ts`.

## Où nous en sommes
- Le squelette et les fondations techniques de l'application sont solides et structurés.
- Les principales routes du dashboard existent.
- Il reste potentiellement à finaliser ou affiner la logique métier, la liaison réelle avec la base de données Supabase pour chaque page du dashboard, ou bien améliorer le design et l'expérience utilisateur globale.
- L'environnement de développement est prêt à être étendu pour chaque module (abonnement, incidents, etc.).
