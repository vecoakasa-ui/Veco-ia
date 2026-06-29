-- ============================================
-- SQL Script: Accorder les droits globaux aux Administrateurs (Super Admins)
-- À copier-coller dans "SQL Editor" sur Supabase et exécuter
-- ============================================

-- 1. Créer une fonction sécurisée pour vérifier si l'utilisateur est un Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_email TEXT;
BEGIN
  -- Cette requête s'exécute en tant que superutilisateur (grâce à SECURITY DEFINER)
  -- Elle ne déclenche donc pas de boucle infinie avec le RLS.
  SELECT role, email INTO user_role, user_email FROM public.profiles WHERE id = auth.uid()::text LIMIT 1;
  
  -- L'accès est accordé si le rôle est 'admin' OU si l'email est le compte principal vecoakasa
  RETURN COALESCE(user_role = 'admin', FALSE) OR COALESCE(user_email = 'vecoakasa@gmail.com', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ajouter les autorisations "Administrateur" sur toutes les tables
-- (Ces politiques viennent s'ajouter à celles existantes)

-- Profils
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (public.is_admin());

-- Bailleurs / Propriétaires
DROP POLICY IF EXISTS "Admins can manage all landlords" ON landlords;
CREATE POLICY "Admins can manage all landlords" ON landlords
  FOR ALL USING (public.is_admin());

-- Biens
DROP POLICY IF EXISTS "Admins can manage all properties" ON properties;
CREATE POLICY "Admins can manage all properties" ON properties
  FOR ALL USING (public.is_admin());

-- Locataires
DROP POLICY IF EXISTS "Admins can manage all tenants" ON tenants;
CREATE POLICY "Admins can manage all tenants" ON tenants
  FOR ALL USING (public.is_admin());

-- Baux (Contrats)
DROP POLICY IF EXISTS "Admins can manage all leases" ON leases;
CREATE POLICY "Admins can manage all leases" ON leases
  FOR ALL USING (public.is_admin());

-- Paiements (Quittances)
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (public.is_admin());

-- Dépenses (Comptabilité)
DROP POLICY IF EXISTS "Admins can manage all expenses" ON expenses;
CREATE POLICY "Admins can manage all expenses" ON expenses
  FOR ALL USING (public.is_admin());

-- Incidents
DROP POLICY IF EXISTS "Admins can manage all incidents" ON incidents;
CREATE POLICY "Admins can manage all incidents" ON incidents
  FOR ALL USING (public.is_admin());
