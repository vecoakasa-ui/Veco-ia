"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/store";
import { Banknote, CheckCircle2, Clock, AlertTriangle, ArrowLeft, X, CreditCard, ShieldCheck } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function SyndicChargesPage() {
  const params = useParams();
  const tenantId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [syndicCharges, setSyndicCharges] = useState<any[]>([]);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedChargeId, setSelectedChargeId] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"options" | "processing" | "success">("options");

  useEffect(() => {
    const loadCharges = async () => {
      setLoading(true);
      try {
        const profile = await db.getProfile();
        if (!profile) {
          setLoading(false);
          return;
        }

        const allTenants = await db.getTenants();
        let currentTenantId = tenantId;

        if (profile.role === "tenant") {
          const t = allTenants.find(t => t.profile_id === profile.id || (t.email && profile.email && t.email.toLowerCase() === profile.email.toLowerCase()));
          if (t) currentTenantId = t.id;
        }

        const { data } = await supabase.from('syndic_apportionments')
          .select('*, charge:syndic_charges(*)')
          .eq('tenant_id', currentTenantId)
          .order('created_at', { ascending: false });
        
        if (data) {
          setSyndicCharges(data);
        }
      } catch (error) {
        console.error("Error loading charges:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (tenantId) loadCharges();
  }, [tenantId]);

  useEffect(() => {
    if (paymentStep === "processing" && selectedChargeId) {
      const processPayment = async () => {
        // Simulation d'une redirection et retour d'API (Wave/Orange Money)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const { error } = await supabase.from('syndic_apportionments').update({ status: 'paid' }).eq('id', selectedChargeId);
          if (error) throw error;
          
          setPaymentStep("success");
          
          // Fermer la modale et recharger la page après succès
          setTimeout(() => {
            setShowPaymentModal(false);
            window.location.reload();
          }, 2000);
        } catch (error) {
          alert("Erreur de connexion au service de paiement.");
          setPaymentStep("options");
        }
      };
      
      processPayment();
    }
  }, [paymentStep, selectedChargeId]);

  const handlePayCharge = (chargeId: string) => {
    setSelectedChargeId(chargeId);
    setPaymentStep("options");
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--gray-200)", borderTopColor: "var(--orange)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ color: "var(--gray-500)", fontWeight: "600" }}>Chargement de vos charges...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)" }}>
        <Link href={`/locataire/${tenantId}`} className="btn btn-ghost" style={{ padding: "8px", marginTop: "4px" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--gray-900)", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "var(--primary-lightest)", padding: "12px", borderRadius: "var(--radius-lg)" }}>
              <Banknote size={28} style={{ color: "var(--primary)" }} />
            </div>
            Charges de Copropriété (Syndic)
          </h1>
          <p style={{ color: "var(--gray-600)", margin: 0, fontSize: "15px" }}>
            Consultez et réglez vos quotes-parts pour l'entretien et la gestion de votre immeuble.
          </p>
        </div>
      </div>

      {syndicCharges.length === 0 ? (
        <div className="card" style={{ padding: "var(--space-8)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "var(--gray-50)", padding: "20px", borderRadius: "50%" }}>
            <Banknote size={48} style={{ color: "var(--gray-300)" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "700", margin: "0 0 8px 0", color: "var(--gray-800)" }}>Aucune charge en cours</h3>
            <p style={{ color: "var(--gray-500)", margin: 0 }}>Vous n'avez actuellement aucune charge de copropriété assignée à votre profil.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          <div className="table-container" style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", minWidth: "700px", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                  <th style={{ padding: "16px", fontWeight: "700", color: "var(--gray-600)", fontSize: "12px", textTransform: "uppercase" }}>Libellé de la charge</th>
                  <th style={{ padding: "16px", fontWeight: "700", color: "var(--gray-600)", fontSize: "12px", textTransform: "uppercase" }}>Date d'émission</th>
                  <th style={{ padding: "16px", fontWeight: "700", color: "var(--gray-600)", fontSize: "12px", textTransform: "uppercase" }}>Échéance</th>
                  <th style={{ padding: "16px", fontWeight: "700", color: "var(--gray-600)", fontSize: "12px", textTransform: "uppercase" }}>Statut</th>
                  <th style={{ padding: "16px", fontWeight: "700", color: "var(--gray-600)", fontSize: "12px", textTransform: "uppercase", textAlign: "right" }}>Montant à payer</th>
                  <th style={{ padding: "16px", fontWeight: "700", color: "var(--gray-600)", fontSize: "12px", textTransform: "uppercase", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {syndicCharges.map((app) => (
                  <tr key={app.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: "700", color: "var(--gray-900)" }}>{app.charge?.title}</div>
                    </td>
                    <td style={{ padding: "16px", color: "var(--gray-600)", fontSize: "14px" }}>
                      {formatDate(app.created_at)}
                    </td>
                    <td style={{ padding: "16px", color: "var(--gray-600)", fontSize: "14px" }}>
                      {app.charge?.due_date ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Clock size={14} style={{ color: new Date(app.charge.due_date) < new Date() && app.status !== 'paid' ? "var(--danger)" : "var(--gray-400)" }} />
                          <span style={{ color: new Date(app.charge.due_date) < new Date() && app.status !== 'paid' ? "var(--danger)" : "inherit" }}>
                            {formatDate(app.charge.due_date)}
                          </span>
                        </span>
                      ) : "-"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      {app.status === "paid" ? (
                        <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={12} /> Réglé
                        </span>
                      ) : new Date(app.charge?.due_date) < new Date() ? (
                        <span className="badge badge-danger" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <AlertTriangle size={12} /> En retard
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> En attente
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px", textAlign: "right", fontWeight: "800", color: app.status === "paid" ? "var(--success)" : "var(--gray-900)", fontSize: "16px" }}>
                      {formatCurrency(app.amount_due)}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      {app.status === "pending" ? (
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => handlePayCharge(app.id)}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          Payer
                        </button>
                      ) : (
                        <span style={{ color: "var(--gray-400)", fontSize: "12px", fontWeight: "600" }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "400px", padding: "var(--space-6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={20} style={{ color: "var(--primary)" }} /> Payer la charge
              </h3>
              {paymentStep !== "processing" && (
                <button onClick={() => setShowPaymentModal(false)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><X size={20} /></button>
              )}
            </div>
            
            {paymentStep === "options" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ background: "var(--gray-50)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", textAlign: "center" }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--gray-600)" }}>Montant à régler :</p>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--gray-900)" }}>
                    {formatCurrency(syndicCharges.find(c => c.id === selectedChargeId)?.amount_due || 0)}
                  </div>
                </div>
                
                <h4 style={{ margin: "8px 0 0 0", fontSize: "14px", fontWeight: "700", textAlign: "center" }}>Choisissez votre mode de paiement :</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button className="btn btn-outline" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", height: "auto", borderColor: "#1dc5ce", background: "rgba(29, 197, 206, 0.05)" }} onClick={() => setPaymentStep("processing")}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Wave_logo.svg/1024px-Wave_logo.svg.png" alt="Wave" style={{ height: "24px", objectFit: "contain" }} />
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#1dc5ce" }}>Wave</span>
                  </button>
                  <button className="btn btn-outline" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", height: "auto", borderColor: "#ff7900", background: "rgba(255, 121, 0, 0.05)" }} onClick={() => setPaymentStep("processing")}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/1024px-Orange_logo.svg.png" alt="Orange Money" style={{ height: "24px", objectFit: "contain" }} />
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#ff7900" }}>Orange Money</span>
                  </button>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginTop: "16px", color: "var(--gray-500)", fontSize: "12px" }}>
                  <ShieldCheck size={14} style={{ color: "var(--success)" }} /> Transactions 100% sécurisées
                </div>
              </div>
            )}
            
            {paymentStep === "processing" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "32px 0" }}>
                <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--gray-200)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ margin: 0, fontWeight: "600", color: "var(--gray-700)" }}>Initialisation du paiement...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="animate-scale-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "24px 0", textAlign: "center" }}>
                <CheckCircle2 size={56} style={{ color: "var(--success)" }} />
                <h4 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "var(--gray-900)" }}>Paiement réussi !</h4>
                <p style={{ margin: 0, color: "var(--gray-500)", fontSize: "14px" }}>Votre paiement a été traité avec succès et votre charge de copropriété a bien été réglée.</p>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
