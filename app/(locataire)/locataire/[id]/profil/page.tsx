"use client";

import { useState, useEffect, useRef } from "react";
import { User, Camera, Mail, Phone, Calendar, ShieldCheck } from "lucide-react";
import { db } from "@/lib/store";
import { Profile } from "@/lib/types";

export default function TenantProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const p = await db.getProfile();
      if (p) {
        setProfile(p);
      }
    };
    loadProfile();

    const customAvatar = localStorage.getItem("V_CUSTOM_AVATAR");
    if (customAvatar) {
      setAvatarUrl(customAvatar);
    }
  }, []);

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

  if (!profile) return null;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "800px", padding: "var(--space-6) 0" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, margin: 0, color: "var(--gray-900)" }}>Mon Profil</h1>
        <p style={{ color: "var(--gray-500)", margin: "var(--space-2) 0 0 0" }}>Gérez vos informations personnelles et votre photo de profil.</p>
      </div>

      <div className="card" style={{ padding: "var(--space-6)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "var(--space-8)" }}>
          <div style={{ position: "relative", marginBottom: "var(--space-4)" }}>
            <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "var(--primary-lightest)", overflow: "hidden", border: "4px solid var(--white)", boxShadow: "var(--shadow-md)", flexShrink: 0 }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", fontWeight: "bold", color: "var(--primary)" }}>
                  {profile.full_name?.substring(0, 2).toUpperCase() || "L"}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ position: "absolute", bottom: "4px", right: "4px", background: "var(--primary)", color: "var(--fixed-white)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)", transition: "transform 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              title="Modifier la photo"
            >
              <Camera size={18} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: "none" }} 
            />
          </div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0, color: "var(--gray-900)" }}>{profile.full_name || "Locataire"}</h2>
          <span className="badge" style={{ marginTop: "8px", background: "rgba(16, 185, 129, 0.1)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.2)" }}>Locataire Actif</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
            <div style={{ padding: "10px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", color: "var(--gray-500)" }}>
              <User size={20} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Nom complet</label>
              <div style={{ fontWeight: 600, color: "var(--gray-900)" }}>{profile.full_name}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
            <div style={{ padding: "10px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", color: "var(--gray-500)" }}>
              <Mail size={20} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Adresse Email</label>
              <div style={{ fontWeight: 600, color: "var(--gray-900)" }}>{profile.email}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
            <div style={{ padding: "10px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", color: "var(--gray-500)" }}>
              <Phone size={20} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Téléphone</label>
              <div style={{ fontWeight: 600, color: "var(--gray-900)" }}>{profile.phone || "+225 00 00 00 00 00"}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
            <div style={{ padding: "10px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", color: "var(--gray-500)" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Privilèges</label>
              <div style={{ fontWeight: 600, color: "var(--gray-900)" }}>Locataire Autorisé</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
