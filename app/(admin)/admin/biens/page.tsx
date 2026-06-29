"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { Property, PropertyStatus } from "@/lib/types";
import { 
  Search, 
  Eye,
  Edit, 
  Ban, 
  CheckCircle,
  MapPin,
  Home,
  X
} from "lucide-react";

type ModalType = "Détails" | "Modifier" | "Suspendre" | null;

export default function AdminBiensPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const data = await db.getProperties();
        setProperties(data);
        setFilteredProperties(data);
      } catch (error) {
        console.error("Erreur lors du chargement des biens", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProperties();
  }, []);

  // Handle Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties);
      return;
    }
    
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = properties.filter(prop => 
      (prop.name && prop.name.toLowerCase().includes(lowercasedTerm)) ||
      (prop.address && prop.address.toLowerCase().includes(lowercasedTerm)) ||
      (prop.landlord_name && prop.landlord_name.toLowerCase().includes(lowercasedTerm))
    );
    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

  const openModal = (type: ModalType, property: Property) => {
    setSelectedProperty(property);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedProperty(null);
    setIsSubmitting(false);
  };

  const handleModalSubmit = async () => {
    if (!selectedProperty) return;
    setIsSubmitting(true);

    try {
      const updatedProperty = { ...selectedProperty };

      if (modalType === "Suspendre") {
        // En vrai, on changerait le status ou un flag 'is_suspended'
        updatedProperty.status = updatedProperty.status === "maintenance" ? "vacant" : "maintenance";
        await db.updateProperty(updatedProperty);
      }

      // Mettre à jour l'état local
      const updatedProps = properties.map(p => p.id === updatedProperty.id ? updatedProperty : p);
      setProperties(updatedProps);
      
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Une erreur est survenue.");
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: PropertyStatus) => {
    switch(status) {
      case 'occupied':
        return <span className="badge" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}>Occupé</span>;
      case 'vacant':
        return <span className="badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>Vacant</span>;
      case 'maintenance':
        return <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>Suspendu/Maintenance</span>;
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
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Parc Immobilier Global</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Tous les Biens</h2>
        </div>
      </div>

      {/* Barre de Recherche et Outils */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, adresse ou propriétaire..." 
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
          {filteredProperties.length} bien(s) listé(s)
        </div>
      </div>

      {/* Tableau des biens */}
      <div className="card" style={{ overflow: "hidden", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Photo</th>
                <th style={thStyle}>Nom & Type</th>
                <th style={thStyle}>Adresse</th>
                <th style={thStyle}>Propriétaire</th>
                <th style={thStyle}>Loyer / Mois</th>
                <th style={thStyle}>Statut</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Chargement des propriétés...
                  </td>
                </tr>
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Aucun bien trouvé.
                  </td>
                </tr>
              ) : (
                filteredProperties.map((prop, idx) => (
                  <tr key={prop.id || idx} className="table-row">
                    <td style={tdStyle}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--gray-100)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {prop.images && prop.images.length > 0 ? (
                          <img src={prop.images[0]} alt={prop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Home size={20} color="#94a3b8" />
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{prop.name || "Bien sans nom"}</span>
                        <span style={{ fontSize: "12px", color: "var(--gray-500)", textTransform: "capitalize" }}>{prop.type || "Inconnu"}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={14} color="#64748b" />
                        <span style={{ fontSize: "13px" }}>{prop.city}, {prop.country}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 500, color: "#334155" }}>{prop.landlord_name || "Non assigné"}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{formatMoney(prop.monthly_rent)}</span>
                    </td>
                    <td style={tdStyle}>{getStatusBadge(prop.status)}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                        <button className="action-btn" title="Voir les détails" onClick={() => openModal("Détails", prop)}>
                          <Eye size={16} />
                        </button>
                        <button className="action-btn" title="Modifier" onClick={() => openModal("Modifier", prop)}>
                          <Edit size={16} />
                        </button>
                        <button className={`action-btn ${prop.status === 'maintenance' ? 'action-btn-success' : 'action-btn-danger'}`} title={prop.status === 'maintenance' ? "Réactiver le bien" : "Suspendre le bien"} onClick={() => openModal("Suspendre", prop)}>
                          {prop.status === 'maintenance' ? <CheckCircle size={16} /> : <Ban size={16} />}
                        </button>
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

      {/* Modal / Popup pour les actions */}
      {modalType && selectedProperty && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            
            <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "18px" }}>
              {modalType} - {selectedProperty.name}
            </h3>

            {modalType === "Détails" && (
              <div className="stats-grid">
                <div className="stat-box">
                  <span>Localisation</span>
                  <strong>{selectedProperty.address}, {selectedProperty.city}</strong>
                </div>
                <div className="stat-box">
                  <span>Type</span>
                  <strong style={{ textTransform: 'capitalize' }}>{selectedProperty.type}</strong>
                </div>
                <div className="stat-box">
                  <span>Loyer</span>
                  <strong>{formatMoney(selectedProperty.monthly_rent)}</strong>
                </div>
                <div className="stat-box">
                  <span>Propriétaire</span>
                  <strong>{selectedProperty.landlord_name || 'Inconnu'}</strong>
                </div>
                <div className="stat-box" style={{ gridColumn: 'span 2' }}>
                  <span>Description</span>
                  <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#334155" }}>
                    {selectedProperty.description || "Aucune description renseignée."}
                  </p>
                </div>
              </div>
            )}

            {modalType === "Modifier" && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                <Edit size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p>Le formulaire d'édition complet sera intégré dans une vue dédiée (Phase suivante).</p>
              </div>
            )}

            {modalType === "Suspendre" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                {selectedProperty.status === "maintenance" ? (
                  <>
                    <CheckCircle size={48} color="#10b981" style={{ marginBottom: "16px" }} />
                    <p style={{ margin: 0, color: "#334155" }}>
                      Voulez-vous réactiver le bien <strong>{selectedProperty.name}</strong> ? Il sera de nouveau visible.
                    </p>
                  </>
                ) : (
                  <>
                    <Ban size={48} color="#ef4444" style={{ marginBottom: "16px" }} />
                    <p style={{ margin: 0, color: "#334155" }}>
                      Voulez-vous vraiment suspendre (mettre en maintenance) le bien <strong>{selectedProperty.name}</strong> ? Il ne sera plus visible pour la location.
                    </p>
                  </>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={closeModal} disabled={isSubmitting}>
                Fermer
              </button>
              {modalType === "Suspendre" && (
                <button 
                  className={`btn-primary ${selectedProperty.status !== 'maintenance' ? 'btn-danger' : ''}`} 
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
};

const tdStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: "14px",
};
