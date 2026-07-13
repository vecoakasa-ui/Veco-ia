"use client";

import { useState, useEffect, useRef } from "react";
import { Moon, Sun, Monitor, User, Camera } from "lucide-react";
import { useTheme } from "../../../components/ThemeProvider";
import { DEFAULT_PROFILE, db } from "../../../lib/store";
import { Profile } from "../../../lib/types";
import ConfirmModal from "@/components/ConfirmModal";
import AlertModal from "@/components/AlertModal";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(DEFAULT_PROFILE.avatar_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", phone: "" });

  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, type: "danger"|"warning", action: () => void}>({isOpen: false, title: "", message: "", type: "warning", action: () => {}});
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, message: string, type: "error"|"success"|"info"}>({isOpen: false, title: "", message: "", type: "error"});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
          
          const newAvatar = canvas.toDataURL("image/jpeg", 0.8);
          setAvatarUrl(newAvatar);
          window.dispatchEvent(new CustomEvent("avatarUpdate", { detail: newAvatar }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    db.getProfile().then(p => {
      if (p) {
        setProfile(p);
        setFormData({ full_name: p.full_name || "", phone: p.phone || "" });
        if (p.avatar_url) setAvatarUrl(p.avatar_url);
      }
    });
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      await db.updateProfile({ ...profile, full_name: formData.full_name, phone: formData.phone, avatar_url: avatarUrl || profile.avatar_url });
      setProfile({ ...profile, full_name: formData.full_name, phone: formData.phone, avatar_url: avatarUrl || profile.avatar_url });
      setIsEditing(false);
      window.dispatchEvent(new CustomEvent("profileUpdate", { detail: { full_name: formData.full_name, phone: formData.phone } }));
      setAlertModal({ isOpen: true, title: "Succès", message: "Profil mis à jour avec succès", type: "success" });
    } catch (err) {
      setAlertModal({ isOpen: true, title: "Erreur", message: "Impossible de mettre à jour le profil", type: "error" });
    }
  };  return (
    <div className="container animate-fade-in" style={{ maxWidth: "800px", padding: "var(--space-6) 0" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, margin: 0, color: "var(--gray-900)" }}>Paramètres</h1>
        <p style={{ color: "var(--gray-500)", margin: "var(--space-2) 0 0 0" }}>Gérez votre profil, vos préférences d'affichage et les configurations avancées.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        
        {/* Section Profil */}
        <div className="card">
          <div className="profile-card-header">
            <div className="avatar avatar-sm" style={{ background: "var(--primary-lightest)", color: "var(--primary)" }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0, color: "var(--gray-900)" }}>Mon Profil</h2>
            </div>
            <div style={{ marginLeft: "auto" }}>
              {isEditing ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-outline" onClick={() => {
                    setIsEditing(false);
                    if (profile) setFormData({ full_name: profile.full_name || "", phone: profile.phone || "" });
                  }}>Annuler</button>
                  <button className="btn btn-primary" onClick={handleSaveProfile}>Enregistrer</button>
                </div>
              ) : (
                <button className="btn btn-outline" onClick={() => setIsEditing(true)}>Modifier</button>
              )}
            </div>
          </div>
          
          <div className="profile-card-body">
            <div style={{ position: "relative" }}>
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--primary-lightest)", overflow: "hidden", border: "4px solid var(--white)", boxShadow: "var(--shadow-md)", flexShrink: 0 }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "var(--primary)" }}>
                    {(profile?.full_name || DEFAULT_PROFILE.full_name)?.substring(0, 2).toUpperCase() || "VI"}
                  </div>
                )}
              </div>
              
              <label 
                htmlFor="avatar-upload-settings"
                style={{ position: "absolute", bottom: "0", right: "0", background: "var(--primary)", color: "var(--fixed-white)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)", transition: "transform 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                title="Modifier la photo"
              >
                <Camera size={16} />
              </label>
              <input 
                id="avatar-upload-settings"
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: "none" }} 
              />
            </div>
            <div style={{ flex: 1, width: "100%" }}>
              <div className="profile-card-grid">
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase" }}>Nom complet</label>
                  {isEditing ? (
                    <input 
                      className="input" 
                      value={formData.full_name} 
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-300)" }}
                    />
                  ) : (
                    <div style={{ fontWeight: 600, color: "var(--gray-900)", padding: "8px 12px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)" }}>{profile?.full_name || DEFAULT_PROFILE.full_name}</div>
                  )}
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase" }}>Rôle</label>
                  <div style={{ fontWeight: 600, color: "var(--primary)", padding: "8px 12px", background: "var(--primary-lightest)", borderRadius: "var(--radius-md)", border: "1px solid var(--primary-lighter)", display: "inline-block" }}>
                    {(profile?.role || DEFAULT_PROFILE.role) === 'owner' ? 'Propriétaire' : 'Administrateur'}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase" }}>Email de connexion</label>
                  <div style={{ fontWeight: 500, color: "var(--gray-900)", padding: "8px 12px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)" }}>{profile?.email || DEFAULT_PROFILE.email}</div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase" }}>Téléphone</label>
                  {isEditing ? (
                    <input 
                      className="input" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-300)" }}
                    />
                  ) : (
                    <div style={{ fontWeight: 500, color: "var(--gray-900)", padding: "8px 12px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)" }}>{profile?.phone || DEFAULT_PROFILE.phone || "-"}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Thème */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "var(--space-4)" }}>
            <div className="avatar avatar-sm" style={{ background: "var(--primary-lightest)", color: "var(--primary)" }}>
              <Monitor size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0, color: "var(--gray-900)" }}>Préférences d'Affichage</h2>
              <p style={{ color: "var(--gray-500)", margin: 0, fontSize: "var(--text-sm)" }}>Personnalisez l'apparence de votre interface.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
            <button 
              onClick={() => setTheme("light")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                background: theme === "light" ? "var(--primary-lightest)" : "var(--white)",
                border: theme === "light" ? "2px solid var(--primary)" : "2px solid var(--gray-200)",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <Sun size={32} style={{ color: theme === "light" ? "var(--primary)" : "var(--gray-400)" }} />
              <span style={{ fontWeight: 600, color: theme === "light" ? "var(--primary-dark)" : "var(--gray-600)" }}>Mode Clair</span>
            </button>

            <button 
              onClick={() => setTheme("dark")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                background: theme === "dark" ? "var(--primary-dark)" : "var(--gray-800)",
                border: theme === "dark" ? "2px solid var(--primary-light)" : "2px solid transparent",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <Moon size={32} style={{ color: theme === "dark" ? "var(--fixed-white)" : "var(--gray-400)" }} />
              <span style={{ fontWeight: 600, color: "var(--fixed-white)" }}>Mode Sombre</span>
            </button>

            <button 
              onClick={() => setTheme("system")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                background: theme === "system" ? "var(--gray-100)" : "var(--white)",
                border: theme === "system" ? "2px solid var(--gray-400)" : "2px solid var(--gray-200)",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <Monitor size={32} style={{ color: "var(--gray-600)" }} />
              <span style={{ fontWeight: 600, color: "var(--gray-700)" }}>Système</span>
            </button>
          </div>
        </div>
        {/* Section Base de données (Local) */}
        <div className="card" style={{ border: "1px solid var(--danger-light)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "var(--space-4)" }}>
            <div className="avatar avatar-sm" style={{ background: "var(--danger-light)", color: "var(--danger-dark)" }}>
              <Monitor size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0, color: "var(--gray-900)" }}>Données locales</h2>
              <p style={{ color: "var(--gray-500)", margin: 0, fontSize: "var(--text-sm)" }}>Gestion de la base de données de test et des sauvegardes.</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {/* Sauvegarder */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--gray-100)" }}>
              <div>
                <p style={{ fontWeight: 600, color: "var(--gray-900)", margin: "0 0 4px 0" }}>Sauvegarder les données</p>
                <p style={{ color: "var(--gray-500)", fontSize: "12px", margin: 0, maxWidth: "400px" }}>Téléchargez une copie complète de vos données locales pour pouvoir les restaurer plus tard.</p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const data = JSON.stringify(localStorage);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `veco_immo_backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
              >
                Télécharger (Backup)
              </button>
            </div>

            {/* Restaurer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--gray-100)" }}>
              <div>
                <p style={{ fontWeight: 600, color: "var(--gray-900)", margin: "0 0 4px 0" }}>Restaurer les données</p>
                <p style={{ color: "var(--gray-500)", fontSize: "12px", margin: 0, maxWidth: "400px" }}>Importez un fichier de sauvegarde précédemment téléchargé pour restaurer vos données.</p>
              </div>
              <label className="btn btn-outline" style={{ cursor: "pointer", margin: 0 }}>
                Importer (Restaurer)
                <input 
                  type="file" 
                  accept=".json" 
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const data = JSON.parse(event.target?.result as string);
                          setConfirmModal({
                            isOpen: true,
                            title: "Restaurer les données",
                            message: "Êtes-vous sûr de vouloir écraser vos données actuelles avec cette sauvegarde ? Cette action est irréversible.",
                            type: "warning",
                            action: () => {
                              localStorage.clear();
                              Object.keys(data).forEach(key => {
                                localStorage.setItem(key, data[key]);
                              });
                              window.location.reload();
                            }
                          });
                        } catch {
                          setAlertModal({
                            isOpen: true,
                            title: "Erreur de fichier",
                            message: "Le fichier de sauvegarde est invalide.",
                            type: "error"
                          });
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>

            {/* Vider */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600, color: "var(--gray-900)", margin: "0 0 4px 0" }}>Vider le cache local</p>
                <p style={{ color: "var(--danger-dark)", fontSize: "12px", margin: 0, maxWidth: "400px" }}>Cette action réinitialisera l'état de votre navigateur (préférences locales). Vos vraies données resteront intactes et sécurisées dans la base de données (Supabase).</p>
              </div>
              <button 
                className="btn"
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: "Vider le cache local",
                    message: "Voulez-vous vraiment vider le cache local de votre navigateur ? Cela ne supprimera PAS vos données de la base de données.",
                    type: "danger",
                    action: () => {
                      localStorage.clear();
                      window.location.reload();
                    }
                  });
                }}
                style={{ background: "var(--danger)", color: "var(--fixed-white)", border: "none", padding: "8px 16px", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600 }}
              >
                Vider le cache
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onCancel={() => setConfirmModal(prev => ({...prev, isOpen: false}))}
        onConfirm={() => {
          confirmModal.action();
          setConfirmModal(prev => ({...prev, isOpen: false}));
        }}
      />
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({...prev, isOpen: false}))}
      />
    </div>
  );
}
