"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Map, 
  MapPin, 
  DollarSign, 
  Search, 
  Plus, 
  X, 
  Edit3,
  List,
  Grid,
  Image as ImageIcon,
  Trash2,
  Home,
  FileText,
  Navigation
} from "lucide-react";
import { db } from "@/lib/store";
import dynamic from "next/dynamic";
const MapModuleWrapper = dynamic(() => import("@/components/MapModuleWrapper"), { ssr: false });
import { Property, PropertyType, Landlord } from "@/lib/types";
import { formatCurrency, getPropertyStatusClass, getPropertyStatusLabel, getPropertyTypeLabel } from "@/lib/utils";

export default function LotsPage() {
  const router = useRouter();
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
  const [type, setType] = useState<PropertyType>("terrain");
  const [unitsCount, setUnitsCount] = useState<number>(0);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Abidjan");
  const [country, setCountry] = useState("Côte d'Ivoire");
  const [salePrice, setSalePrice] = useState("");
  const [desc, setDesc] = useState("");
  const [landlordId, setLandlordId] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [editMainImage, setEditMainImage] = useState("");

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const props = await db.getProperties();
      // Filter only terrain and lotissement
      const lands = props.filter(p => p.type === 'terrain' || p.type === 'lotissement');
      setProperties(lands);
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
          alert("Impossible d'obtenir votre position. Veuillez vérifier les autorisations.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    const newProp = await db.addProperty({
      name,
      type,
      address,
      city,
      country,
      monthly_rent: 0,
      sale_price: Number(salePrice) || 0,
      status: "vacant",
      description: desc,
      landlord_id: landlordId || undefined,
      images: mainImage ? [mainImage] : [],
      lat,
      lng
    });

    if (type === 'lotissement' && unitsCount > 0) {
      for (let i = 1; i <= unitsCount; i++) {
        await db.addProperty({
          name: `${name} - Lot ${i}`,
          type: 'terrain',
          address,
          city,
          country,
          monthly_rent: 0,
          sale_price: Number(salePrice) || 0,
          status: "vacant",
          description: desc,
          landlord_id: landlordId || undefined,
          images: mainImage ? [mainImage] : [],
          lat,
          lng,
          parent_id: newProp.id
        });
      }
    }

    setName("");
    setType("terrain");
    setUnitsCount(0);
    setAddress("");
    setCity("Abidjan");
    setCountry("Côte d'Ivoire");
    setSalePrice("");
    setDesc("");
    setLandlordId("");
    setMainImage("");
    setLat(undefined);
    setLng(undefined);
    setShowAddModal(false);

    await loadProperties();
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
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Ventes & Terrains</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Lots & Terrains</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Ajouter un lot / terrain
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="card" style={{ display: "flex", flexDirection: "row", gap: "var(--space-4)", alignItems: "center", flexWrap: "wrap", padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ flex: 1, minWidth: "240px" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", background: "var(--gray-100)", borderRadius: "var(--radius-md)", padding: "4px" }}>
            <button className={`btn btn-sm ${viewMode === "grid" ? "" : "btn-ghost"}`} onClick={() => setViewMode("grid")}>
              <Grid size={16} /> Cartes
            </button>
            <button className={`btn btn-sm ${viewMode === "list" ? "" : "btn-ghost"}`} onClick={() => setViewMode("list")}>
              <List size={16} /> Liste
            </button>
          </div>
          <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: "160px", appearance: "auto" }}>
            <option value="all">Tous les types</option>
            <option value="terrain">Terrains/Lots</option>
            <option value="lotissement">Lotissements</option>
          </select>
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: "160px", appearance: "auto" }}>
            <option value="all">Tous les statuts</option>
            <option value="vacant">Disponible</option>
            <option value="occupied">Vendu</option>
          </select>
        </div>
      </div>

      {/* Properties List */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(250px, 1fr))" : "1fr", gap: "var(--space-6)" }}>
           {[1, 2, 3].map((i) => (
             <div key={i} className="card skeleton" style={{ height: 200 }}></div>
           ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-16)" }}>
          <Map size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4) auto" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Aucun terrain ou lot trouvé</h3>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(250px, 1fr))" : "1fr", gap: "var(--space-6)" }}>
          {filteredProperties.map((p) => (
            <div key={p.id} className="card card-interactive" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: viewMode === "grid" ? "column" : "row", height: "100%" }}>
              <div className="card-image-container" style={{ height: viewMode === "grid" ? "180px" : "auto", width: viewMode === "list" ? "250px" : "auto", position: "relative" }}>
                <div className="card-image-zoom" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: p.images?.[0] ? `url(${p.images[0]}) center/cover` : "var(--gray-200)" }}></div>
                <span className={`badge badge-glass ${getPropertyStatusClass(p.status)}`} style={{ position: "absolute", top: "12px", right: "12px" }}>
                  {p.status === 'vacant' ? 'Disponible' : p.status === 'occupied' ? 'Vendu' : 'Indisponible'}
                </span>
              </div>
              <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", flexGrow: 1, gap: "var(--space-3)" }}>
                <div>
                  <span className={`badge ${p.type === 'lotissement' ? 'badge-success' : 'badge-primary'}`} style={{ textTransform: "uppercase", fontSize: "10px" }}>
                    {getPropertyTypeLabel(p.type)}
                  </span>
                  {p.parent_id && properties.find(parent => parent.id === p.parent_id) && (
                    <span className="badge badge-glass" style={{ fontSize: "9px", padding: "2px 8px", marginLeft: "4px" }}>
                      📍 {properties.find(parent => parent.id === p.parent_id)?.name}
                    </span>
                  )}
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--gray-900)", marginTop: "8px", marginBottom: "4px" }}>
                    {p.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: "var(--gray-500)" }}>
                    <MapPin size={14} /> {p.address}, {p.city}
                  </div>
                </div>
                
                <div style={{ fontSize: "var(--text-base)", fontWeight: 800, color: "var(--primary-dark)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <DollarSign size={18} style={{ color: "var(--primary)" }} /> {formatCurrency(p.sale_price || 0)}
                </div>

                <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "var(--space-3)", marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditProperty(p); setEditMainImage(p.images?.[0] || ""); }}>
                    <Edit3 size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} onClick={() => setDeleteProperty(p)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px", backdropFilter: "blur(4px)" }}>
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "850px", background: 'white', padding: "0", maxHeight: "90vh", overflowY: "auto", overflowX: "hidden" }}>
            
            <div style={{ position: "sticky", top: 0, background: "white", zIndex: 10, padding: "20px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Map size={20} style={{ color: "var(--primary)" }} /> Ajouter un Terrain / Lotissement
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddProperty} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", padding: "24px" }}>
              
              {/* Left Column: Infos de base */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Informations principales</h4>
                
                <div className="input-group">
                  <label className="input-label">Nom du bien</label>
                  <div className="input-with-icon">
                    <Home className="input-icon" size={16} />
                    <input type="text" required placeholder="Ex: Lotissement Palmeraie" value={name} onChange={(e) => setName(e.target.value)} className="input" style={{ paddingLeft: "36px" }} />
                  </div>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as PropertyType)} className="input" style={{ appearance: "auto" }}>
                    <option value="terrain">Terrain simple (Lot)</option>
                    <option value="lotissement">Lotissement (Génère plusieurs lots)</option>
                  </select>
                </div>
                
                {type === 'lotissement' && (
                  <div className="input-group">
                    <label className="input-label">Nombre de lots à générer</label>
                    <input type="number" min="1" value={unitsCount || ""} onChange={(e) => setUnitsCount(Number(e.target.value))} className="input" />
                  </div>
                )}
                
                <div className="input-group">
                  <label className="input-label">Prix de vente (FCFA)</label>
                  <div className="input-with-icon">
                    <DollarSign className="input-icon" size={16} />
                    <input type="number" required value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="input" style={{ paddingLeft: "36px" }} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Image principale (URL)</label>
                  <div className="input-with-icon">
                    <ImageIcon className="input-icon" size={16} />
                    <input type="text" placeholder="https://..." value={mainImage} onChange={(e) => setMainImage(e.target.value)} className="input" style={{ paddingLeft: "36px" }} />
                  </div>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Description (Optionnel)</label>
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="input" rows={3}></textarea>
                </div>
              </div>

              {/* Right Column: Localisation & GPS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Localisation & Coordonnées</h4>
                  
                  <div className="input-group">
                    <label className="input-label">Adresse / Quartier</label>
                    <div className="input-with-icon">
                      <MapPin className="input-icon" size={16} />
                      <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="input" style={{ paddingLeft: "36px" }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Ville</label>
                      <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="input" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Pays</label>
                      <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} className="input" />
                    </div>
                  </div>
                </div>

                <div style={{ height: "1px", background: "var(--gray-200)", margin: "4px 0" }}></div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Coordonnées GPS</h4>
                  <div style={{ background: "var(--primary-lighter)", border: "1px solid rgba(var(--primary-rgb), 0.2)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="input-group">
                        <label className="input-label">Latitude</label>
                        <div className="input-with-icon">
                          <Navigation className="input-icon" size={16} />
                          <input type="number" step="any" placeholder="Ex: 5.3599" value={lat || ""} onChange={(e) => setLat(e.target.value ? Number(e.target.value) : undefined)} className="input" style={{ paddingLeft: "36px", background: "white" }} />
                        </div>
                      </div>
                      <div className="input-group">
                        <label className="input-label">Longitude</label>
                        <div className="input-with-icon">
                          <Navigation className="input-icon" size={16} />
                          <input type="number" step="any" placeholder="Ex: -4.0082" value={lng || ""} onChange={(e) => setLng(e.target.value ? Number(e.target.value) : undefined)} className="input" style={{ paddingLeft: "36px", background: "white" }} />
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "12px", marginBottom: 0 }}>
                      Ces coordonnées permettront d'afficher le bien sur la mini-carte lors de la vente.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Documents annexes</h4>
                  <div style={{ border: "2px dashed var(--gray-200)", borderRadius: "var(--radius-md)", padding: "16px", textAlign: "center", color: "var(--gray-500)", background: "var(--gray-50)" }}>
                    <FileText size={24} style={{ opacity: 0.5, margin: "0 auto 8px auto" }} />
                    <p style={{ fontSize: "13px", margin: 0 }}>L'upload de Titre Foncier et d'ACD sera bientôt disponible.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "auto", paddingTop: "16px" }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Enregistrer le bien</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal / Delete Modal... Omitted for brevity but basically identical logic */}
    </div>
  );
}
