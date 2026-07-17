"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Search, 
  Plus, 
  X, 
  Mail, 
  Phone, 
  Building,
  Percent,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2
} from "lucide-react";
import { db, getFromStorage } from "@/lib/store";
import { Landlord, Property } from "@/lib/types";

export default function ProprietairesPage() {
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewLandlord, setViewLandlord] = useState<Landlord | null>(null);
  const [editLandlord, setEditLandlord] = useState<Landlord | null>(null);
  const [deleteLandlord, setDeleteLandlord] = useState<Landlord | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const activePhotoIdRef = useRef<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [, setAvatarUrl] = useState("");

  const [commission, setCommission] = useState("10");

  const loadData = async () => {
    try {
      // 1. Instant load from cache (Stale-While-Revalidate)
      const cached = getFromStorage("landlords", []);
      if (cached && cached.length > 0) {
        setLandlords(cached);
      }
      
      // 2. Background fetch for fresh data
      const freshData = await db.getLandlords();
      setLandlords(freshData);
      
      const freshProps = await db.getProperties();
      // Masquer à vie les structures parentes (demande utilisateur)
      const parentTypes = ['building', 'cour_commune', 'residence', 'lotissement'];
      setProperties(freshProps.filter(p => !parentTypes.includes(p.type)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Listen for storage changes from other tabs/pages
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleDelete = async (id: string) => {
    await db.deleteLandlord(id);
    setDeleteLandlord(null);
    await loadData();
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
        
        const landlord = landlords.find(l => l.id === targetId);
        if (landlord) {
          try {
            setUploadProgress(80);
            await db.updateLandlord({ ...landlord, avatar_url: compressedBase64 });
            await loadData();
            setUploadProgress(100);
            setTimeout(() => {
              setUploadingId(null);
              setUploadProgress(0);
            }, 400);
            window.dispatchEvent(new Event("storage"));
          } catch (error) {
            console.error("Error uploading photo:", error);
            setUploadingId(null);
            setUploadProgress(0);
          }
        } else {
          setUploadingId(null);
          setUploadProgress(0);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAddLandlord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
        return;
    }

    await db.addLandlord({
      full_name: fullName,
      email: email,
      phone: phone,
      commission_rate: parseFloat(commission) || 10,
    });

    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setAvatarUrl("");
    setCommission("10");
    setShowAddModal(false);

    // Reload lists
    await loadData();
    window.dispatchEvent(new Event("storage"));
  };

  const handleSaveEditLandlord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLandlord) return;
    await db.updateLandlord(editLandlord);
    setEditLandlord(null);
    await loadData();
    window.dispatchEvent(new Event("storage"));
  };

  const filteredLandlords = landlords.filter((l) => {
    const term = search.toLowerCase();
    return (
      (l.full_name?.toLowerCase() || "").includes(term) ||
      (l.email?.toLowerCase() || "").includes(term) ||
      (l.phone?.toLowerCase() || "").includes(term)
    );
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Gestion des mandats et commissions</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Propriétaires Bailleurs</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Ajouter un propriétaire
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ width: "100%" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Landlords Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div className="table-container" style={{ minHeight: "250px", overflowX: "auto", width: "100%", borderRadius: "var(--radius-xl)", border: "1px solid var(--gray-200)", scrollbarWidth: "thin" }}>
          <table className="table" style={{ minWidth: "800px" }}>
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>Photo</th>
                <th>Propriétaire</th>
                <th>Téléphone</th>
                <th>E-mail</th>
                <th style={{ whiteSpace: "nowrap" }}>Taux de commission</th>
                <th style={{ whiteSpace: "nowrap" }}>Biens associés</th>
                <th style={{ width: "80px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "var(--space-16)" }}>
                    <div style={{ width: "24px", height: "24px", border: "3px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto var(--space-4) auto" }}></div>
                    <p style={{ color: "var(--gray-500)", fontWeight: 500, margin: 0 }}>Chargement des données...</p>
                  </td>
                </tr>
              ) : filteredLandlords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--gray-400)" }}>
                    Aucun propriétaire enregistré.
                  </td>
                </tr>
              ) : (
                filteredLandlords.map((l, index) => (
                  <tr key={l.id}>
                    <td style={{ textAlign: "center", position: "relative" }}>
                      {uploadingId === l.id && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10, background: "rgba(255,255,255,0.9)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                           <div style={{ width: "24px", height: "4px", background: "var(--gray-200)", borderRadius: "2px", overflow: "hidden" }}>
                             <div style={{ width: `${uploadProgress}%`, height: "100%", background: "var(--primary)", transition: "width 0.2s ease-out" }} />
                           </div>
                           <span style={{ fontSize: "9px", fontWeight: "700", marginTop: "2px", color: "var(--primary)" }}>{uploadProgress}%</span>
                        </div>
                      )}
                      <div style={{ opacity: uploadingId === l.id ? 0.3 : 1, transition: "opacity 0.2s", display: "inline-block" }}>
                        {l.avatar_url ? (
                          <img src={l.avatar_url} alt={l.full_name} className="avatar avatar-zoomable" style={{ objectFit: "cover", width: "40px", height: "40px", cursor: "pointer", border: "2px solid var(--gray-200)", margin: "0 auto" }} onClick={() => handlePhotoClick(l.id)} title="Modifier la photo" />
                        ) : (
                          <button className="btn btn-ghost btn-sm" style={{ padding: 0, borderRadius: "50%", background: "var(--gray-100)", width: "40px", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }} onClick={() => handlePhotoClick(l.id)} title="Ajouter une photo">
                            <Plus size={18} style={{ color: "var(--gray-500)" }} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "700", margin: 0 }}>{l.full_name}</h4>
                        <span style={{ fontSize: "10px", color: "var(--gray-400)" }}>ID: {l.id}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--gray-800)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Phone size={14} className="text-orange" /> {l.phone}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-600)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Mail size={12} /> {l.email || "Non renseigné"}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-warning" style={{ fontSize: "11px", display: "inline-flex", gap: "4px" }}>
                        <Percent size={12} />
                        {l.commission_rate}% de frais de gestion
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--gray-800)", display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)" }}>
                        <Building size={14} style={{ color: "var(--gray-400)" }} />
                        {properties.filter(p => p.landlord_id === l.id).length} bien(s)
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ padding: "8px" }} 
                          title="Options"
                          onClick={() => {
                            setActiveDropdown(activeDropdown === l.id ? null : l.id);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeDropdown === l.id && (
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
                                top: (index === filteredLandlords.length - 1 && filteredLandlords.length > 1) ? "auto" : "100%",
                                bottom: (index === filteredLandlords.length - 1 && filteredLandlords.length > 1) ? "100%" : "auto",
                                padding: "var(--space-2)",
                                minWidth: "160px",
                                zIndex: 9999,
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                                background: 'var(--white)',
                                border: "1px solid var(--gray-200)"
                              }}
                            >
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ width: "100%", justifyContent: "flex-start", color: "var(--gray-700)", fontWeight: "500" }}
                              onClick={() => {
                                setViewLandlord(l);
                                setActiveDropdown(null);
                              }}
                            >
                              <Eye size={14} style={{ marginRight: "8px" }} /> Voir les détails
                            </button>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ width: "100%", justifyContent: "flex-start", color: "var(--gray-700)", fontWeight: "500" }}
                              onClick={() => {
                                setEditLandlord(l);
                                setActiveDropdown(null);
                              }}
                            >
                              <Edit2 size={14} style={{ marginRight: "8px" }} /> Modifier
                            </button>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ width: "100%", justifyContent: "flex-start", color: "var(--danger)", fontWeight: "500" }}
                              onClick={() => {
                                setDeleteLandlord(l);
                                setActiveDropdown(null);
                              }}
                            >
                              <Trash2 size={14} style={{ marginRight: "8px" }} /> Supprimer
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

      {/* Hidden file input for Avatar upload */}
      <input 
        id="photo-upload"
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: "none" }} 
        onChange={handlePhotoUpload} 
      />

      {/* ============================================
         Add Landlord Modal
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
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800" }}>Ajouter un propriétaire bailleur</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Nom complet ou Société</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: M. Jean-Paul Bédié"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Numéro de Téléphone</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +225 01 02 03 04 05"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Adresse E-mail (Optionnel)</label>
                <input
                  type="email"
                  placeholder="Ex: jpbedie@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Frais de gestion (Commission de l'agence %)</label>
                <div className="input-with-icon">
                  <Percent className="input-icon" size={16} />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    className="input"
                  />
                </div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", marginTop: "4px" }}>
                  Ce pourcentage sera déduit des loyers perçus pour calculer la part reversée au propriétaire.
                </p>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddLandlord}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Landlord */}
      {viewLandlord && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "var(--space-4)",
            backdropFilter: "blur(4px)"
          }}
          className="animate-fade-in"
          onClick={() => setViewLandlord(null)}
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
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800" }}>Détails du Propriétaire</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewLandlord(null)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {viewLandlord.avatar_url && (
                <div style={{ textAlign: "center", marginBottom: "var(--space-4)" }}>
                  <img src={viewLandlord.avatar_url} alt={viewLandlord.full_name} style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "4px solid var(--gray-100)" }} />
                </div>
              )}
              <div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", marginBottom: "4px" }}>Nom complet ou Société</p>
                <p style={{ fontSize: "var(--text-md)", fontWeight: "600" }}>{viewLandlord.full_name}</p>
              </div>
              <div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", marginBottom: "4px" }}>Numéro de Téléphone</p>
                <p style={{ fontSize: "var(--text-md)", fontWeight: "600" }}>{viewLandlord.phone}</p>
              </div>
              <div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", marginBottom: "4px" }}>Adresse E-mail</p>
                <p style={{ fontSize: "var(--text-md)", fontWeight: "600" }}>{viewLandlord.email || "Non renseigné"}</p>
              </div>
              <div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", marginBottom: "4px" }}>Taux de Commission</p>
                <p style={{ fontSize: "var(--text-md)", fontWeight: "600" }}>{viewLandlord.commission_rate}% de frais de gestion</p>
              </div>
              <div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", marginBottom: "4px" }}>Biens Associés</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "var(--text-md)", fontWeight: "800", color: "var(--primary)" }}>{properties.filter(p => p.landlord_id === viewLandlord.id).length}</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "600" }}>bien(s) géré(s)</span>
                </div>
                
                {/* Detailed List of Properties */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  {properties.filter(p => p.landlord_id === viewLandlord.id).length > 0 ? (
                    properties.filter(p => p.landlord_id === viewLandlord.id).map(prop => (
                      <div key={prop.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", border: "1px solid var(--gray-200)", background: "var(--gray-50)" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Building size={20} style={{ color: "var(--gray-500)" }} />
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <h4 style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: "700", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{prop.name}</h4>
                          <p style={{ margin: 0, fontSize: "11px", color: "var(--gray-500)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{prop.address}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "700", color: "var(--gray-900)" }}>{prop.monthly_rent.toLocaleString()}</span>
                          <span style={{ fontSize: "10px", color: "var(--gray-500)", display: "block" }}>FCFA / mois</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "16px", textAlign: "center", border: "1px dashed var(--gray-300)", borderRadius: "8px", color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>
                      Aucun bien n'est actuellement associé à ce propriétaire.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "var(--space-6)" }}>
              <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={() => setViewLandlord(null)}>
                Fermer les détails
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Landlord */}
      {editLandlord && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "var(--space-4)",
            backdropFilter: "blur(4px)"
          }}
          className="animate-fade-in"
          onClick={() => setEditLandlord(null)}
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
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800" }}>Modifier un propriétaire</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditLandlord(null)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Nom complet ou Société</label>
                <input
                  type="text"
                  required
                  value={editLandlord.full_name}
                  onChange={(e) => setEditLandlord({...editLandlord, full_name: e.target.value})}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Numéro de Téléphone</label>
                <input
                  type="tel"
                  required
                  value={editLandlord.phone}
                  onChange={(e) => setEditLandlord({...editLandlord, phone: e.target.value})}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Adresse E-mail (Optionnel)</label>
                <input
                  type="email"
                  value={editLandlord.email}
                  onChange={(e) => setEditLandlord({...editLandlord, email: e.target.value})}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Frais de gestion (Commission %)</label>
                <div className="input-with-icon">
                  <Percent className="input-icon" size={16} />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={editLandlord.commission_rate}
                    onChange={(e) => setEditLandlord({...editLandlord, commission_rate: parseFloat(e.target.value)})}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditLandlord(null)}>
                  Annuler
                </button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveEditLandlord}>
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Landlord */}
      {deleteLandlord && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "var(--space-4)",
            backdropFilter: "blur(4px)"
          }}
          className="animate-fade-in"
          onClick={() => setDeleteLandlord(null)}
        >
          <div 
            className="card animate-scale-in"
            style={{
              width: "100%",
              maxWidth: "400px",
              background: 'var(--white)',
              padding: "var(--space-6)",
              textAlign: "center"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-4)" }}>
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "16px", borderRadius: "50%" }}>
                <Trash2 size={32} />
              </div>
            </div>
            
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", marginBottom: "var(--space-2)" }}>Supprimer ce propriétaire ?</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: "var(--space-6)" }}>
              Êtes-vous sûr de vouloir supprimer définitivement <strong>{deleteLandlord.full_name}</strong> ? Cette action est irréversible et supprimera également les données associées.
            </p>

            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteLandlord(null)}>
                Annuler
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1, background: "var(--danger)", borderColor: "var(--danger)", color: "white" }} onClick={() => handleDelete(deleteLandlord.id)}>
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
