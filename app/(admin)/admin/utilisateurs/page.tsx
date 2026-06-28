"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { Profile } from "@/lib/types";
import { 
  Search, 
  Edit, 
  Shield, 
  Key, 
  BarChart2, 
  Ban, 
  CheckCircle,
  MoreVertical 
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Temporary action handlers for Phase 1
  const handleAction = (actionName: string, userName: string) => {
    alert(`Action: ${actionName} pour l'utilisateur ${userName}\n(Cette fonctionnalité sera branchée à la base de données dans la Phase 2)`);
  };

  const getRoleBadge = (role: string) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>Admin</span>;
      case 'landlord':
        return <span className="badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>Propriétaire</span>;
      case 'tenant':
        return <span className="badge" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}>Locataire</span>;
      default:
        return <span className="badge" style={{ background: "rgba(148, 163, 184, 0.1)", color: "#64748b" }}>{role || 'Inconnu'}</span>;
    }
  };

  return (
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
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id || idx} className="table-row">
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--gray-600)" }}>
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{user.full_name || "Sans nom"}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>{user.email || "-"}</td>
                    <td style={tdStyle}>{user.phone || "-"}</td>
                    <td style={tdStyle}>{getRoleBadge(user.role)}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></div>
                        <span style={{ fontSize: "13px", fontWeight: "500" }}>Actif</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                        <button className="action-btn" title="Modifier" onClick={() => handleAction("Modifier", user.full_name || "")}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn" title="Changer Rôle" onClick={() => handleAction("Changer Rôle", user.full_name || "")}>
                          <Shield size={16} />
                        </button>
                        <button className="action-btn" title="Réinitialiser Mot de passe" onClick={() => handleAction("Réinitialiser MDP", user.full_name || "")}>
                          <Key size={16} />
                        </button>
                        <button className="action-btn" title="Statistiques" onClick={() => handleAction("Voir Stats", user.full_name || "")}>
                          <BarChart2 size={16} />
                        </button>
                        <button className="action-btn action-btn-danger" title="Suspendre/Bannir" onClick={() => handleAction("Suspendre", user.full_name || "")}>
                          <Ban size={16} />
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
      `}</style>
    </div>
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
