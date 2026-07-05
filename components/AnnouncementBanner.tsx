"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

// ==========================================
// CONFIGURATION DE LA BANNIÈRE
// Changez SHOW_BANNER à 'true' pour afficher le message sur tout le site
// Changez SHOW_BANNER à 'false' pour le masquer
// ==========================================
const SHOW_BANNER = true;
const BANNER_MESSAGE = "🚨 Maintenance en cours : Notre équipe déploie actuellement une nouvelle mise à jour majeure. Certaines fonctionnalités peuvent être momentanément indisponibles.";

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(SHOW_BANNER);

  if (!isVisible) return null;

  return (
    <div style={{
      backgroundColor: "var(--danger)",
      color: "white",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      zIndex: 9999, // S'assurer qu'il soit toujours au-dessus
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, justifyContent: "center" }}>
        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", textAlign: "center" }}>
          {BANNER_MESSAGE}
        </p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.8)",
          cursor: "pointer",
          padding: "4px",
          marginLeft: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px"
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        aria-label="Fermer l'annonce"
      >
        <X size={18} />
      </button>
    </div>
  );
}
