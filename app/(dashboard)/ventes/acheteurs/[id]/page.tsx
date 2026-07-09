"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Phone, Mail, Calendar, CheckCircle, AlertCircle, CreditCard, TrendingUp, Download, Plus, X } from "lucide-react";
import { db } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function VenteDashboard() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sale, setSale] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const sales = await db.getSales();
        const currentSale = sales.find(s => s.id === id);
        
        if (!currentSale) {
          router.push("/ventes/acheteurs");
          return;
        }
        
        const allInstallments = await db.getSaleInstallments();
        const saleInstallments = allInstallments.filter(i => i.sale_id === id);
        
        setSale(currentSale);
        setInstallments(saleInstallments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sales = await db.getSales();
      const currentSale = sales.find(s => s.id === id);
      
      if (!currentSale) {
        router.push("/ventes/acheteurs");
        return;
      }
      
      const allInstallments = await db.getSaleInstallments();
      const saleInstallments = allInstallments.filter(i => i.sale_id === id);
      
      setSale(currentSale);
      setInstallments(saleInstallments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayInstallment = async (instId: string) => {
    if (confirm("Voulez-vous marquer cette échéance comme payée ?")) {
      try {
        await db.payInstallment(instId, 'cash');
        
        // If it's paid, we need to update the sale's remaining balance
        const inst = installments.find(i => i.id === instId);
        if (inst && sale) {
          const newBalance = Math.max(0, sale.remaining_balance - inst.amount);
          await db.updateSale(sale.id, {
            remaining_balance: newBalance
          });
        }
        
        await loadData();
      } catch (error) {
        console.error(error);
        alert("Erreur lors du paiement");
      }
    }
  };

  if (isLoading || !sale) return <div style={{ padding: "32px", textAlign: "center" }}>Chargement...</div>;

  // Calculate Progress
  const totalPaid = sale.total_price - sale.remaining_balance;
  const progressPercent = Math.min(100, Math.round((totalPaid / sale.total_price) * 100));

  // Calculate Pie Chart Data
  const amountPaid = installments.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const amountLate = installments.filter(i => i.status !== 'paid' && new Date(i.due_date) < new Date()).reduce((acc, curr) => acc + curr.amount, 0);
  const amountPending = installments.filter(i => i.status !== 'paid' && new Date(i.due_date) >= new Date()).reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = [
    { name: 'Payé', value: amountPaid, color: '#009A44' },
    { name: 'En retard', value: amountLate, color: '#FF8200' },
    { name: 'À venir', value: amountPending, color: '#e2e8f0' }
  ].filter(d => d.value > 0);

  const lateInstallments = installments.filter(i => i.status !== 'paid' && new Date(i.due_date) < new Date());

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <Link href="/ventes/acheteurs" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--gray-500)", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}>
            <ArrowLeft size={14} /> Retour aux acheteurs
          </Link>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            Dossier de Vente
            {sale.status === 'completed' && <span className="badge badge-success" style={{ fontSize: "12px" }}>Soldé</span>}
            {sale.status === 'pending' && <span className="badge badge-primary" style={{ fontSize: "12px" }}>En cours</span>}
          </h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        {/* Buyer & Property Info */}
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-lighter)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sale.buyer_name || "A")}&backgroundColor=e25822`} alt={sale.buyer_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "900", margin: 0 }}>{sale.buyer_name}</h3>
              <p style={{ margin: "4px 0 0 0", color: "var(--gray-500)", fontSize: "14px" }}>Acheteur</p>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--gray-600)" }}>
              <Mail size={16} /> {sale.buyer_email || "Email non renseigné"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--gray-600)" }}>
              <Phone size={16} /> {sale.buyer_phone || "Téléphone non renseigné"}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--gray-200)", margin: "16px 0", paddingTop: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-500)", textTransform: "uppercase", marginBottom: "12px" }}>Bien Acquis</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--primary-lighter)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPin size={24} />
              </div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>{sale.property_name}</div>
                <div style={{ fontSize: "13px", color: "var(--gray-500)" }}>Lot / Terrain</div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary & Progress */}
        <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 16px 0" }}>Bilan Financier</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div style={{ background: "var(--gray-50)", padding: "16px", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase" }}>Total Payé</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--success)", marginTop: "4px" }}>{formatCurrency(totalPaid)}</div>
            </div>
            <div style={{ background: "var(--gray-50)", padding: "16px", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase" }}>Reste à Payer</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--danger)", marginTop: "4px" }}>{formatCurrency(sale.remaining_balance)}</div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontWeight: "700", fontSize: "14px" }}>Progression du paiement</span>
              <span style={{ fontWeight: "800", color: "var(--primary)" }}>{progressPercent}%</span>
            </div>
            <div style={{ width: "100%", height: "12px", background: "var(--gray-200)", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--primary)", borderRadius: "6px", transition: "width 1s ease-in-out" }}></div>
            </div>
          </div>
          
          <div style={{ fontSize: "13px", color: "var(--gray-500)", display: "flex", justifyContent: "space-between" }}>
            <span>Prix total: {formatCurrency(sale.total_price)}</span>
            <span>Avance: {formatCurrency(sale.advance_payment)}</span>
          </div>

          {lateInstallments.length > 0 && (
            <div style={{ marginTop: "auto", background: "rgba(220, 38, 38, 0.1)", color: "var(--danger)", padding: "16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
              <AlertCircle size={20} />
              <div>
                <div style={{ fontWeight: "bold" }}>Retard de paiement</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>{lateInstallments.length} échéance(s) en retard</div>
              </div>
            </div>
          )}
        </div>
        {/* Payment Chart */}
        <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 16px 0" }}>Évolution des paiements</h3>
          <div style={{ height: "160px", width: "100%", flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px", fontSize: "12px", color: "var(--gray-600)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#009A44" }}></span> Payé</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF8200" }}></span> En retard</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#e2e8f0" }}></span> À venir</div>
          </div>
        </div>
      </div>

      {/* Installments List */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-6)" }}>
        <div className="card" style={{ padding: "0" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>Plan de paiement (Échéancier)</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)", textAlign: "left" }}>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Mois</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Montant</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Statut</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((inst, index) => {
                  const isLate = inst.status === 'late' || (inst.status === 'pending' && new Date(inst.due_date) < new Date());
                  const statusLabel = inst.status === 'paid' ? 'Payé' : isLate ? 'En retard' : 'En attente';
                  const statusClass = inst.status === 'paid' ? 'badge-success' : isLate ? 'badge-danger' : 'badge-ghost';
                  
                  return (
                    <tr key={inst.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-500)", fontWeight: "bold", fontSize: "14px" }}>
                            {index + 1}
                          </div>
                          <div>
                            <div style={{ fontWeight: "600" }}>{new Date(inst.due_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                            <div style={{ fontSize: "12px", color: "var(--gray-500)" }}>Au {new Date(inst.due_date).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: "bold" }}>
                        {formatCurrency(inst.amount)}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span className={`badge ${statusClass}`}>{statusLabel}</span>
                        {inst.payment_date && (
                          <div style={{ fontSize: "11px", color: "var(--gray-500)", marginTop: "4px" }}>
                            le {new Date(inst.payment_date).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        {inst.status !== 'paid' ? (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handlePayInstallment(inst.id)}
                            style={{ padding: "4px 12px", fontSize: "13px" }}
                          >
                            Encaisser
                          </button>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                            <button 
                              className="btn btn-ghost"
                              onClick={() => setSelectedPaymentInfo(inst)}
                              style={{ padding: "4px 8px", color: "var(--success)", background: "transparent", border: "none" }}
                              title="Voir le mode de paiement"
                            >
                              <CheckCircle size={20} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>

      {/* Payment Details Modal */}
      {selectedPaymentInfo && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelectedPaymentInfo(null)}>
          <div style={{ background: "white", padding: "24px", borderRadius: "16px", width: "400px", maxWidth: "90%", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={20} color="var(--success)" />
                Détails du Paiement
              </h3>
              <button onClick={() => setSelectedPaymentInfo(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--gray-500)" }}><X size={20} /></button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "var(--gray-50)", padding: "16px", borderRadius: "8px" }}>
                <div style={{ fontSize: "13px", color: "var(--gray-500)", marginBottom: "4px" }}>Montant réglé</div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "var(--gray-900)" }}>{formatCurrency(selectedPaymentInfo.amount)}</div>
              </div>

              <div>
                <div style={{ fontSize: "13px", color: "var(--gray-500)", marginBottom: "4px" }}>Mode de paiement</div>
                <div style={{ fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={16} />
                  {selectedPaymentInfo.payment_method === 'cash' ? 'Espèces' : 
                   selectedPaymentInfo.payment_method === 'bank_transfer' ? 'Virement Bancaire' : 
                   selectedPaymentInfo.payment_method === 'mobile_money' ? 'Mobile Money' : 
                   selectedPaymentInfo.payment_method || 'Mode non renseigné'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "13px", color: "var(--gray-500)", marginBottom: "4px" }}>Date de paiement</div>
                <div style={{ fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={16} />
                  {selectedPaymentInfo.payment_date ? new Date(selectedPaymentInfo.payment_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date non renseignée'}
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: "100%", marginTop: "24px" }} onClick={() => setSelectedPaymentInfo(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
