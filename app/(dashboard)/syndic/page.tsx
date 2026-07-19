"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Banknote,
  Search,
  Layers,
  ArrowRight
} from "lucide-react";
import { db } from "@/lib/store";
import { Property } from "@/lib/types";

export default function SyndicPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        const props = await db.getProperties();
        // Filtrer pour ne garder que les super-structures (immeubles, résidences, cours communes)
        const superStructures = props.filter(p => 
          ['building', 'residence', 'cour_commune'].includes(p.type)
        );
        setProperties(superStructures);
      } finally {
        setIsLoading(false);
      }
    };
    loadProperties();
  }, []);

  const filteredProperties = properties.filter((p) => {
    const safeName = p.name || "";
    return safeName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Gestion de copropriété et syndic</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Syndic & Charges</h2>
        </div>
      </div>

      {/* Filter and search bar */}
      <div 
        className="card" 
        style={{ 
          display: "flex", 
          flexDirection: "row", 
          gap: "var(--space-4)", 
          alignItems: "center", 
          padding: "var(--space-4)"
        }}
      >
        <div className="input-with-icon" style={{ flex: 1, minWidth: "240px" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher un immeuble ou une résidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Properties List */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-6)" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: "var(--space-4)", height: "160px" }}>
               <div className="skeleton skeleton-text short"></div>
               <div className="skeleton skeleton-text long"></div>
               <div className="skeleton skeleton-text" style={{ marginTop: "auto" }}></div>
            </div>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-16)" }}>
          <Layers size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4) auto" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Aucune copropriété trouvée</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", maxWidth: "400px", margin: "4px auto 0 auto" }}>
            Pour utiliser le module Syndic, vous devez d'abord créer un Immeuble, une Résidence ou une Cour Commune dans la section "Mes Biens".
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-6)" }}>
          {filteredProperties.map((p) => (
            <div key={p.id} className="card card-interactive" style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", background: "var(--primary-lightest)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "var(--text-md)", fontWeight: "700", color: "var(--gray-900)", margin: "0 0 4px 0", lineClamp: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--gray-500)" }}>
                    <MapPin size={12} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.address}, {p.city}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--gray-100)", marginTop: "auto", paddingTop: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge badge-info" style={{ fontSize: "10px" }}>
                  Gestion des charges
                </span>
                <Link href={`/syndic/${p.id}`} className="btn btn-ghost btn-sm" style={{ color: "var(--primary)", padding: "4px 8px" }}>
                  Gérer <ArrowRight size={14} style={{ marginLeft: "4px" }} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
