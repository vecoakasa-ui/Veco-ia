"use client";

import { useState, useEffect } from "react";
import { Save, Database, Shield, CheckCircle2, Moon, Sun, Monitor, User } from "lucide-react";
import { useTheme } from "../../../components/ThemeProvider";
import { DEFAULT_PROFILE } from "../../../lib/store";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Charger les clés depuis le localStorage si elles existent
    const storedUrl = localStorage.getItem("V_SUPABASE_URL");
    const storedKey = localStorage.getItem("V_SUPABASE_KEY");
     
    if (storedUrl) setUrl(storedUrl);
     
    if (storedKey) setKey(storedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem("V_SUPABASE_URL", url.trim());
    localStorage.setItem("V_SUPABASE_KEY", key.trim());
    setSaved(true);
    
    // Forcer le rechargement de la page pour initialiser Supabase avec les nouvelles clés
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  };

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
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--primary-lightest)", overflow: "hidden", border: "4px solid var(--white)", boxShadow: "var(--shadow-md)", flexShrink: 0 }}>
              {DEFAULT_PROFILE.avatar_url ? (
                <img src={DEFAULT_PROFILE.avatar_url} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "var(--primary)" }}>
                  {DEFAULT_PROFILE.full_name?.substring(0, 2).toUpperCase() || "VI"}
                </div>
              )}
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

        {/* Section Avancée (Supabase) */}
        <div className="card" style={{ border: "1px dashed var(--gray-300)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
            <div className="avatar avatar-sm" style={{ background: "var(--gray-100)", color: "var(--gray-600)" }}>
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0, color: "var(--gray-900)" }}>Avancé : Connexion Base de données</h2>
              <p style={{ color: "var(--gray-500)", margin: 0, fontSize: "var(--text-sm)" }}>
                Contournez Vercel et connectez Supabase directement d'ici.
              </p>
            </div>
          </div>

          {saved && (
            <div style={{ backgroundColor: "var(--success-light)", color: "var(--success-dark)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
              <CheckCircle2 size={18} />
              <span style={{ fontWeight: 600 }}>Connexion sauvegardée ! Redirection...</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <label style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--gray-700)" }}>
                Supabase Project URL
              </label>
              <input 
                type="text" 
                className="input" 
                placeholder="https://xxxxxx.supabase.co" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--gray-700)" }}>
                Supabase API Key (anon / public)
              </label>
              <input 
                type="password" 
                className="input" 
                placeholder="eyJh..." 
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", backgroundColor: "var(--gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", marginTop: "var(--space-2)" }}>
              <Shield size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "11px", color: "var(--gray-500)", margin: 0 }}>
                Vos clés sont sauvegardées localement de manière sécurisée dans votre navigateur. Elles ne transitent par aucun autre serveur que celui de Supabase.
              </p>
            </div>

            <button 
              className="btn btn-outline" 
              style={{ marginTop: "var(--space-2)", width: "100%", padding: "12px" }}
              onClick={handleSave}
              disabled={!url || !key}
            >
              <Save size={18} style={{ marginRight: "var(--space-2)" }} />
              Connecter et Sauvegarder
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
