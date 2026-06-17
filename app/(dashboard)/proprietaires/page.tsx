"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Search, 
  Plus, 
  X, 
  Mail, 
  Phone, 
  Briefcase,
  Building,
  Percent,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2
} from "lucide-react";
import { db } from "@/lib/store";
import { Landlord } from "@/lib/types";

export default function ProprietairesPage() {
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [commission, setCommission] = useState("10");

  const loadData = async () => {
    setLandlords(await db.getLandlords());
  };

  useEffect(() => {
    loadData();
    // Listen for storage changes from other tabs/pages
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce propriétaire ?")) {
      await db.deleteLandlord(id);
      await loadData();
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handlePhotoClick = (id: string) => {
    setActivePhotoId(id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoId) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = async () => {
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
        
        // Compress to 80% JPEG (very light weight)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        
        const landlord = landlords.find(l => l.id === activePhotoId);
        if (landlord) {
          await db.updateLandlord({ ...landlord, avatar_url: compressedBase64 });
          await loadData();
          window.dispatchEvent(new Event("storage"));
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAddLandlord = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Étape 1 : Bouton cliqué ! Début de l'enregistrement...");
    if (!fullName || !phone) {
        alert("Étape 1.5 : Erreur, le nom ou le téléphone est vide.");
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
    alert("Étape 2 : Modal fermé, chargement des données...");

    // Reload lists
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
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
      <div className="card" style={{ padding: 0, overflow: "visible" }}>
        <div style={{ width: "100%", borderRadius: "var(--radius-xl)", border: "1px solid var(--gray-200)" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "80px", textAlign: "center" }}>Photo</th>
                <th style={{ width: "25%" }}>Propriétaire</th>
                <th style={{ width: "20%" }}>Téléphone</th>
                <th style={{ width: "25%" }}>E-mail</th>
                <th style={{ width: "15%" }}>Taux de commission</th>
                <th style={{ width: "15%" }}>Biens associés</th>
                <th style={{ width: "60px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLandlords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--gray-400)" }}>
                    Aucun propriétaire enregistré.
                  </td>
                </tr>
              ) : (
                filteredLandlords.map((l) => (
                  <tr key={l.id} style={{ position: "relative", zIndex: activeDropdown === l.id ? 100 : 1 }}>
                    <td style={{ textAlign: "center" }}>
                      {l.avatar_url ? (
                        <img src={l.avatar_url} alt={l.full_name} className="avatar avatar-zoomable" style={{ objectFit: "cover", width: "40px", height: "40px", cursor: "pointer", border: "2px solid var(--gray-200)", margin: "0 auto" }} onClick={() => handlePhotoClick(l.id)} title="Modifier la photo" />
                      ) : (
                        <button className="btn btn-ghost btn-sm" style={{ padding: 0, borderRadius: "50%", background: "var(--gray-100)", width: "40px", height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }} onClick={() => handlePhotoClick(l.id)} title="Ajouter une photo">
                          <Plus size={18} style={{ color: "var(--gray-500)" }} />
                        </button>
                      )}
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
                        {l.property_count || 0} bien(s)
                      </span>
                    </td>
                    <td style={{ textAlign: "right", position: "relative" }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ padding: "8px" }} 
                        title="Options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === l.id ? null : l.id);
                        }}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {activeDropdown === l.id && (
                        <div 
                          className="card animate-scale-in"
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "100%",
                            padding: "var(--space-2)",
                            minWidth: "180px",
                            zIndex: 50,
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            background: "white",
                          }}
                        >
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ width: "100%", justifyContent: "flex-start", color: "var(--gray-700)", fontWeight: "500" }}
                            onClick={() => alert("Détails du propriétaire " + l.full_name)}
                          >
                            <Eye size={14} style={{ marginRight: "8px" }} /> Voir les détails
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ width: "100%", justifyContent: "flex-start", color: "var(--gray-700)", fontWeight: "500" }}
                            onClick={() => alert("Modifier le propriétaire " + l.full_name)}
                          >
                            <Edit2 size={14} style={{ marginRight: "8px" }} /> Modifier
                          </button>
                          <div style={{ height: "1px", background: "var(--gray-200)", margin: "4px 0" }}></div>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ width: "100%", justifyContent: "flex-start", color: "var(--red)", fontWeight: "600" }}
                            onClick={() => handleDelete(l.id)}
                          >
                            <Trash2 size={14} style={{ marginRight: "8px" }} /> Supprimer
                          </button>
                        </div>
                      )}
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
              background: "white",
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
    </div>
  );
}
