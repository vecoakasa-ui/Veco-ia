# État du Projet - Vision Immo 2.0 (Property Management Dashboard)

## Description
Application de gestion immobilière développée avec **Next.js (App Router)**. L'application permet de gérer des biens immobiliers (appartements, villas, immeubles, cours communes, résidences), des locataires, des paiements, des quittances, et bientôt des ventes de terrains.

## Technologies
- **Framework :** Next.js - App Router (React)
- **Base de données / Backend :** Supabase (PostgreSQL)
- **Cartographie :** Google Maps
- **Style :** CSS natif (`globals.css`) et modules CSS

## Ce qui a été fait jusqu'à présent
1. **Architecture de base :** Dashboard complet avec gestion des locataires, paiements, quittances, cautions.
2. **Gestion des "Super-structures" (Immeubles, Cours Communes, Résidences) :**
   - Création de la logique de génération automatique d'unités (appartements/maisons) rattachées à une super-structure (système de `parent_id`).
   - Masquage des super-structures lors de l'assignation des locataires pour forcer l'assignation aux unités enfants.
   - Les badges visuels permettent de repérer facilement l'immeuble parent d'un appartement.

## Ce qui est EN COURS (Où nous nous sommes arrêtés)
Nous sommes en train de développer le **Module "Ventes & Terrains"**. 
- Le but est de permettre à l'agent immobilier de gérer la vente de terrains lotis avec **paiement échelonné**, de manière 100% interne et sécurisée (pas de lien public).
- L'agent crée le lotissement, enregistre lui-même l'acheteur, renseigne l'avance payée, et le système génère l'échéancier et le dashboard de l'acheteur.

**Action bloquante actuelle :**
L'utilisateur devait exécuter le code SQL dans Supabase pour créer les tables `buyers`, `sales` et `sale_installments`. 
La première tentative de script SQL a échoué car j'avais utilisé le type `UUID` pour les clés étrangères (`property_id`), alors que la base de données utilise le type `TEXT` pour les IDs générés manuellement par l'application. 
-> J'ai généré le NOUVEAU script SQL corrigé (utilisant `TEXT`) que l'utilisateur doit exécuter.

## Prochaines étapes à faire par le prochain Assistant
1. Vérifier avec l'utilisateur que le nouveau script SQL (avec `TEXT` au lieu de `UUID`) a bien été exécuté avec succès sur Supabase.
2. Coder l'interface du Module "Ventes & Terrains" dans `app/(dashboard)/` :
   - Ajouter un onglet/menu pour les Ventes.
   - Créer la logique côté Frontend (lib/store.ts, lib/types.ts) pour requêter ces nouvelles tables.
   - Créer le dashboard spécifique pour les Acheteurs (`app/(acheteur)`).
