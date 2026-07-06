"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { 
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
  Filter,
  ArrowUpRight,
  Loader2,
  AlertTriangle,
  X
} from "lucide-react";
import { db } from "@/lib/store";
import { Payment, Tenant } from "@/lib/types";
import { formatCurrency, formatDate, getPaymentStatusClass, getPaymentStatusLabel } from "@/lib/utils";
import Link from "next/link";

export default function PaiementsLocatairePage() {
  const params = useParams();
  
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "upcoming" | "late">("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const generatePDF = async (payment: Payment) => {
    const element = document.getElementById(`receipt-content-${payment.id}`);
    if (!element) return;
    
    const opt = {
      margin:       10,
      filename:     `Quittance_Loyer_${payment.month}_${payment.year}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().set(opt).from(element).save();
  };

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
              <span className="badge" style={{ background: "var(--orange)", color: "white", border: "none", fontWeight: 800 }}>À jour</span>
            )}
          </div>
          
          <div>
            <h2 style={{ fontSize: "42px", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-1px", color: "var(--orange)" }}>{formatCurrency(upcomingTotal)}</h2>
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
                    <div style={{ fontWeight: 800, fontSize: "var(--text-lg)", color: "var(--orange)" }}>
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
                        onClick={() => setSelectedPayment(payment)}
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
      
      {selectedPayment && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "var(--space-4)",
            backdropFilter: "blur(4px)"
          }}
          className="animate-fade-in"
          onClick={() => setSelectedPayment(null)}
        >
          <div 
            className="animate-scale-in"
            style={{
              width: "100%",
              maxWidth: "800px",
              height: "90vh",
              display: "flex",
              flexDirection: "column",
              background: "transparent",
              gap: "16px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="btn btn-primary" onClick={() => generatePDF(selectedPayment)} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Download size={16} /> Télécharger le PDF
              </button>
              <button className="btn btn-outline" onClick={() => setSelectedPayment(null)} style={{ background: 'var(--white)' }}>
                <X size={16} /> Fermer
              </button>
            </div>

            {/* Receipt A4 Container */}
            <div style={{ flex: 1, overflowY: "auto", background: "var(--gray-100)", borderRadius: "8px", display: "flex", justifyContent: "center", padding: "32px 16px" }}>
              
              {/* Actual Receipt Content (A4 Proportions) */}
              <div 
                id={`receipt-content-${selectedPayment.id}`}
                style={{
                  background: 'var(--white)',
                  width: "210mm",
                  minHeight: "297mm",
                  padding: "40px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  color: "#000",
                  fontFamily: "Arial, sans-serif"
                }}
              >
                {/* Receipt Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #f0f0f0", paddingBottom: "20px", marginBottom: "30px" }}>
                  <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a1a", margin: "0 0 8px 0" }}>QUITTANCE DE LOYER</h1>
                    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Reçu généré le {new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "40px", height: "40px", background: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={24} color="white" />
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)" }}>Vision Immo 2.0</span>
                  </div>
                </div>

                {/* Addresses */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>Propriétaire / Bailleur</h3>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "16px" }}>Vision Immo 2.0</p>
                    <p style={{ margin: 0, color: "#444", fontSize: "14px" }}>Cocody, Abidjan</p>
                    <p style={{ margin: 0, color: "#444", fontSize: "14px" }}>contact@veco-ia.com</p>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>Locataire</h3>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "16px" }}>{selectedPayment.tenant_name}</p>
                    <p style={{ margin: 0, color: "#444", fontSize: "14px" }}>{selectedPayment.property_name}</p>
                  </div>
                </div>

                {/* Receipt Details */}
                <div style={{ marginBottom: "40px" }}>
                  <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#333" }}>
                    Nous soussignés, <strong>Vision Immo 2.0</strong>, déclarons avoir reçu de <strong>{selectedPayment.tenant_name}</strong> la somme de <strong>{formatCurrency(selectedPayment.amount)}</strong> au titre du paiement du loyer pour le local situé à l'adresse du bien <strong>{selectedPayment.property_name}</strong>.
                  </p>
                </div>

                {/* Amount Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "2px solid #ddd", color: "#555" }}>Description</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "2px solid #ddd", color: "#555" }}>Période</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", borderBottom: "2px solid #ddd", color: "#555" }}>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "16px", borderBottom: "1px solid #eee", color: "#333" }}>Loyer de base</td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #eee", color: "#333", textTransform: "capitalize" }}>{selectedPayment.month} {selectedPayment.year}</td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #eee", textAlign: "right", color: "#333" }}>{formatCurrency(selectedPayment.amount)}</td>
                    </tr>
                    {selectedPayment.charges > 0 && (
                      <tr>
                        <td style={{ padding: "16px", borderBottom: "1px solid #eee", color: "#333" }}>Charges récupérables</td>
                        <td style={{ padding: "16px", borderBottom: "1px solid #eee", color: "#333", textTransform: "capitalize" }}>{selectedPayment.month} {selectedPayment.year}</td>
                        <td style={{ padding: "16px", borderBottom: "1px solid #eee", textAlign: "right", color: "#333" }}>{formatCurrency(selectedPayment.charges)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={2} style={{ padding: "16px", textAlign: "right", fontWeight: "bold", fontSize: "16px", color: "#111" }}>TOTAL PAYÉ</td>
                      <td style={{ padding: "16px", textAlign: "right", fontWeight: "bold", fontSize: "18px", color: "var(--primary-dark)" }}>{formatCurrency(selectedPayment.total)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer / Signature */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "60px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#666" }}>Mode de paiement : <strong style={{ textTransform: "capitalize", color: "#333" }}>{selectedPayment.payment_method?.replace("_", " ")}</strong></p>
                    <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>Date du règlement : <strong style={{ color: "#333" }}>{selectedPayment.payment_date ? new Date(selectedPayment.payment_date).toLocaleDateString('fr-FR') : '-'}</strong></p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#333", fontWeight: "bold" }}>Le Bailleur / Le Mandataire</p>
                    <div style={{ width: "160px", height: "60px", borderBottom: "1px dashed #ccc", margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "8px" }}>
                      <span style={{ fontFamily: "cursive", fontSize: "24px", color: "var(--primary)" }}>Vision Immo 2.0</span>
                    </div>
                  </div>
                </div>

                {/* Legal note */}
                <div style={{ marginTop: "80px", paddingTop: "20px", borderTop: "1px solid #eee", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "#999", margin: 0 }}>
                    Cette quittance annule tous les reçus qui auraient pu être donnés pour acompte versé sur le présent terme, même si ces reçus portent une date postérieure à la date ci-contre. Le paiement de la présente quittance ne présume pas du paiement des termes précédents.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .hover-bg-gray-50:hover {
          background-color: var(--gray-50);
        }
      `}</style>
    </div>
  );
}
