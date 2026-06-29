"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { Profile, UserRole } from "@/lib/types";
import { 
  Search, 
  Edit, 
  Shield, 
  Key, 
  BarChart2, 
  Ban, 
  X,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

type ModalType = "Modifier" | "Changer Rôle" | "Réinitialiser MDP" | "Voir Stats" | "Suspendre" | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editFormData, setEditFormData] = useState({ full_name: "", phone: "" });
  const [selectedRole, setSelectedRole] = useState<UserRole>("tenant");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await db.getAllProfiles();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Handle Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      (user.full_name && user.full_name.toLowerCase().includes(lowercasedTerm)) ||
      (user.email && user.email.toLowerCase().includes(lowercasedTerm)) ||
      (user.phone && user.phone.includes(lowercasedTerm))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const openModal = (type: ModalType, user: Profile) => {
    setSelectedUser(user);
    setModalType(type);
    if (type === "Modifier") {
      setEditFormData({ full_name: user.full_name || "", phone: user.phone || "" });
    } else if (type === "Changer Rôle") {
      setSelectedRole(user.role);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setIsSubmitting(false);
  };

  const handleModalSubmit = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);

    try {
      const updatedUser = { ...selectedUser };

      if (modalType === "Modifier") {
        updatedUser.full_name = editFormData.full_name;
        updatedUser.phone = editFormData.phone;
        await db.updateProfile(updatedUser);
      } 
      else if (modalType === "Changer Rôle") {
        updatedUser.role = selectedRole;
        await db.updateProfile(updatedUser);
      }
      else if (modalType === "Suspendre") {
        updatedUser.is_suspended = !updatedUser.is_suspended;
        await db.updateProfile(updatedUser);
      }
      else if (modalType === "Réinitialiser MDP") {
        // En réalité, on appellerait l'API Supabase Admin : supabase.auth.admin.resetPasswordForEmail
        // On simule avec un délai
        await new Promise(res => setTimeout(res, 1000));
        alert(`Un email de réinitialisation a été envoyé à ${updatedUser.email}`);
      }

      // Mettre à jour l'état local si l'action n'était pas juste un envoi d'email/stats
      if (modalType !== "Réinitialiser MDP" && modalType !== "Voir Stats") {
        const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        setUsers(updatedUsers);
      }
      
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Une erreur est survenue.");
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>Admin</span>;
      case 'owner':
      case 'landlord':
        return <span className="badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>Propriétaire</span>;
      case 'tenant':
        return <span className="badge" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}>Locataire</span>;
      default:
        return <span className="badge" style={{ background: "rgba(148, 163, 184, 0.1)", color: "#64748b" }}>{role || 'Inconnu'}</span>;
    }
  };

  return (
    <>
      <div className="animate-fade-in" style={{ padding: "var(--space-6)" }}>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Gestion des Accès</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Tous les Utilisateurs</h2>
        </div>
      </div>

      {/* Barre de Recherche et Outils */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email ou téléphone..." 
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
          {filteredUsers.length} utilisateur(s) trouvé(s)
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="card" style={{ overflow: "hidden", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Photo</th>
                <th style={thStyle}>Nom Complet</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Téléphone</th>
                <th style={thStyle}>Rôle</th>
                <th style={thStyle}>Statut</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions Rapides</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id || idx} className="table-row">
                    <td style={tdStyle} data-label="Photo">
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--gray-600)", overflow: "hidden" }}>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          user.full_name ? user.full_name.charAt(0).toUpperCase() : "?"
                        )}
                      </div>
                    </td>
                    <td style={tdStyle} data-label="Nom Complet">
                      <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{user.full_name || "Sans nom"}</span>
                    </td>
                    <td style={tdStyle} data-label="Email">{user.email || "-"}</td>
                    <td style={tdStyle} data-label="Téléphone">{user.phone || "-"}</td>
                    <td style={tdStyle} data-label="Rôle">{getRoleBadge(user.role)}</td>
                    <td style={tdStyle} data-label="Statut">
                      {user.is_suspended ? (
                         <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ef4444" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }}></div>
                          <span style={{ fontSize: "13px", fontWeight: "500" }}>Suspendu</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></div>
                          <span style={{ fontSize: "13px", fontWeight: "500" }}>Actif</span>
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }} data-label="Actions">
                      <div className="mobile-actions" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                        <button className="action-btn" title="Modifier" onClick={() => openModal("Modifier", user)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn" title="Changer Rôle" onClick={() => openModal("Changer Rôle", user)}>
                          <Shield size={16} />
                        </button>
                        <button className="action-btn" title="Réinitialiser Mot de passe" onClick={() => openModal("Réinitialiser MDP", user)}>
                          <Key size={16} />
                        </button>
                        <button className="action-btn" title="Statistiques" onClick={() => openModal("Voir Stats", user)}>
                          <BarChart2 size={16} />
                        </button>
                        <button className={`action-btn ${user.is_suspended ? 'action-btn-success' : 'action-btn-danger'}`} title={user.is_suspended ? "Réactiver" : "Suspendre/Bannir"} onClick={() => openModal("Suspendre", user)}>
                          {user.is_suspended ? <CheckCircle size={16} /> : <Ban size={16} />}
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
      {modalType && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            
            <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "18px" }}>
              {modalType} - {selectedUser.full_name}
            </h3>

            {modalType === "Modifier" && (
              <div className="form-group">
                <label>Nom complet</label>
                <input 
                  type="text" 
                  value={editFormData.full_name} 
                  onChange={e => setEditFormData({...editFormData, full_name: e.target.value})}
                  className="input-field"
                />
                <label style={{ marginTop: "12px" }}>Téléphone</label>
                <input 
                  type="text" 
                  value={editFormData.phone} 
                  onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                  className="input-field"
                />
              </div>
            )}

            {modalType === "Changer Rôle" && (
              <div className="form-group">
                <label>Nouveau Rôle</label>
                <select 
                  value={selectedRole} 
                  onChange={e => setSelectedRole(e.target.value as UserRole)}
                  className="input-field"
                >
                  <option value="tenant">Locataire</option>
                  <option value="owner">Propriétaire</option>
                  <option value="admin">Administrateur</option>
                </select>
                <p style={{ fontSize: "13px", color: "var(--gray-500)", marginTop: "12px" }}>
                  Attention : Modifier le rôle changera les accès et fonctionnalités disponibles pour cet utilisateur.
                </p>
              </div>
            )}

            {modalType === "Réinitialiser MDP" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Key size={48} color="#3b82f6" style={{ marginBottom: "16px" }} />
                <p style={{ margin: 0, color: "#334155" }}>
                  Êtes-vous sûr de vouloir envoyer un email de réinitialisation de mot de passe à <strong>{selectedUser.email}</strong> ?
                </p>
              </div>
            )}

            {modalType === "Suspendre" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                {selectedUser.is_suspended ? (
                  <>
                    <CheckCircle size={48} color="#10b981" style={{ marginBottom: "16px" }} />
                    <p style={{ margin: 0, color: "#334155" }}>
                      Voulez-vous réactiver le compte de <strong>{selectedUser.full_name}</strong> ? Il pourra à nouveau se connecter.
                    </p>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: "16px" }} />
                    <p style={{ margin: 0, color: "#334155" }}>
                      Voulez-vous vraiment suspendre le compte de <strong>{selectedUser.full_name}</strong> ? L'utilisateur ne pourra plus accéder à la plateforme.
                    </p>
                  </>
                )}
              </div>
            )}

            {modalType === "Voir Stats" && (
              <div className="stats-grid">
                <div className="stat-box">
                  <span>Inscrit le</span>
                  <strong>{new Date(selectedUser.created_at).toLocaleDateString("fr-FR")}</strong>
                </div>
                <div className="stat-box">
                  <span>Rôle actuel</span>
                  <strong>
                    {selectedUser.role === 'owner' ? 'Propriétaire' : 
                     selectedUser.role === 'tenant' ? 'Locataire' : 
                     selectedUser.role === 'admin' ? 'Administrateur' : 
                     selectedUser.role}
                  </strong>
                </div>
                <div className="stat-box">
                  <span>Statut</span>
                  <strong>{selectedUser.is_suspended ? 'Suspendu' : 'Actif'}</strong>
                </div>
                <div className="stat-box">
                  <span>Plan</span>
                  <strong>
                    {selectedUser.subscription_plan === 'free' ? 'Gratuit' : 
                     selectedUser.subscription_plan === 'pro' ? 'Pro' : 
                     selectedUser.subscription_plan === 'business' ? 'Business' : 
                     (selectedUser.subscription_plan || 'Aucun')}
                  </strong>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={closeModal} disabled={isSubmitting}>
                Fermer
              </button>
              {modalType !== "Voir Stats" && (
                <button 
                  className={`btn-primary ${modalType === 'Suspendre' && !selectedUser.is_suspended ? 'btn-danger' : ''}`} 
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
        /* Mobile Responsive Table and Modal */
        @media (max-width: 768px) {
          table thead {
            display: none;
          }
          table, table tbody, table tr, table td {
            display: block;
            width: 100%;
          }
          table tr {
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            background: #fff;
          }
          table td {
            padding: 10px 0 !important;
            border-bottom: 1px solid #f1f5f9 !important;
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-align: right !important;
          }
          table td:last-child {
            border-bottom: none !important;
            flex-direction: column;
            align-items: flex-end;
          }
          table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #64748b;
            font-size: 13px;
            text-transform: uppercase;
            margin-right: auto;
          }
          .mobile-actions {
            width: 100%;
            justify-content: center !important;
            flex-wrap: wrap;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px dashed #e2e8f0;
          }
          .action-btn {
            width: 44px !important;
            height: 44px !important;
          }
          
          /* Modal Responsive */
          .modal-overlay {
            padding: 12px !important;
          }
          .modal-content {
            padding: 16px !important;
            max-height: 90vh;
            overflow-y: auto;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }

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

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }

        .input-field {
          width: 100%;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 16px; /* 16px is required on mobile to prevent auto-zoom */
          outline: none;
          transition: border 0.2s;
        }
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

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
