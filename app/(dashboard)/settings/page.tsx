"use client";

import { useState, useEffect, useRef } from "react";
import { Moon, Sun, Monitor, User, Camera } from "lucide-react";
import { useTheme } from "../../../components/ThemeProvider";
import { DEFAULT_PROFILE } from "../../../lib/store";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(DEFAULT_PROFILE.avatar_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newAvatar = event.target.result as string;
          setAvatarUrl(newAvatar);
          localStorage.setItem("V_CUSTOM_AVATAR", newAvatar);
          window.dispatchEvent(new Event("avatarUpdate"));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const customAvatar = localStorage.getItem("V_CUSTOM_AVATAR");
    if (customAvatar) {
      setAvatarUrl(customAvatar);
    }
  }, []);



  return (
    <div className="container animate-fade-in" style={{ maxWidth: "800px", padding: "var(--space-6) 0" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, margin: 0, color: "var(--gray-900)" }}>Paramètres</h1>
        <p style={{ color: "var(--gray-500)", margin: "var(--space-2) 0 0 0" }}>Gérez votre profil, vos préférences d'affichage et les configurations avancées.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        
        {/* Section Profil */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "var(--space-4)" }}>
            <div className="avatar avatar-sm" style={{ background: "var(--primary-lightest)", color: "var(--primary)" }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0, color: "var(--gray-900)" }}>Mon Profil</h2>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--primary-lightest)", overflow: "hidden", border: "4px solid var(--white)", boxShadow: "var(--shadow-md)", flexShrink: 0 }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "var(--primary)" }}>
                    {DEFAULT_PROFILE.full_name?.substring(0, 2).toUpperCase() || "VI"}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ position: "absolute", bottom: "0", right: "0", background: "var(--primary)", color: "var(--fixed-white)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)", transition: "transform 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                title="Modifier la photo"
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: "none" }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase" }}>Nom complet</label>
                  <div style={{ fontWeight: 600, color: "var(--gray-900)", padding: "8px 12px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)" }}>{DEFAULT_PROFILE.full_name}</div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase" }}>Rôle</label>
                  <div style={{ fontWeight: 600, color: "var(--primary)", padding: "8px 12px", background: "var(--primary-lightest)", borderRadius: "var(--radius-md)", border: "1px solid var(--primary-lighter)", display: "inline-block" }}>
                    {DEFAULT_PROFILE.role === 'owner' ? 'Propriétaire' : 'Administrateur'}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase" }}>Email de connexion</label>
                  <div style={{ fontWeight: 500, color: "var(--gray-900)", padding: "8px 12px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)" }}>{DEFAULT_PROFILE.email}</div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase" }}>Téléphone</label>
                  <div style={{ fontWeight: 500, color: "var(--gray-900)", padding: "8px 12px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)" }}>{DEFAULT_PROFILE.phone}</div>
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
                          if (window.confirm("Êtes-vous sûr de vouloir écraser vos données actuelles avec cette sauvegarde ?")) {
                            localStorage.clear();
                            Object.keys(data).forEach(key => {
                              localStorage.setItem(key, data[key]);
                            });
                            window.location.reload();
                          }
                        } catch (err) {
                          alert("Le fichier de sauvegarde est invalide.");
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
                <p style={{ fontWeight: 600, color: "var(--gray-900)", margin: "0 0 4px 0" }}>Vider les données</p>
                <p style={{ color: "var(--danger-dark)", fontSize: "12px", margin: 0, maxWidth: "400px" }}>Cette action supprimera toutes les données locales. Pensez à faire une sauvegarde avant !</p>
              </div>
              <button 
                className="btn"
                onClick={() => {
                  if (window.confirm("Avez-vous fait une sauvegarde ? Cette action est irréversible. Voulez-vous vraiment vider toutes les données locales ?")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                style={{ background: "var(--danger)", color: "var(--fixed-white)", border: "none", padding: "8px 16px", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600 }}
              >
                Vider le cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
