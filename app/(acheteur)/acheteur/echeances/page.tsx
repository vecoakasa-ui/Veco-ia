"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Download,
  ChevronRight,
  FileText,
  X
} from "lucide-react";
import { db } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { SaleInstallment, Property, Sale } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function AcheteurEcheances() {
  const [installments, setInstallments] = useState<SaleInstallment[]>([]);
  const [salesMap, setSalesMap] = useState<Record<string, Sale>>({});
  const [propsMap, setPropsMap] = useState<Record<string, Property>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedInst, setSelectedInst] = useState<SaleInstallment | null>(null);

  const generatePDF = async (inst: SaleInstallment) => {
    const element = document.getElementById(`receipt-content-${inst.id}`);
    if (!element) return;
    
    const opt = {
      margin:       10,
      filename:     `Recu_Echeance_${inst.id}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { sales, properties, installments } = await db.getAcheteurDashboardData();
        
        const pMap: Record<string, Property> = {};
        Object.values(properties).forEach(p => pMap[p.id] = p);
        setPropsMap(pMap);

        const sMap: Record<string, Sale> = {};
        sales.forEach(s => sMap[s.id] = s);
        setSalesMap(sMap);
        
        setInstallments(installments);
      } catch (error) {
        console.error("Error loading installments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePay = async (inst: SaleInstallment) => {
    setIsProcessingPayment(true);
    
    try {
      const sale = salesMap[inst.sale_id];
      const propertyName = propsMap?.[sale?.property_id]?.name || "Acquisition immobilière";
      
      const res = await fetch("/api/paydunya/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: inst.id,
          tenantName: sale?.buyer_name || "Acheteur", // Reusing field for buyer
          propertyName: propertyName,
          month: "Échéance",
          year: new Date(inst.due_date).getFullYear(),
          amount: inst.amount
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur d'initialisation du paiement");
      }

      if (data.url) {
        window.location.assign(data.url);
      } else {
        alert("Une erreur est survenue lors de la création du lien de paiement.");
        setIsProcessingPayment(false);
      }
    } catch (error: any) {
      alert(error.message);
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(249, 115, 22, 0.2)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--gray-900)", margin: "0 0 8px 0" }}>
          Mes Échéances
        </h1>
        <p style={{ color: "var(--gray-500)", margin: 0 }}>
          Consultez et réglez vos mensualités pour vos acquisitions immobilières.
        </p>
      </div>

      <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--gray-200)", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", background: "var(--gray-50)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={18} color="var(--gray-600)" />
            Échéancier de paiement
          </h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", color: "var(--gray-500)", fontWeight: "600", letterSpacing: "0.05em" }}>Statut</th>
                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", color: "var(--gray-500)", fontWeight: "600", letterSpacing: "0.05em" }}>Date d'échéance</th>
                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", color: "var(--gray-500)", fontWeight: "600", letterSpacing: "0.05em" }}>Description</th>
                <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", color: "var(--gray-500)", fontWeight: "600", letterSpacing: "0.05em" }}>Montant</th>
                <th style={{ padding: "16px 24px", textAlign: "right", fontSize: "12px", textTransform: "uppercase", color: "var(--gray-500)", fontWeight: "600", letterSpacing: "0.05em" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {installments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Aucune échéance trouvée.
                  </td>
                </tr>
              ) : (
                installments.map((inst, index) => {
                  const sale = salesMap[inst.sale_id];
                  const prop = sale ? propsMap[sale.property_id] : null;
                  const isLate = inst.status === 'pending' && new Date(inst.due_date) < new Date();
                  
                  return (
                    <tr key={inst.id} style={{ borderBottom: "1px solid var(--gray-100)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: "16px 24px" }}>
                        {inst.status === 'paid' ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                            <CheckCircle size={14} /> Réglé
                          </div>
                        ) : isLate ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                            <AlertCircle size={14} /> En retard
                          </div>
                        ) : (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(249, 115, 22, 0.1)", color: "var(--warning-dark)", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                            <Clock size={14} /> En attente
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: "500", color: "var(--gray-900)" }}>
                        {new Date(inst.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: "500", color: "var(--gray-900)", marginBottom: "4px" }}>Mensualité {index === 0 ? "(Avance initiale)" : `n°${index}`}</div>
                        <div style={{ fontSize: "13px", color: "var(--gray-500)" }}>Pour: {prop?.name || 'Bien inconnu'}</div>
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: "700", color: "var(--gray-900)" }}>
                        {formatCurrency(inst.amount)}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        {inst.status === 'paid' ? (
                          <button 
                            onClick={() => setSelectedInst(inst)}
                            style={{ background: "transparent", border: "1px solid var(--gray-200)", color: "var(--gray-600)", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "500", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}
                          >
                            <Download size={14} /> Reçu
                          </button>
                        ) : (
                          <button 
                            onClick={() => handlePay(inst)}
                            disabled={isProcessingPayment}
                            style={{ 
                              background: "var(--primary)", 
                              border: "none", 
                              color: "white", 
                              padding: "8px 16px", 
                              borderRadius: "6px", 
                              fontSize: "13px", 
                              fontWeight: "600", 
                              cursor: isProcessingPayment ? "not-allowed" : "pointer",
                              display: "inline-flex", 
                              alignItems: "center", 
                              gap: "6px", 
                              transition: "all 0.2s",
                              opacity: isProcessingPayment ? 0.7 : 1
                            }}
                          >
                            <CreditCard size={14} /> {isProcessingPayment ? "Traitement..." : "Payer"} <ChevronRight size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REÇU ECHEANCE */}
      {selectedInst && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>Reçu de paiement</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => generatePDF(selectedInst)}
                  style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '14px' }}
                >
                  <Download size={16} /> Télécharger PDF
                </button>
                <button 
                  onClick={() => setSelectedInst(null)}
                  style={{ background: 'var(--gray-100)', border: 'none', color: 'var(--gray-600)', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', background: '#f5f7fa', display: 'flex', justifyContent: 'center' }}>
              <div 
                id={`receipt-content-${selectedInst.id}`}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #f0f0f0", paddingBottom: "20px", marginBottom: "30px" }}>
                  <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a1a", margin: "0 0 8px 0" }}>REÇU DE PAIEMENT</h1>
                    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Reçu généré le {new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "40px", height: "40px", background: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={24} color="white" />
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)" }}>Vision Immo 2.0</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>Propriétaire / Promoteur</h3>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "16px" }}>Vision Immo 2.0</p>
                    <p style={{ margin: 0, color: "#444", fontSize: "14px" }}>Cocody, Abidjan</p>
                    <p style={{ margin: 0, color: "#444", fontSize: "14px" }}>contact@veco-ia.com</p>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>Acheteur</h3>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "16px" }}>{salesMap[selectedInst.sale_id]?.buyers?.full_name || 'Acheteur'}</p>
                    <p style={{ margin: 0, color: "#444", fontSize: "14px" }}>{propsMap[salesMap[selectedInst.sale_id]?.property_id]?.name || 'Bien inconnu'}</p>
                  </div>
                </div>

                <div style={{ marginBottom: "40px" }}>
                  <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#333" }}>
                    Nous soussignés, <strong>Vision Immo 2.0</strong>, déclarons avoir reçu de <strong>{salesMap[selectedInst.sale_id]?.buyers?.full_name || 'Acheteur'}</strong> la somme de <strong>{formatCurrency(selectedInst.amount)}</strong> au titre du paiement d'une échéance pour l'acquisition du bien <strong>{propsMap[salesMap[selectedInst.sale_id]?.property_id]?.name || 'Bien inconnu'}</strong>.
                  </p>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "2px solid #ddd", color: "#555" }}>Description</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "2px solid #ddd", color: "#555" }}>Date d'échéance</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", borderBottom: "2px solid #ddd", color: "#555" }}>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "16px", borderBottom: "1px solid #eee", color: "#333" }}>Échéance d'acquisition</td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #eee", color: "#333" }}>{new Date(selectedInst.due_date).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #eee", textAlign: "right", color: "#333" }}>{formatCurrency(selectedInst.amount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: "16px", textAlign: "right", fontWeight: "bold", fontSize: "16px", color: "#111" }}>TOTAL PAYÉ</td>
                      <td style={{ padding: "16px", textAlign: "right", fontWeight: "bold", fontSize: "18px", color: "var(--primary-dark)" }}>{formatCurrency(selectedInst.amount)}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "60px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#666" }}>Mode de paiement : <strong style={{ textTransform: "capitalize", color: "#333" }}>{selectedInst.payment_method?.replace("_", " ")}</strong></p>
                    <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>Date du règlement : <strong style={{ color: "#333" }}>{selectedInst.payment_date ? new Date(selectedInst.payment_date).toLocaleDateString('fr-FR') : '-'}</strong></p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#333", fontWeight: "bold" }}>Le Promoteur / Le Mandataire</p>
                    <div style={{ width: "160px", height: "60px", borderBottom: "1px dashed #ccc", margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "8px" }}>
                      <span style={{ fontFamily: "cursive", fontSize: "24px", color: "var(--primary)" }}>Vision Immo 2.0</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "80px", paddingTop: "20px", borderTop: "1px solid #eee", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "#999", margin: 0 }}>
                    Ce reçu atteste du paiement partiel ou total dans le cadre d'une acquisition immobilière. Il ne vaut pas titre de propriété. Le transfert de propriété définitif sera acté par-devant notaire à l'issue du paiement intégral du prix de vente.
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
