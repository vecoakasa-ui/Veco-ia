-- ============================================
-- VENANCE IMO — Supabase Database Schema DDL
-- ============================================

-- Nettoyer la base pour repartir à zéro (les données de test seront effacées)
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS landlords CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES Table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'owner',
  avatar_url TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.5 LANDLORDS Table (Bailleurs / Propriétaires)
CREATE TABLE landlords (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  commission_rate NUMERIC DEFAULT 0,
  property_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROPERTIES Table (Biens)
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  landlord_id TEXT REFERENCES landlords(id) ON DELETE SET NULL,
  landlord_name TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'vacant',
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_validated BOOLEAN NOT NULL DEFAULT TRUE,
  tenant_count INT DEFAULT 0,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TENANTS Table (Locataires)
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  profile_id TEXT,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  property_name TEXT,
  lease_start TEXT NOT NULL,
  lease_end TEXT NOT NULL,
  lease_type TEXT NOT NULL DEFAULT 'residential',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LEASES Table (Baux / Cautions)
CREATE TABLE leases (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_name TEXT,
  property_name TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  rent_amount NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL,
  deposit_status TEXT DEFAULT 'held',
  deposit_returned NUMERIC,
  deposit_deductions NUMERIC,
  inventory_in_status TEXT DEFAULT 'pending',
  inventory_in_date TEXT,
  inventory_out_status TEXT DEFAULT 'pending',
  inventory_out_date TEXT,
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PAYMENTS Table (Paiements / Quittances)
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_name TEXT,
  property_name TEXT,
  amount NUMERIC NOT NULL,
  charges NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  month TEXT NOT NULL,
  year INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  stripe_payment_id TEXT,
  payment_date TEXT,
  due_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5.5 EXPENSES Table (Dépenses / Comptabilité)
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  landlord_id TEXT REFERENCES landlords(id) ON DELETE SET NULL,
  property_name TEXT,
  landlord_name TEXT,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INCIDENTS Table
CREATE TABLE incidents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  images TEXT[] DEFAULT '{}',
  resolved_at TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. RLS ENABLED
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES Policies
CREATE POLICY "Users can manage their own profile" 
  ON profiles FOR ALL 
  USING (id = auth.uid()::text);

-- 1.5 LANDLORDS Policies
CREATE POLICY "Owners can manage their landlords" 
  ON landlords FOR ALL 
  USING (owner_id = auth.uid()::text);

-- 2. PROPERTIES Policies
CREATE POLICY "Owners can manage their properties" 
  ON properties FOR ALL 
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Tenants can view assigned properties" 
  ON properties FOR SELECT 
  USING (id IN (SELECT property_id FROM tenants WHERE profile_id = auth.uid()::text));

-- 3. TENANTS Policies
CREATE POLICY "Owners can manage their tenants" 
  ON tenants FOR ALL 
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Tenants can view their own tenant record" 
  ON tenants FOR SELECT 
  USING (profile_id = auth.uid()::text);

-- 4. LEASES Policies
CREATE POLICY "Owners can manage leases" 
  ON leases FOR ALL 
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Tenants can view their own leases" 
  ON leases FOR SELECT 
  USING (tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid()::text));

-- 5. PAYMENTS Policies
CREATE POLICY "Owners can manage payments" 
  ON payments FOR ALL 
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Tenants can view and manage their payments" 
  ON payments FOR ALL 
  USING (tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid()::text));

-- 6. INCIDENTS Policies
CREATE POLICY "Owners can manage incidents of their properties" 
  ON incidents FOR ALL 
  USING (property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid()::text));

CREATE POLICY "Tenants can manage their own incidents" 
  ON incidents FOR ALL 
  USING (tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid()::text));

-- 7. EXPENSES Policies
CREATE POLICY "Owners can manage their expenses" 
  ON expenses FOR ALL 
  USING (owner_id = auth.uid()::text);


-- ============================================
-- AUTHENTICATION TRIGGERS (Auto-Profile Creation)
-- ============================================

-- Automatically sync profiles table when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, subscription_plan)
  VALUES (
    new.id::text,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.phone,
    COALESCE(new.raw_user_meta_data->>'role', 'owner'),
    'free'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists first to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SECURITY FIXES (REVOKE EXECUTE)
-- ============================================

-- Revoke public execution of security definer functions to resolve Supabase security warnings
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- If rls_auto_enable function exists (often created by Supabase tooling), revoke its execution too
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;
  END IF;
END $$;
