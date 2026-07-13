"use client";

import { useState, useEffect } from "react";
import { 
  Home, 
  MapPin, 
  CreditCard,
  Calendar,
  ArrowRight,
  TrendingUp,
  PieChart
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Sale, Property, SaleInstallment } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function AcheteurDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [installments, setInstallments] = useState<SaleInstallment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyerId, setBuyerId] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { sales, properties, installments } = await db.getAcheteurDashboardData();
        setSales(sales);
        setProperties(properties);
        setInstallments(installments);
        
        if (sales.length > 0) {
          setBuyerId(sales[0].buyer_id);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(249, 115, 22, 0.2)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  const totalInvested = sales.reduce((sum, s) => sum + s.total_price, 0);
  const totalPaid = sales.reduce((sum, s) => sum + (s.total_price - s.remaining_balance), 0);
  const remainingBalance = sales.reduce((sum, s) => sum + s.remaining_balance, 0);
  const progressPercent = totalInvested > 0 ? Math.round((totalPaid / totalInvested) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--gray-900)", margin: "0 0 8px 0" }}>
          Bonjour, Acheteur 👋
        </h1>
        <p style={{ color: "var(--gray-500)", margin: 0 }}>
          Voici l'état d'avancement de vos acquisitions immobilières.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
        <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid var(--gray-200)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={20} color="var(--primary)" />
            </div>
            <h3 style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)", fontWeight: "500" }}>Valeur Totale</h3>
          </div>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "var(--gray-900)" }}>
            {formatCurrency(totalInvested)}
          </p>
        </div>

        <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid var(--gray-200)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PieChart size={20} color="var(--success)" />
            </div>
            <h3 style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)", fontWeight: "500" }}>Montant Payé</h3>
          </div>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "var(--gray-900)" }}>
            {formatCurrency(totalPaid)}
          </p>
          <div style={{ marginTop: "12px", background: "var(--gray-100)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--success)", borderRadius: "3px" }}></div>
          </div>
        </div>

        <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid var(--gray-200)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={20} color="var(--danger)" />
            </div>
            <h3 style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)", fontWeight: "500" }}>Reste à Payer</h3>
          </div>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "var(--gray-900)" }}>
            {formatCurrency(remainingBalance)}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Vos acquisitions */}
        <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid var(--gray-200)", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Vos acquisitions récentes</h2>
            <Link href="/acheteur/terrains" style={{ color: "var(--primary)", fontSize: "14px", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>

          {sales.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-500)" }}>
              <Home size={48} style={{ margin: "0 auto 16px auto", opacity: 0.2 }} />
              <p>Vous n&apos;avez pas encore d&apos;acquisitions.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {sales.slice(0, 3).map((sale) => {
                const prop = properties[sale.property_id];
                return (
                  <div key={sale.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", border: "1px solid var(--gray-200)", borderRadius: "12px" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {prop?.images && prop.images[0] ? (
                        <img src={prop.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <MapPin size={24} color="var(--gray-400)" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 4px 0", fontWeight: "600", color: "var(--gray-900)" }}>{prop?.name || 'Bien non trouvé'}</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} /> {prop?.address || '-'}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0 0 4px 0", fontWeight: "700", color: "var(--primary)" }}>{formatCurrency(sale.total_price)}</p>
                      <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", fontWeight: "600" }}>
                        {sale.status === 'completed' ? 'Soldé' : 'En cours'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prochaines Échéances */}
        <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid var(--gray-200)", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={18} color="var(--primary)" /> Prochaine échéance
          </h2>

          {installments.filter(i => i.status === 'pending').length === 0 ? (
            <p style={{ color: "var(--gray-500)", fontSize: "14px", margin: 0, textAlign: "center", padding: "20px 0" }}>Aucune échéance à venir.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {installments.filter(i => i.status === 'pending').slice(0, 2).map((inst) => (
                <div key={inst.id} style={{ background: "var(--gray-50)", padding: "16px", borderRadius: "12px", border: "1px solid var(--gray-200)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-700)" }}>Échéance</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-900)" }}>{new Date(inst.due_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "var(--gray-500)" }}>Montant</span>
                    <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--primary)" }}>{formatCurrency(inst.amount)}</span>
                  </div>
                  <Link href="/acheteur/echeances" style={{ display: "block", textAlign: "center", background: "var(--primary)", color: "white", padding: "10px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
                    Payer maintenant
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
