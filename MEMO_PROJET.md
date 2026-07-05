# Mémo du Projet : Fonctionnalités & Mises à jour 🚀

Ce document sert de rappel (mémo) pour toutes les fonctionnalités récentes, les corrections de bugs et les structures mises en place dans le projet **Vision Immo 2.0**.

---

## 1. Système de Demandes de Location (Inquiries) 📝
Un système complet permettant aux locataires potentiels de candidater pour un bien, et aux propriétaires de gérer ces candidatures.

- **Côté Locataire (`/locataire/[id]/explorer`) :**
  - Parcours des biens vacants sous forme de grille ou de carte.
  - Formulaire de demande (avec gestion des erreurs moderne, remplaçant les anciennes alertes disgracieuses).
- **Côté Propriétaire (`/demandes`) :**
  - Ajout du bouton **"Demandes"** dans le menu de navigation (Sidebar).
  - Tableau de bord listant toutes les demandes en attente, approuvées ou rejetées.
  - **Action d'Approbation :** L'approbation d'une demande génère *automatiquement* un contrat de bail et assigne le bien au locataire.
- **Base de données :** Création de la table `inquiries` dans Supabase avec les politiques de sécurité (RLS) appropriées.

## 2. Fonctionnalité "Aperçu Client" (View as Tenant) 👀
Permet au propriétaire de voir l'interface exacte de son locataire pour l'accompagner.

- **Sécurisation des Accès :**
  - Autorisation pour les rôles `owner` et `admin` d'accéder aux routes `/locataire/[id]`.
- **Correction des Données :**
  - Résolution d'un bug où l'espace affichait les propres données (inexistantes) du propriétaire. Désormais, le système charge correctement les données du locataire cliqué en utilisant l'ID de l'URL.
  - Vérification de sécurité pour empêcher un propriétaire de voir l'espace d'un locataire qui ne lui appartient pas.

## 3. Bannière d'Annonce Globale (Maintenance) 🚧
Un outil de communication stratégique pour informer les utilisateurs.

- **Composant `AnnouncementBanner` :**
  - Barre rouge professionnelle fixée tout en haut de l'écran pour toutes les pages (intégrée dans `app/layout.tsx`).
  - Fonctionnement par bascule : il suffit de changer la variable `SHOW_BANNER` (true/false) dans `components/AnnouncementBanner.tsx` pour l'activer ou la désactiver lors des déploiements ou maintenances.

## 4. Corrections Techniques (Bug Fixes) 🔧
- **TypeScript & Build Vercel :** 
  - Résolution de plusieurs erreurs bloquantes lors du build (`npm run build`) qui empêchaient le déploiement sur Vercel (erreurs liées au typage `Profile` et `Tenant`).
- **UI/UX :** 
  - Ajout des animations de chargement (spinners) sur les boutons de soumission pour indiquer aux utilisateurs qu'une action est en cours.
  - Suppression des `window.alert()` au profit de messages d'erreur intégrés et esthétiques (encadrés rouges/verts).

---
*Document généré le 5 Juillet 2026 pour le suivi du développement de l'application.*
