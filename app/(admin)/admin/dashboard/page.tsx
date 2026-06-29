"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { Users, Building, CreditCard, Activity, BarChart3, ShieldAlert, X } from "lucide-react";
import { DashboardStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats & { total_landlords: number, active_admins: number } | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modalData, setModalData] = useState<any[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [modalType, setModalType] = useState<string>("");

  useEffect(() => {
    async function loadStats() {
      const globalStats = await db.getGlobalStats();
      setStats(globalStats);
    }
    loadStats();
  }, []);

  const handleCardClick = async (type: 'tenants' | 'landlords' | 'properties' | 'transactions') => {
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    setModalType(type);
    
    try {
      if (type === 'tenants') {
        setModalTitle("Détails des Locataires");
        const data = await db.getTenants();
        setModalData(data);
      } else if (type === 'landlords') {
        setModalTitle("Détails des Propriétaires");
        const data = await db.getLandlords();
        setModalData(data);
      } else if (type === 'properties') {
        setModalTitle("Détails des Biens Gérés");
        const data = await db.getProperties();
        setModalData(data);
      } else if (type === 'transactions') {
        setModalTitle("Détails des Transactions");
        const data = await db.getPayments();
        setModalData(data);
      }
    } catch (error) {
      console.error("Error loading details:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

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
        <div className="card stat-card" onClick={() => handleCardClick('tenants')} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}>
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
        <div className="card stat-card" onClick={() => handleCardClick('landlords')} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}>
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
        <div className="card stat-card" onClick={() => handleCardClick('properties')} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}>
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
        <div className="card stat-card" onClick={() => handleCardClick('transactions')} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}>
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

      <style jsx global>{`
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: #FFFFFF;
          border-radius: 16px;
          width: 90%;
          max-width: 800px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }
        
        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }
        
        .modal-close {
          background: #f1f5f9;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }
        
        .modal-close:hover {
          background: #fee2e2;
          color: #ef4444;
        }
        
        .detail-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .detail-table th {
          text-align: left;
          padding: 12px 16px;
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .detail-table td {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
          font-size: 14px;
        }
      `}</style>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>{modalTitle}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {isLoadingDetail ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Chargement des données...</div>
              ) : modalData.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Aucune donnée disponible.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="detail-table">
                    <thead>
                      <tr>
                        {modalType === 'tenants' && (
                          <>
                            <th>Nom complet</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Type de Bail</th>
                            <th>Statut</th>
                          </>
                        )}
                        {modalType === 'landlords' && (
                          <>
                            <th>Nom complet</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Biens</th>
                          </>
                        )}
                        {modalType === 'properties' && (
                          <>
                            <th>Nom du Bien</th>
                            <th>Adresse</th>
                            <th>Type</th>
                            <th>Propriétaire</th>
                          </>
                        )}
                        {modalType === 'transactions' && (
                          <>
                            <th>Locataire</th>
                            <th>Bien</th>
                            <th>Montant</th>
                            <th>Statut</th>
                            <th>Date</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.map((item, idx) => (
                        <tr key={idx}>
                          {modalType === 'tenants' && (
                            <>
                              <td style={{ fontWeight: 500 }}>{item.full_name}</td>
                              <td>{item.email}</td>
                              <td>{item.phone || "-"}</td>
                              <td>{item.lease_type || "-"}</td>
                              <td>
                                <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                  {item.status === 'active' ? 'Actif' : item.status || 'Inconnu'}
                                </span>
                              </td>
                            </>
                          )}
                          {modalType === 'landlords' && (
                            <>
                              <td style={{ fontWeight: 500 }}>{item.full_name}</td>
                              <td>{item.email}</td>
                              <td>{item.phone || "-"}</td>
                              <td>{item.property_count || 0}</td>
                            </>
                          )}
                          {modalType === 'properties' && (
                            <>
                              <td style={{ fontWeight: 500 }}>{item.name}</td>
                              <td>{item.address}</td>
                              <td>{item.property_type}</td>
                              <td>{item.landlord_name || "-"}</td>
                            </>
                          )}
                          {modalType === 'transactions' && (
                            <>
                              <td style={{ fontWeight: 500 }}>{item.tenant_name || "-"}</td>
                              <td>{item.property_name || "-"}</td>
                              <td style={{ fontWeight: 700 }}>{item.amount?.toLocaleString()} FCFA</td>
                              <td>
                                <span className={`badge ${item.status === 'completed' || item.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td>{new Date(item.payment_date || item.created_at).toLocaleDateString()}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
