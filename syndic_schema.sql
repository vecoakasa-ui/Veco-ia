-- ============================================
-- Vision Immo 2.0 — Module Syndic / Copropriété
-- ============================================

-- 1. SYNDIC_CHARGES (Factures globales de l'immeuble)
CREATE TABLE IF NOT EXISTS syndic_charges (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SYNDIC_APPORTIONMENTS (Répartition par locataire/appartement)
CREATE TABLE IF NOT EXISTS syndic_apportionments (
  id TEXT PRIMARY KEY,
  charge_id TEXT REFERENCES syndic_charges(id) ON DELETE CASCADE,
  unit_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE SET NULL,
  amount_due NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE syndic_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE syndic_apportionments ENABLE ROW LEVEL SECURITY;

-- Politiques pour syndic_charges
CREATE POLICY "Owners can manage syndic charges" 
  ON syndic_charges FOR ALL 
  USING (owner_id = auth.uid()::text);

-- Politiques pour syndic_apportionments
CREATE POLICY "Owners can manage syndic apportionments" 
  ON syndic_apportionments FOR ALL 
  USING (charge_id IN (SELECT id FROM syndic_charges WHERE owner_id = auth.uid()::text));

CREATE POLICY "Tenants can view their apportionments" 
  ON syndic_apportionments FOR SELECT 
  USING (tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid()::text));

-- L'entité "Tickets" utilise la table existante "incidents" qui est déjà configurée.
