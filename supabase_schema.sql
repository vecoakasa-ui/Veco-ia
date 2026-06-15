-- ============================================
-- VENANCE IMO — Supabase Database Schema DDL
-- ============================================

-- Enable pgcrypto extension for generating random UUIDs if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES Table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Supports custom text IDs or Auth UUIDs
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'owner', -- 'owner' | 'tenant' | 'admin'
  avatar_url TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'free', -- 'free' | 'pro' | 'business'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROPERTIES Table
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY, -- 'prop-XXXX'
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'apartment' | 'studio' | 'villa' | 'house'
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'vacant', -- 'occupied' | 'vacant' | 'maintenance'
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_validated BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_count INT DEFAULT 0,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

-- 3. TENANTS Table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY, -- 'tenant-XXXX'
  profile_id TEXT, -- Can reference profiles(id) if they have accounts
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  lease_start TEXT NOT NULL, -- Stored as text (YYYY-MM-DD)
  lease_end TEXT NOT NULL, -- Stored as text (YYYY-MM-DD)
  lease_type TEXT NOT NULL DEFAULT 'residential', -- 'residential' | 'commercial'
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'ended'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LEASES Table
CREATE TABLE IF NOT EXISTS leases (
  id TEXT PRIMARY KEY, -- 'lease-XXXX'
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
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
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'expired' | 'terminated'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PAYMENTS Table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY, -- 'pay-XXXX'
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  charges NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  month TEXT NOT NULL,
  year INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'paid' | 'pending' | 'late' | 'upcoming'
  payment_method TEXT NOT NULL, -- 'stripe' | 'orange_money' | 'mtn' | 'cash' | 'paydunya' | 'wave'
  stripe_payment_id TEXT,
  payment_date TEXT, -- Stored as text (YYYY-MM-DD) or null
  due_date TEXT NOT NULL, -- Stored as text (YYYY-MM-DD)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INCIDENTS Table
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY, -- 'inc-XXXX'
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'urgent'
  status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'in_progress' | 'resolved' | 'closed'
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TEXT -- Stored as text (ISOString) or null
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) & SECURE POLICIES
-- ============================================

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES Policies
CREATE POLICY "Users can manage their own profile" 
  ON profiles FOR ALL 
  USING (id = auth.uid()::text);

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
