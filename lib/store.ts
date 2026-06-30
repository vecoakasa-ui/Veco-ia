"use client";

import { Property, Tenant, Payment, Lease, Incident, Profile, DashboardStats, PaymentStatus, PaymentMethod, Landlord, Expense, SubscriptionRecord } from "./types";
import { generateId } from "./utils";
import { supabase, isSupabaseConfigured } from "./supabase";

interface DBTenantRow {
  id: string;
  profile_id: string;
  property_id: string;
  owner_id: string;
  lease_start: string;
  lease_end: string;
  lease_type: "residential" | "commercial";
  status: "active" | "ended";
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
  } | null;
  properties: {
    name: string;
  } | null;
  full_name?: string;
  email?: string;
  phone?: string;
  property_name?: string;
  avatar_url?: string;
}

interface DBPaymentRow {
  id: string;
  tenant_id: string;
  property_id: string;
  owner_id: string;
  amount: number;
  charges: number;
  total: number;
  month: string;
  year: number;
  status: string;
  payment_method: string;
  stripe_payment_id: string | null;
  payment_date: string | null;
  due_date: string;
  created_at: string;
  tenant_name?: string;
  property_name?: string;
  tenants: {
    full_name?: string;
    avatar_url?: string;
  } | null;
  properties: {
    name: string;
  } | null;
}

// ============================================
// INITIAL MOCK DATA
// ============================================

export const DEFAULT_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    owner_id: "owner-1",
    amount: 15000,
    description: "Réparation plomberie (Fuite d'eau)",
    category: "maintenance",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    property_id: "prop-1",
    property_name: "Villa Hibiscus"
  },
  {
    id: "exp-2",
    owner_id: "owner-1",
    amount: 50000,
    description: "Reversement loyer propriétaire Bédié",
    category: "payout",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    landlord_id: "landlord-1",
    landlord_name: "Jean-Paul Bédié"
  }
];

export const DEFAULT_PROFILE: Profile = {
  id: "owner-1",
  full_name: "Venance",
  email: "contact@visionimmo.com",
  phone: "+225 07 00 00 00 00",
  role: "owner",
  avatar_url: "/owner_avatar.png",
  subscription_plan: "pro",
  created_at: new Date().toISOString(),
};

export const DEFAULT_LANDLORDS: Landlord[] = [
  {
    id: "landlord-1",
    owner_id: "owner-1",
    full_name: "Jean-Paul Bédié",
    email: "jpbedie@mail.com",
    phone: "+225 01 02 03 04 05",
    commission_rate: 10,
    created_at: new Date().toISOString(),
    property_count: 2
  },
  {
    id: "landlord-2",
    owner_id: "owner-1",
    full_name: "Marie Koné",
    email: "mariek@mail.com",
    phone: "+225 05 11 22 33 44",
    commission_rate: 8,
    created_at: new Date().toISOString(),
    property_count: 2
  }
];

export const DEFAULT_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    owner_id: "owner-1",
    name: "Villa Hibiscus",
    type: "villa",
    address: "Cocody Riviera 3",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    monthly_rent: 450000,
    status: "occupied",
    description: "Grande villa avec piscine, 4 pièces, jardin et garage sécurisé.",
    images: [],
    is_validated: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    landlord_id: "landlord-1",
    landlord_name: "Jean-Paul Bédié",
    tenant_count: 1,
    lat: 5.345317,
    lng: -4.001925
  },
  {
    id: "prop-2",
    owner_id: "owner-1",
    name: "Appartement Riviera C2",
    type: "apartment",
    address: "Riviera Faya, Route d'Abatta",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    monthly_rent: 250000,
    status: "occupied",
    description: "Appartement de 3 pièces au 2ème étage d'un immeuble récent.",
    images: [],
    is_validated: true,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    landlord_id: "landlord-2",
    landlord_name: "Marie Koné",
    tenant_count: 1,
    lat: 5.359951,
    lng: -4.008256
  },
  {
    id: "prop-3",
    owner_id: "owner-1",
    name: "Studio Zone 4",
    type: "studio",
    address: "Rue Paul Langevin",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    monthly_rent: 150000,
    status: "vacant",
    description: "Studio meublé tout confort idéal pour travailleur ou étudiant.",
    images: [],
    is_validated: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    landlord_id: "landlord-1",
    landlord_name: "Jean-Paul Bédié",
    tenant_count: 0,
    lat: 5.293421,
    lng: -3.989821
  },
  {
    id: "prop-4",
    owner_id: "owner-1",
    name: "Maison Cocody Angré",
    type: "house",
    address: "Angré 8ème Tranche",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    monthly_rent: 350000,
    status: "maintenance",
    description: "Maison basse de 4 pièces en cours de rafraîchissement.",
    images: [],
    is_validated: true,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    landlord_id: "landlord-2",
    landlord_name: "Marie Koné",
    tenant_count: 0,
    lat: 5.391211,
    lng: -3.962134
  }
];

export const DEFAULT_TENANTS: Tenant[] = [
  {
    id: "tenant-1",
    profile_id: "tp-1",
    property_id: "prop-1",
    owner_id: "owner-1",
    lease_start: "2026-01-01",
    lease_end: "2027-01-01",
    lease_type: "residential",
    status: "active",
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    full_name: "Koffi Kouassi",
    email: "koffi.kouassi@mail.com",
    phone: "+225 05 55 55 55 55",
    property_name: "Villa Hibiscus"
  },
  {
    id: "tenant-2",
    profile_id: "tp-2",
    property_id: "prop-2",
    owner_id: "owner-1",
    lease_start: "2026-02-15",
    lease_end: "2027-02-15",
    lease_type: "residential",
    status: "active",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    full_name: "Awa Diop",
    email: "awa.diop@mail.com",
    phone: "+225 07 77 77 77 77",
    property_name: "Appartement Riviera C2"
  }
];

export const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: "pay-1",
    tenant_id: "tenant-1",
    property_id: "prop-1",
    owner_id: "owner-1",
    amount: 450000,
    charges: 30000,
    total: 480000,
    month: "Jun",
    year: 2026,
    status: "paid",
    payment_method: "stripe",
    stripe_payment_id: "ch_mock_123",
    payment_date: "2026-06-02",
    due_date: "2026-06-05",
    created_at: new Date().toISOString(),
    tenant_name: "Koffi Kouassi",
    property_name: "Villa Hibiscus"
  },
  {
    id: "pay-2",
    tenant_id: "tenant-2",
    property_id: "prop-2",
    owner_id: "owner-1",
    amount: 250000,
    charges: 15000,
    total: 265000,
    month: "Jun",
    year: 2026,
    status: "late",
    payment_method: "cash",
    stripe_payment_id: null,
    payment_date: null,
    due_date: "2026-06-05",
    created_at: new Date().toISOString(),
    tenant_name: "Awa Diop",
    property_name: "Appartement Riviera C2"
  },
  {
    id: "pay-3",
    tenant_id: "tenant-1",
    property_id: "prop-1",
    owner_id: "owner-1",
    amount: 450000,
    charges: 30000,
    total: 480000,
    month: "May",
    year: 2026,
    status: "paid",
    payment_method: "stripe",
    stripe_payment_id: "ch_mock_122",
    payment_date: "2026-05-04",
    due_date: "2026-05-05",
    created_at: new Date().toISOString(),
    tenant_name: "Koffi Kouassi",
    property_name: "Villa Hibiscus"
  },
  {
    id: "pay-4",
    tenant_id: "tenant-2",
    property_id: "prop-2",
    owner_id: "owner-1",
    amount: 250000,
    charges: 15000,
    total: 265000,
    month: "May",
    year: 2026,
    status: "paid",
    payment_method: "orange_money",
    stripe_payment_id: "om_mock_456",
    payment_date: "2026-05-05",
    due_date: "2026-05-05",
    created_at: new Date().toISOString(),
    tenant_name: "Awa Diop",
    property_name: "Appartement Riviera C2"
  },
  {
    id: "pay-5",
    tenant_id: "tenant-2",
    property_id: "prop-2",
    owner_id: "owner-1",
    amount: 250000,
    charges: 15000,
    total: 265000,
    month: "Jul",
    year: 2026,
    status: "upcoming",
    payment_method: "stripe",
    stripe_payment_id: null,
    payment_date: null,
    due_date: "2026-07-05",
    created_at: new Date().toISOString(),
    tenant_name: "Awa Diop",
    property_name: "Appartement Riviera C2"
  }
];

export const DEFAULT_LEASES: Lease[] = [
  {
    id: "lease-1",
    tenant_id: "tenant-1",
    property_id: "prop-1",
    owner_id: "owner-1",
    start_date: "2026-01-01",
    end_date: "2027-01-01",
    rent_amount: 450000,
    deposit_amount: 900000,
    deposit_status: "held",
    inventory_in_status: "completed",
    inventory_in_date: "2026-01-01",
    document_url: "#",
    status: "active",
    tenant_name: "Koffi Kouassi",
    property_name: "Villa Hibiscus",
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lease-2",
    tenant_id: "tenant-2",
    property_id: "prop-2",
    owner_id: "owner-1",
    start_date: "2026-02-15",
    end_date: "2027-02-15",
    rent_amount: 250000,
    deposit_amount: 500000,
    deposit_status: "held",
    inventory_in_status: "pending",
    document_url: "#",
    status: "active",
    tenant_name: "Awa Diop",
    property_name: "Appartement Riviera C2",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const DEFAULT_INCIDENTS: Incident[] = [
  {
    id: "inc-1",
    tenant_id: "tenant-1",
    property_id: "prop-1",
    title: "Fuite d'eau sous l'évier",
    description: "Une fuite d'eau importante a été constatée sous l'évier de la cuisine, imbibant le placard.",
    priority: "high",
    status: "in_progress",
    images: [],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: null
  },
  {
    id: "inc-2",
    tenant_id: "tenant-2",
    property_id: "prop-2",
    title: "Prise électrique défectueuse",
    description: "La prise principale du salon ne fournit plus de courant et fait sauter les plombs.",
    priority: "medium",
    status: "open",
    images: [],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: null
  }
];

// ============================================
// HELPER FUNCTIONS (LOCAL STORAGE BRIDGE)
// ============================================

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading localStorage key", key, error);
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting localStorage key", key, error);
  }
}

export const getOwnerId = async (): Promise<string> => {
  if (isSupabaseConfigured()) {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) return data.session.user.id;
  }
  throw new Error("Veuillez vous connecter pour continuer.");
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkAuthError = (err: any) => {
  if (err && (err.code === 'PGRST303' || (err.message && err.message.includes('JWT expired')))) {
    console.error('Session expirée, déconnexion forcée...');
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
};

export const db = {
  // Clear all and reset
  reset: async (): Promise<void> => {
    if (typeof window === "undefined") return;
    localStorage.clear();
    location.reload();
  },

  // Profile
  getProfile: async (): Promise<Profile | null> => {
    try {
      const ownerId = await getOwnerId();
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", ownerId)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          // Rendre ce compte UNIQUE Super Administrateur (Insensible à la casse)
          if (data.email && data.email.toLowerCase() === 'vecoakasa@gmail.com') {
            data.role = 'admin';
          }
          return data as Profile;
        }
      }
    } catch (err) {
      console.error("Error fetching profile from Supabase:", err);
        checkAuthError(err);
    }
    return null;
  },
  updateProfile: async (profile: Profile): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("profiles")
          .upsert(profile);
        if (error) throw error;
      } catch (err) {
        console.error("Error updating profile in Supabase:", err);
      }
    }
    setToStorage("profile", profile);
  },

  // Landlords
  getLandlords: async (): Promise<Landlord[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("landlords")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (data) return data as Landlord[];
      } catch (err) {
        console.error("Error fetching landlords from Supabase:", err);
        checkAuthError(err);
      }
    }
    return [];
  },
  addLandlord: async (landlord: Omit<Landlord, "id" | "owner_id" | "created_at" | "property_count">): Promise<Landlord> => {
    const ownerId = await getOwnerId();
    const newLandlord: Landlord = {
      ...landlord,
      id: "landlord-" + generateId(),
      owner_id: ownerId,
      created_at: new Date().toISOString(),
      property_count: 0
    };
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("landlords")
        .insert(newLandlord);
      if (error) throw error;
    }
    return newLandlord;
  },
  updateLandlord: async (landlord: Landlord): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("landlords")
        .update(landlord)
        .eq("id", landlord.id);
      if (error) throw error;
    }
  },
  deleteLandlord: async (id: string): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("landlords").delete().eq("id", id);
      if (error) throw error;
    }
  },

  // Properties
  getProperties: async (): Promise<Property[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from("properties")
          .select("*")
          .order("created_at", { ascending: true });
        if (data) return data as Property[];
      } catch (err) {
        console.error("Error fetching properties from Supabase:", err);
        checkAuthError(err);
      }
    }
    return [];
  },
  addProperty: async (property: Omit<Property, "id" | "owner_id" | "created_at" | "is_validated">): Promise<Property> => {
    const ownerId = await getOwnerId();
    
    // Détection automatique des coordonnées via Nominatim (OpenStreetMap) si non fournies
    let lat = property.lat;
    let lng = property.lng;
    
    if (!lat || !lng) {
      try {
        const query = encodeURIComponent(`${property.address}, ${property.city}, ${property.country}`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        } else {
          // Si l'adresse complète échoue, on tente juste avec la ville
          const cityQuery = encodeURIComponent(`${property.city}, ${property.country}`);
          const resCity = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${cityQuery}&limit=1`);
          const dataCity = await resCity.json();
          if (dataCity && dataCity.length > 0) {
            lat = parseFloat(dataCity[0].lat);
            lng = parseFloat(dataCity[0].lon);
          }
        }
      } catch (e) {
        console.error("Erreur de géolocalisation automatique :", e);
      }
    }

    const newProperty: Property = {
      ...property,
      id: "prop-" + generateId(),
      owner_id: ownerId,
      is_validated: true,
      created_at: new Date().toISOString(),
      tenant_count: 0,
      lat: lat || 5.30966, // Fallback par défaut
      lng: lng || -4.01266
    };

    // If property has a landlord, update landlord count
    if (newProperty.landlord_id) {
      const landlords = await db.getLandlords();
      const landlord = landlords.find(l => l.id === newProperty.landlord_id);
      if (landlord) {
        newProperty.landlord_name = landlord.full_name;
        landlord.property_count = (landlord.property_count || 0) + 1;
        await db.updateLandlord(landlord);
      }
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("properties")
        .insert(newProperty);
      if (error) throw error;
    }
    return newProperty;
  },
  updateProperty: async (property: Property): Promise<void> => {
    // Si l'adresse a changé et qu'on n'a pas mis à jour manuellement les coordonnées
    const updatedProperty = { ...property };
    
    // On pourrait détecter si l'adresse a changé, mais pour faire simple
    // si lat et lng ne sont pas corrects ou ont besoin d'être actualisés :
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("properties")
        .update(updatedProperty)
        .eq("id", updatedProperty.id);
      if (error) throw error;
    }
  },
  deleteProperty: async (id: string): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    }
  },

  getTenants: async (): Promise<Tenant[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("tenants")
          .select(`
            *,
            properties:property_id (*)
          `);
        if (error) throw error;
        
        if (data) {
          const rows = data as unknown as (DBTenantRow & { avatar_url?: string })[];
          const parsed = rows.map((t) => ({
            id: t.id,
            profile_id: t.profile_id,
            property_id: t.property_id,
            owner_id: t.owner_id,
            lease_start: t.lease_start,
            lease_end: t.lease_end,
            lease_type: t.lease_type,
            status: t.status,
            created_at: t.created_at,
            full_name: t.full_name || "",
            email: t.email || "",
            phone: t.phone || "",
            avatar_url: t.avatar_url || "",
            property_name: t.property_name || t.properties?.name || ""
          }));
          return parsed;
        }
      } catch (err) {
        console.error("Error fetching tenants from Supabase:", err);
        checkAuthError(err);
      }
    }
    return [];
  },
  addTenant: async (tenant: Omit<Tenant, "id" | "owner_id" | "created_at">): Promise<Tenant> => {
    const ownerId = await getOwnerId();
    const properties = await db.getProperties();
    const targetProp = properties.find(p => p.id === tenant.property_id);
    
    const newTenant: Tenant = {
      ...tenant,
      id: "tenant-" + generateId(),
      owner_id: ownerId,
      created_at: new Date().toISOString(),
      property_name: targetProp ? targetProp.name : ""
    };

    if (isSupabaseConfigured()) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: tenant.profile_id,
        full_name: tenant.full_name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        role: "tenant",
        avatar_url: tenant.avatar_url || ""
      });
      if (profileError) {
        console.warn("Could not create profile (likely RLS), proceeding to create tenant record:", profileError);
      }

      const { error } = await supabase.from("tenants").insert({
        id: newTenant.id,
        profile_id: tenant.profile_id,
        property_id: tenant.property_id,
        owner_id: ownerId,
        full_name: tenant.full_name,
        email: tenant.email,
        phone: tenant.phone,
        property_name: newTenant.property_name,
        lease_start: tenant.lease_start,
        lease_end: tenant.lease_end,
        lease_type: tenant.lease_type,
        status: tenant.status,
        avatar_url: tenant.avatar_url
      });
      if (error) throw error;

      if (targetProp) {
        targetProp.status = "occupied";
        targetProp.tenant_count = (targetProp.tenant_count || 0) + 1;
        await db.updateProperty(targetProp);
      }

      await db.addPayment({
        tenant_id: newTenant.id,
        property_id: newTenant.property_id,
        amount: targetProp ? targetProp.monthly_rent : 100000,
        charges: 15000,
        month: "Jun",
        year: 2026,
        status: "pending",
        payment_method: "stripe",
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      await db.addLease({
        tenant_id: newTenant.id,
        property_id: newTenant.property_id,
        tenant_name: newTenant.full_name,
        property_name: newTenant.property_name,
        start_date: tenant.lease_start,
        end_date: tenant.lease_end,
        rent_amount: targetProp ? targetProp.monthly_rent : 0,
        deposit_amount: targetProp ? targetProp.monthly_rent * 2 : 0, // Default 2 months
        deposit_status: "held",
        status: "active",
        document_url: null
      });
    }

    return newTenant;
  },
  updateTenant: async (tenant: Tenant): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error: profileError } = await supabase.from("profiles").update({
        full_name: tenant.full_name,
        email: tenant.email,
        phone: tenant.phone,
        avatar_url: tenant.avatar_url
      }).eq("id", tenant.profile_id);
      if (profileError) {
        console.warn("Could not update profile (likely RLS), proceeding to update tenant record:", profileError);
      }

      const { error } = await supabase.from("tenants").update({
        property_id: tenant.property_id,
        lease_start: tenant.lease_start,
        lease_end: tenant.lease_end,
        lease_type: tenant.lease_type,
        status: tenant.status,
        avatar_url: tenant.avatar_url
      }).eq("id", tenant.id);
      if (error) throw error;
      
      // Attempt to save avatar directly to tenants table
      if (tenant.avatar_url) {
        const { error: avatarError } = await supabase.from("tenants").update({
          avatar_url: tenant.avatar_url
        }).eq("id", tenant.id);
        if (avatarError) console.warn("Could not save avatar to tenants table. Ensure column exists.", avatarError);
      }
    }
  },
  deleteTenant: async (id: string): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("tenants").delete().eq("id", id);
      if (error) {
         console.error("Error deleting tenant in Supabase:", error);
         throw error;
      }
    }
    
    // We can't rely on local fallback anymore, so updating property_count is handled by Postgres Triggers ideally,
    // but for now we'll do it by fetching the tenant first.
  },

  // Payments
  getPayments: async (): Promise<Payment[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select(`
            *,
            tenants:tenant_id (*),
            properties:property_id (*)
          `)
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) {
          const rows = data as unknown as DBPaymentRow[];
          return rows.map((p) => {
            return {
              id: p.id,
              tenant_id: p.tenant_id,
              property_id: p.property_id,
              owner_id: p.owner_id,
              amount: Number(p.amount),
              charges: Number(p.charges),
              total: Number(p.total),
              month: p.month,
              year: p.year,
              status: p.status as unknown as PaymentStatus,
              payment_method: p.payment_method as unknown as PaymentMethod,
              stripe_payment_id: p.stripe_payment_id,
              payment_date: p.payment_date,
              due_date: p.due_date,
              created_at: p.created_at,
              tenant_name: p.tenant_name || p.tenants?.full_name || "Locataire inconnu",
              tenant_avatar: p.tenants?.avatar_url || "",
              property_name: p.property_name || p.properties?.name || "Propriété inconnue"
            } as Payment;
          });
        }
      } catch (err) {
        console.error("Error fetching payments from Supabase:", err);
        checkAuthError(err);
      }
    }
    return [];
  },
  addPayment: async (payment: Omit<Payment, "id" | "owner_id" | "created_at" | "total" | "stripe_payment_id" | "payment_date" | "tenant_name" | "property_name">): Promise<Payment> => {
    const ownerId = await getOwnerId();
    const tenants = await db.getTenants();
    const properties = await db.getProperties();
    const tenant = tenants.find(t => t.id === payment.tenant_id);
    const property = properties.find(p => p.id === payment.property_id);

    const newPayment: Payment = {
      ...payment,
      id: "pay-" + generateId(),
      owner_id: ownerId,
      total: payment.amount + payment.charges,
      stripe_payment_id: null,
      payment_date: payment.status === "paid" ? new Date().toISOString().split('T')[0] : null,
      created_at: new Date().toISOString(),
      tenant_name: tenant ? tenant.full_name : "Locataire inconnu",
      property_name: property ? property.name : "Propriété inconnue"
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("payments").insert({
        id: newPayment.id,
        tenant_id: newPayment.tenant_id,
        property_id: newPayment.property_id,
        owner_id: ownerId,
        amount: newPayment.amount,
        charges: newPayment.charges,
        total: newPayment.total,
        month: newPayment.month,
        year: newPayment.year,
        status: newPayment.status,
        payment_method: newPayment.payment_method,
        stripe_payment_id: newPayment.stripe_payment_id,
        payment_date: newPayment.payment_date,
        due_date: newPayment.due_date
      });
      if (error) throw error;
    }

    return newPayment;
  },
  updatePayment: async (payment: Payment): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("payments")
        .update({
          status: payment.status,
          payment_method: payment.payment_method,
          stripe_payment_id: payment.stripe_payment_id,
          payment_date: payment.payment_date,
          amount: payment.amount,
          charges: payment.charges,
          total: payment.total
        })
        .eq("id", payment.id);
      if (error) throw error;
    }
  },
  deletePayment: async (id: string): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("payments").delete().eq("id", id);
      if (error) throw error;
    }
  },

  // Leases
  getLeases: async (): Promise<Lease[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data: leasesData, error } = await supabase
          .from("leases")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        
        let leases = (leasesData || []) as Lease[];
        
        // Auto-fix: generate missing leases for existing tenants
        const { data: tenantsData } = await supabase.from("tenants").select("*");
        if (tenantsData) {
          const ownerId = await getOwnerId();
          const missingLeases = tenantsData.filter((t: Tenant) => !leases.some(l => l.tenant_id === t.id));
          
          if (missingLeases.length > 0) {
            console.log("Auto-generating", missingLeases.length, "missing leases");
            const newLeasesToInsert = missingLeases.map((t: Tenant) => ({
              id: "lease-" + generateId(),
              tenant_id: t.id,
              property_id: t.property_id,
              owner_id: ownerId,
              tenant_name: t.full_name,
              property_name: t.property_name,
              start_date: t.lease_start || new Date().toISOString().split('T')[0],
              end_date: t.lease_end || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
              rent_amount: 100000,
              deposit_amount: 200000,
              deposit_status: "held",
              status: "active",
              document_url: null,
              created_at: new Date().toISOString()
            }));
            
            await supabase.from("leases").insert(newLeasesToInsert);
            leases = [...leases, ...newLeasesToInsert] as Lease[];
          }
        }
        
        return leases;
      } catch (err) {
        console.error("Error fetching leases from Supabase:", err);
        checkAuthError(err);
      }
    }
    return [];
  },
  addLease: async (lease: Omit<Lease, "id" | "owner_id" | "created_at">): Promise<Lease> => {
    const ownerId = await getOwnerId();
    const newLease: Lease = {
      ...lease,
      id: "lease-" + generateId(),
      owner_id: ownerId,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("leases").insert(newLease);
      if (error) throw error;
    }

    return newLease;
  },
  updateLease: async (lease: Lease): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("leases")
        .update({
          deposit_status: lease.deposit_status,
          deposit_returned: lease.deposit_returned,
          deposit_deductions: lease.deposit_deductions,
          inventory_in_status: lease.inventory_in_status,
          inventory_in_date: lease.inventory_in_date,
          inventory_in_video_url: lease.inventory_in_video_url,
          inventory_out_status: lease.inventory_out_status,
          inventory_out_date: lease.inventory_out_date,
          inventory_out_video_url: lease.inventory_out_video_url,
          status: lease.status
        })
        .eq("id", lease.id);
      if (error) throw error;
    }
  },

  // Incidents
  getIncidents: async (): Promise<Incident[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("incidents")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) return data as Incident[];
      } catch (err) {
        console.error("Error fetching incidents from Supabase:", err);
        checkAuthError(err);
      }
    }
    return [];
  },
  addIncident: async (incident: Omit<Incident, "id" | "created_at" | "resolved_at">): Promise<Incident> => {
    const newIncident: Incident = {
      ...incident,
      id: "inc-" + generateId(),
      created_at: new Date().toISOString(),
      resolved_at: null
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("incidents").insert(newIncident);
      if (error) throw error;
    }

    return newIncident;
  },
  updateIncident: async (incident: Incident): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("incidents")
        .update(incident)
        .eq("id", incident.id);
      if (error) throw error;
    }
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .order("date", { ascending: false });
        if (error) throw error;
        if (data) return data as Expense[];
      } catch (err) {
        console.error("Error fetching expenses:", err);
        checkAuthError(err);
      }
    }
    return [];
  },

  addExpense: async (expense: Omit<Expense, "id" | "owner_id" | "created_at">): Promise<Expense> => {
    const ownerId = await getOwnerId();
    const newExpense: Expense = {
      ...expense,
      id: "exp-" + generateId(),
      owner_id: ownerId,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("expenses")
        .insert(newExpense);
      if (error) throw error;
    }
    return newExpense;
  },

  deleteExpense: async (expenseId: string): Promise<void> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);
      if (error) throw error;
    }
  },

  // Calculate stats in real-time
  getStats: async (): Promise<DashboardStats> => {
    const [properties, tenants, payments, landlords, leases] = await Promise.all([
      db.getProperties(),
      db.getTenants(),
      db.getPayments(),
      db.getLandlords(),
      db.getLeases()
    ]);

    const total_properties = properties.length;
    const total_tenants = tenants.length;
    const total_landlords = landlords.length;
    const total_leases = leases.length;

    const total_revenue = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.total, 0);

    const late_payments = payments.filter(p => p.status === "late").length;

    const occupiedCount = properties.filter(p => p.status === "occupied").length;
    const occupancy_rate = total_properties > 0 ? Math.round((occupiedCount / total_properties) * 100) : 0;

    return {
      total_properties,
      total_tenants,
      total_revenue,
      late_payments,
      occupancy_rate,
      total_landlords,
      total_leases
    };
  },

  // ============================================
  // ADMIN METHODS (SUPERVISION)
  // ============================================

  getAllProfiles: async (): Promise<Profile[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) return data as Profile[];
      } catch (err) {
        console.error("Error fetching all profiles:", err);
        checkAuthError(err);
      }
    }
    return [getFromStorage("profile", DEFAULT_PROFILE)];
  },
  
  getGlobalStats: async (): Promise<DashboardStats & { total_landlords: number, active_admins: number }> => {
    if (isSupabaseConfigured()) {
      try {
        const [props, ten, pays, lands, adminsCount] = await Promise.all([
          supabase.from("properties").select("id, status"),
          supabase.from("tenants").select("id", { count: "exact", head: true }),
          supabase.from("payments").select("total, status"),
          supabase.from("landlords").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin")
        ]);
        
        const properties = props.data || [];
        const payments = pays.data || [];
        const total_properties = properties.length;
        
        return {
          total_properties,
          total_tenants: ten.count || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          total_revenue: payments.filter((p: any) => p.status === "paid").reduce((sum: number, p: any) => sum + p.total, 0),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          late_payments: payments.filter((p: any) => p.status === "late").length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          occupancy_rate: total_properties > 0 ? Math.round((properties.filter((p: any) => p.status === "occupied").length / total_properties) * 100) : 0,
          total_landlords: lands.count || 0,
          total_leases: 0,
          active_admins: adminsCount.count || 0
        };
      } catch (err) {
         console.error("Error fetching global stats:", err);
        checkAuthError(err);
      }
    }
    const localStats = await db.getStats();
    return { 
      ...localStats, 
      total_landlords: (await db.getLandlords()).length,
      active_admins: 1 // Default fallback
    };
  },

  getAllSystemIncidents: async (): Promise<Incident[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("incidents")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) return data as Incident[];
      } catch (err) {
        console.error("Error fetching system incidents:", err);
        checkAuthError(err);
      }
    }
    return await db.getIncidents();
  },

  // Mock function for subscriptions
  getAllSubscriptions: async (): Promise<SubscriptionRecord[]> => {
    // In a real app, this would fetch from a `subscriptions` table.
    // Here we generate mock data based on landlords and profiles for demonstration.
    return [
      {
        id: "sub-1",
        profile_id: "owner-1",
        plan: "pro",
        status: "active",
        amount: 15000,
        next_billing_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        last_payment_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        profile: {
          full_name: "Jean-Paul Bédié",
          email: "jpbedie@mail.com",
          avatar_url: null,
        }
      },
      {
        id: "sub-2",
        profile_id: "owner-2",
        plan: "business",
        status: "late",
        amount: 30000,
        next_billing_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        last_payment_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        profile: {
          full_name: "Marie Koné",
          email: "mariek@mail.com",
          avatar_url: null,
        }
      },
      {
        id: "sub-3",
        profile_id: "owner-3",
        plan: "free",
        status: "active",
        amount: 0,
        next_billing_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        profile: {
          full_name: "Koffi Kouassi",
          email: "koffi.kouassi@mail.com",
          avatar_url: null,
        }
      },
      {
        id: "sub-4",
        profile_id: "owner-4",
        plan: "pro",
        status: "suspended",
        amount: 15000,
        next_billing_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        last_payment_date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
        profile: {
          full_name: "Awa Diop",
          email: "awa.diop@mail.com",
          avatar_url: null,
        }
      }
    ];
  }
};
