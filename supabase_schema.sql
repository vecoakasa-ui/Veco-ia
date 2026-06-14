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
-- ROW LEVEL SECURITY (RLS) & POLICIES (Optional setup for secure production)
-- ============================================

-- RLS can be configured if integrating Supabase Auth users directly.
-- Since the application uses a mock owner profile 'owner-1' out-of-the-box,
-- it is recommended to enable RLS after integrating Supabase Auth.
