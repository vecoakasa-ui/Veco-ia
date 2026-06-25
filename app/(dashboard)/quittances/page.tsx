"use client";

import { useEffect, useState, useRef } from "react";
import { Download, Search, X, Eye, FileText } from "lucide-react";
import { db } from "@/lib/store";
import { Payment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function QuittancesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only get paid payments to generate quittances
    const loadQuittances = async () => {
      const allPayments = await db.getPayments();
      setPayments(allPayments.filter(p => p.status === "paid"));
    };
    loadQuittances();
  }, []);

  const filtered = payments.filter(p => 
    (p.tenant_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (p.property_name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const handleDownloadPDF = async (payment: Payment) => {
    // Dynamic import to avoid Next.js SSR issues with html2pdf
    const html2pdf = (await import("html2pdf.js")).default;
    
    // We need to render the receipt HTML temporarily if not in preview modal,
    // but the easiest way is to use the receiptRef if it's already open.
    // If it's not open, we can just open it.
    if (!selectedPayment || selectedPayment.id !== payment.id) {
      setSelectedPayment(payment);
      // Wait for modal to render
      setTimeout(() => generatePDF(payment), 500);
    } else {
      generatePDF(payment);
    }
  };

  const generatePDF = async (payment: Payment) => {
    const element = document.getElementById(`receipt-content-${payment.id}`);
    if (!element) return;
    
    const opt = {
      margin:       10,
      filename:     `Quittance_${payment.tenant_name?.replace(/\s+/g, '_')}_${payment.month}_${payment.year}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Générez et gérez les reçus</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Quittances de Loyer</h2>
        </div>
      </div>

      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ maxWidth: "400px" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher un locataire ou un bien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <tr>
                <th style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Locataire</th>
                <th style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Bien</th>
                <th style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Période</th>
                <th style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Montant payé</th>
                <th style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--gray-500)" }}>
                    Aucune quittance trouvée pour cette recherche.
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", fontWeight: 600 }}>{p.tenant_name}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>{p.property_name}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>{p.month} {p.year}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--primary-dark)" }}>{formatCurrency(p.total)}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => setSelectedPayment(p)} 
                        style={{ display: "flex", gap: "6px", alignItems: "center" }}
                      >
                        <Eye size={14} /> Aperçu
                      </button>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => handleDownloadPDF(p)} 
                        style={{ display: "flex", gap: "6px", alignItems: "center" }}
                      >
                        <Download size={14} /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <button className="btn btn-outline" onClick={() => setSelectedPayment(null)} style={{ background: "white" }}>
                <X size={16} /> Fermer
              </button>
            </div>

            {/* Receipt A4 Container */}
            <div style={{ flex: 1, overflowY: "auto", background: "var(--gray-100)", borderRadius: "8px", display: "flex", justifyContent: "center", padding: "32px 16px" }}>
              
              {/* Actual Receipt Content (A4 Proportions) */}
              <div 
                id={`receipt-content-${selectedPayment.id}`}
                style={{
                  background: "white",
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
                    <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)" }}>Veco Immo</span>
                  </div>
                </div>

                {/* Addresses */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>Propriétaire / Bailleur</h3>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "16px" }}>Agence Veco Immo</p>
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
                    Nous soussignés, <strong>Agence Veco Immo</strong>, déclarons avoir reçu de <strong>{selectedPayment.tenant_name}</strong> la somme de <strong>{formatCurrency(selectedPayment.total)}</strong> au titre du paiement du loyer et des charges pour le local situé à l'adresse du bien <strong>{selectedPayment.property_name}</strong>.
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
                      <span style={{ fontFamily: "cursive", fontSize: "24px", color: "var(--primary)" }}>Veco Immo</span>
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
    </div>
  );
}
