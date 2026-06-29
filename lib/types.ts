// ============================================
// VENANCE IMO — TypeScript Type Definitions
// ============================================

export type UserRole = 'owner' | 'tenant' | 'admin';
export type SubscriptionPlan = 'free' | 'pro' | 'business';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar_url: string | null;
  subscription_plan: SubscriptionPlan;
  is_suspended?: boolean;
  created_at: string;
  next_billing_date?: string; // Added for SaaS subscriptions
}

export type SubStatus = 'active' | 'late' | 'suspended';

export interface SubscriptionRecord {
  id: string;
  profile_id: string;
  plan: SubscriptionPlan;
  status: SubStatus;
  amount: number;
  next_billing_date: string;
  last_payment_date?: string;
  profile?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface Landlord {
  id: string;
  owner_id: string; // The platform user who manages this landlord
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  commission_rate: number; // e.g. 10 for 10%
  created_at: string;
  property_count?: number;
}

export type PropertyType = 'apartment' | 'studio' | 'villa' | 'house';
export type PropertyStatus = 'occupied' | 'vacant' | 'maintenance';

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  country: string;
  monthly_rent: number;
  status: PropertyStatus;
  description: string;
  images: string[];
  is_validated: boolean;
  created_at: string;
  landlord_id?: string;
  landlord_name?: string;
  tenant_count?: number;
  lat?: number;
  lng?: number;
}

export type PaymentStatus = 'paid' | 'pending' | 'late' | 'upcoming';
export type PaymentMethod = 'stripe' | 'orange_money' | 'mtn' | 'cash' | 'paydunya' | 'wave';

export interface Payment {
  id: string;
  tenant_id: string;
  property_id: string;
  owner_id: string;
  amount: number;
  charges: number;
  total: number;
  month: string;
  year: number;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  stripe_payment_id: string | null;
  payment_date: string | null;
  due_date: string;
  created_at: string;
  tenant_name?: string;
  tenant_avatar?: string;
  property_name?: string;
}

export type ExpenseCategory = 'maintenance' | 'tax' | 'admin' | 'insurance' | 'payout' | 'other';

export interface Expense {
  id: string;
  owner_id: string; // The platform user
  property_id?: string; // Optional: linked property
  landlord_id?: string; // Optional: linked landlord
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  created_at: string;
  receipt_url?: string;
  property_name?: string;
  landlord_name?: string;
}

export type LeaseStatus = 'active' | 'expired' | 'terminated';
export type DepositStatus = 'held' | 'refunded' | 'partially_refunded' | 'pending';
export type InventoryStatus = 'pending' | 'completed';

export interface Lease {
  id: string;
  tenant_id: string;
  property_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  deposit_status?: DepositStatus;
  deposit_returned?: number; // How much was returned
  deposit_deductions?: number; // How much was deducted for repairs
  inventory_in_status?: InventoryStatus;
  inventory_in_date?: string;
  inventory_in_video_url?: string;
  inventory_out_status?: InventoryStatus;
  inventory_out_date?: string;
  inventory_out_video_url?: string;
  document_url: string | null;
  status: LeaseStatus;
  created_at: string;
  tenant_name?: string;
  property_name?: string;
}

export type IncidentPriority = 'low' | 'medium' | 'high' | 'urgent';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  tenant_id: string;
  property_id: string;
  title: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  images: string[];
  created_at: string;
  resolved_at: string | null;
}



export interface Receipt {
  id: string;
  payment_id: string;
  tenant_id: string;
  property_id: string;
  receipt_number: string;
  pdf_url: string;
  generated_at: string;
}

export interface Tenant {
  id: string;
  profile_id: string;
  property_id: string;
  owner_id: string;
  lease_start: string;
  lease_end: string;
  lease_type: 'residential' | 'commercial';
  status: 'active' | 'ended';
  created_at: string;
  // Joined fields
  full_name?: string;
  email?: string;
  phone?: string;
  property_name?: string;
  avatar_url?: string;
}

export interface DashboardStats {
  total_properties: number;
  total_tenants: number;
  total_revenue: number;
  late_payments: number;
  occupancy_rate: number;
}

export interface PricingPlan {
  name: string;
  price: number;
  annual_price: number;
  features: string[];
  popular?: boolean;
  cta: string;
}

// Navigation items
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}
