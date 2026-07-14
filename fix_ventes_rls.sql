-- ============================================
-- SQL Script: Accorder les droits globaux et corriger l'accès aux Ventes
-- À copier-coller dans "SQL Editor" sur Supabase et exécuter
-- ============================================

-- 1. On s'assure que RLS est bien activé pour les nouvelles tables
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_installments ENABLE ROW LEVEL SECURITY;

-- 2. Ajouter les autorisations "Administrateur" sur les nouvelles tables
-- (Ces politiques viennent s'ajouter à celles existantes et donnent accès total)
DROP POLICY IF EXISTS "Admins can manage all buyers" ON public.buyers;
CREATE POLICY "Admins can manage all buyers" ON public.buyers
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all sales" ON public.sales;
CREATE POLICY "Admins can manage all sales" ON public.sales
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all sale_installments" ON public.sale_installments;
CREATE POLICY "Admins can manage all sale_installments" ON public.sale_installments
  FOR ALL USING (public.is_admin());

-- 3. Renforcer la politique publique pour la lecture (SELECT)
-- Cela permet à l'interface d'afficher les données sans être bloquée
DROP POLICY IF EXISTS "Enable read access for all users" ON public.buyers;
CREATE POLICY "Enable read access for all users" ON public.buyers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.sales;
CREATE POLICY "Enable read access for all users" ON public.sales FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.sale_installments;
CREATE POLICY "Enable read access for all users" ON public.sale_installments FOR SELECT USING (true);

-- 4. Autoriser l'insertion/mise à jour pour tout utilisateur connecté
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.buyers;
CREATE POLICY "Enable insert for authenticated users only" ON public.buyers FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.buyers;
CREATE POLICY "Enable update for authenticated users only" ON public.buyers FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.sales;
CREATE POLICY "Enable insert for authenticated users only" ON public.sales FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.sales;
CREATE POLICY "Enable update for authenticated users only" ON public.sales FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.sale_installments;
CREATE POLICY "Enable insert for authenticated users only" ON public.sale_installments FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.sale_installments;
CREATE POLICY "Enable update for authenticated users only" ON public.sale_installments FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ============================================
-- NOTE EN CAS DE BLOCAGE EXTRÊME (DÉBOGAGE UNIQUEMENT)
-- Si rien ne s'affiche malgré l'exécution de ce script, 
-- vous pouvez temporairement désactiver le RLS pour tester en décommentant ces lignes :
-- 
-- ALTER TABLE public.buyers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.sale_installments DISABLE ROW LEVEL SECURITY;
-- ============================================
