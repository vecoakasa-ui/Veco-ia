"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { Incident, Property, Tenant } from "@/lib/types";
import { 
  Search, 
  Eye,
  CheckCircle,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Wrench,
  User
} from "lucide-react";

type ModalType = "Détails" | "Changer Statut" | null;

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const incs = await db.getAllSystemIncidents();
        const rawProps = await db.getProperties();
        const rawTens = await db.getTenants();
        
        const props = rawProps.reduce((acc, p) => ({...acc, [p.id]: p}), {} as Record<string, Property>);
        const tens = rawTens.reduce((acc, t) => ({...acc, [t.id]: t}), {} as Record<string, Tenant>);
        
        setProperties(props);
        setTenants(tens);
        setIncidents(incs);
        setFilteredIncidents(incs);
      } catch (error) {
        console.error("Erreur lors du chargement des incidents", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredIncidents(incidents);
      return;
    }
    
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = incidents.filter(inc => {
      const tName = tenants[inc.tenant_id]?.full_name || "";
      const pName = properties[inc.property_id]?.name || "";
      const title = inc.title || "";
      return tName.toLowerCase().includes(lowercasedTerm) || 
             pName.toLowerCase().includes(lowercasedTerm) ||
             title.toLowerCase().includes(lowercasedTerm);
    });
    setFilteredIncidents(filtered);
  }, [searchTerm, incidents, tenants, properties]);

  const openModal = (type: ModalType, incident: Incident) => {
    setSelectedIncident(incident);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedIncident(null);
    setIsSubmitting(false);
  };

  const handleModalSubmit = async () => {
    if (!selectedIncident) return;
    setIsSubmitting(true);

    try {
      if (modalType === "Changer Statut") {
        let newStatus = selectedIncident.status;
        if (selectedIncident.status === "open") newStatus = "in_progress";
        else if (selectedIncident.status === "in_progress") newStatus = "resolved";

        const updatedIncident = { 
          ...selectedIncident, 
          status: newStatus as "open" | "in_progress" | "resolved" | "closed",
          resolved_at: newStatus === "resolved" ? new Date().toISOString() : selectedIncident.resolved_at
        };
        await db.updateIncident(updatedIncident);

        const updatedList = incidents.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc);
        setIncidents(updatedList);
        setFilteredIncidents(updatedList);
      }
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Une erreur est survenue.");
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'resolved':
      case 'closed':
        return <span className="badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>Résolu</span>;
      case 'in_progress':
        return <span className="badge" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>En cours</span>;
      case 'open':
        return <span className="badge" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>Ouvert</span>;
      default:
        return <span className="badge" style={{ background: "rgba(148, 163, 184, 0.1)", color: "#64748b" }}>{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'urgent':
        return <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}>Urgent 🚨</span>;
      case 'high':
        return <span className="badge" style={{ background: "rgba(249, 115, 22, 0.1)", color: "#f97316" }}>Haute</span>;
      case 'medium':
        return <span className="badge" style={{ background: "rgba(234, 179, 8, 0.1)", color: "#eab308" }}>Moyenne</span>;
      case 'low':
        return <span className="badge" style={{ background: "rgba(148, 163, 184, 0.1)", color: "#64748b" }}>Basse</span>;
      default:
        return <span className="badge" style={{ background: "rgba(148, 163, 184, 0.1)", color: "#64748b" }}>{priority}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalOpen = incidents.filter(i => i.status === 'open').length;
  const totalInProgress = incidents.filter(i => i.status === 'in_progress').length;
  const totalResolved = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;

  return (
    <>
      <div className="animate-fade-in" style={{ padding: "var(--space-6)" }}>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Gestion & Maintenance</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Support & Incidents</h2>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={24} color="#f59e0b" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)" }}>Nouveaux (Ouverts)</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{totalOpen}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Wrench size={24} color="#3b82f6" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)" }}>En cours de traitement</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{totalInProgress}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CheckCircle2 size={24} color="#10b981" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)" }}>Résolus</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{totalResolved}</h3>
          </div>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input 
            type="text" 
            placeholder="Rechercher par titre, locataire ou bien..." 
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
          {filteredIncidents.length} incident(s) trouvé(s)
        </div>
      </div>

      {/* Tableau des incidents */}
      <div className="card" style={{ overflow: "hidden", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 250px)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Date & Priorité</th>
                <th style={thStyle}>Titre du ticket</th>
                <th style={thStyle}>Locataire</th>
                <th style={thStyle}>Bien Immobilier</th>
                <th style={thStyle}>Statut</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Chargement des incidents...
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Aucun incident trouvé.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident, idx) => {
                  const t = tenants[incident.tenant_id];
                  const p = properties[incident.property_id];
                  const isUrgent = incident.priority === 'urgent';
                  return (
                    <tr key={incident.id || idx} className="table-row" style={isUrgent && incident.status !== 'resolved' ? { backgroundColor: 'rgba(239, 68, 68, 0.02)' } : {}}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                          <span style={{ fontSize: "14px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={12} /> {formatDate(incident.created_at)}
                          </span>
                          {getPriorityBadge(incident.priority)}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{incident.title}</span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-lightest)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px" }}>
                            {t?.full_name ? t.full_name.substring(0, 2).toUpperCase() : <User size={14} />}
                          </div>
                          <span style={{ fontWeight: 500 }}>{t?.full_name || "Inconnu"}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: "#475569" }}>{p?.name || "Inconnu"}</span>
                      </td>
                      <td style={tdStyle}>{getStatusBadge(incident.status)}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button className="action-btn" title="Voir les détails" onClick={() => openModal("Détails", incident)}>
                            <Eye size={16} />
                          </button>
                          {incident.status === 'open' && (
                            <button className="action-btn" style={{ color: "#3b82f6" }} title="Passer en cours" onClick={() => openModal("Changer Statut", incident)}>
                              <Wrench size={16} />
                            </button>
                          )}
                          {incident.status === 'in_progress' && (
                            <button className="action-btn action-btn-success" title="Marquer comme résolu" onClick={() => openModal("Changer Statut", incident)}>
                              <CheckCircle size={16} />
                            </button>
                          )}
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
      {modalType && selectedIncident && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            
            <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "18px" }}>
              {modalType === "Détails" ? "Détails du Ticket" : "Évolution du Statut"}
            </h3>

            {modalType === "Détails" && (
              <div className="stats-grid">
                <div className="stat-box" style={{ gridColumn: 'span 2' }}>
                  <span>Titre</span>
                  <strong>{selectedIncident.title}</strong>
                </div>
                <div className="stat-box" style={{ gridColumn: 'span 2' }}>
                  <span>Description détaillée</span>
                  <p style={{ margin: "8px 0 0 0", color: "#334155", fontSize: "14px", lineHeight: "1.5" }}>{selectedIncident.description}</p>
                </div>
                <div className="stat-box">
                  <span>Locataire</span>
                  <strong>{tenants[selectedIncident.tenant_id]?.full_name || "Inconnu"}</strong>
                </div>
                <div className="stat-box">
                  <span>Bien Immobilier</span>
                  <strong>{properties[selectedIncident.property_id]?.name || "Inconnu"}</strong>
                </div>
                <div className="stat-box">
                  <span>Priorité</span>
                  <div>{getPriorityBadge(selectedIncident.priority)}</div>
                </div>
                <div className="stat-box">
                  <span>Statut</span>
                  <div>{getStatusBadge(selectedIncident.status)}</div>
                </div>
                <div className="stat-box">
                  <span>Date de création</span>
                  <strong>{formatDate(selectedIncident.created_at)}</strong>
                </div>
                <div className="stat-box">
                  <span>Date de résolution</span>
                  <strong>{formatDate(selectedIncident.resolved_at || "")}</strong>
                </div>
              </div>
            )}

            {modalType === "Changer Statut" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                {selectedIncident.status === "open" ? (
                  <>
                    <Wrench size={48} color="#3b82f6" style={{ marginBottom: "16px" }} />
                    <p style={{ margin: 0, color: "#334155" }}>
                      Voulez-vous prendre en charge ce ticket et le passer au statut <strong>En cours</strong> ?
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle size={48} color="#10b981" style={{ marginBottom: "16px" }} />
                    <p style={{ margin: 0, color: "#334155" }}>
                      Le problème a-t-il été corrigé ? Ce ticket sera marqué comme <strong>Résolu</strong>.
                    </p>
                  </>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={closeModal} disabled={isSubmitting}>
                Fermer
              </button>
              {modalType === "Changer Statut" && (
                <button 
                  className="btn-primary" 
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
