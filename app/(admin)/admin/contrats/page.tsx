"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { Lease, Property, Tenant } from "@/lib/types";
import { 
  Search, 
  Eye,
  Ban, 
  CheckCircle,
  User,
  X
} from "lucide-react";

type ModalType = "Détails" | "Résilier" | null;

export default function AdminContratsPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const leasesList = await db.getLeases();
        const rawProps = await db.getProperties();
        const rawTens = await db.getTenants();
        
        const props = rawProps.reduce((acc, p) => ({...acc, [p.id]: p}), {} as Record<string, Property>);
        const tens = rawTens.reduce((acc, t) => ({...acc, [t.id]: t}), {} as Record<string, Tenant>);
        
        setProperties(props);
        setTenants(tens);
        setLeases(leasesList);
        setFilteredLeases(leasesList);
      } catch (error) {
        console.error("Erreur lors du chargement des contrats", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLeases(leases);
      return;
    }
    
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = leases.filter(l => {
      const tName = tenants[l.tenant_id]?.full_name || "";
      const pName = properties[l.property_id]?.name || "";
      return tName.toLowerCase().includes(lowercasedTerm) || pName.toLowerCase().includes(lowercasedTerm);
    });
    setFilteredLeases(filtered);
  }, [searchTerm, leases, tenants, properties]);

  const openModal = (type: ModalType, lease: Lease) => {
    setSelectedLease(lease);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedLease(null);
    setIsSubmitting(false);
  };

  const handleModalSubmit = async () => {
    if (!selectedLease) return;
    setIsSubmitting(true);

    try {
      // Simulation of status update since there's no updateLease in db yet, 
      // but we update the local state for demonstration
      const updatedLease = { ...selectedLease };

      if (modalType === "Résilier") {
        updatedLease.status = updatedLease.status === "active" ? "terminated" : "active";
        // Normally we would call: await db.updateLease(updatedLease);
      }

      // Local state update
      const updatedList = leases.map(l => l.id === updatedLease.id ? updatedLease : l);
      setLeases(updatedList);
      setFilteredLeases(updatedList);
      
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Une erreur est survenue.");
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>En cours</span>;
      case 'terminated':
        return <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>Résilié</span>;
      case 'expired':
        return <span className="badge" style={{ background: "rgba(148, 163, 184, 0.1)", color: "#64748b" }}>Expiré</span>;
      default:
        return <span className="badge" style={{ background: "rgba(148, 163, 184, 0.1)", color: "#64748b" }}>{status}</span>;
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <>
      <div className="animate-fade-in" style={{ padding: "var(--space-6)" }}>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Gestion Immobilière</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Tous les Contrats</h2>
        </div>
      </div>

      {/* Barre de Recherche et Outils */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input 
            type="text" 
            placeholder="Rechercher par locataire ou bien..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "10px 10px 10px 40px", 
              borderRadius: "8px", 
              border: "1px solid #e2e8f0",
              outline: "none",
              fontSize: "14px"
            }}
          />
        </div>
        <div style={{ color: "var(--gray-500)", fontSize: "14px", fontWeight: "600" }}>
          {filteredLeases.length} contrat(s) listé(s)
        </div>
      </div>

      {/* Tableau des contrats */}
      <div className="card" style={{ overflow: "hidden", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 250px)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Locataire</th>
                <th style={thStyle}>Bien Immobilier</th>
                <th style={thStyle}>Date de Début</th>
                <th style={thStyle}>Loyer Mensuel</th>
                <th style={thStyle}>Caution</th>
                <th style={thStyle}>Statut</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Chargement des contrats...
                  </td>
                </tr>
              ) : filteredLeases.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Aucun contrat trouvé.
                  </td>
                </tr>
              ) : (
                filteredLeases.map((lease, idx) => {
                  const t = tenants[lease.tenant_id];
                  const p = properties[lease.property_id];
                  return (
                    <tr key={lease.id || idx} className="table-row">
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-lightest)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px" }}>
                            {t?.full_name ? t.full_name.substring(0, 2).toUpperCase() : <User size={16} />}
                          </div>
                          <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{t?.full_name || "Inconnu"}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 500, color: "#334155" }}>{p?.name || "Inconnu"}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: "14px", color: "#64748b" }}>{lease.start_date}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{formatMoney(lease.rent_amount)}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 500, color: "#475569" }}>{formatMoney(lease.deposit_amount)}</span>
                      </td>
                      <td style={tdStyle}>{getStatusBadge(lease.status)}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button className="action-btn" title="Voir les détails" onClick={() => openModal("Détails", lease)}>
                            <Eye size={16} />
                          </button>
                          <button className={`action-btn ${lease.status === 'terminated' ? 'action-btn-success' : 'action-btn-danger'}`} title={lease.status === 'terminated' ? "Réactiver le contrat" : "Résilier le contrat"} onClick={() => openModal("Résilier", lease)}>
                            {lease.status === 'terminated' ? <CheckCircle size={16} /> : <Ban size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Modal / Popup pour les actions */}
      {modalType && selectedLease && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            
            <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "18px" }}>
              {modalType === "Détails" ? "Détails du Contrat" : "Résilier le Contrat"}
            </h3>

            {modalType === "Détails" && (
              <div className="stats-grid">
                <div className="stat-box">
                  <span>Locataire</span>
                  <strong>{tenants[selectedLease.tenant_id]?.full_name || "Inconnu"}</strong>
                </div>
                <div className="stat-box">
                  <span>Bien Immobilier</span>
                  <strong>{properties[selectedLease.property_id]?.name || "Inconnu"}</strong>
                </div>
                <div className="stat-box">
                  <span>Loyer Mensuel</span>
                  <strong>{formatMoney(selectedLease.rent_amount)}</strong>
                </div>
                <div className="stat-box">
                  <span>Caution</span>
                  <strong>{formatMoney(selectedLease.deposit_amount)}</strong>
                </div>
                <div className="stat-box">
                  <span>Date de début</span>
                  <strong>{selectedLease.start_date}</strong>
                </div>
                <div className="stat-box">
                  <span>Date de fin prévue</span>
                  <strong>{selectedLease.end_date}</strong>
                </div>
                <div className="stat-box" style={{ gridColumn: 'span 2' }}>
                  <span>Statut du Contrat</span>
                  <div>{getStatusBadge(selectedLease.status)}</div>
                </div>
              </div>
            )}

            {modalType === "Résilier" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                {selectedLease.status === "terminated" ? (
                  <>
                    <CheckCircle size={48} color="#10b981" style={{ marginBottom: "16px" }} />
                    <p style={{ margin: 0, color: "#334155" }}>
                      Voulez-vous réactiver le contrat de <strong>{tenants[selectedLease.tenant_id]?.full_name}</strong> ?
                    </p>
                  </>
                ) : (
                  <>
                    <Ban size={48} color="#ef4444" style={{ marginBottom: "16px" }} />
                    <p style={{ margin: 0, color: "#334155" }}>
                      Voulez-vous vraiment résilier le contrat de bail pour le locataire <strong>{tenants[selectedLease.tenant_id]?.full_name}</strong> ? Cette action marquera le contrat comme terminé.
                    </p>
                  </>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={closeModal} disabled={isSubmitting}>
                Fermer
              </button>
              {modalType === "Résilier" && (
                <button 
                  className={`btn-primary ${selectedLease.status !== 'terminated' ? 'btn-danger' : ''}`} 
                  onClick={handleModalSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "En cours..." : "Confirmer"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row {
          transition: background 0.2s;
        }
        .table-row:hover {
          background: #f8fafc;
        }
        
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        
        .action-btn-danger:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fca5a5;
        }

        .action-btn-success:hover {
          background: #d1fae5;
          color: #10b981;
          border-color: #6ee7b7;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: #fff;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          padding: 24px;
          position: relative;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }

        .modal-close {
          position: absolute;
          top: 16px; right: 16px;
          background: transparent; border: none;
          color: #94a3b8; cursor: pointer;
          transition: 0.2s;
        }
        .modal-close:hover { color: #0f172a; }

        .btn-secondary {
          padding: 10px 16px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #475569;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-secondary:hover { background: #e2e8f0; }

        .btn-primary {
          padding: 10px 16px;
          border-radius: 8px;
          background: #10b981;
          color: #fff;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary:hover { background: #059669; }

        .btn-danger {
          background: #ef4444;
        }
        .btn-danger:hover { background: #dc2626; }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .stat-box {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .stat-box span {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
        }
        .stat-box strong {
          font-size: 16px;
          color: #0f172a;
        }
      `}</style>
    </>
  );
}

// Inline styles pour le tableau
const thStyle = {
  textAlign: "left" as const,
  padding: "16px 20px",
  background: "#f8fafc",
  color: "#475569",
  fontWeight: 600,
  fontSize: "13px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  borderBottom: "1px solid #e2e8f0",
  position: "sticky" as const,
  top: 0,
  zIndex: 10,
};

const tdStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "14px",
  color: "#334155",
};
