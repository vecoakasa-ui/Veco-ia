"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Building, 
  MapPin, 
  CheckCircle2, 
  Loader2,
  X,
  Info,
  Phone,
  Mail,
  Home,
  User
} from "lucide-react";
import { db } from "@/lib/store";
import { Property, Profile } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function ExplorerPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenantProfile, setTenantProfile] = useState<Profile | null>(null);
  
  // Modal State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const allProperties = await db.getProperties();
      // Filter for vacant properties only
      const vacantProperties = allProperties.filter(p => p.status === "vacant");
      setProperties(vacantProperties);

      const profile = await db.getProfile();
      if (profile && profile.role === "tenant") {
        setTenantProfile(profile);
      }
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending inquiry to owner
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedProperty(null);
      setMessage("");
    }, 3000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
        <Loader2 size={48} className="animate-spin" style={{ color: "var(--primary)" }} />
        <h3 style={{ color: "var(--gray-600)" }}>Recherche des biens disponibles...</h3>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--gray-900)", marginBottom: "4px" }}>
          Explorer les Biens
        </h1>
        <p style={{ color: "var(--gray-500)", margin: 0 }}>Découvrez nos logements actuellement disponibles à la location.</p>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="card" style={{ padding: "var(--space-8)", textAlign: "center", background: "var(--white)" }}>
          <Building size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4)" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--gray-700)", margin: "0 0 var(--space-2)" }}>
            Aucun bien disponible
          </h3>
          <p style={{ color: "var(--gray-500)", margin: 0 }}>Il n'y a actuellement aucun logement vacant sur la plateforme. Revenez plus tard !</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "var(--space-6)"
        }}>
          {properties.map((property) => (
            <div key={property.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* Image Header */}
              <div style={{ 
                height: "200px", 
                background: property.images && property.images.length > 0 ? `url(${property.images[0]}) center/cover` : "var(--gray-200)",
                position: "relative"
              }}>
                {(!property.images || property.images.length === 0) && (
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "var(--gray-400)" }}>
                    <Home size={48} />
                  </div>
                )}
                <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                  <span className="badge badge-success" style={{ fontWeight: 700, boxShadow: "var(--shadow-sm)" }}>
                    Disponible
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0, color: "var(--gray-900)" }}>{property.name}</h3>
                  <span style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--primary)" }}>{formatCurrency(property.monthly_rent)}<span style={{ fontSize: "12px", fontWeight: 500, color: "var(--gray-500)" }}>/mois</span></span>
                </div>
                
                <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 var(--space-4)" }}>
                  <MapPin size={14} style={{ color: "var(--gray-400)" }} />
                  {property.address}, {property.city}
                </p>

                <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, background: "var(--gray-100)", color: "var(--gray-600)", padding: "4px 8px", borderRadius: "var(--radius-sm)", textTransform: "uppercase" }}>
                    {property.type === "apartment" ? "Appartement" : property.type === "house" ? "Maison" : property.type === "studio" ? "Studio" : "Villa"}
                  </span>
                </div>
                
                {property.description && (
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", marginBottom: "var(--space-6)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {property.description}
                  </p>
                )}

                <div style={{ marginTop: "auto" }}>
                  <button 
                    onClick={() => setSelectedProperty(property)}
                    className="btn btn-primary" 
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Je suis intéressé
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interest Modal */}
      {selectedProperty && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-4)"
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "500px", padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-4)", borderBottom: "1px solid var(--gray-200)", background: "var(--gray-50)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>Signaler votre intérêt</h3>
              <button onClick={() => { setSelectedProperty(null); setShowSuccess(false); }} style={{ color: "var(--gray-500)", background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: "var(--space-5)" }}>
              {showSuccess ? (
                <div style={{ textAlign: "center", padding: "var(--space-6) 0" }} className="animate-fade-in">
                  <CheckCircle2 size={64} style={{ color: "var(--success)", margin: "0 auto var(--space-4)" }} />
                  <h4 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--gray-900)", marginBottom: "var(--space-2)" }}>Demande envoyée !</h4>
                  <p style={{ color: "var(--gray-600)", margin: 0 }}>Le propriétaire a été averti de votre intérêt pour <strong>{selectedProperty.name}</strong>. Il vous contactera prochainement.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-3)", background: "var(--primary-lightest)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-5)" }}>
                    <Info size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--primary-dark)" }}>
                      Vous êtes sur le point d'envoyer une demande pour <strong>{selectedProperty.name}</strong> au loyer de <strong>{formatCurrency(selectedProperty.monthly_rent)}</strong>.
                    </p>
                  </div>

                  <form onSubmit={handleInterestSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    {/* Pre-filled info based on profile if available */}
                    <div className="form-group">
                      <label className="form-label">Nom complet</label>
                      <div className="input-with-icon">
                        <User size={18} className="input-icon" />
                        <input 
                          type="text" 
                          className="form-control" 
                          defaultValue={tenantProfile?.full_name || ""} 
                          required 
                          placeholder="Votre nom complet"
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                      <div className="form-group">
                        <label className="form-label">Téléphone</label>
                        <div className="input-with-icon">
                          <Phone size={18} className="input-icon" />
                          <input 
                            type="tel" 
                            className="form-control" 
                            defaultValue={tenantProfile?.phone || ""} 
                            required 
                            placeholder="+225..."
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-with-icon">
                          <Mail size={18} className="input-icon" />
                          <input 
                            type="email" 
                            className="form-control" 
                            defaultValue={tenantProfile?.email || ""} 
                            required 
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message (optionnel)</label>
                      <textarea 
                        className="form-control" 
                        rows={3} 
                        placeholder="Précisez votre situation, votre date d'emménagement souhaitée, etc."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      ></textarea>
                    </div>

                    <div style={{ marginTop: "var(--space-2)" }}>
                      <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "16px" }}>
                        Envoyer ma demande
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
