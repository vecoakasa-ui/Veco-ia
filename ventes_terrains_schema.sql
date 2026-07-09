-- ============================================
-- SQL Script: Création des tables Ventes & Terrains
-- Utilise des TEXT pour les IDs pour s'aligner avec le reste du projet
-- ============================================

-- 1. Table des Acheteurs (Buyers)
CREATE TABLE IF NOT EXISTS public.buyers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des Ventes (Sales)
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id TEXT REFERENCES public.buyers(id) ON DELETE CASCADE,
  total_price NUMERIC NOT NULL,
  advance_payment NUMERIC NOT NULL DEFAULT 0,
  remaining_balance NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des Échéances de Vente (Sale Installments)
CREATE TABLE IF NOT EXISTS public.sale_installments (
  id TEXT PRIMARY KEY,
  sale_id TEXT REFERENCES public.sales(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS (Row Level Security) - A ajuster selon les besoins
-- ============================================
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_installments ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture/écriture (On pourra restreindre plus tard si nécessaire)
CREATE POLICY "Enable read access for all users" ON public.buyers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.sale_installments FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.buyers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users only" ON public.sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users only" ON public.sale_installments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.buyers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.sales FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.sale_installments FOR UPDATE USING (auth.role() = 'authenticated');
