"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  FileText,
  Download,
  Search,
  X,
  Loader2
} from "lucide-react";
import { db } from "@/lib/store";
import { Payment, Tenant } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TenantQuittancesPage() {
  const params = useParams();
  

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const loadData = async () => {
    setLoading(true);
    
    const profile = await db.getProfile();
    if (!profile) {
      setLoading(false);
      return;
    }

    const allTenants = await db.getTenants();
    const currentTenant = allTenants.find(t => t.profile_id === profile.id || (t.email && profile.email && t.email.toLowerCase() === profile.email.toLowerCase()));
    setTenant(currentTenant || null);

    if (currentTenant && currentTenant.id) {
      const allPayments = await db.getPayments();
      // Only keep paid payments for this tenant
      const tenantPayments = allPayments.filter(p => p.tenant_id === currentTenant.id && p.status === "paid");
      
      // Sort by payment date or due date
      tenantPayments.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
      
      setPayments(tenantPayments);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
     
  }, [params.id]);

  const filteredPayments = payments.filter(p => 
    (p.month?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (p.year?.toString() || "").includes(search.toLowerCase())
  );

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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
        <Loader2 size={48} className="animate-spin" style={{ color: "var(--primary)" }} />
        <h3 style={{ color: "var(--gray-600)" }}>Chargement de vos quittances...</h3>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, margin: "0 0 8px 0", color: "var(--gray-900)", display: "flex", alignItems: "center", gap: "12px" }}>
            <FileText size={32} style={{ color: "var(--primary)" }} />
            Mes Quittances
          </h1>
          <p style={{ fontSize: "var(--text-md)", color: "var(--gray-600)", margin: 0 }}>
            Consultez et téléchargez les reçus de vos loyers payés.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ maxWidth: "400px" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher par mois ou année..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Main List Area */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", background: "var(--white)" }}>
          {filteredPayments.length === 0 ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--gray-500)" }}>
              <div style={{ background: "var(--gray-100)", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-4) auto" }}>
                <FileText size={24} style={{ color: "var(--gray-400)" }} />
              </div>
              <h4 style={{ fontWeight: 600, color: "var(--gray-700)", margin: "0 0 4px 0" }}>Aucune quittance trouvée</h4>
              <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>Vous n'avez pas de reçus disponibles pour le moment.</p>
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
                    background: "var(--success-lightest)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: "var(--success)"
                  }}>
                    <FileText size={24} />
                  </div>
                  
                  <div>
                    <h4 style={{ fontWeight: 800, margin: "0 0 4px 0", fontSize: "var(--text-md)", color: "var(--gray-900)" }}>
                      Quittance - {payment.month} {payment.year}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--gray-500)" }}>
                      <span className="badge badge-success" style={{ padding: "2px 8px", fontSize: "11px", border: "none", color: "var(--success)" }}>
                        Payé
                      </span>
                      <span>• Le {formatDate(payment.payment_date || payment.due_date)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: "var(--text-lg)", color: "var(--success-dark)" }}>
                      {formatCurrency(payment.total)}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button 
                      className="btn btn-primary btn-sm" 
                      style={{ padding: "8px 16px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "6px" }}
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <Download size={16} /> Télécharger
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* ============================================
         Preview Modal
         ============================================ */}
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
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "16px" }}>{selectedPayment.tenant_name || (tenant && tenant.full_name)}</p>
                    <p style={{ margin: 0, color: "#444", fontSize: "14px" }}>{selectedPayment.property_name || (tenant && tenant.property_name)}</p>
                  </div>
                </div>

                {/* Receipt Details */}
                <div style={{ marginBottom: "40px" }}>
                  <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#333" }}>
                    Nous soussignés, <strong>Vision Immo 2.0</strong>, déclarons avoir reçu de <strong>{selectedPayment.tenant_name || (tenant && tenant.full_name)}</strong> la somme de <strong>{formatCurrency(selectedPayment.total)}</strong> au titre du paiement du loyer pour le local situé à l'adresse du bien <strong>{selectedPayment.property_name || (tenant && tenant.property_name)}</strong>.
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
                    <tr>
                      <td colSpan={2} style={{ padding: "16px", textAlign: "right", fontWeight: "bold", fontSize: "16px", color: "#111" }}>TOTAL PAYÉ</td>
                      <td style={{ padding: "16px", textAlign: "right", fontWeight: "bold", fontSize: "18px", color: "var(--primary-dark)" }}>{formatCurrency(selectedPayment.amount)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer / Signature */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "60px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#666" }}>Mode de paiement : <strong style={{ textTransform: "capitalize", color: "#333" }}>{selectedPayment.payment_method?.replace("_", " ") || "En ligne"}</strong></p>
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
