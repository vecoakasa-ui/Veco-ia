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
  ChevronRight
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        // Mock data loading
        const allProps = await db.getProperties();
        const pMap: Record<string, Property> = {};
        allProps.forEach(p => pMap[p.id] = p);
        setPropsMap(pMap);

        const allSales = await db.getSales();
        const sMap: Record<string, Sale> = {};
        allSales.forEach(s => sMap[s.id] = s);
        setSalesMap(sMap);
        
        // Mock installments
        setInstallments([
          {
            id: "inst-0",
            sale_id: "sale-1",
            amount: 1500000,
            due_date: "2026-06-01",
            status: "paid",
            payment_method: "cash",
            payment_date: "2026-06-01"
          },
          {
            id: "inst-1",
            sale_id: "sale-1",
            amount: 500000,
            due_date: "2026-08-01",
            status: "pending"
          },
          {
            id: "inst-2",
            sale_id: "sale-1",
            amount: 500000,
            due_date: "2026-09-01",
            status: "pending"
          }
        ]);
        
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
    // Simulation of payment interface redirection (PayDunya/Stripe)
    setTimeout(() => {
      alert(\`Redirection vers l'interface de paiement pour le montant de \${formatCurrency(inst.amount)}...\`);
      
      // MOCK: Auto update to paid for demo purposes
      setInstallments(prev => prev.map(i => {
        if (i.id === inst.id) {
          return { ...i, status: 'paid', payment_date: new Date().toISOString(), payment_method: 'paydunya' };
        }
        return i;
      }));
      setIsProcessingPayment(false);
    }, 1500);
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
                        <div style={{ fontWeight: "500", color: "var(--gray-900)", marginBottom: "4px" }}>Mensualité {index === 0 ? "(Avance initiale)" : \`n°\${index}\`}</div>
                        <div style={{ fontSize: "13px", color: "var(--gray-500)" }}>Pour: {prop?.name || 'Bien inconnu'}</div>
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: "700", color: "var(--gray-900)" }}>
                        {formatCurrency(inst.amount)}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        {inst.status === 'paid' ? (
                          <button style={{ background: "transparent", border: "1px solid var(--gray-200)", color: "var(--gray-600)", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "500", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}>
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
    </div>
  );
}
