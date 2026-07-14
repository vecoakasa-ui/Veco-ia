-- ============================================
-- SQL Script: Mise à jour des tables Ventes & Terrains
-- Ajoute les colonnes manquantes (owner_id, profile_id)
-- ============================================

-- 1. Mettre à jour la table buyers
ALTER TABLE public.buyers 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS profile_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Mettre à jour la table sales
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Mettre à jour la table sale_installments
ALTER TABLE public.sale_installments 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Re-appliquer ou mettre à jour les politiques RLS si nécessaire
DROP POLICY IF EXISTS "Enable read access for all users" ON public.buyers;
CREATE POLICY "Enable read access for all users" ON public.buyers FOR SELECT USING (true);
