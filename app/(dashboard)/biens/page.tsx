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
  List,
  Grid,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import { db } from "@/lib/store";
import dynamic from "next/dynamic";
const MapModuleWrapper = dynamic(() => import("@/components/MapModuleWrapper"), { ssr: false });
import { Property, PropertyType, Landlord } from "@/lib/types";
import { formatCurrency, getPropertyStatusClass, getPropertyStatusLabel, getPropertyTypeLabel } from "@/lib/utils";

export default function BiensPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [deleteProperty, setDeleteProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("grid");
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<PropertyType>("apartment");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Abidjan");
  const [country, setCountry] = useState("Côte d'Ivoire");
  const [rent, setRent] = useState("");
  const [desc, setDesc] = useState("");
  const [landlordId, setLandlordId] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);

  // Edit form state
  const [editMainImage, setEditMainImage] = useState("");

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const props = await db.getProperties();
      setProperties(props);
      setLandlords(await db.getLandlords());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleGetLocation = (isEdit: boolean) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isEdit && editProperty) {
            setEditProperty({...editProperty, lat: position.coords.latitude, lng: position.coords.longitude});
          } else {
            setLat(position.coords.latitude);
            setLng(position.coords.longitude);
          }
        },
        () => {
          alert("Impossible d'obtenir votre position. Veuillez vérifier les autorisations de votre navigateur.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

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
      landlord_id: landlordId || undefined,
      images: mainImage ? [mainImage] : [],
      lat,
      lng
    });

    // Reset form & close modal
    setName("");
    setType("apartment");
    setAddress("");
    setCity("Abidjan");
    setCountry("Côte d'Ivoire");
    setRent("");
    setDesc("");
    setLandlordId("");
    setMainImage("");
    setLat(undefined);
    setLng(undefined);
    setShowAddModal(false);

    // Reload list
    await loadProperties();
    // Dispatch storage event to update dashboard if open
    window.dispatchEvent(new Event("storage"));
  };

  const handleSaveEditProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProperty) return;

    await db.updateProperty({
      ...editProperty,
      images: editMainImage ? [editMainImage] : editProperty.images
    });

    setEditProperty(null);
    await loadProperties();
    window.dispatchEvent(new Event("storage"));
  };

  const handleDeleteProperty = async (id: string) => {
    await db.deleteProperty(id);
    setDeleteProperty(null);
    await loadProperties();
    window.dispatchEvent(new Event("storage"));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 800; // 800px is good enough for property cards
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        if (isEdit) {
           setEditMainImage(compressedBase64);
        } else {
           setMainImage(compressedBase64);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const filteredProperties = properties.filter((p) => {
    const safeName = p.name || "";
    const safeAddress = p.address || "";
    const matchesSearch = 
      safeName.toLowerCase().includes(search.toLowerCase()) || 
      safeAddress.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div className="page-header">
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
              className={`btn btn-sm ${viewMode === "grid" ? "" : "btn-ghost"}`} 
              style={{ background: viewMode === "grid" ? "white" : "transparent", color: viewMode === "grid" ? "var(--gray-900)" : "var(--gray-500)", border: viewMode === "grid" ? "1px solid var(--gray-200)" : "none", display: "flex", alignItems: "center", gap: "6px", boxShadow: viewMode === "grid" ? "var(--shadow-sm)" : "none" }}
              onClick={() => setViewMode("grid")}
            >
              <Grid size={16} /> Cartes
            </button>
            <button 
              className={`btn btn-sm ${viewMode === "map" ? "" : "btn-ghost"}`} 
              style={{ background: viewMode === "map" ? "white" : "transparent", color: viewMode === "map" ? "var(--gray-900)" : "var(--gray-500)", border: viewMode === "map" ? "1px solid var(--gray-200)" : "none", display: "flex", alignItems: "center", gap: "6px", boxShadow: viewMode === "map" ? "var(--shadow-sm)" : "none" }}
              onClick={() => setViewMode("map")}
            >
              <Map size={16} /> Plan
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
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr", gap: "var(--space-6)" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card" style={{ padding: 0, height: viewMode === "grid" ? "400px" : "180px", display: "flex", flexDirection: viewMode === "grid" ? "column" : "row" }}>
              <div className="skeleton skeleton-image" style={{ height: viewMode === "grid" ? "240px" : "100%", width: viewMode === "list" ? "280px" : "100%" }}></div>
              <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)", flexGrow: 1 }}>
                 <div className="skeleton skeleton-text short"></div>
                 <div className="skeleton skeleton-text long"></div>
                 <div className="skeleton skeleton-text" style={{ marginTop: "auto" }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "map" ? (
        <MapModuleWrapper properties={filteredProperties} />
      ) : filteredProperties.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-16)" }}>
          <Building2 size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4) auto" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Aucun bien immobilier trouvé</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", maxWidth: "400px", margin: "4px auto 0 auto" }}>
            Essayez de modifier vos filtres ou ajoutez votre premier bien immobilier en utilisant le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr", gap: "var(--space-6)" }}>
          {filteredProperties.map((p) => (
            <div key={p.id} className="card card-interactive" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: viewMode === "grid" ? "column" : "row", height: "100%" }}>
              {/* Image Banner */}
              <div className="card-image-container" style={{ 
                height: viewMode === "grid" ? "240px" : "auto", 
                width: viewMode === "list" ? "280px" : "auto",
                minHeight: viewMode === "list" ? "100%" : "auto",
                position: "relative",
                borderBottom: viewMode === "grid" ? "1px solid var(--gray-200)" : "none",
                borderRight: viewMode === "list" ? "1px solid var(--gray-200)" : "none"
              }}>
                <div className="card-image-zoom" style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  background: p.images && p.images.length > 0 ? `url(${p.images[0]}) center/cover` : "var(--gray-200)", 
                }}></div>
                {(!p.images || p.images.length === 0) && (
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "var(--gray-400)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <ImageIcon size={32} />
                    {viewMode === "grid" && <span style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}>Aucune image</span>}
                  </div>
                )}
                <span className={`badge badge-glass ${getPropertyStatusClass(p.status)}`} style={{ position: "absolute", top: "12px", right: "12px" }}>
                  {getPropertyStatusLabel(p.status)}
                </span>
              </div>

              <div style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", flexGrow: 1, gap: "var(--space-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span className={`badge ${p.type === 'villa' ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: "uppercase", fontSize: "9px", padding: "2px 8px" }}>
                      {getPropertyTypeLabel(p.type)}
                    </span>
                    <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--gray-900)", marginTop: "4px" }}>
                      {p.name}
                    </h3>
                  </div>
                  {viewMode === "list" && (
                     <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--primary-dark)" }}>
                       <DollarSign size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                       <span>{formatCurrency(p.monthly_rent)} <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", fontWeight: 400 }}>/ mois</span></span>
                     </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: viewMode === "grid" ? "column" : "row", gap: viewMode === "grid" ? "4px" : "var(--space-6)", flexGrow: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>
                    <MapPin size={16} style={{ color: "var(--gray-400)", flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.address}, {p.city}
                    </span>
                  </div>
                  {viewMode === "grid" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--primary-dark)" }}>
                      <DollarSign size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <span>{formatCurrency(p.monthly_rent)} <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", fontWeight: 400 }}>/ mois</span></span>
                    </div>
                  )}
                  {p.description && viewMode === "grid" && (
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: "6px 0 0 0", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.description}
                    </p>
                  )}
                  {viewMode === "list" && (
                     <span style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", display: "flex", alignItems: "center" }}>
                      {p.landlord_name && <span style={{color: "var(--gray-700)", fontWeight: 600, marginRight: "8px"}}>{p.landlord_name} &bull;</span>}
                      {p.tenant_count && p.tenant_count > 0 ? `${p.tenant_count} Locataire(s)` : "Aucun locataire"}
                    </span>
                  )}
                </div>

                <div style={{ borderTop: viewMode === "grid" ? "1px solid var(--gray-100)" : "none", paddingTop: viewMode === "grid" ? "var(--space-2)" : 0, marginTop: "auto", display: "flex", justifyContent: viewMode === "grid" ? "space-between" : "flex-end", alignItems: "center" }}>
                  {viewMode === "grid" && (
                     <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>
                      {p.landlord_name && <span style={{display: "block", color: "var(--gray-700)", fontWeight: 600, marginBottom: "2px"}}>{p.landlord_name}</span>}
                      {p.tenant_count && p.tenant_count > 0 ? `${p.tenant_count} Locataire(s)` : "Aucun locataire"}
                    </span>
                  )}
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => {
                      setEditProperty(p);
                      setEditMainImage(p.images?.[0] || "");
                    }} style={{ color: "var(--gray-600)" }}>
                      <Edit3 size={14} /> Modifier
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDeleteProperty(p)} style={{ color: "var(--danger)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
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
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "var(--space-6)", minHeight: "32px", marginTop: "12px" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", textAlign: "center", margin: 0 }}>Ajouter un nouveau bien</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)} style={{ position: "absolute", right: 0, top: "-8px", padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProperty} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {/* Image Uploader */}
              <div className="input-group">
                <label className="input-label">Image principale du bien</label>
                <div style={{ 
                  border: "2px dashed var(--gray-300)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", 
                  textAlign: "center", cursor: "pointer", background: "var(--gray-50)", position: "relative"
                }}>
                  {mainImage ? (
                    <div style={{ position: "relative" }}>
                       <img src={mainImage} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "var(--radius-sm)" }} />
                       <button type="button" onClick={() => setMainImage("")} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", padding: 4, cursor: "pointer" }}><X size={16} /></button>
                    </div>
                  ) : (
                    <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "var(--space-4) 0" }}>
                      <ImageIcon size={32} style={{ color: "var(--gray-400)" }} />
                      <span style={{ color: "var(--gray-600)", fontSize: "var(--text-sm)" }}>Cliquez pour ajouter une image</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageSelect(e, false)} />
                    </label>
                  )}
                </div>
              </div>

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
                <label className="input-label">Propriétaire (Bailleur)</label>
                <select
                  value={landlordId}
                  onChange={(e) => setLandlordId(e.target.value)}
                  className="input"
                  style={{ appearance: "auto" }}
                >
                  <option value="">-- Propriété de l'agence (Aucun) --</option>
                  {landlords.map((l) => (
                    <option key={l.id} value={l.id}>{l.full_name}</option>
                  ))}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label className="input-label" style={{ margin: 0 }}>Coordonnées GPS (Optionnel)</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleGetLocation(false)} style={{ color: "var(--primary)", padding: "2px 8px", height: "auto", fontSize: "12px", minHeight: "24px" }}>
                    <MapPin size={12} style={{ marginRight: "4px" }} /> Ma position actuelle
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude (ex: 5.3599)"
                    value={lat || ""}
                    onChange={(e) => setLat(e.target.value ? Number(e.target.value) : undefined)}
                    className="input"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude (ex: -4.0082)"
                    value={lng || ""}
                    onChange={(e) => setLng(e.target.value ? Number(e.target.value) : undefined)}
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

      {/* ============================================    
         Edit Property Modal
         ============================================ */}
      {editProperty && (
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
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "var(--space-6)", minHeight: "32px", marginTop: "12px" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", textAlign: "center", margin: 0 }}>Modifier le bien</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditProperty(null)} style={{ position: "absolute", right: 0, top: "-8px", padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProperty} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {/* Image Uploader */}
              <div className="input-group">
                <label className="input-label">Image principale du bien</label>
                <div style={{ 
                  border: "2px dashed var(--gray-300)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", 
                  textAlign: "center", cursor: "pointer", background: "var(--gray-50)", position: "relative"
                }}>
                  {editMainImage ? (
                    <div style={{ position: "relative" }}>
                       <img src={editMainImage} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "var(--radius-sm)" }} />
                       <button type="button" onClick={() => setEditMainImage("")} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", padding: 4, cursor: "pointer" }}><X size={16} /></button>
                    </div>
                  ) : (
                    <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "var(--space-4) 0" }}>
                      <ImageIcon size={32} style={{ color: "var(--gray-400)" }} />
                      <span style={{ color: "var(--gray-600)", fontSize: "var(--text-sm)" }}>Cliquez pour changer d'image</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageSelect(e, true)} />
                    </label>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Nom du bien</label>
                <input
                  type="text"
                  required
                  value={editProperty.name}
                  onChange={(e) => setEditProperty({...editProperty, name: e.target.value})}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Type de bien</label>
                <select
                  value={editProperty.type}
                  onChange={(e) => setEditProperty({...editProperty, type: e.target.value as PropertyType})}
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
                <label className="input-label">Statut</label>
                <select
                  value={editProperty.status}
                  onChange={(e) => setEditProperty({...editProperty, status: e.target.value as "vacant" | "occupied" | "maintenance"})}
                  className="input"
                  style={{ appearance: "auto" }}
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupé</option>
                  <option value="maintenance">En travaux</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Loyer mensuel (FCFA)</label>
                <input
                  type="number"
                  required
                  value={editProperty.monthly_rent}
                  onChange={(e) => setEditProperty({...editProperty, monthly_rent: Number(e.target.value)})}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Adresse physique</label>
                <input
                  type="text"
                  required
                  value={editProperty.address}
                  onChange={(e) => setEditProperty({...editProperty, address: e.target.value})}
                  className="input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div className="input-group">
                  <label className="input-label">Ville</label>
                  <input
                    type="text"
                    required
                    value={editProperty.city}
                    onChange={(e) => setEditProperty({...editProperty, city: e.target.value})}
                    className="input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Pays</label>
                  <input
                    type="text"
                    required
                    value={editProperty.country}
                    onChange={(e) => setEditProperty({...editProperty, country: e.target.value})}
                    className="input"
                  />
                </div>
              </div>

              <div className="input-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label className="input-label" style={{ margin: 0 }}>Coordonnées GPS (Optionnel)</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleGetLocation(true)} style={{ color: "var(--primary)", padding: "2px 8px", height: "auto", fontSize: "12px", minHeight: "24px" }}>
                    <MapPin size={12} style={{ marginRight: "4px" }} /> Ma position actuelle
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude (ex: 5.3599)"
                    value={editProperty.lat || ""}
                    onChange={(e) => setEditProperty({...editProperty, lat: e.target.value ? Number(e.target.value) : undefined})}
                    className="input"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude (ex: -4.0082)"
                    value={editProperty.lng || ""}
                    onChange={(e) => setEditProperty({...editProperty, lng: e.target.value ? Number(e.target.value) : undefined})}
                    className="input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  value={editProperty.description || ""}
                  onChange={(e) => setEditProperty({...editProperty, description: e.target.value})}
                  className="input"
                  rows={3}
                  style={{ resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditProperty(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Property */}
      {deleteProperty && (
        <div 
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: "var(--space-4)", backdropFilter: "blur(4px)"
          }}
          className="animate-fade-in"
          onClick={() => setDeleteProperty(null)}
        >
          <div 
            className="card animate-scale-in"
            style={{ width: "100%", maxWidth: "400px", background: "white", padding: "var(--space-6)", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-4)" }}>
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "16px", borderRadius: "50%" }}>
                <Trash2 size={32} />
              </div>
            </div>
            
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", marginBottom: "var(--space-2)" }}>Supprimer ce bien ?</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: "var(--space-6)" }}>
              Êtes-vous sûr de vouloir supprimer définitivement <strong>{deleteProperty.name}</strong> ? Cette action est irréversible.
            </p>

            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteProperty(null)}>
                Annuler
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1, background: "var(--danger)", borderColor: "var(--danger)", color: "white" }} onClick={() => handleDeleteProperty(deleteProperty.id)}>
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
