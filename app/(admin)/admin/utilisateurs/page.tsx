"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { Search, ShieldAlert, UserCheck, UserX, Mail, Phone } from "lucide-react";
import { Profile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await db.getAllProfiles();
      setProfiles(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredProfiles = profiles.filter(p => {
    const term = search.toLowerCase();
    return (
      (p.full_name?.toLowerCase() || "").includes(term) ||
      (p.email?.toLowerCase() || "").includes(term) ||
      (p.role?.toLowerCase() || "").includes(term)
    );
  });

  const handleToggleStatus = (id: string, currentRole: string) => {
    // Dans une application réelle, on changerait un statut "is_active" ou on bannirait l'utilisateur
    alert(`Fonctionnalité de suspension non implémentée pour l'utilisateur ${id}`);
  };

  if (loading) {
    return <div style={{ padding: "var(--space-8)", textAlign: "center" }}>Chargement des profils...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", padding: "var(--space-6)" }}>
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Gestion et Sécurité</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Annuaire Global des Utilisateurs</h2>
        </div>
      </div>

      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ width: "100%" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, rôle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-container" style={{ minHeight: "300px", overflowX: "auto", width: "100%" }}>
          <table className="table" style={{ minWidth: "800px" }}>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Coordonnées</th>
                <th>Rôle</th>
                <th>Plan d'abonnement</th>
                <th>Date d'inscription</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--gray-400)" }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.full_name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "var(--gray-500)", fontSize: "12px" }}>
                            {p.full_name?.charAt(0) || "?"}
                          </div>
                        )}
                        <div>
                          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "700", margin: 0 }}>{p.full_name || "Sans nom"}</h4>
                          <span style={{ fontSize: "10px", color: "var(--gray-400)" }}>ID: {p.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "var(--text-xs)", color: "var(--gray-600)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Mail size={12} /> {p.email}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Phone size={12} /> {p.phone || "N/A"}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.role === 'admin' ? 'badge-primary' : p.role === 'owner' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: "capitalize", fontSize: "10px", background: p.role === 'admin' ? "var(--danger)" : undefined, color: p.role === 'admin' ? "white" : undefined }}>
                        {p.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--gray-700)", textTransform: "capitalize" }}>
                        {p.subscription_plan || "Gratuit"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--gray-600)" }}>
                        {formatDate(p.created_at)}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        title="Suspendre / Activer"
                        onClick={() => handleToggleStatus(p.id, p.role)}
                        style={{ color: "var(--danger)" }}
                      >
                        <UserX size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
