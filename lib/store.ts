"use client";

import { Property, Tenant, Payment, Lease, Incident, Profile, DashboardStats, PaymentStatus, PaymentMethod } from "./types";
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
  } | null;
  properties: {
    name: string;
  } | null;
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
  tenants: {
    profiles: {
      full_name: string;
    } | null;
  } | null;
  properties: {
    name: string;
  } | null;
}

// ============================================
// INITIAL MOCK DATA
// ============================================

const DEFAULT_PROFILE: Profile = {
  id: "owner-1",
  full_name: "Venance",
  email: "venance@venanceimo.com",
  phone: "+225 07 00 00 00 00",
  role: "owner",
  avatar_url: null,
  subscription_plan: "pro",
  created_at: new Date().toISOString(),
};

const DEFAULT_PROPERTIES: Property[] = [
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
    tenant_count: 0,
    lat: 5.391211,
    lng: -3.962134
  }
];

const DEFAULT_TENANTS: Tenant[] = [
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

const DEFAULT_PAYMENTS: Payment[] = [
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

const DEFAULT_LEASES: Lease[] = [
  {
    id: "lease-1",
    tenant_id: "tenant-1",
    property_id: "prop-1",
    owner_id: "owner-1",
    start_date: "2026-01-01",
    end_date: "2027-01-01",
    rent_amount: 450000,
    deposit_amount: 900000,
    document_url: "#",
    status: "active",
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
    document_url: "#",
    status: "active",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_INCIDENTS: Incident[] = [
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

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading localStorage key", key, error);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting localStorage key", key, error);
  }
}

export const db = {
  // Clear all and reset
  reset: async (): Promise<void> => {
    if (typeof window === "undefined") return;
    localStorage.clear();
    location.reload();
  },

  // Profile
  getProfile: async (): Promise<Profile> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", "owner-1")
          .maybeSingle();
        if (error) throw error;
        if (data) return data as Profile;
      } catch (err) {
        console.error("Error fetching profile from Supabase:", err);
      }
    }
    return getFromStorage("profile", DEFAULT_PROFILE);
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

  // Properties
  getProperties: async (): Promise<Property[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (data) return data as Property[];
      } catch (err) {
        console.error("Error fetching properties from Supabase:", err);
      }
    }
    return getFromStorage("properties", DEFAULT_PROPERTIES);
  },
  addProperty: async (property: Omit<Property, "id" | "owner_id" | "created_at" | "is_validated">): Promise<Property> => {
    const newProperty: Property = {
      ...property,
      id: "prop-" + generateId(),
      owner_id: "owner-1",
      is_validated: true,
      created_at: new Date().toISOString(),
      tenant_count: 0,
      lat: 5.28 + Math.random() * 0.12,
      lng: -4.05 + Math.random() * 0.12
    };
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("properties")
          .insert(newProperty);
        if (error) throw error;
        return newProperty;
      } catch (err) {
        console.error("Error adding property to Supabase:", err);
      }
    }
    const properties = getFromStorage("properties", DEFAULT_PROPERTIES);
    setToStorage("properties", [...properties, newProperty]);
    return newProperty;
  },
  updateProperty: async (property: Property): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("properties")
          .update(property)
          .eq("id", property.id);
        if (error) throw error;
      } catch (err) {
        console.error("Error updating property in Supabase:", err);
      }
    }
    const properties = getFromStorage("properties", DEFAULT_PROPERTIES);
    const index = properties.findIndex(p => p.id === property.id);
    if (index !== -1) {
      properties[index] = property;
      setToStorage("properties", properties);
    }
  },

  // Tenants
  getTenants: async (): Promise<Tenant[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("tenants")
          .select(`
            *,
            profiles:profile_id (*),
            properties:property_id (*)
          `);
        if (error) throw error;
        if (data) {
          const rows = data as unknown as DBTenantRow[];
          return rows.map((t) => ({
            id: t.id,
            profile_id: t.profile_id,
            property_id: t.property_id,
            owner_id: t.owner_id,
            lease_start: t.lease_start,
            lease_end: t.lease_end,
            lease_type: t.lease_type,
            status: t.status,
            created_at: t.created_at,
            full_name: t.profiles?.full_name || "",
            email: t.profiles?.email || "",
            phone: t.profiles?.phone || "",
            property_name: t.properties?.name || ""
          }));
        }
      } catch (err) {
        console.error("Error fetching tenants from Supabase:", err);
      }
    }
    return getFromStorage("tenants", DEFAULT_TENANTS);
  },
  addTenant: async (tenant: Omit<Tenant, "id" | "owner_id" | "created_at">): Promise<Tenant> => {
    const properties = await db.getProperties();
    const targetProp = properties.find(p => p.id === tenant.property_id);
    
    const newTenant: Tenant = {
      ...tenant,
      id: "tenant-" + generateId(),
      owner_id: "owner-1",
      created_at: new Date().toISOString(),
      property_name: targetProp ? targetProp.name : ""
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("profiles").upsert({
          id: tenant.profile_id,
          full_name: tenant.full_name || "",
          email: tenant.email || "",
          phone: tenant.phone || "",
          role: "tenant"
        });

        const { error } = await supabase.from("tenants").insert({
          id: newTenant.id,
          profile_id: tenant.profile_id,
          property_id: tenant.property_id,
          owner_id: "owner-1",
          lease_start: tenant.lease_start,
          lease_end: tenant.lease_end,
          lease_type: tenant.lease_type,
          status: tenant.status
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

        return newTenant;
      } catch (err) {
        console.error("Error adding tenant to Supabase:", err);
      }
    }

    const tenants = getFromStorage("tenants", DEFAULT_TENANTS);
    if (targetProp) {
      targetProp.status = "occupied";
      targetProp.tenant_count = (targetProp.tenant_count || 0) + 1;
      const index = properties.findIndex(p => p.id === targetProp.id);
      if (index !== -1) {
        properties[index] = targetProp;
        setToStorage("properties", properties);
      }
    }
    setToStorage("tenants", [...tenants, newTenant]);
    
    const payments = getFromStorage("payments", DEFAULT_PAYMENTS);
    const newPayment: Payment = {
      id: "pay-" + generateId(),
      tenant_id: newTenant.id,
      property_id: newTenant.property_id,
      owner_id: "owner-1",
      amount: targetProp ? targetProp.monthly_rent : 100000,
      charges: 15000,
      total: (targetProp ? targetProp.monthly_rent : 100000) + 15000,
      month: "Jun",
      year: 2026,
      status: "pending",
      payment_method: "stripe",
      stripe_payment_id: null,
      payment_date: null,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      tenant_name: newTenant.full_name || "Locataire inconnu",
      property_name: targetProp ? targetProp.name : "Propriété inconnue"
    };
    setToStorage("payments", [newPayment, ...payments]);

    return newTenant;
  },

  // Payments
  getPayments: async (): Promise<Payment[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select(`
            *,
            tenants:tenant_id (
              profiles:profile_id (*)
            ),
            properties:property_id (*)
          `)
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) {
          const rows = data as unknown as DBPaymentRow[];
          return rows.map((p) => {
            const tenantProfile = p.tenants?.profiles;
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
              tenant_name: tenantProfile?.full_name || "Locataire inconnu",
              property_name: p.properties?.name || "Propriété inconnue"
            } as Payment;
          });
        }
      } catch (err) {
        console.error("Error fetching payments from Supabase:", err);
      }
    }
    return getFromStorage("payments", DEFAULT_PAYMENTS);
  },
  addPayment: async (payment: Omit<Payment, "id" | "owner_id" | "created_at" | "total" | "stripe_payment_id" | "payment_date" | "tenant_name" | "property_name">): Promise<Payment> => {
    const tenants = await db.getTenants();
    const properties = await db.getProperties();
    const tenant = tenants.find(t => t.id === payment.tenant_id);
    const property = properties.find(p => p.id === payment.property_id);

    const newPayment: Payment = {
      ...payment,
      id: "pay-" + generateId(),
      owner_id: "owner-1",
      total: payment.amount + payment.charges,
      stripe_payment_id: null,
      payment_date: payment.status === "paid" ? new Date().toISOString().split('T')[0] : null,
      created_at: new Date().toISOString(),
      tenant_name: tenant ? tenant.full_name : "Locataire inconnu",
      property_name: property ? property.name : "Propriété inconnue"
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("payments").insert({
          id: newPayment.id,
          tenant_id: newPayment.tenant_id,
          property_id: newPayment.property_id,
          owner_id: "owner-1",
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
        return newPayment;
      } catch (err) {
        console.error("Error adding payment to Supabase:", err);
      }
    }

    const payments = getFromStorage("payments", DEFAULT_PAYMENTS);
    setToStorage("payments", [newPayment, ...payments]);
    return newPayment;
  },
  updatePayment: async (payment: Payment): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
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
      } catch (err) {
        console.error("Error updating payment in Supabase:", err);
      }
    }
    const payments = getFromStorage("payments", DEFAULT_PAYMENTS);
    const index = payments.findIndex(p => p.id === payment.id);
    if (index !== -1) {
      payments[index] = payment;
      setToStorage("payments", payments);
    }
  },

  // Leases
  getLeases: async (): Promise<Lease[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("leases")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (data) return data as Lease[];
      } catch (err) {
        console.error("Error fetching leases from Supabase:", err);
      }
    }
    return getFromStorage("leases", DEFAULT_LEASES);
  },
  addLease: async (lease: Omit<Lease, "id" | "owner_id" | "created_at">): Promise<Lease> => {
    const newLease: Lease = {
      ...lease,
      id: "lease-" + generateId(),
      owner_id: "owner-1",
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("leases").insert(newLease);
        if (error) throw error;
        return newLease;
      } catch (err) {
        console.error("Error adding lease to Supabase:", err);
      }
    }

    const leases = getFromStorage("leases", DEFAULT_LEASES);
    setToStorage("leases", [...leases, newLease]);
    return newLease;
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
      }
    }
    return getFromStorage("incidents", DEFAULT_INCIDENTS);
  },
  addIncident: async (incident: Omit<Incident, "id" | "created_at" | "resolved_at">): Promise<Incident> => {
    const newIncident: Incident = {
      ...incident,
      id: "inc-" + generateId(),
      created_at: new Date().toISOString(),
      resolved_at: null
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("incidents").insert(newIncident);
        if (error) throw error;
        return newIncident;
      } catch (err) {
        console.error("Error adding incident to Supabase:", err);
      }
    }

    const incidents = getFromStorage("incidents", DEFAULT_INCIDENTS);
    setToStorage("incidents", [newIncident, ...incidents]);
    return newIncident;
  },
  updateIncident: async (incident: Incident): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("incidents")
          .update(incident)
          .eq("id", incident.id);
        if (error) throw error;
      } catch (err) {
        console.error("Error updating incident in Supabase:", err);
      }
    }
    const incidents = getFromStorage("incidents", DEFAULT_INCIDENTS);
    const index = incidents.findIndex(i => i.id === incident.id);
    if (index !== -1) {
      incidents[index] = incident;
      setToStorage("incidents", incidents);
    }
  },

  // Calculate stats in real-time
  getStats: async (): Promise<DashboardStats> => {
    const properties = await db.getProperties();
    const tenants = await db.getTenants();
    const payments = await db.getPayments();

    const total_properties = properties.length;
    const total_tenants = tenants.length;

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
      occupancy_rate
    };
  }
};
