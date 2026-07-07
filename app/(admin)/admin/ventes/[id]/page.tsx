"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { db } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AdminVenteDashboard() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sale, setSale] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sales = await db.getSales();
      const currentSale = sales.find(s => s.id === id);
      
      if (!currentSale) {
        router.push("/admin/ventes");
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

  if (isLoading || !sale) return <div style={{ padding: "32px", textAlign: "center" }}>Chargement...</div>;

  // Calculate Progress
  const totalPaid = sale.total_price - sale.remaining_balance;
  const progressPercent = Math.min(100, Math.round((totalPaid / sale.total_price) * 100));

  // Calculate Chart Data
  const chartData = installments.map(inst => ({
    name: new Date(inst.due_date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    amount: inst.amount,
    status: inst.status
  }));

  const lateInstallments = installments.filter(i => i.status === 'late' || (i.status === 'pending' && new Date(i.due_date) < new Date()));

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <Link href="/admin/ventes" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--gray-500)", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}>
            <ArrowLeft size={14} /> Retour aux ventes globales
          </Link>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            Supervision du Dossier
            {sale.status === 'completed' && <span className="badge badge-success" style={{ fontSize: "12px" }}>Soldé</span>}
            {sale.status === 'pending' && <span className="badge badge-primary" style={{ fontSize: "12px" }}>En cours</span>}
          </h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
        {/* Buyer & Property Info */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
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

          <div style={{ borderTop: "1px solid var(--gray-200)", margin: "24px 0", paddingTop: "24px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-500)", textTransform: "uppercase", marginBottom: "16px" }}>Bien Acquis</h4>
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
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 24px 0" }}>Bilan Financier Global</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
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
      </div>

      {/* Chart and Installments */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-6)" }}>
        
        {/* Payment Chart */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 24px 0" }}>Évolution des paiements</h3>
          <div style={{ height: "250px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}M` : `${value / 1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.status === 'paid' ? '#10b981' : entry.status === 'late' || (entry.status === 'pending' && new Date(installments[index].due_date) < new Date()) ? '#ef4444' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "16px", fontSize: "13px", color: "var(--gray-600)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#10b981" }}></span> Payé</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#ef4444" }}></span> En retard</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#cbd5e1" }}></span> À venir</div>
          </div>
        </div>

        {/* Installments List */}
        <div className="card" style={{ padding: "0" }}>
          <div style={{ padding: "24px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>Plan de paiement (Supervision)</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)", textAlign: "left" }}>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Mois</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Montant</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Statut</th>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
