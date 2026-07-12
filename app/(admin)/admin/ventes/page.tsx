"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, Banknote, Calendar, Eye, AlertCircle, CheckCircle, Briefcase, ChevronRight } from "lucide-react";
import { db } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function AdminVentesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allSales = await db.getSales();
      // On the super admin side, we want to see ALL sales across the platform
      setSales(allSales);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSales = sales.filter(s => {
    const term = search.toLowerCase();
    return (
      (s.buyer_name || "").toLowerCase().includes(term) ||
      (s.property_name || "").toLowerCase().includes(term)
    );
  });

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total_price, 0);
  const totalAdvances = sales.reduce((acc, sale) => acc + sale.advance_payment, 0);
  const totalRemaining = sales.reduce((acc, sale) => acc + sale.remaining_balance, 0);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Supervision globale de la plateforme</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Ventes & Terrains</h2>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-4)" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Banknote size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)", fontWeight: "600" }}>Volume total des ventes</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "var(--gray-900)" }}>{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>
        
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--primary-lighter)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)", fontWeight: "600" }}>Avances encaissées</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "var(--gray-900)" }}>{formatCurrency(totalAdvances)}</h3>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)", fontWeight: "600" }}>Reste à recouvrer</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "var(--gray-900)" }}>{formatCurrency(totalRemaining)}</h3>
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="card" style={{ display: "flex", flexDirection: "row", gap: "var(--space-4)", alignItems: "center", padding: "16px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} color="var(--gray-400)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Rechercher un acheteur ou un bien..." 
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "40px", width: "100%", maxWidth: "400px" }}
          />
        </div>
      </div>

      {/* Liste des ventes */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Dossiers de vente de la plateforme</h3>
        </div>
        
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>Chargement des ventes...</div>
        ) : filteredSales.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
            <Briefcase size={48} style={{ margin: "0 auto 16px auto", opacity: 0.2 }} />
            <p>Aucune transaction de vente trouvée.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)", textAlign: "left" }}>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Acheteur</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Bien Acquis</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Montant Total</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Reste à payer</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Date</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-lighter)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sale.buyer_name || "A")}&backgroundColor=e25822`} alt={sale.buyer_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ fontWeight: "600", color: "var(--gray-900)" }}>{sale.buyer_name}</div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={14} color="var(--gray-400)" />
                        <span style={{ fontSize: "13px", color: "var(--gray-700)" }}>{sale.property_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", fontWeight: "bold", color: "var(--gray-900)" }}>
                      {formatCurrency(sale.total_price)}
                    </td>
                    <td style={{ padding: "16px 24px", fontWeight: "bold", color: sale.remaining_balance > 0 ? "var(--danger)" : "var(--success)" }}>
                      {formatCurrency(sale.remaining_balance)}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--gray-500)" }}>
                        <Calendar size={14} />
                        {new Date(sale.start_date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <Link href={`/admin/ventes/${sale.id}`} className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        Détails <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
