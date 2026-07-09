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

## Ce qui a été fait jusqu'à présent (Mise à jour)
1. **Architecture de base :** Dashboard complet avec gestion des locataires, paiements, quittances, cautions.
2. **Gestion des "Super-structures" (Immeubles, Cours Communes, Résidences) :**
   - Création de la logique de génération automatique d'unités (appartements/maisons) rattachées à une super-structure.
3. **Module "Ventes & Terrains" (NOUVEAU) :**
   - Création des tables SQL (`buyers`, `sales`, `sale_installments`) sur Supabase.
   - Création du dashboard des ventes et de la liste des acheteurs dans l'espace Propriétaire/Agent (`/ventes/acheteurs`).
   - Implémentation du formulaire d'ajout d'une nouvelle vente (Assigner un terrain/lot).
   - Création du Dashboard détaillé pour chaque acheteur (`/ventes/acheteurs/[id]`) avec :
     - Bilan financier (Total payé, Reste à payer, Progression).
     - Graphique circulaire (PieChart) de l'évolution des paiements.
     - Échéancier détaillé.
     - Modale détaillée pour visualiser le mode de paiement des échéances payées.
     - Bouton "Encaisser" pour enregistrer un nouveau paiement sur une échéance.

## Ce qui est EN COURS / Prochaines étapes
- L'interface d'affichage du détail de paiement pour une échéance est finalisée.
- Prochaine étape : Permettre à l'acheteur lui-même de se connecter et d'accéder à son propre Dashboard (L'espace `/dashboard` ou `/(acheteur)`) pour suivre ses paiements de manière autonome, si ce n'est pas encore complètement déployé.
- Gérer la correction d'éventuels bugs UI ou de type strict TypeScript avant le déploiement sur Vercel.
