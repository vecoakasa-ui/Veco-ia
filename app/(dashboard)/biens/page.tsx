"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Search, 
  Plus, 
  X, 
  Edit3,
  Map,
  List
} from "lucide-react";
import { db } from "@/lib/store";
import MapModuleWrapper from "@/components/MapModuleWrapper";
import { Property, PropertyType } from "@/lib/types";
import { formatCurrency, getPropertyStatusClass, getPropertyStatusLabel, getPropertyTypeLabel } from "@/lib/utils";

export default function BiensPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<PropertyType>("apartment");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Abidjan");
  const [country, setCountry] = useState("Côte d'Ivoire");
  const [rent, setRent] = useState("");
  const [desc, setDesc] = useState("");

  const loadProperties = async () => {
    const props = await db.getProperties();
    setProperties(props);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadProperties();
    });
  }, []);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !rent) return;

    await db.addProperty({
      name,
      type,
      address,
      city,
      country,
      monthly_rent: Number(rent),
      status: "vacant",
      description: desc,
      images: []
    });

    // Reset form & close modal
    setName("");
    setType("apartment");
    setAddress("");
    setCity("Abidjan");
    setCountry("Côte d'Ivoire");
    setRent("");
    setDesc("");
    setShowAddModal(false);

    // Reload list
    await loadProperties();
    // Dispatch storage event to update dashboard if open
    window.dispatchEvent(new Event("storage"));
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.address.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Gestion de votre patrimoine immobilier</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Mes Biens Immobiliers</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Ajouter un bien
        </button>
      </div>

      {/* Filter and search bar */}
      <div 
        className="card" 
        style={{ 
          display: "flex", 
          flexDirection: "row", 
          gap: "var(--space-4)", 
          alignItems: "center", 
          flexWrap: "wrap", 
          padding: "var(--space-4)"
        }}
      >
        <div className="input-with-icon" style={{ flex: 1, minWidth: "240px" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom ou adresse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}>
          {/* View toggle */}
          <div style={{ display: "flex", background: "var(--gray-100)", borderRadius: "var(--radius-md)", padding: "4px" }}>
            <button 
              className={`btn btn-sm ${viewMode === "list" ? "" : "btn-ghost"}`} 
              style={{ background: viewMode === "list" ? "white" : "transparent", color: viewMode === "list" ? "var(--gray-900)" : "var(--gray-500)", border: viewMode === "list" ? "1px solid var(--gray-200)" : "none", display: "flex", alignItems: "center", gap: "6px", boxShadow: viewMode === "list" ? "var(--shadow-sm)" : "none" }}
              onClick={() => setViewMode("list")}
            >
              <List size={16} /> Liste
            </button>
            <button 
              className={`btn btn-sm ${viewMode === "map" ? "" : "btn-ghost"}`} 
              style={{ background: viewMode === "map" ? "white" : "transparent", color: viewMode === "map" ? "var(--gray-900)" : "var(--gray-500)", border: viewMode === "map" ? "1px solid var(--gray-200)" : "none", display: "flex", alignItems: "center", gap: "6px", boxShadow: viewMode === "map" ? "var(--shadow-sm)" : "none" }}
              onClick={() => setViewMode("map")}
            >
              <Map size={16} /> Carte
            </button>
          </div>

          {/* Type filter */}
          <select 
            className="input" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: "160px", appearance: "auto" }}
          >
            <option value="all">Tous les types</option>
            <option value="villa">Villas</option>
            <option value="apartment">Appartements</option>
            <option value="studio">Studios</option>
            <option value="house">Maisons</option>
          </select>

          {/* Status filter */}
          <select 
            className="input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "160px", appearance: "auto" }}
          >
            <option value="all">Tous les statuts</option>
            <option value="occupied">Occupés</option>
            <option value="vacant">Vacants</option>
            <option value="maintenance">En travaux</option>
          </select>
        </div>
      </div>

      {/* Properties List or Map */}
      {viewMode === "map" ? (
        <MapModuleWrapper properties={filteredProperties} />
      ) : filteredProperties.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-16)" }}>
          <Building2 size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4) auto" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Aucun bien immobilier trouvé</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", maxWidth: "400px", margin: "4px auto var(--space-6) auto" }}>
            Essayez de modifier vos filtres ou ajoutez votre premier bien immobilier en cliquant sur le bouton ci-dessus.
          </p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            Ajouter un bien immobilier
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
          {filteredProperties.map((p) => (
            <div key={p.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
                <div>
                  <span className={`badge ${p.type === 'villa' ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: "uppercase", fontSize: "9px", padding: "2px 8px" }}>
                    {getPropertyTypeLabel(p.type)}
                  </span>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--gray-900)", marginTop: "4px" }}>
                    {p.name}
                  </h3>
                </div>
                <span className={`badge ${getPropertyStatusClass(p.status)}`}>
                  {getPropertyStatusLabel(p.status)}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", margin: "var(--space-4) 0", flexGrow: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>
                  <MapPin size={16} style={{ color: "var(--gray-400)", flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.address}, {p.city}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--primary-dark)" }}>
                  <DollarSign size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <span>{formatCurrency(p.monthly_rent)} <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", fontWeight: 400 }}>/ mois</span></span>
                </div>
                {p.description && (
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: "6px 0 0 0", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {p.description}
                  </p>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "var(--space-4)", marginTop: "var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>
                  {p.tenant_count && p.tenant_count > 0 ? `${p.tenant_count} Locataire(s)` : "Aucun locataire"}
                </span>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => alert("Fonctionnalité d'édition bientôt disponible dans la version finale.")} style={{ color: "var(--gray-600)" }}>
                    <Edit3 size={14} /> Modifier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================
         Add Property Modal
         ============================================ */}
      {showAddModal && (
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
        >
          <div 
            className="card animate-scale-in"
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "white",
              padding: "var(--space-6)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800" }}>Ajouter un nouveau bien</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProperty} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Nom du bien</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Villa Hibiscus, Apt C2..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Type de bien</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                  className="input"
                  style={{ appearance: "auto" }}
                >
                  <option value="apartment">Appartement</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="house">Maison</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Loyer mensuel (FCFA)</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 250000"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Adresse physique</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rue des Jardins, Riviera 3..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div className="input-group">
                  <label className="input-label">Ville</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Pays</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Description (Optionnel)</label>
                <textarea
                  placeholder="Caractéristiques additionnelles (piscine, étage, balcon...)"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="input"
                  rows={3}
                  style={{ resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Enregistrer le bien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
