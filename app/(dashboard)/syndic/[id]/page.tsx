"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Banknote,
  Plus,
  ArrowLeft,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { db } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Property, Tenant } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

type Ticket = {
  id: string;
  tenant_id: string;
  property_id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  tenant?: Tenant;
  unit?: Property;
};

type SyndicCharge = {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  status: string;
  created_at: string;
};

type Apportionment = {
  id: string;
  charge_id: string;
  unit_id: string;
  tenant_id: string | null;
  amount_due: number;
  status: string;
  unit?: Property;
  tenant?: Tenant;
};

export default function SyndicDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [building, setBuilding] = useState<Property | null>(null);
  const [units, setUnits] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [charges, setCharges] = useState<SyndicCharge[]>([]);
  const [apportionments, setApportionments] = useState<Apportionment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [chargeTitle, setChargeTitle] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeDueDate, setChargeDueDate] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Get Building
      const { data: bData } = await supabase.from('properties').select('*').eq('id', id).single();
      if (bData) setBuilding(bData);

      // 2. Get Units
      const { data: uData } = await supabase.from('properties').select('*').eq('parent_id', id);
      if (uData) setUnits(uData);

      // 3. Get Tenants in these units
      if (uData && uData.length > 0) {
        const unitIds = uData.map((u: any) => u.id);
        const { data: tData } = await supabase.from('tenants').select('*').in('property_id', unitIds).eq('status', 'active');
        if (tData) setTenants(tData);
      }

      // 4. Get Charges
      const { data: cData } = await supabase.from('syndic_charges').select('*').eq('property_id', id).order('created_at', { ascending: false });
      if (cData) setCharges(cData);

      // 5. Get Apportionments (with unit details)
      if (cData && cData.length > 0) {
        const chargeIds = cData.map((c: any) => c.id);
        const { data: aData } = await supabase.from('syndic_apportionments').select(`
          *,
          unit:properties!unit_id(*),
          tenant:tenants!tenant_id(*)
        `).in('charge_id', chargeIds);
        
        if (aData) setApportionments(aData as any[]);
      }

      // 6. Get Tickets
      const allPropIds = [id];
      if (uData) {
        allPropIds.push(...uData.map((u: any) => u.id));
      }
      const { data: tkData } = await supabase.from('tickets').select(`
        *,
        tenant:tenants!tenant_id(*),
        unit:properties!property_id(*)
      `).in('property_id', allPropIds).order('created_at', { ascending: false });
      if (tkData) setTickets(tkData as any[]);

    } catch (error) {
      console.error("Error loading syndic details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('tickets').update({ status: newStatus }).eq('id', ticketId);
      if (error) throw error;
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Error updating ticket:", error);
      alert("Erreur lors de la mise à jour du ticket.");
    }
  };

  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeTitle || !chargeAmount || !chargeDueDate || units.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const amount = Number(chargeAmount);
      // Division par le nombre total d'unités
      const amountPerUnit = amount / units.length;
      
      const { data: { session } } = await supabase.auth.getSession();
      const ownerId = session?.user?.id;

      if (!ownerId) return;

      // 1. Create Charge
      const chargeId = "ch_" + Math.random().toString(36).substr(2, 9);
      const { error: chargeError } = await supabase.from('syndic_charges').insert({
        id: chargeId,
        property_id: id,
        owner_id: ownerId,
        title: chargeTitle,
        amount: amount,
        due_date: chargeDueDate,
        status: 'pending'
      });

      if (chargeError) throw chargeError;

      // 2. Create Apportionments for each unit
      const apps = units.map(unit => {
        // Find if unit has an active tenant
        const activeTenant = tenants.find(t => t.property_id === unit.id);
        
        return {
          id: "app_" + Math.random().toString(36).substr(2, 9),
          charge_id: chargeId,
          unit_id: unit.id,
          tenant_id: activeTenant ? activeTenant.id : null,
          amount_due: amountPerUnit,
          status: 'pending'
        };
      });

      const { error: appError } = await supabase.from('syndic_apportionments').insert(apps);
      if (appError) throw appError;

      // Reset form & reload
      setChargeTitle("");
      setChargeAmount("");
      setChargeDueDate("");
      setShowAddCharge(false);
      await loadData();

    } catch (error) {
      console.error("Failed to add charge:", error);
      alert("Erreur lors de l'ajout de la charge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getChargeProgress = (chargeId: string) => {
    const apps = apportionments.filter(a => a.charge_id === chargeId);
    if (apps.length === 0) return 0;
    const paid = apps.filter(a => a.status === 'paid').length;
    return Math.round((paid / apps.length) * 100);
  };

  if (isLoading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Chargement...</div>;
  }

  if (!building) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Immeuble introuvable.</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div className="syndic-header" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <Link href="/syndic" className="btn btn-ghost" style={{ padding: "8px" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 size={24} style={{ color: "var(--primary)" }} /> {building.name}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--gray-500)", marginTop: "4px" }}>
            <MapPin size={14} /> {building.address}, {building.city} &bull; {units.length} unités
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}
          onClick={() => setShowAddCharge(true)}
        >
          <Plus size={16} /> Ajouter une charge
        </button>
      </div>

      <div className="syndic-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}>
        {/* Left Column: Charges List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "700", margin: 0 }}>Historique des Charges</h3>
          
          {charges.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--gray-500)" }}>
              <Banknote size={32} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
              Aucune charge n'a encore été créée pour cet immeuble.
            </div>
          ) : (
            charges.map(charge => {
              const progress = getChargeProgress(charge.id);
              return (
                <div key={charge.id} className="card" style={{ padding: "0", overflow: "hidden" }}>
                  <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--gray-50)" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "var(--text-md)", fontWeight: "700" }}>{charge.title}</h4>
                      <span style={{ fontSize: "12px", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} /> Échéance : {new Date(charge.due_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--gray-900)" }}>
                        {formatCurrency(charge.amount)}
                      </div>
                      <span className={`badge ${progress === 100 ? 'badge-success' : progress > 0 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: "10px", marginTop: "4px" }}>
                        Recouvrement : {progress}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Répartitions / Locataires */}
                  <div style={{ padding: "var(--space-4)" }}>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--gray-500)", textTransform: "uppercase", marginBottom: "var(--space-3)", margin: 0 }}>Répartition par lot</p>
                    <div className="apportionment-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                      {apportionments.filter(a => a.charge_id === charge.id).map(app => (
                        <div key={app.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "white", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {app.status === 'paid' ? (
                              <CheckCircle size={16} style={{ color: "var(--success)" }} />
                            ) : (
                              <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid var(--gray-300)" }}></div>
                            )}
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-800)" }}>{app.unit?.name || 'Unité'}</div>
                              <div style={{ fontSize: "11px", color: "var(--gray-500)" }}>
                                {app.tenant ? app.tenant.full_name : 'Vacant (À la charge du bailleur)'}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--gray-900)" }}>
                            {formatCurrency(app.amount_due)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Info & Tickets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Summary Card */}
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "700", margin: "0 0 16px 0", color: "var(--gray-900)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "8px" }}>
              Résumé de l'immeuble
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--gray-500)" }}>Unités totales</span>
                <span style={{ fontWeight: "600" }}>{units.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--gray-500)" }}>Locataires actifs</span>
                <span style={{ fontWeight: "600" }}>{tenants.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--gray-500)" }}>Taux d'occupation</span>
                <span style={{ fontWeight: "600" }}>{units.length > 0 ? Math.round((tenants.length / units.length) * 100) : 0}%</span>
              </div>
            </div>
          </div>

          {/* Tickets Card */}
          <div className="card" style={{ padding: "var(--space-4)", borderColor: "var(--warning)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--gray-200)", paddingBottom: "8px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "700", margin: 0, color: "var(--gray-900)", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle size={16} style={{ color: "var(--warning)" }} /> Tickets (Pannes)
              </h3>
              <span className="badge badge-warning" style={{ fontSize: "10px" }}>{tickets.length}</span>
            </div>
            
            {tickets.length === 0 ? (
              <p style={{ fontSize: "12px", color: "var(--gray-500)", margin: 0, textAlign: "center", padding: "16px 0" }}>
                Aucun ticket signalé pour cet immeuble.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", maxHeight: "400px", overflowY: "auto" }}>
                {tickets.map(ticket => (
                  <div key={ticket.id} style={{ padding: "var(--space-3)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", background: "var(--gray-50)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "600" }}>{ticket.title}</h4>
                      <select 
                        value={ticket.status} 
                        onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                        style={{ fontSize: "11px", padding: "2px 4px", borderRadius: "4px", border: "1px solid var(--gray-300)" }}
                      >
                        <option value="open">Ouvert</option>
                        <option value="in_progress">En cours</option>
                        <option value="resolved">Résolu</option>
                      </select>
                    </div>
                    <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--gray-600)" }}>{ticket.description}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--gray-500)" }}>
                      <span>Par: {ticket.tenant?.full_name || 'Locataire'} ({ticket.unit?.name || 'Unité'})</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Charge Modal */}
      {showAddCharge && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "400px", padding: "var(--space-6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", margin: 0 }}>Nouvelle Charge Syndic</h3>
              <button onClick={() => setShowAddCharge(false)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddCharge} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Libellé de la charge</label>
                <input type="text" className="input" required placeholder="Ex: Gardiennage Octobre" value={chargeTitle} onChange={e => setChargeTitle(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Montant Total (FCFA)</label>
                <input type="number" className="input" required placeholder="Ex: 100000" value={chargeAmount} onChange={e => setChargeAmount(e.target.value)} />
                <span style={{ fontSize: "11px", color: "var(--gray-500)", marginTop: "4px" }}>
                  Ce montant sera divisé par {units.length} (nombre de lots).
                </span>
              </div>
              <div className="input-group">
                <label className="input-label">Date limite de paiement</label>
                <input type="date" className="input" required value={chargeDueDate} onChange={e => setChargeDueDate(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddCharge(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? "Création..." : "Créer et Répartir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Style overrides for responsive layout */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .syndic-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .syndic-header > div:nth-child(2) {
            margin-bottom: 8px;
            width: 100%;
          }
          .syndic-header .btn-primary {
            margin-left: 0 !important;
            width: 100%;
            justify-content: center;
          }
          .syndic-grid {
            grid-template-columns: 1fr !important;
          }
          .apportionment-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
