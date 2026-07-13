"use client";

import { useState, useEffect, useRef } from "react";
import { User, Camera, Mail, Phone, ShieldCheck } from "lucide-react";
import { db } from "@/lib/store";
import { Profile } from "@/lib/types";
import AlertModal from "@/components/AlertModal";

export default function TenantProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, message: string, type: "error"|"success"|"info"}>({isOpen: false, title: "", message: "", type: "info"});

  useEffect(() => {
    const loadProfile = async () => {
      const p = await db.getProfile();
      if (p) {
        setProfile(p);
        setFormData({ full_name: p.full_name || "", phone: p.phone || "" });
      }
    };
    loadProfile();
  }, []);

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

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await db.updateProfile({ ...profile, full_name: formData.full_name, phone: formData.phone, avatar_url: avatarUrl || profile.avatar_url });
      setProfile({ ...profile, full_name: formData.full_name, phone: formData.phone, avatar_url: avatarUrl || profile.avatar_url });
      setIsEditing(false);
      window.dispatchEvent(new CustomEvent("profileUpdate", { detail: { full_name: formData.full_name, phone: formData.phone } }));
      setAlertModal({ isOpen: true, title: "Succès", message: "Profil mis à jour avec succès !", type: "success" });
    } catch (err) {
      setAlertModal({ isOpen: true, title: "Erreur", message: "Erreur lors de la mise à jour du profil.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "800px", padding: "var(--space-6) 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, margin: 0, color: "var(--gray-900)" }}>Mon Profil</h1>
          <p style={{ color: "var(--gray-500)", margin: "var(--space-2) 0 0 0" }}>Gérez vos informations personnelles et votre photo de profil.</p>
        </div>
        <div>
          {isEditing ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-outline" onClick={() => {
                setIsEditing(false);
                if (profile) setFormData({ full_name: profile.full_name || "", phone: profile.phone || "" });
              }} disabled={isSaving}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          ) : (
            <button className="btn btn-outline" onClick={() => setIsEditing(true)}>Modifier</button>
          )}
        </div>
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
            
            <label 
              htmlFor="avatar-upload-locataire"
              style={{ position: "absolute", bottom: "4px", right: "4px", background: "var(--primary)", color: "var(--fixed-white)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)", transition: "transform 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              title="Modifier la photo"
            >
              <Camera size={18} />
            </label>
            <input 
              id="avatar-upload-locataire"
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)", background: "var(--white)", boxShadow: "var(--shadow-xs)" }}>
            <div style={{ padding: "12px", background: "var(--primary-lightest)", borderRadius: "var(--radius-md)", color: "var(--primary)", flexShrink: 0 }}>
              <User size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Nom complet</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="input" 
                  value={formData.full_name} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-300)" }}
                />
              ) : (
                <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--gray-900)", wordBreak: "break-word", lineHeight: 1.2 }}>{profile.full_name}</div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)", background: "var(--white)", boxShadow: "var(--shadow-xs)" }}>
            <div style={{ padding: "12px", background: "var(--orange-lightest)", borderRadius: "var(--radius-md)", color: "var(--orange)", flexShrink: 0 }}>
              <Mail size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Adresse Email</label>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--gray-900)", wordBreak: "break-word", lineHeight: 1.2 }}>{profile.email}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)", background: "var(--white)", boxShadow: "var(--shadow-xs)" }}>
            <div style={{ padding: "12px", background: "var(--info-light)", borderRadius: "var(--radius-md)", color: "var(--info-dark)", flexShrink: 0 }}>
              <Phone size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", color: "var(--gray-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Téléphone</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="input" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-300)" }}
                />
              ) : (
                <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--gray-900)", wordBreak: "break-word", lineHeight: 1.2 }}>{profile.phone || "+225 00 00 00 00 00"}</div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", border: "1px solid var(--success-light)", borderRadius: "var(--radius-lg)", background: "var(--success-lightest)", boxShadow: "var(--shadow-xs)" }}>
            <div style={{ padding: "12px", background: "var(--white)", borderRadius: "var(--radius-md)", color: "var(--success-dark)", flexShrink: 0, boxShadow: "var(--shadow-xs)" }}>
              <ShieldCheck size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", color: "var(--success-dark)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px", opacity: 0.8 }}>Privilèges</label>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--success-dark)", wordBreak: "break-word", lineHeight: 1.2 }}>Locataire Autorisé</div>
            </div>
          </div>
        </div>
      </div>

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
