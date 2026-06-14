"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Search, CheckCircle } from "lucide-react";
import { db } from "@/lib/store";
import { Incident, Property, Tenant } from "@/lib/types";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});

  useEffect(() => {
    const loadIncidentsData = async () => {
      const list = await db.getIncidents();
      const rawProps = await db.getProperties();
      const rawTens = await db.getTenants();
      const props = rawProps.reduce((acc, p) => ({...acc, [p.id]: p}), {} as Record<string, Property>);
      const tens = rawTens.reduce((acc, t) => ({...acc, [t.id]: t}), {} as Record<string, Tenant>);
      
      setIncidents(list);
      setProperties(props);
      setTenants(tens);
    };
    loadIncidentsData();
  }, []);

  const filtered = incidents.filter(i => {
    return i.title.toLowerCase().includes(search.toLowerCase()) || 
           i.description.toLowerCase().includes(search.toLowerCase());
  });

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') return <span className="badge badge-danger">Urgent</span>;
    if (priority === 'medium') return <span className="badge badge-warning">Normal</span>;
    return <span className="badge badge-info">Faible</span>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'open') return <span className="badge badge-warning">Nouveau</span>;
    if (status === 'in_progress') return <span className="badge badge-info">En cours</span>;
    return <span className="badge badge-success">Résolu</span>;
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Suivi des problèmes et réparations</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Incidents</h2>
        </div>
        <button className="btn btn-primary" onClick={() => alert("Le signalement d'incident sera bientôt disponible")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Signaler un incident
        </button>
      </div>

      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ maxWidth: "400px" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher un incident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-16)" }}>
          <AlertTriangle size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4) auto" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Aucun incident</h3>
          <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>Tout va bien dans vos propriétés !</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-4)" }}>
          {filtered.map(i => {
             const t = tenants[i.tenant_id];
             const p = properties[i.property_id];
             return (
               <div key={i.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                   <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                     {getPriorityBadge(i.priority)}
                     <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, margin: 0 }}>{i.title}</h3>
                   </div>
                   {getStatusBadge(i.status)}
                 </div>
                 <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)", margin: 0 }}>{i.description}</p>
                 <div style={{ display: "flex", gap: "var(--space-6)", fontSize: "var(--text-xs)", color: "var(--gray-500)", marginTop: "var(--space-2)" }}>
                   <div>Bien: <span style={{ color: "var(--gray-800)", fontWeight: 600 }}>{p ? p.name : "Inconnu"}</span></div>
                   <div>Locataire: <span style={{ color: "var(--gray-800)", fontWeight: 600 }}>{t ? t.full_name : "Inconnu"}</span></div>
                   <div>Signalé le: <span style={{ color: "var(--gray-800)", fontWeight: 600 }}>{new Date(i.created_at).toLocaleDateString()}</span></div>
                 </div>
                 {i.status !== "resolved" && (
                   <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "var(--space-3)", marginTop: "var(--space-2)" }}>
                      <button className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={async () => {
                         const updated = {...i, status: "resolved", resolved_at: new Date().toISOString()};
                         await db.updateIncident(updated as Incident);
                         const list = await db.getIncidents();
                         setIncidents(list);
                      }}>
                       <CheckCircle size={14} /> Marquer comme résolu
                     </button>
                   </div>
                 )}
               </div>
             )
          })}
        </div>
      )}
    </div>
  );
}
