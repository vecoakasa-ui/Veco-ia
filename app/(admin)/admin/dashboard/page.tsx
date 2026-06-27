"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { Users, Building, CreditCard, Activity, BarChart3, TrendingUp, ShieldAlert } from "lucide-react";
import { DashboardStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats & { total_landlords: number, active_admins: number } | null>(null);

  useEffect(() => {
    async function loadStats() {
      const globalStats = await db.getGlobalStats();
      setStats(globalStats);
    }
    loadStats();
  }, []);

  if (!stats) {
    return <div style={{ padding: "var(--space-8)", textAlign: "center" }}>Chargement des statistiques globales...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", padding: "var(--space-6)" }}>
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Supervision Plateforme</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Vue Globale de Veco IA</h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
        {/* Total Users */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)" }}>
          <div style={{ padding: "var(--space-3)", background: "rgba(99, 102, 241, 0.1)", borderRadius: "var(--radius-lg)" }}>
            <Users size={24} style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Total Locataires</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--gray-900)", margin: "4px 0 0 0" }}>
              {stats.total_tenants}
            </h3>
          </div>
        </div>

        {/* Total Landlords */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)" }}>
          <div style={{ padding: "var(--space-3)", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-lg)" }}>
            <Users size={24} style={{ color: "var(--success)" }} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Total Propriétaires</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--gray-900)", margin: "4px 0 0 0" }}>
              {stats.total_landlords}
            </h3>
          </div>
        </div>

        {/* Properties */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)" }}>
          <div style={{ padding: "var(--space-3)", background: "rgba(245, 158, 11, 0.1)", borderRadius: "var(--radius-lg)" }}>
            <Building size={24} style={{ color: "var(--warning)" }} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Biens Gérés</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--gray-900)", margin: "4px 0 0 0" }}>
              {stats.total_properties}
            </h3>
          </div>
        </div>

        {/* Global Revenue */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)" }}>
          <div style={{ padding: "var(--space-3)", background: "rgba(236, 72, 153, 0.1)", borderRadius: "var(--radius-lg)" }}>
            <CreditCard size={24} style={{ color: "#ec4899" }} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Volume Transactions</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--gray-900)", margin: "4px 0 0 0" }}>
              {stats.total_revenue.toLocaleString()} FCFA
            </h3>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)", marginTop: "var(--space-4)" }}>
        {/* Placeholder for a chart */}
        <div className="card" style={{ minHeight: "300px" }}>
          <h3 style={{ fontSize: "var(--text-md)", fontWeight: "700", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart3 size={18} className="text-primary" /> Croissance Utilisateurs
          </h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--gray-400)", border: "1px dashed var(--gray-200)", borderRadius: "var(--radius-md)", background: "var(--gray-50)" }}>
            Graphique de croissance en cours d'intégration...
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <h3 style={{ fontSize: "var(--text-md)", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={18} className="text-warning" /> Santé du Système
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3)", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>Taux d'occupation global</span>
            <span style={{ fontWeight: "700", color: "var(--success)" }}>{stats.occupancy_rate}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3)", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>Paiements en retard</span>
            <span style={{ fontWeight: "700", color: stats.late_payments > 0 ? "var(--danger)" : "var(--success)" }}>{stats.late_payments}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3)", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>Admins Actifs</span>
            <span style={{ fontWeight: "700", color: "var(--primary)" }}>{stats.active_admins}</span>
          </div>
          
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "8px", padding: "var(--space-3)", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-md)", color: "var(--success)" }}>
             <ShieldAlert size={16} />
             <span style={{ fontSize: "var(--text-sm)", fontWeight: "600" }}>Tous les services sont opérationnels</span>
          </div>
        </div>
      </div>
    </div>
  );
}
