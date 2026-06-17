"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { Save, Database, Shield, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Charger les clés depuis le localStorage si elles existent
    const storedUrl = localStorage.getItem("V_SUPABASE_URL");
    const storedKey = localStorage.getItem("V_SUPABASE_KEY");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (storedUrl) setUrl(storedUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="container" style={{ maxWidth: "600px", marginTop: "var(--space-8)" }}>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
          <div className="avatar avatar-sm" style={{ background: "var(--primary-lightest)", color: "var(--primary)" }}>
            <Database size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 800, margin: 0 }}>Connexion Base de données</h1>
            <p style={{ color: "var(--gray-500)", margin: 0, fontSize: "var(--text-sm)" }}>
              Contournez Vercel et connectez Supabase directement d&apos;ici.
            </p>
          </div>
        </div>

        {saved && (
          <div style={{ backgroundColor: "#ecfdf5", color: "#065f46", padding: "var(--space-4)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
            <CheckCircle2 size={18} />
            <span style={{ fontWeight: 600 }}>Connexion sauvegardée ! Redirection...</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 600, fontSize: "var(--text-sm)" }}>
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
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 600, fontSize: "var(--text-sm)" }}>
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
            className="btn btn-primary" 
            style={{ marginTop: "var(--space-4)", width: "100%", padding: "12px" }}
            onClick={handleSave}
            disabled={!url || !key}
          >
            <Save size={18} style={{ marginRight: "var(--space-2)" }} />
            Connecter et Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
