"use client";

import { Property, Tenant, Payment, Lease, Incident, Profile, DashboardStats } from "./types";
import { generateId } from "./utils";

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
  reset: () => {
    if (typeof window === "undefined") return;
    localStorage.clear();
    location.reload();
  },

  // Profile
  getProfile: (): Profile => getFromStorage("profile", DEFAULT_PROFILE),
  updateProfile: (profile: Profile) => setToStorage("profile", profile),

  // Properties
  getProperties: (): Property[] => getFromStorage("properties", DEFAULT_PROPERTIES),
  addProperty: (property: Omit<Property, "id" | "owner_id" | "created_at" | "is_validated">): Property => {
    const properties = db.getProperties();
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
    setToStorage("properties", [...properties, newProperty]);
    return newProperty;
  },
  updateProperty: (property: Property) => {
    const properties = db.getProperties();
    const index = properties.findIndex(p => p.id === property.id);
    if (index !== -1) {
      properties[index] = property;
      setToStorage("properties", properties);
    }
  },

  // Tenants
  getTenants: (): Tenant[] => getFromStorage("tenants", DEFAULT_TENANTS),
  addTenant: (tenant: Omit<Tenant, "id" | "owner_id" | "created_at">): Tenant => {
    const tenants = db.getTenants();
    const properties = db.getProperties();
    const targetProp = properties.find(p => p.id === tenant.property_id);
    
    const newTenant: Tenant = {
      ...tenant,
      id: "tenant-" + generateId(),
      owner_id: "owner-1",
      created_at: new Date().toISOString(),
      property_name: targetProp ? targetProp.name : ""
    };

    // Update tenant count and status on property
    if (targetProp) {
      targetProp.status = "occupied";
      targetProp.tenant_count = (targetProp.tenant_count || 0) + 1;
      db.updateProperty(targetProp);
    }

    setToStorage("tenants", [...tenants, newTenant]);
    
    // Automatically generate first payment
    db.addPayment({
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
  },

  // Payments
  getPayments: (): Payment[] => getFromStorage("payments", DEFAULT_PAYMENTS),
  addPayment: (payment: Omit<Payment, "id" | "owner_id" | "created_at" | "total" | "stripe_payment_id" | "payment_date" | "tenant_name" | "property_name">): Payment => {
    const payments = db.getPayments();
    const tenants = db.getTenants();
    const properties = db.getProperties();
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
    setToStorage("payments", [newPayment, ...payments]);
    return newPayment;
  },
  updatePayment: (payment: Payment) => {
    const payments = db.getPayments();
    const index = payments.findIndex(p => p.id === payment.id);
    if (index !== -1) {
      payments[index] = payment;
      setToStorage("payments", payments);
    }
  },

  // Leases
  getLeases: (): Lease[] => getFromStorage("leases", DEFAULT_LEASES),
  addLease: (lease: Omit<Lease, "id" | "owner_id" | "created_at">): Lease => {
    const leases = db.getLeases();
    const newLease: Lease = {
      ...lease,
      id: "lease-" + generateId(),
      owner_id: "owner-1",
      created_at: new Date().toISOString()
    };
    setToStorage("leases", [...leases, newLease]);
    return newLease;
  },

  // Incidents
  getIncidents: (): Incident[] => getFromStorage("incidents", DEFAULT_INCIDENTS),
  addIncident: (incident: Omit<Incident, "id" | "created_at" | "resolved_at">): Incident => {
    const incidents = db.getIncidents();
    const newIncident: Incident = {
      ...incident,
      id: "inc-" + generateId(),
      created_at: new Date().toISOString(),
      resolved_at: null
    };
    setToStorage("incidents", [newIncident, ...incidents]);
    return newIncident;
  },
  updateIncident: (incident: Incident) => {
    const incidents = db.getIncidents();
    const index = incidents.findIndex(i => i.id === incident.id);
    if (index !== -1) {
      incidents[index] = incident;
      setToStorage("incidents", incidents);
    }
  },

  // Calculate stats in real-time
  getStats: (): DashboardStats => {
    const properties = db.getProperties();
    const tenants = db.getTenants();
    const payments = db.getPayments();

    const total_properties = properties.length;
    const total_tenants = tenants.length;

    // Calculate revenue (sum of payments with status "paid")
    const total_revenue = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.total, 0);

    // Calculate late payments count
    const late_payments = payments.filter(p => p.status === "late").length;

    // Occupancy rate = (occupied properties / total properties) * 100
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
