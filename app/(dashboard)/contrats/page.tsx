"use client";

import { useEffect, useState } from "react";
import { FolderLock, Plus, FileText, Search, X, Download } from "lucide-react";
import { db } from "@/lib/store";
import { Lease, Property, Tenant } from "@/lib/types";

export default function ContratsPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [search, setSearch] = useState("");
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);

  useEffect(() => {
    const loadLeasesData = async () => {
      const leasesList = await db.getLeases();
      const rawProps = await db.getProperties();
      const rawTens = await db.getTenants();
      const props = rawProps.reduce((acc, p) => ({...acc, [p.id]: p}), {} as Record<string, Property>);
      const tens = rawTens.reduce((acc, t) => ({...acc, [t.id]: t}), {} as Record<string, Tenant>);
      
      setLeases(leasesList);
      setProperties(props);
      setTenants(tens);
    };
    loadLeasesData();
  }, []);

  const filtered = leases.filter(l => {
    const t = tenants[l.tenant_id];
    const p = properties[l.property_id];
    const tName = t?.full_name || "";
    const pName = p?.name || "";
    return tName.toLowerCase().includes(search.toLowerCase()) || pName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Gérez vos contrats de bail</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Contrats de bail</h2>
        </div>
        <button className="btn btn-primary" onClick={() => alert("L'ajout de contrat sera bientôt disponible")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Nouveau Contrat
        </button>
      </div>

      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ maxWidth: "400px" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher par locataire ou bien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-16)" }}>
          <FolderLock size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4) auto" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Aucun contrat trouvé</h3>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "var(--space-6)" }}>
          {filtered.map(l => {
             const t = tenants[l.tenant_id];
             const p = properties[l.property_id];
             return (
               <div key={l.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between" }}>
                   <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700 }}>Contrat pour {t ? t.full_name : "Inconnu"}</h3>
                   <span className={`badge ${l.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                     {l.status === 'active' ? 'En cours' : 'Terminé'}
                   </span>
                 </div>
                 <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)", margin: 0 }}>Bien: {p ? p.name : "Inconnu"}</p>
                 <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)", marginTop: "var(--space-2)" }}>
                   <div>Début: <span style={{ color: "var(--gray-800)", fontWeight: 600 }}>{l.start_date}</span></div>
                   <div>Fin: <span style={{ color: "var(--gray-800)", fontWeight: 600 }}>{l.end_date}</span></div>
                 </div>
                 <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "var(--space-3)", marginTop: "var(--space-2)" }}>
                   <button className="btn btn-outline btn-sm" style={{ width: "100%", display: "flex", justifyContent: "center", gap: "6px" }} onClick={() => setSelectedLease(l)}>
                     <FileText size={14} /> Consulter le bail
                   </button>
                 </div>
               </div>
             )
          })}
        </div>
      )}

      {/* Modal for viewing lease details */}
      {selectedLease && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "var(--space-4)",
            backdropFilter: "blur(4px)"
          }}
          className="animate-fade-in"
          onClick={() => setSelectedLease(null)}
        >
          <div 
            className="card animate-scale-in"
            style={{
              width: "100%",
              maxWidth: "600px",
              background: "white",
              padding: "var(--space-6)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <FileText size={24} style={{ color: "var(--primary)" }} />
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", margin: 0 }}>Détails du Contrat de Bail</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedLease(null)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", background: "var(--gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: "0 0 4px 0" }}>Locataire</p>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0 }}>{tenants[selectedLease.tenant_id]?.full_name || "Inconnu"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: "0 0 4px 0" }}>Bien immobilier</p>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0 }}>{properties[selectedLease.property_id]?.name || "Inconnu"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: "0 0 4px 0" }}>Date de début</p>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0 }}>{selectedLease.start_date}</p>
                </div>
                <div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: "0 0 4px 0" }}>Date de fin</p>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0 }}>{selectedLease.end_date}</p>
                </div>
                <div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: "0 0 4px 0" }}>Loyer mensuel</p>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0, color: "var(--primary-dark)" }}>{selectedLease.rent_amount.toLocaleString("fr-FR")} FCFA</p>
                </div>
                <div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: "0 0 4px 0" }}>Caution</p>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0 }}>{selectedLease.deposit_amount.toLocaleString("fr-FR")} FCFA</p>
                </div>
              </div>

              <div style={{ marginTop: "var(--space-4)", padding: "var(--space-6)", border: "1px dashed var(--gray-300)", borderRadius: "var(--radius-md)", textAlign: "center", background: "var(--gray-50)" }}>
                <FileText size={48} style={{ color: "var(--gray-400)", margin: "0 auto var(--space-4) auto" }} />
                <h4 style={{ fontSize: "var(--text-md)", fontWeight: "600", marginBottom: "var(--space-2)" }}>Document numérique</h4>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", marginBottom: "var(--space-4)" }}>Le document complet du bail est numérisé et stocké de manière sécurisée.</p>
                <button className="btn btn-primary" onClick={() => alert("Le téléchargement du document original sera disponible prochainement.")} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Download size={16} /> Télécharger le PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
