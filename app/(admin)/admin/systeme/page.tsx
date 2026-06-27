"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { AlertCircle, AlertTriangle, CheckCircle, Search, Clock } from "lucide-react";
import { Incident } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminSystemPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await db.getAllSystemIncidents();
      setIncidents(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredIncidents = incidents.filter(i => {
    const term = search.toLowerCase();
    return (
      (i.title?.toLowerCase() || "").includes(term) ||
      (i.description?.toLowerCase() || "").includes(term) ||
      (i.status?.toLowerCase() || "").includes(term)
    );
  });

  if (loading) {
    return <div style={{ padding: "var(--space-8)", textAlign: "center" }}>Chargement des incidents...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", padding: "var(--space-6)" }}>
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Supervision Technique</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Logs système & Anomalies globales</h2>
        </div>
      </div>

      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ width: "100%" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher une anomalie, un mot clé, un statut..."
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
                <th style={{ width: "60px", textAlign: "center" }}>Priorité</th>
                <th>Titre de l'anomalie</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Signalé le</th>
                <th>Résolu le</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--gray-400)" }}>
                    Aucune anomalie ou incident signalé dans le système.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id}>
                    <td style={{ textAlign: "center" }}>
                      {inc.priority === 'urgent' && <AlertCircle size={20} style={{ color: "var(--danger)", margin: "0 auto" }} />}
                      {inc.priority === 'high' && <AlertTriangle size={20} style={{ color: "var(--warning)", margin: "0 auto" }} />}
                      {inc.priority === 'medium' && <Clock size={20} style={{ color: "var(--primary)", margin: "0 auto" }} />}
                      {inc.priority === 'low' && <CheckCircle size={20} style={{ color: "var(--success)", margin: "0 auto" }} />}
                    </td>
                    <td>
                      <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "700", margin: 0, color: "var(--gray-900)" }}>
                        {inc.title}
                      </h4>
                      <span style={{ fontSize: "10px", color: "var(--gray-400)" }}>ID: {inc.id.substring(0,8)}</span>
                    </td>
                    <td>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-600)", margin: 0, maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {inc.description}
                      </p>
                    </td>
                    <td>
                      <span className={`badge ${
                        inc.status === 'open' ? 'badge-danger' : 
                        inc.status === 'in_progress' ? 'badge-warning' : 
                        'badge-success'
                      }`} style={{ fontSize: "10px", background: inc.status === 'open' ? "var(--danger)" : undefined, color: inc.status === 'open' ? "white" : undefined }}>
                        {inc.status === 'open' ? "Ouvert" : inc.status === 'in_progress' ? "En cours" : "Résolu"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--gray-600)" }}>
                        {formatDate(inc.created_at)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: inc.resolved_at ? "var(--success)" : "var(--gray-400)" }}>
                        {inc.resolved_at ? formatDate(inc.resolved_at) : "N/A"}
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
  );
}
