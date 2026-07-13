"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Plus, 
  X, 
  Mail, 
  Phone, 
  Calendar,
  Building,
  MoreHorizontal,
  ExternalLink,
  Trash2
} from "lucide-react";
import { db } from "@/lib/store";
import { Tenant, Property } from "@/lib/types";
import { formatDate, getPropertyTypeLabel } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function LocatairesPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LocatairesContent />
    </Suspense>
  );
}

function LocatairesContent() {
  const searchParams = useSearchParams();
  const initialPropertyId = searchParams.get("property_id");
  const initialSearch = searchParams.get("search") || "";
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [filterPropertyId, setFilterPropertyId] = useState<string | null>(initialPropertyId);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (filterPropertyId && e.target.value !== initialSearch) {
      setFilterPropertyId(null);
    }
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const activePhotoIdRef = useRef<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [deleteTenantId, setDeleteTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [leaseType, setLeaseType] = useState<"residential" | "commercial">("residential");
  const [avatarUrl, setAvatarUrl] = useState("");
  const addPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 200;
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
        
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        setAvatarUrl(compressedBase64);
      };
    };
    reader.readAsDataURL(file);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      setTenants(await db.getTenants());
      setProperties(await db.getProperties());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, []);

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !propertyId || !leaseStart || !leaseEnd) return;

    const normalizedEmail = email.trim().toLowerCase();
    let finalProfileId = "tp-" + Math.random().toString(36).substring(2, 9);
    try {
      const { data } = await supabase.from("profiles").select("id").eq("email", normalizedEmail).maybeSingle();
      if (data && data.id) {
        finalProfileId = data.id;
      }
    } catch (e) {}

    await db.addTenant({
      profile_id: finalProfileId,
      property_id: propertyId,
      lease_start: leaseStart,
      lease_end: leaseEnd,
      lease_type: leaseType,
      status: "active",
      full_name: fullName,
      email: normalizedEmail,
      phone,
      avatar_url: avatarUrl
    });

    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setPropertyId("");
    setLeaseStart("");
    setLeaseEnd("");
    setLeaseType("residential");
    setAvatarUrl("");
    setShowAddModal(false);

    // Reload lists
    await loadData();
    // Dispatch storage event to sync other pages
    window.dispatchEvent(new Event("storage"));
  };

  const handlePhotoClick = (id: string) => {
    activePhotoIdRef.current = id;
    setActivePhotoId(id);
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = activePhotoIdRef.current || activePhotoId;
    
    // Reset input so the same file can be selected again
    e.target.value = '';

    if (!file || !targetId) return;

    setUploadingId(targetId);
    setUploadProgress(10); // Start progress

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = async () => {
        setUploadProgress(30);
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 200;
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
        
        setUploadProgress(60);
        // Compress to 80% JPEG (very light weight)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        
        const tenant = tenants.find(t => t.id === targetId);
        if (tenant) {
          setUploadProgress(80);
          await db.updateTenant({ ...tenant, avatar_url: compressedBase64 });
          await loadData();
          setUploadProgress(100);
          setTimeout(() => {
            setUploadingId(null);
            setUploadProgress(0);
          }, 400);
          window.dispatchEvent(new Event("storage"));
        } else {
          setUploadingId(null);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    await db.deleteTenant(id);
    setDeleteTenantId(null);
    await loadData();
    window.dispatchEvent(new Event("storage"));
  };

  const filteredTenants = tenants.filter((t) => {
    if (filterPropertyId && t.property_id !== filterPropertyId) {
      return false;
    }
    const term = search.toLowerCase();
    if (!term) return true;
    const matchesSearch = 
      (t.full_name?.toLowerCase() || "").includes(term) ||
      (t.email?.toLowerCase() || "").includes(term) ||
      (t.phone?.toLowerCase() || "").includes(term) ||
      (t.property_name?.toLowerCase() || "").includes(term);
    return matchesSearch;
  });

  // Only show vacant/maintenance properties to assign, plus already assigned ones
  const availableProperties = properties.filter(p => 
    p.type !== 'building' && 
    p.type !== 'cour_commune' && 
    p.type !== 'residence' &&
    p.type !== 'lotissement' &&
    p.type !== 'terrain'
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Suivi des baux et fiches de contact</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Gestion des Locataires</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Ajouter un locataire
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ width: "100%" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone ou bien loué..."
            value={search}
            onChange={handleSearchChange}
            className="input"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-container" style={{ minHeight: "250px", overflowX: "auto", width: "100%", borderRadius: "var(--radius-xl)", border: "1px solid var(--gray-200)", scrollbarWidth: "thin" }}>
          <table className="table" style={{ minWidth: "800px" }}>
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>Photo</th>
                <th>Nom du locataire</th>
                <th>Coordonnées</th>
                <th>Bien assigné</th>
                <th>Période du bail</th>
                <th>Type</th>
                <th>Statut</th>
                <th style={{ width: "80px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "var(--space-16)" }}>
                    <div className="skeleton skeleton-text" style={{ margin: "0 auto", width: "50%" }}></div>
                    <div className="skeleton skeleton-text" style={{ margin: "var(--space-2) auto 0 auto", width: "30%" }}></div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--gray-400)" }}>
                    Aucun locataire enregistré.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t, index) => (
                  <tr key={t.id}>
                    <td style={{ textAlign: "center", position: "relative" }}>
                      {uploadingId === t.id && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10, background: "rgba(255,255,255,0.9)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                           <div style={{ width: "24px", height: "4px", background: "var(--gray-200)", borderRadius: "2px", overflow: "hidden" }}>
                             <div style={{ width: `${uploadProgress}%`, height: "100%", background: "var(--primary)", transition: "width 0.2s ease-out" }} />
                           </div>
                           <span style={{ fontSize: "9px", fontWeight: "700", marginTop: "2px", color: "var(--primary)" }}>{uploadProgress}%</span>
                        </div>
                      )}
                      <div style={{ opacity: uploadingId === t.id ? 0.3 : 1, transition: "opacity 0.2s", display: "inline-block" }}>
                        {t.avatar_url ? (
                          <img src={t.avatar_url} alt={t.full_name} className="avatar avatar-zoomable" style={{ objectFit: "cover", width: "40px", height: "40px", cursor: "pointer", border: "2px solid var(--gray-200)", margin: "0 auto" }} onClick={() => handlePhotoClick(t.id)} title="Modifier la photo" />
                        ) : (
                          <button className="btn btn-ghost btn-sm" style={{ padding: 0, borderRadius: "50%", background: "var(--gray-100)", width: "40px", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }} onClick={() => handlePhotoClick(t.id)} title="Ajouter une photo">
                            <Plus size={18} style={{ color: "var(--gray-500)" }} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                        <div>
                          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "700", margin: 0 }}>{t.full_name}</h4>
                          <span style={{ fontSize: "10px", color: "var(--gray-400)" }}>ID: {t.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "var(--text-xs)", color: "var(--gray-600)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Mail size={12} /> {t.email}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Phone size={12} /> {t.phone}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--gray-800)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Building size={14} style={{ color: "var(--gray-400)" }} />
                        {t.property_name || "Non assigné"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "var(--text-xs)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} style={{ color: "var(--gray-400)" }} />
                          Du {formatDate(t.lease_start)}
                        </span>
                        <span style={{ paddingLeft: "16px", color: "var(--gray-500)" }}>
                          Au {formatDate(t.lease_end)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${t.lease_type === 'commercial' ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: "capitalize", fontSize: "10px" }}>
                        {t.lease_type === 'commercial' ? "Commercial" : "Résidentiel"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-success`} style={{ fontSize: "10px" }}>
                        Actif
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ padding: "8px" }} 
                          title="Options"
                          onClick={() => {
                            setActiveDropdown(activeDropdown === t.id ? null : t.id);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeDropdown === t.id && (
                          <>
                            <div 
                              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(null);
                              }}
                            />
                            <div 
                              className="card animate-scale-in"
                              style={{
                                position: "absolute",
                                right: 0,
                                top: (index === filteredTenants.length - 1 && filteredTenants.length > 1) ? "auto" : "100%",
                                bottom: (index === filteredTenants.length - 1 && filteredTenants.length > 1) ? "100%" : "auto",
                                background: 'var(--white)',
                                padding: "var(--space-2)",
                                minWidth: "160px",
                                zIndex: 9999,
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                                border: "1px solid var(--gray-200)"
                              }}
                            >
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ width: "100%", justifyContent: "flex-start", color: "var(--gray-700)", fontWeight: "500" }}
                              onClick={() => {
                                setActiveDropdown(null);
                                window.open(`/locataire/${t.id}`, '_blank');
                              }}
                            >
                              <ExternalLink size={14} style={{ marginRight: "8px", color: "var(--gray-400)" }} /> 
                              Espace Client
                            </button>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ width: "100%", justifyContent: "flex-start", color: "var(--danger)", fontWeight: "500", borderTop: "1px solid var(--gray-100)", marginTop: "4px", paddingTop: "8px" }}
                              onClick={() => {
                                setActiveDropdown(null);
                                setDeleteTenantId(t.id);
                              }}
                            >
                              <Trash2 size={14} style={{ marginRight: "8px" }} /> 
                              Supprimer
                            </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden file input for photo upload */}
      <input
        type="file"
        id="photo-upload"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handlePhotoUpload}
      />


      {/* ============================================
         Add Tenant Modal
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
              background: 'var(--white)',
              padding: "var(--space-6)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800" }}>Ajouter un nouveau locataire</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTenant} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={addPhotoInputRef}
                  style={{ display: "none" }}
                  onChange={handleAddPhotoSelect}
                />
                <div 
                  onClick={() => addPhotoInputRef.current?.click()}
                  style={{ 
                    width: "80px", height: "80px", borderRadius: "50%", 
                    background: "var(--gray-100)", border: "2px dashed var(--gray-300)", 
                    margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", overflow: "hidden", position: "relative"
                  }}
                  title="Ajouter une photo"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Plus size={24} style={{ color: "var(--gray-400)" }} />
                  )}
                </div>
                <p style={{ fontSize: "11px", color: "var(--gray-500)", marginTop: "8px" }}>Photo de profil (Optionnel)</p>
              </div>

              <div className="input-group">
                <label className="input-label">Nom complet du locataire</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Koffi Kouassi..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Adresse E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: koffi@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Numéro de Téléphone</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +225 05 55 55 55 55"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Associer un bien immobilier</label>
                <select
                  required
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="input"
                  style={{ appearance: "auto" }}
                >
                  <option value="">Sélectionnez un logement</option>
                  {availableProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({getPropertyTypeLabel(p.type)} - {p.city}) • {p.monthly_rent.toLocaleString()} FCFA/mois
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div className="input-group">
                  <label className="input-label">Début du bail</label>
                  <input
                    type="date"
                    required
                    value={leaseStart}
                    onChange={(e) => setLeaseStart(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Fin du bail</label>
                  <input
                    type="date"
                    required
                    value={leaseEnd}
                    onChange={(e) => setLeaseEnd(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Type de bail</label>
                <select
                  value={leaseType}
                  onChange={(e) => setLeaseType(e.target.value as "residential" | "commercial")}
                  className="input"
                  style={{ appearance: "auto" }}
                >
                  <option value="residential">Résidentiel (Habitation)</option>
                  <option value="commercial">Commercial (Bureaux, Boutiques)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Enregistrer le locataire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTenantId && (
        <div 
          style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "var(--space-4)", backdropFilter: "blur(4px)" }}
        >
          <div className="card" style={{ width: "100%", maxWidth: "400px", background: 'var(--white)', padding: "var(--space-6)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--danger)", margin: "0 0 var(--space-2) 0" }}>Confirmer la suppression</h3>
            <p style={{ color: "var(--gray-600)", margin: "0 0 var(--space-6) 0" }}>
              Êtes-vous sûr de vouloir supprimer définitivement ce locataire ? Cette action est irréversible.
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteTenantId(null)}>
                Annuler
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1, background: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => handleDelete(deleteTenantId)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
