-- ============================================
-- SQL Script: Mettre à jour la table buyers
-- ============================================

ALTER TABLE public.buyers 
ADD COLUMN IF NOT EXISTS owner_id TEXT,
ADD COLUMN IF NOT EXISTS profile_id TEXT,
ADD COLUMN IF NOT EXISTS id_card_number TEXT;

ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS owner_id TEXT;

ALTER TABLE public.sale_installments
ADD COLUMN IF NOT EXISTS owner_id TEXT;
