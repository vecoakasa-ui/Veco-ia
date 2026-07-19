"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Banknote, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SyndicChargesPage() {
  const params = useParams();
  const tenantId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [syndicCharges, setSyndicCharges] = useState<any[]>([]);

  useEffect(() => {
    const loadCharges = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('syndic_apportionments')
          .select('*, charge:syndic_charges(*)')
          .eq('tenant_id', tenantId)
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

  const handlePayCharge = (chargeId: string) => {
    // Dans le futur, ceci redirigera vers le système de paiement (ex: Wave, Orange Money)
    alert("Redirection vers le portail de paiement sécurisé pour la charge " + chargeId);
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
    </div>
  );
}
