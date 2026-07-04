"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
  Filter,
  ArrowUpRight,
  ChevronRight,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { db } from "@/lib/store";
import { Payment, Tenant } from "@/lib/types";
import { formatCurrency, formatDate, getPaymentStatusClass, getPaymentStatusLabel } from "@/lib/utils";
import Link from "next/link";

export default function PaiementsLocatairePage() {
  const params = useParams();
  const tenantId = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "upcoming" | "late">("all");

  const loadData = async () => {
    setLoading(true);
    
    const profile = await db.getProfile();
    if (!profile) {
      setLoading(false);
      return;
    }

    const allTenants = await db.getTenants();
    let currentTenant = allTenants.find(t => t.profile_id === profile.id);
    
    if (!currentTenant) {
      currentTenant = {
        id: "temp-" + profile.id,
        profile_id: profile.id,
        property_id: "",
        owner_id: "",
        lease_start: "",
        lease_end: "",
        lease_type: "residential",
        status: "active",
        created_at: new Date().toISOString(),
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        property_name: "Aucun logement assigné"
      };
    }
    setTenant(currentTenant);

    if (currentTenant && currentTenant.property_id) {
      const allPayments = await db.getPayments();
      // Only keep payments for this tenant
      const tenantPayments = allPayments.filter(p => p.tenant_id === currentTenant?.id);
      
      // Sort by due date (most recent first)
      tenantPayments.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
      
      setPayments(tenantPayments);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const filteredPayments = useMemo(() => {
    if (statusFilter === "all") return payments;
    return payments.filter(p => p.status === statusFilter);
  }, [payments, statusFilter]);

  const upcomingPayments = payments.filter(p => p.status === "upcoming" || p.status === "late");
  const upcomingTotal = upcomingPayments.reduce((sum, p) => sum + p.total, 0);
  
  const latePayments = payments.filter(p => p.status === "late");
  const lateTotal = latePayments.reduce((sum, p) => sum + p.total, 0);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
        <Loader2 size={48} className="animate-spin" style={{ color: "var(--primary)" }} />
        <h3 style={{ color: "var(--gray-600)" }}>Chargement de vos paiements...</h3>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
        <AlertTriangle size={48} style={{ color: "var(--warning)" }} />
        <h3>Locataire introuvable</h3>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, margin: "0 0 8px 0", color: "var(--gray-900)", display: "flex", alignItems: "center", gap: "12px" }}>
            <Wallet size={32} style={{ color: "var(--primary)" }} />
            Mes Paiements
          </h1>
          <p style={{ fontSize: "var(--text-md)", color: "var(--gray-600)", margin: 0 }}>
            Gérez vos loyers, consultez votre historique et téléchargez vos quittances.
          </p>
        </div>
        
        {upcomingPayments.length > 0 && (
          <Link href={`/pay/${upcomingPayments[upcomingPayments.length - 1].id}`} className="btn btn-primary" style={{ padding: "12px 24px", fontSize: "16px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "8px" }}>
            Payer le loyer <ArrowUpRight size={18} />
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-6)" }}>
        
        {/* Next Payment Card */}
        <div className="card hover-scale" style={{ background: "linear-gradient(135deg, #009E60 0%, #007A4B 100%)", color: "white", padding: "var(--space-6)", border: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 25px -5px rgba(0, 158, 96, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                <Wallet size={24} style={{ color: "var(--white)" }} />
              </div>
              <div>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "rgba(255,255,255,0.8)", display: "block", textTransform: "uppercase", letterSpacing: "1px" }}>Reste à payer</span>
              </div>
            </div>
            {lateTotal > 0 ? (
              <span className="badge badge-danger" style={{ border: "none", fontWeight: 800 }}>En retard</span>
            ) : upcomingTotal > 0 ? (
              <span className="badge badge-warning" style={{ border: "none", fontWeight: 800 }}>À venir</span>
            ) : (
              <span className="badge" style={{ background: "var(--primary)", color: "white", border: "none", fontWeight: 800 }}>À jour</span>
            )}
          </div>
          
          <div>
            <h2 style={{ fontSize: "42px", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-1px", color: "var(--primary)" }}>{formatCurrency(upcomingTotal)}</h2>
            {upcomingPayments.length > 0 ? (
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-sm)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} /> Pour {upcomingPayments.length} échéance(s)
              </p>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-sm)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={14} /> Aucun loyer en attente
              </p>
            )}
          </div>
        </div>

        {/* Retard Card (if any) */}
        {lateTotal > 0 && (
          <div className="card hover-scale" style={{ background: "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)", color: "white", padding: "var(--space-6)", border: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                  <AlertCircle size={24} style={{ color: "var(--white)" }} />
                </div>
                <div>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "rgba(255,255,255,0.8)", display: "block", textTransform: "uppercase", letterSpacing: "1px" }}>Impayés</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 style={{ fontSize: "42px", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-1px" }}>{formatCurrency(lateTotal)}</h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-sm)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle size={14} /> {latePayments.length} loyer(s) en retard
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Main List Area */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        
        {/* Filters & Header */}
        <div style={{ padding: "var(--space-5)", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)", background: "var(--gray-50)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "10px", color: "var(--gray-800)" }}>
            <FileText size={20} style={{ color: "var(--primary)" }} /> Historique Complet
          </h3>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            <Filter size={16} style={{ color: "var(--gray-500)", marginRight: "4px" }} />
            {(["all", "paid", "upcoming", "late"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  border: statusFilter === status ? "none" : "1px solid var(--gray-200)",
                  background: statusFilter === status ? "var(--primary)" : "var(--white)",
                  color: statusFilter === status ? "white" : "var(--gray-600)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap"
                }}
              >
                {status === "all" ? "Tous" : getPaymentStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Payments List */}
        <div style={{ display: "flex", flexDirection: "column", background: "var(--white)" }}>
          {filteredPayments.length === 0 ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--gray-500)" }}>
              <div style={{ background: "var(--gray-100)", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-4) auto" }}>
                <FileText size={24} style={{ color: "var(--gray-400)" }} />
              </div>
              <h4 style={{ fontWeight: 600, color: "var(--gray-700)", margin: "0 0 4px 0" }}>Aucun paiement trouvé</h4>
              <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>Il n'y a pas de paiements correspondant à ce filtre.</p>
            </div>
          ) : (
            filteredPayments.map((payment, index) => (
              <div 
                key={payment.id} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  padding: "var(--space-4) var(--space-5)", 
                  borderBottom: index < filteredPayments.length - 1 ? "1px solid var(--gray-100)" : "none",
                  transition: "background 0.2s",
                  flexWrap: "wrap",
                  gap: "var(--space-4)"
                }}
                className="hover-bg-gray-50"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", minWidth: "200px" }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "var(--radius-md)", 
                    background: payment.status === 'paid' ? "var(--success-lightest)" : payment.status === 'late' ? "var(--danger-lightest)" : "var(--warning-lightest)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: payment.status === 'paid' ? "var(--success)" : payment.status === 'late' ? "var(--danger)" : "var(--warning-dark)"
                  }}>
                    {payment.status === 'paid' ? <CheckCircle2 size={24} /> : payment.status === 'late' ? <AlertCircle size={24} /> : <Clock size={24} />}
                  </div>
                  
                  <div>
                    <h4 style={{ fontWeight: 800, margin: "0 0 4px 0", fontSize: "var(--text-md)", color: "var(--gray-900)" }}>
                      Loyer {payment.month} {payment.year}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--gray-500)" }}>
                      <span className={`badge ${getPaymentStatusClass(payment.status)}`} style={{ padding: "2px 8px", fontSize: "11px" }}>
                        {getPaymentStatusLabel(payment.status)}
                      </span>
                      {payment.payment_date ? (
                        <span>• Payé le {formatDate(payment.payment_date)}</span>
                      ) : (
                        <span>• Échéance : {formatDate(payment.due_date)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: "var(--text-lg)", color: "var(--primary)" }}>
                      {formatCurrency(payment.total)}
                    </div>
                    {payment.charges > 0 && (
                      <div style={{ fontSize: "12px", color: "var(--gray-400)" }}>
                        dont {formatCurrency(payment.charges)} de charges
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    {(payment.status === "upcoming" || payment.status === "late") && (
                      <Link href={`/pay/${payment.id}`} className="btn btn-primary btn-sm" style={{ padding: "8px 16px", borderRadius: "var(--radius-lg)" }}>
                        Payer
                      </Link>
                    )}
                    
                    {payment.status === "paid" && (
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ padding: "8px 16px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "6px" }}
                        onClick={() => alert("Génération de votre quittance PDF en cours...")}
                      >
                        <Download size={16} /> Quittance
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .hover-bg-gray-50:hover {
          background-color: var(--gray-50);
        }
      `}</style>
    </div>
  );
}
