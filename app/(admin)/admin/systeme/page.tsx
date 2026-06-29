"use client";

import { useState } from "react";
import { 
  Search, 
  Eye,
  CheckCircle,
  X,
  Activity,
  AlertOctagon,
  AlertTriangle,
  Info,
  Server,
  Database,
  ShieldAlert,
  CreditCard
} from "lucide-react";

type ModalType = "Détails" | "Marquer Traité" | null;

// Types pour les données factices
type Severity = "critical" | "warning" | "info";
type Category = "database" | "auth" | "payment" | "system";

interface SystemLog {
  id: string;
  date: string;
  severity: Severity;
  category: Category;
  title: string;
  description: string;
  technical_details?: string;
  is_resolved: boolean;
}

// Données statiques de démonstration
const MOCK_LOGS: SystemLog[] = [
  {
    id: "log-1",
    date: "2026-06-29T14:32:00Z",
    severity: "critical",
    category: "payment",
    title: "Échec de l'API PayDunya",
    description: "Timeout lors de la vérification du statut d'un paiement (Locataire: Koffi).",
    technical_details: "Error 504 Gateway Timeout on endpoint /api/v1/checkout-invoice/confirm. Retried 3 times.",
    is_resolved: false,
  },
  {
    id: "log-2",
    date: "2026-06-29T10:15:22Z",
    severity: "warning",
    category: "auth",
    title: "Tentatives de connexion multiples",
    description: "5 tentatives de connexion échouées depuis l'IP 192.168.1.45 pour l'utilisateur admin@test.com.",
    technical_details: "AuthError: Invalid credentials. Rate limit triggered for IP 192.168.1.45.",
    is_resolved: false,
  },
  {
    id: "log-3",
    date: "2026-06-28T23:00:00Z",
    severity: "info",
    category: "database",
    title: "Sauvegarde automatique réussie",
    description: "La sauvegarde nocturne de la base de données s'est terminée avec succès.",
    is_resolved: true,
  },
  {
    id: "log-4",
    date: "2026-06-28T09:45:10Z",
    severity: "critical",
    category: "system",
    title: "Crash du service d'envoi d'emails",
    description: "Le service Resend a renvoyé une erreur lors de l'envoi des quittances massives.",
    technical_details: "Resend API Error 429: Too Many Requests. Quota exceeded.",
    is_resolved: true,
  },
  {
    id: "log-5",
    date: "2026-06-27T16:20:00Z",
    severity: "warning",
    category: "database",
    title: "Requête lente détectée",
    description: "La requête de récupération des statistiques mensuelles a pris plus de 3 secondes.",
    technical_details: "Query: SELECT * FROM leases LEFT JOIN ... Time: 3450ms.",
    is_resolved: false,
  }
];

export default function AdminSystemePage() {
  const [logs, setLogs] = useState<SystemLog[]>(MOCK_LOGS);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  // Filtrage
  const filteredLogs = logs.filter(log => {
    if (!searchTerm.trim()) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return log.title.toLowerCase().includes(lowerTerm) || 
           log.category.toLowerCase().includes(lowerTerm) ||
           log.description.toLowerCase().includes(lowerTerm);
  });

  const openModal = (type: ModalType, log: SystemLog) => {
    setSelectedLog(log);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedLog(null);
  };

  const handleResolve = () => {
    if (!selectedLog) return;
    const updatedLogs = logs.map(l => l.id === selectedLog.id ? { ...l, is_resolved: true } : l);
    setLogs(updatedLogs);
    closeModal();
  };

  // Helpers UI
  const getSeverityBadge = (severity: Severity) => {
    switch(severity) {
      case 'critical': return <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}><AlertOctagon size={12} style={{marginRight: 4}}/> Critique</span>;
      case 'warning': return <span className="badge" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}><AlertTriangle size={12} style={{marginRight: 4}}/> Avertissement</span>;
      case 'info': return <span className="badge" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}><Info size={12} style={{marginRight: 4}}/> Info</span>;
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch(category) {
      case 'database': return <Database size={16} color="#64748b" />;
      case 'auth': return <ShieldAlert size={16} color="#64748b" />;
      case 'payment': return <CreditCard size={16} color="#64748b" />;
      case 'system': return <Server size={16} color="#64748b" />;
    }
  };

  const getCategoryLabel = (category: Category) => {
    switch(category) {
      case 'database': return "Base de données";
      case 'auth': return "Sécurité & Auth";
      case 'payment': return "Paiements";
      case 'system': return "Système global";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Statistiques
  const totalCritical = logs.filter(l => l.severity === 'critical' && !l.is_resolved).length;
  const totalWarnings = logs.filter(l => l.severity === 'warning' && !l.is_resolved).length;
  // Fausse métrique de santé
  const healthScore = totalCritical > 0 ? 85 : (totalWarnings > 0 ? 95 : 100);

  return (
    <>
      <div className="animate-fade-in" style={{ padding: "var(--space-6)" }}>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Supervision Globale</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Système & Anomalies</h2>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Activity size={24} color={healthScore > 90 ? "#10b981" : (healthScore > 80 ? "#f59e0b" : "#ef4444")} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)" }}>Santé du système</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{healthScore}%</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertOctagon size={24} color="#ef4444" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)" }}>Erreurs Critiques (Actives)</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{totalCritical}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={24} color="#f59e0b" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)" }}>Avertissements</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{totalWarnings}</h3>
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "12px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
        <Info size={20} color="#3b82f6" />
        <span style={{ fontSize: "14px", color: "#1e3a8a" }}>Ces données sont actuellement simulées pour des fins de démonstration du tableau de bord d'administration.</span>
      </div>

      {/* Barre de Recherche */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input 
            type="text" 
            placeholder="Rechercher dans les logs (titre, catégorie)..." 
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
          {filteredLogs.length} évènement(s)
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="card" style={{ overflow: "hidden", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Date & Heure</th>
                <th style={thStyle}>Sévérité</th>
                <th style={thStyle}>Catégorie</th>
                <th style={thStyle}>Évènement</th>
                <th style={thStyle}>État</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Aucun log ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="table-row" style={!log.is_resolved && log.severity === 'critical' ? { backgroundColor: 'rgba(239, 68, 68, 0.02)' } : {}}>
                    <td style={tdStyle}>
                      <span style={{ color: "#64748b" }}>{formatDate(log.date)}</span>
                    </td>
                    <td style={tdStyle}>
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {getCategoryIcon(log.category)}
                        <span style={{ fontWeight: 500, color: "#475569" }}>{getCategoryLabel(log.category)}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{log.title}</span>
                    </td>
                    <td style={tdStyle}>
                      {log.is_resolved ? (
                        <span style={{ color: "#10b981", fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle size={14}/> Traité
                        </span>
                      ) : (
                        <span style={{ color: "#f59e0b", fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Activity size={14}/> À surveiller
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                        <button className="action-btn" title="Voir les détails techniques" onClick={() => openModal("Détails", log)}>
                          <Eye size={16} />
                        </button>
                        {!log.is_resolved && log.severity !== 'info' && (
                          <button className="action-btn action-btn-success" title="Marquer comme traité" onClick={() => openModal("Marquer Traité", log)}>
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Modal / Popup */}
      {modalType && selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            
            <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "18px" }}>
              {modalType === "Détails" ? "Détails Techniques" : "Validation de résolution"}
            </h3>

            {modalType === "Détails" && (
              <div className="stats-grid">
                <div className="stat-box" style={{ gridColumn: 'span 2' }}>
                  <span>Titre de l'évènement</span>
                  <strong>{selectedLog.title}</strong>
                </div>
                <div className="stat-box" style={{ gridColumn: 'span 2' }}>
                  <span>Description utilisateur</span>
                  <p style={{ margin: "8px 0 0 0", color: "#334155", fontSize: "14px", lineHeight: "1.5" }}>{selectedLog.description}</p>
                </div>
                {selectedLog.technical_details && (
                  <div className="stat-box" style={{ gridColumn: 'span 2', background: "#1e293b", color: "#f8fafc", border: "none" }}>
                    <span style={{ color: "#94a3b8" }}>Trace technique (Logs)</span>
                    <pre style={{ margin: "8px 0 0 0", whiteSpace: "pre-wrap", fontSize: "13px", fontFamily: "monospace" }}>
                      {selectedLog.technical_details}
                    </pre>
                  </div>
                )}
                <div className="stat-box">
                  <span>Catégorie</span>
                  <strong>{getCategoryLabel(selectedLog.category)}</strong>
                </div>
                <div className="stat-box">
                  <span>Sévérité</span>
                  <div>{getSeverityBadge(selectedLog.severity)}</div>
                </div>
              </div>
            )}

            {modalType === "Marquer Traité" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle size={48} color="#10b981" style={{ marginBottom: "16px" }} />
                <p style={{ margin: 0, color: "#334155" }}>
                  Avez-vous corrigé ou vérifié cette anomalie ?<br/>
                  Elle sera marquée comme <strong>Traitée</strong>.
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={closeModal}>
                Fermer
              </button>
              {modalType === "Marquer Traité" && (
                <button className="btn-primary" onClick={handleResolve}>
                  Confirmer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row { transition: background 0.2s; }
        .table-row:hover { background: #f8fafc; }
        .action-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0;
          background: #ffffff; color: #64748b; display: inline-flex;
          align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
        }
        .action-btn:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }
        .action-btn-success:hover { background: #d1fae5; color: #10b981; border-color: #6ee7b7; }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .modal-content {
          background: #fff; border-radius: 12px; width: 100%; max-width: 500px;
          padding: 24px; position: relative; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }
        .modal-close {
          position: absolute; top: 16px; right: 16px; background: transparent; border: none;
          color: #94a3b8; cursor: pointer; transition: 0.2s;
        }
        .modal-close:hover { color: #0f172a; }
        .btn-secondary {
          padding: 10px 16px; border-radius: 8px; background: #f1f5f9; color: #475569;
          border: none; font-weight: 600; cursor: pointer;
        }
        .btn-secondary:hover { background: #e2e8f0; }
        .btn-primary {
          padding: 10px 16px; border-radius: 8px; background: #10b981; color: #fff;
          border: none; font-weight: 600; cursor: pointer;
        }
        .btn-primary:hover { background: #059669; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .stat-box {
          background: #f8fafc; padding: 16px; border-radius: 8px;
          border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px;
        }
        .stat-box span { font-size: 12px; color: #64748b; text-transform: uppercase; }
        .stat-box strong { font-size: 16px; color: #0f172a; }
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
};

const tdStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "14px",
  color: "#334155",
};
