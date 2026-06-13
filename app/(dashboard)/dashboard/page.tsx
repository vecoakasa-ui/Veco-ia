"use client";

import { useEffect, useState } from "react";
import Link from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
  ChevronRight,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { db } from "@/lib/store";
import { formatCurrency, formatDate, getPaymentStatusClass, getPaymentStatusLabel } from "@/lib/utils";
import { Payment } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total_properties: 0,
    total_tenants: 0,
    total_revenue: 0,
    late_payments: 0,
    occupancy_rate: 0
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // Load dynamic data from localStorage
    const runLoad = () => {
      setStats(db.getStats());
      const allPayments = db.getPayments();
      setRecentPayments(allPayments.filter(p => p.status === "paid").slice(0, 4));
      setUpcomingPayments(allPayments.filter(p => p.status === "upcoming" || p.status === "pending").slice(0, 3));
    };

    runLoad();
    // Refresh periodically if changes happen
    window.addEventListener("storage", runLoad);
    return () => window.removeEventListener("storage", runLoad);
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      {/* Welcome Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>
            Bonjour, Venance
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", margin: "4px 0 0 0" }}>
            Voici un aperçu de vos activités de gestion immobilière pour aujourd'hui.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => db.reset()}
            style={{ fontSize: 'var(--text-xs)' }}
          >
            Réinitialiser les données
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => router.push("/biens")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} /> Ajouter un bien
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-6)" }}>
        {/* Card 1: Biens */}
        <div className="card" onClick={() => router.push("/biens")} style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
            <div>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Biens Immobiliers</span>
              <h3 style={{ fontSize: "var(--text-3xl)", fontWeight: "800", color: "var(--gray-900)", margin: "4px 0 0 0" }}>{stats.total_properties}</h3>
            </div>
            <div style={{ padding: "10px", background: "var(--primary-lightest)", color: "var(--primary)", borderRadius: "var(--radius-lg)" }}>
              <Building2 size={20} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>
            Gérer les appartements, villas, studios <ArrowRight size={12} />
          </div>
        </div>

        {/* Card 2: Locataires */}
        <div className="card" onClick={() => router.push("/locataires")} style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
            <div>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Locataires Actifs</span>
              <h3 style={{ fontSize: "var(--text-3xl)", fontWeight: "800", color: "var(--gray-900)", margin: "4px 0 0 0" }}>{stats.total_tenants}</h3>
            </div>
            <div style={{ padding: "10px", background: "var(--info-light)", color: "var(--info-dark)", borderRadius: "var(--radius-lg)" }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>
            Voir les fiches de bail et dossiers <ArrowRight size={12} />
          </div>
        </div>

        {/* Card 3: Revenus */}
        <div className="card" onClick={() => router.push("/paiements")} style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
            <div>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Revenus Net Encaisés</span>
              <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--success-dark)", margin: "6px 0 0 0" }}>{formatCurrency(stats.total_revenue)}</h3>
            </div>
            <div style={{ padding: "10px", background: "var(--success-light)", color: "var(--success-dark)", borderRadius: "var(--radius-lg)" }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--success-dark)", fontWeight: 600 }}>
            <TrendingUp size={12} /> +12% ce mois-ci
          </div>
        </div>

        {/* Card 4: Retards */}
        <div className="card" onClick={() => router.push("/paiements")} style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
            <div>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Paiements en Retard</span>
              <h3 style={{ fontSize: "var(--text-3xl)", fontWeight: "800", color: stats.late_payments > 0 ? "var(--danger)" : "var(--gray-900)", margin: "4px 0 0 0" }}>{stats.late_payments}</h3>
            </div>
            <div style={{ padding: "10px", background: stats.late_payments > 0 ? "var(--danger-light)" : "var(--gray-100)", color: stats.late_payments > 0 ? "var(--danger)" : "var(--gray-500)", borderRadius: "var(--radius-lg)" }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: stats.late_payments > 0 ? "var(--danger-dark)" : "var(--gray-500)", fontWeight: stats.late_payments > 0 ? 600 : 400 }}>
            {stats.late_payments > 0 ? "Nécessite des relances de paiement" : "Aucun retard de paiement"}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }} className="grid-3">
        {/* Left Column: Revenue Chart & Recent Payments */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Chart Wrapper */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <div>
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: "700", color: "var(--gray-900)" }}>Évolution des Revenus Mensuels</h3>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Revenus de l'année 2026</span>
              </div>
              <span className="badge badge-success" style={{ display: "flex", gap: "4px" }}><TrendingUp size={12} /> Global</span>
            </div>

            {/* Custom Responsive pure CSS Graph bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div style={{ display: "flex", alignSelf: "stretch", justifyContent: "space-between", alignItems: "flex-end", height: "180px", borderBottom: "1px solid var(--gray-200)", paddingBottom: "8px", position: "relative" }}>
                {/* Horizontal guide lines */}
                <div style={{ position: "absolute", left: 0, right: 0, top: "25%", borderBottom: "1.5px dashed var(--gray-100)" }}></div>
                <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderBottom: "1.5px dashed var(--gray-100)" }}></div>
                <div style={{ position: "absolute", left: 0, right: 0, top: "75%", borderBottom: "1.5px dashed var(--gray-100)" }}></div>
                
                {/* Bars */}
                {[
                  { month: "Jan", val: 30 },
                  { month: "Feb", val: 45 },
                  { month: "Mar", val: 40 },
                  { month: "Apr", val: 55 },
                  { month: "May", val: 73 },
                  { month: "Jun", val: 88 },
                  { month: "Jul", val: 0 },
                  { month: "Aug", val: 0 },
                  { month: "Sep", val: 0 },
                  { month: "Oct", val: 0 },
                  { month: "Nov", val: 0 },
                  { month: "Dec", val: 0 }
                ].map((bar, idx) => (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 5 }}>
                    <div 
                      style={{ 
                        width: "60%", 
                        height: `${bar.val || 5}px`, 
                        minHeight: bar.val > 0 ? `${bar.val * 1.5}px` : "4px",
                        background: idx === 5 ? "var(--primary)" : "var(--primary-lighter)",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.5s ease"
                      }}
                      title={`${bar.month}: ${bar.val > 0 ? bar.val * 30000 : 0} FCFA`}
                    ></div>
                    <span style={{ fontSize: "10px", color: "var(--gray-500)", marginTop: "var(--space-2)" }}>{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Payments Card */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <div>
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: "700" }}>Paiements Récents Validés</h3>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Les dernières quittances émises</span>
              </div>
              <button onClick={() => router.push("/paiements")} className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: "2px", color: "var(--primary)" }}>
                Voir tout <ChevronRight size={14} />
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Locataire</th>
                    <th>Bien</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--gray-400)" }}>
                        Aucun paiement validé trouvé.
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.tenant_name}</td>
                        <td>{p.property_name}</td>
                        <td>{p.payment_date ? formatDate(p.payment_date) : "N/A"}</td>
                        <td style={{ fontWeight: 700, color: "var(--gray-900)" }}>{formatCurrency(p.total)}</td>
                        <td>
                          <span className={`badge ${getPaymentStatusClass(p.status)}`}>
                            {getPaymentStatusLabel(p.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Occupancy Rate circular & Upcoming rents */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Occupancy circular gauge */}
          <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: "700", alignSelf: "flex-start", marginBottom: "var(--space-4)" }}>Taux d'occupation</h3>
            
            {/* SVG circular gauge */}
            <div style={{ position: "relative", width: "130px", height: "130px", margin: "var(--space-4) 0" }}>
              <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle
                  cx="65"
                  cy="65"
                  r="55"
                  style={{
                    fill: "transparent",
                    stroke: "var(--gray-200)",
                    strokeWidth: "10"
                  }}
                />
                <circle
                  cx="65"
                  cy="65"
                  r="55"
                  style={{
                    fill: "transparent",
                    stroke: "var(--primary)",
                    strokeWidth: "10",
                    strokeDasharray: "345.5", // 2 * pi * r = 2 * 3.1415 * 55
                    strokeDashoffset: `${345.5 - (345.5 * stats.occupancy_rate) / 100}`,
                    strokeLinecap: "round",
                    transition: "stroke-dashoffset 1s ease"
                  }}
                />
              </svg>
              <div 
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center"
                }}
              >
                <h4 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>
                  {stats.occupancy_rate}%
                </h4>
                <span style={{ fontSize: "9px", color: "var(--gray-400)", fontWeight: "600", textTransform: "uppercase" }}>Occupé</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-4)", width: "100%", justifyContent: "center", marginTop: "var(--space-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }}></span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Biens loués</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--gray-200)" }}></span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Vacants / Maintenance</span>
              </div>
            </div>
          </div>

          {/* Upcoming rents */}
          <div className="card">
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: "700", marginBottom: "var(--space-4)" }}>Prochaines échéances</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {upcomingPayments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--gray-400)", fontSize: "var(--text-sm)" }}>
                  Aucune échéance à venir.
                </div>
              ) : (
                upcomingPayments.map((p) => (
                  <div 
                    key={p.id}
                    style={{
                      padding: "var(--space-3) var(--space-4)",
                      background: "var(--gray-50)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--gray-200)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "700", margin: 0 }}>{p.tenant_name}</h4>
                      <span style={{ fontSize: "10px", color: "var(--gray-500)" }}>Échéance : {formatDate(p.due_date)}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>{formatCurrency(p.total)}</h4>
                      <span className={`badge ${getPaymentStatusClass(p.status)}`} style={{ fontSize: "8px", padding: "1px 6px", marginTop: "4px" }}>
                        {getPaymentStatusLabel(p.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              className="btn btn-outline" 
              onClick={() => router.push("/paiements")}
              style={{ width: "100%", marginTop: "var(--space-4)", fontSize: "var(--text-xs)", padding: "10px" }}
            >
              Gérer la facturation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
