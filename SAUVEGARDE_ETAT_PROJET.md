# Sauvegarde de l'État du Projet - Vision Immo 2.0

## Description Générale
Application de gestion immobilière développée avec **Next.js (App Router)** et **Supabase**. L'application permet de gérer des biens immobiliers (appartements, villas, immeubles, cours communes, résidences), des locataires, des paiements, des quittances, et bientôt des ventes de terrains.

## Ce qui a été accompli (Historique)
1. **Architecture de base :** Dashboard complet avec gestion des locataires, paiements, quittances, cautions.
2. **Gestion des "Super-structures" (Immeubles, Cours Communes, Résidences) :**
   - Création de la logique de génération automatique d'unités (appartements/maisons) rattachées à une super-structure (système de `parent_id`).
   - Masquage des super-structures lors de l'assignation des locataires pour forcer l'assignation aux unités enfants.
   - Les badges visuels permettent de repérer facilement l'immeuble parent d'un appartement.
3. **Débogage du Dashboard Administrateur (Travail Récent) :**
   - Identification et résolution du problème des fausses données ("6 biens, 1 propriétaire") qui s'affichaient pour le Super Administrateur après une suppression des données.
   - Raison : Les politiques RLS (Row Level Security) de Supabase bloquaient la lecture des tables `properties` et `landlords` pour l'Admin, forçant l'application à utiliser des données locales de démonstration (`DEFAULT_PROPERTIES`).
   - Solution appliquée : Création du script `fix_admin_rls.sql` pour accorder au rôle `admin` et à l'email principal (`vecoakasa@gmail.com`) le droit de contourner ces restrictions.

## Ce qui est EN COURS (Prochaines étapes)
Nous sommes en train de développer le **Module "Ventes & Terrains"**. 
- Le but est de permettre à l'agent immobilier de gérer la vente de terrains lotis avec **paiement échelonné**, de manière 100% interne et sécurisée (pas de lien public).
- L'agent crée le lotissement, enregistre lui-même l'acheteur, renseigne l'avance payée, et le système génère l'échéancier et le dashboard de l'acheteur.

**Actions bloquantes / en attente :**
1. **Script Ventes & Terrains** : Le script SQL pour créer les tables `buyers`, `sales` et `sale_installments` a été corrigé (utilisation du type `TEXT` au lieu de `UUID` pour la compatibilité avec les IDs générés par l'application). Ce script doit être exécuté dans Supabase.
2. **Développement de l'interface** :
   - Ajouter un onglet/menu pour les Ventes dans `app/(dashboard)/`.
   - Mettre à jour `lib/store.ts` et `lib/types.ts` pour gérer ces nouvelles tables de ventes.
   - Créer le dashboard spécifique pour les Acheteurs dans un nouveau dossier `app/(acheteur)`.

*Document généré automatiquement pour préserver l'historique de développement et servir de point de repère.*
