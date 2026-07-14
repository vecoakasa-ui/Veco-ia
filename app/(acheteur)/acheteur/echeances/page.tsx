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

      {/* MODAL REÇU ECHEANCE CHIC */}
      {selectedInst && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(15, 23, 42, 0.7)', 
          backdropFilter: 'blur(8px)',
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            .glass-button {
              background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              border: 1px solid rgba(255,255,255,0.18);
              box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            }
            .hover-lift:hover { transform: translateY(-2px); }
            .hover-bg-light:hover { background: rgba(255,255,255,0.2) !important; }
          `}</style>
          
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '24px', 
            width: '100%', 
            maxWidth: '750px', 
            maxHeight: '90vh', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            
            {/* EN-TÊTE CHIC */}
            <div style={{ 
              padding: '24px 32px', 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                  <FileText size={24} color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>Votre Reçu de Paiement</h2>
                  <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Document officiel • Vision Immo 2.0</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button"
                  onClick={() => generatePDF(selectedInst)}
                  className="glass-button hover-lift"
                  style={{ 
                    color: 'white', 
                    padding: '10px 20px', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    fontWeight: '600', 
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  <Download size={18} /> Télécharger
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedInst(null)}
                  className="hover-bg-light"
                  style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    color: 'white', 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* CONTENU DU REÇU (Zone à imprimer) */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div 
                  id={`receipt-content-${selectedInst.id}`}
                  style={{
                    background: 'white',
                    width: "100%",
                    maxWidth: "210mm",
                  padding: "48px",
                  borderRadius: "16px",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
                  color: "#1e293b",
                  fontFamily: "'Inter', Arial, sans-serif",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Filigrane discret */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '120px', fontWeight: '900', color: 'rgba(0,0,0,0.02)', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0 }}>
                  PAYÉ
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #f1f5f9", paddingBottom: "32px", marginBottom: "32px" }}>
                    <div>
                      <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px 0", letterSpacing: "-1px" }}>REÇU DE PAIEMENT</h1>
                      <div style={{ display: 'inline-block', background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                        N° R-{selectedInst.id.substring(0, 8).toUpperCase()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginBottom: "8px" }}>
                        <div style={{ width: "36px", height: "36px", background: "var(--primary)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Wallet size={20} color="white" />
                        </div>
                        <span style={{ fontSize: "22px", fontWeight: "800", color: "var(--primary)" }}>Vision Immo 2.0</span>
                      </div>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Date: {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "48px", background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b", letterSpacing: "1.2px", marginBottom: "12px", fontWeight: "700" }}>Émetteur</h3>
                      <p style={{ margin: "0 0 6px 0", fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>Vision Immo 2.0</p>
                      <p style={{ margin: "0 0 4px 0", color: "#475569", fontSize: "14px" }}>Cocody, Abidjan</p>
                      <p style={{ margin: 0, color: "#475569", fontSize: "14px" }}>contact@veco-ia.com</p>
                    </div>
                    <div style={{ width: "1px", background: "#e2e8f0", margin: "0 24px" }}></div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b", letterSpacing: "1.2px", marginBottom: "12px", fontWeight: "700" }}>Destinataire</h3>
                      <p style={{ margin: "0 0 6px 0", fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>{(salesMap[selectedInst.sale_id] as any)?.buyers?.full_name || 'Acheteur'}</p>
                      <p style={{ margin: 0, color: "#475569", fontSize: "14px" }}>{propsMap[salesMap[selectedInst.sale_id]?.property_id]?.name || 'Bien inconnu'}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: "40px" }}>
                    <p style={{ fontSize: "15px", lineHeight: "1.8", color: "#334155", background: "#f1f5f9", padding: "20px", borderRadius: "8px", borderLeft: "4px solid var(--primary)" }}>
                      Nous soussignés, <strong>Vision Immo 2.0</strong>, déclarons avoir reçu de <strong>{(salesMap[selectedInst.sale_id] as any)?.buyers?.full_name || 'Acheteur'}</strong> la somme de <strong>{formatCurrency(selectedInst.amount)}</strong> au titre du paiement d'une échéance pour l'acquisition du bien <strong>{propsMap[salesMap[selectedInst.sale_id]?.property_id]?.name || 'Bien inconnu'}</strong>.
                    </p>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, marginBottom: "48px" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "16px", textAlign: "left", borderBottom: "2px solid #cbd5e1", color: "#475569", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>Détails</th>
                        <th style={{ padding: "16px", textAlign: "left", borderBottom: "2px solid #cbd5e1", color: "#475569", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>Date d'échéance</th>
                        <th style={{ padding: "16px", textAlign: "right", borderBottom: "2px solid #cbd5e1", color: "#475569", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "20px 16px", borderBottom: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "500" }}>Échéance d'acquisition</td>
                        <td style={{ padding: "20px 16px", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>{new Date(selectedInst.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                        <td style={{ padding: "20px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right", color: "#0f172a", fontWeight: "600" }}>{formatCurrency(selectedInst.amount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ padding: "24px 16px", textAlign: "right", fontWeight: "800", fontSize: "15px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Total Payé</td>
                        <td style={{ padding: "24px 16px", textAlign: "right", fontWeight: "900", fontSize: "24px", color: "var(--primary-dark)" }}>{formatCurrency(selectedInst.amount)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#64748b" }}>Informations de paiement</p>
                      <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#0f172a", fontWeight: "600" }}>Mode : <span style={{ textTransform: "capitalize", fontWeight: "400" }}>{selectedInst.payment_method?.replace("_", " ") || 'Non spécifié'}</span></p>
                      <p style={{ margin: "0", fontSize: "14px", color: "#0f172a", fontWeight: "600" }}>Réglement : <span style={{ fontWeight: "400" }}>{selectedInst.payment_date ? new Date(selectedInst.payment_date).toLocaleDateString('fr-FR') : 'Date inconnue'}</span></p>
                    </div>
                    
                    <div style={{ textAlign: "center", width: "200px" }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Signature Autorisée</p>
                      <div style={{ height: "80px", borderBottom: "1px solid #cbd5e1", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "10px" }}>
                        <span style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: "32px", color: "var(--primary)", transform: "rotate(-5deg)", opacity: 0.8 }}>Vision Immo</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px dashed #cbd5e1", textAlign: "center" }}>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
                      Ce reçu électronique atteste du paiement dans le cadre d'une acquisition immobilière. 
                      Il ne vaut pas titre de propriété définitif.
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
