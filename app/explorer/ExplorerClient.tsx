"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  User,
  LayoutGrid,
  Map,
  AlertTriangle
} from "lucide-react";
import { db } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Property, Profile } from "@/lib/types";
import { formatCurrency, getPropertyTypeLabel } from "@/lib/utils";
import MapModuleWrapper from "@/components/MapModuleWrapper";
import { ArrowLeft } from "lucide-react";

export default function PublicExplorerClient({ initialProperties }: { initialProperties: Property[] }) {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [dashboardLink, setDashboardLink] = useState("/login");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionUser(session.user);
        const p = await db.getProfile();
        if (p) {
          if (p.role === "admin") setDashboardLink("/admin/dashboard");
          else if (p.role === "owner") setDashboardLink("/dashboard");
          else setDashboardLink("/locataire/dashboard"); // For simple users (tenant), we send them to their Espace Client. If they are buyers, their dashboard redirect handles it (or we can just use /locataire/dashboard which is the Espace Client)
        }
      }
    };
    checkAuth();
  }, []);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [activeTab, setActiveTab] = useState<"location" | "achat">("location");
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  
  // Pagination State
  const [hasMoreLocation, setHasMoreLocation] = useState(true);
  const [hasMoreAchat, setHasMoreAchat] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 12;

  const loadMoreProperties = async () => {
    setIsLoadingMore(true);
    try {
      const isLocation = activeTab === 'location';
      const currentCount = properties.filter(p => isLocation ? p.type !== 'terrain' && p.type !== 'lotissement' : p.type === 'terrain' || p.type === 'lotissement').length;
      
      const start = currentCount;
      const end = currentCount + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'vacant')
        .order('name', { ascending: true })
        .range(start, end);

      if (isLocation) {
        query = query.not('type', 'in', "('building', 'cour_commune', 'residence', 'lotissement', 'terrain')");
      } else {
        query = query.in('type', ['terrain', 'lotissement']);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        setProperties(prev => {
          const newProps = [...prev];
          data.forEach((p: any) => {
            if (!newProps.find(existing => existing.id === p.id)) {
              newProps.push(p as Property);
            }
          });
          return newProps;
        });

        if (data.length < ITEMS_PER_PAGE) {
          if (isLocation) setHasMoreLocation(false);
          else setHasMoreAchat(false);
        }
      }
    } catch (error) {
      console.error("Error loading more properties:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Modal State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);


  const handleInterestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProperty) return;

    setSubmitError(null);
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;

    try {
      const { error } = await supabase.from('inquiries').insert([{
        id: crypto.randomUUID(),
        property_id: selectedProperty.id,
        owner_id: selectedProperty.owner_id,
        tenant_id: null,
        tenant_name: name || '',
        tenant_phone: phone || '',
        tenant_email: email || '',
        message: message,
        status: 'pending'
      }]);

      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedProperty(null);
        setMessage("");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Public Header */}
      <header style={{ background: "white", padding: "16px 24px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--gray-200)", gap: "16px", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/" className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--gray-700)" }}>
          <ArrowLeft size={20} /> Retour
        </Link>
        <Link href="/" style={{ textDecoration: "none" }}>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "var(--gray-900)" }}>Vision Immo 2.0 <span style={{ color: "var(--orange)" }}>Explorer</span></h1>
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href={sessionUser ? dashboardLink : "/login"} className={sessionUser ? "btn btn-primary" : "btn btn-orange"} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
            <User size={16} /> <span className="hide-mobile">{sessionUser ? "Mon Espace" : "Se connecter"}</span>
          </Link>
        </div>
      </header>

      <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-6)", flex: 1, maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--gray-900)", marginBottom: "4px" }}>
            Biens Disponibles
          </h2>
          <p style={{ color: "var(--gray-500)", margin: 0 }}>Découvrez nos logements et terrains actuellement disponibles.</p>
        </div>

        <div style={{ display: "flex", background: "var(--gray-200)", padding: "4px", borderRadius: "var(--radius-lg)" }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{ 
              display: "flex", alignItems: "center", gap: "8px", 
              padding: "8px 16px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer",
              background: viewMode === 'grid' ? "var(--white)" : "transparent",
              color: viewMode === 'grid' ? "var(--primary)" : "var(--gray-600)",
              fontWeight: viewMode === 'grid' ? 600 : 500,
              boxShadow: viewMode === 'grid' ? "var(--shadow-sm)" : "none",
              transition: "all 0.2s"
            }}
          >
            <LayoutGrid size={18} /> Grille
          </button>
          <button 
            onClick={() => setViewMode('map')}
            style={{ 
              display: "flex", alignItems: "center", gap: "8px", 
              padding: "8px 16px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer",
              background: viewMode === 'map' ? "var(--white)" : "transparent",
              color: viewMode === 'map' ? "var(--primary)" : "var(--gray-600)",
              fontWeight: viewMode === 'map' ? 600 : 500,
              boxShadow: viewMode === 'map' ? "var(--shadow-sm)" : "none",
              transition: "all 0.2s"
            }}
          >
            <Map size={18} /> Carte
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--gray-200)" }}>
        <button 
          onClick={() => setActiveTab("location")}
          style={{ 
            padding: "12px 24px", 
            fontWeight: "600",
            borderBottom: activeTab === "location" ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === "location" ? "var(--primary)" : "var(--gray-500)",
            background: "none",
            borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer",
            fontSize: "14px",
            transition: "all 0.2s"
          }}
        >
          À Louer (Appartements, Villas...)
        </button>
        <button 
          onClick={() => setActiveTab("achat")}
          style={{ 
            padding: "12px 24px", 
            fontWeight: "600",
            borderBottom: activeTab === "achat" ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === "achat" ? "var(--primary)" : "var(--gray-500)",
            background: "none",
            borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer",
            fontSize: "14px",
            transition: "all 0.2s"
          }}
        >
          À Acheter <span style={{ color: "var(--orange)", fontWeight: "bold" }}>(Terrains & Lots)</span>
        </button>
      </div>

      {/* Content View */}
      {viewMode === 'map' ? (
        <div className="card animate-fade-in" style={{ padding: "0", overflow: "hidden", marginBottom: "var(--space-2)" }}>
          <MapModuleWrapper properties={properties.filter(p => activeTab === 'location' ? p.type !== 'terrain' && p.type !== 'lotissement' : p.type === 'terrain' || p.type === 'lotissement')} />
        </div>
      ) : (
        <>
          {properties.filter(p => activeTab === 'location' ? p.type !== 'terrain' && p.type !== 'lotissement' : p.type === 'terrain' || p.type === 'lotissement').length === 0 ? (
            <div className="card animate-fade-in" style={{ padding: "var(--space-8)", textAlign: "center", background: "var(--white)" }}>
              <Building size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4)" }} />
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--gray-700)", margin: "0 0 var(--space-2)" }}>
                Aucun bien disponible
              </h3>
              <p style={{ color: "var(--gray-500)", margin: 0 }}>Il n'y a actuellement aucun bien vacant dans cette catégorie. Revenez plus tard !</p>
            </div>
          ) : (
            <>
              <div className="grid-explorer animate-fade-in">
              {properties.filter(p => activeTab === 'location' ? p.type !== 'terrain' && p.type !== 'lotissement' : p.type === 'terrain' || p.type === 'lotissement').map((property) => (
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
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--primary)" }}>
                        {activeTab === 'achat' ? formatCurrency(property.sale_price || 0) : formatCurrency(property.monthly_rent)}
                        {activeTab === 'location' && <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--gray-500)" }}>/mois</span>}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 var(--space-4)" }}>
                      <MapPin size={14} style={{ color: "var(--gray-400)" }} />
                      {property.address}, {property.city}
                    </p>

                    <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, background: "var(--gray-100)", color: "var(--gray-600)", padding: "4px 8px", borderRadius: "var(--radius-sm)", textTransform: "uppercase" }}>
                        {getPropertyTypeLabel(property.type)}
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
            
            {((activeTab === 'location' && hasMoreLocation) || (activeTab === 'achat' && hasMoreAchat)) && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-8)" }}>
                <button 
                  onClick={loadMoreProperties}
                  disabled={isLoadingMore}
                  className="btn btn-outline"
                  style={{ padding: "12px 32px", fontWeight: 600, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Chargement...
                    </>
                  ) : (
                    "Charger plus de biens"
                  )}
                </button>
              </div>
            )}
            </>
          )}
        </>
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
              <button onClick={() => { setSelectedProperty(null); setShowSuccess(false); setSubmitError(null); }} style={{ color: "var(--gray-500)", background: "none", border: "none", cursor: "pointer" }}>
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
                      Vous êtes sur le point d'envoyer une demande {selectedProperty.type === 'terrain' || selectedProperty.type === 'lotissement' ? "d'achat" : "de location"} pour <strong>{selectedProperty.name}</strong> au {selectedProperty.type === 'terrain' || selectedProperty.type === 'lotissement' ? "prix" : "loyer"} de <strong>{formatCurrency(selectedProperty.type === 'terrain' || selectedProperty.type === 'lotissement' ? (selectedProperty.sale_price || 0) : selectedProperty.monthly_rent)}</strong>.
                    </p>
                  </div>

                  {submitError && (
                    <div className="animate-fade-in" style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-3)", background: "#FEF2F2", border: "1px solid #F87171", borderRadius: "var(--radius-md)", marginBottom: "var(--space-5)" }}>
                      <AlertTriangle size={20} style={{ color: "#EF4444", flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "#991B1B" }}>
                        <strong>Erreur : </strong> {submitError}
                        {submitError.includes("inquiries") && " (Avez-vous bien exécuté le script SQL pour créer la table ?)"}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleInterestSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                    {/* Pre-filled info based on profile if available */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--gray-700)" }}>Nom complet</label>
                      <div style={{ position: "relative" }}>
                        <User size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                        <input 
                          type="text" 
                          name="name"
                          className="form-control" 
                          required 
                          placeholder="Votre nom complet"
                          style={{ paddingLeft: "36px", width: "100%", height: "48px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-300)", outline: "none" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--gray-700)" }}>Téléphone</label>
                        <div style={{ position: "relative" }}>
                          <Phone size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                          <input 
                            type="tel" 
                            name="phone"
                            className="form-control" 
                            required 
                            placeholder="+225..."
                            style={{ paddingLeft: "36px", width: "100%", height: "48px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-300)", outline: "none" }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--gray-700)" }}>Email</label>
                        <div style={{ position: "relative" }}>
                          <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                          <input 
                            type="email" 
                            name="email"
                            className="form-control" 
                            required 
                            placeholder="votre@email.com"
                            style={{ paddingLeft: "36px", width: "100%", height: "48px", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-300)", outline: "none" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--gray-700)" }}>Message (optionnel)</label>
                      <textarea 
                        className="form-control" 
                        rows={4} 
                        placeholder={selectedProperty?.type === 'terrain' || selectedProperty?.type === 'lotissement' ? "Précisez votre projet d'achat, vos conditions de financement, etc." : "Précisez votre situation, votre date d'emménagement souhaitée, etc."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{ width: "100%", padding: "12px", resize: "vertical", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-300)", outline: "none" }}
                      ></textarea>
                    </div>

                    <div style={{ marginTop: "var(--space-2)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--gray-200)" }}>
                      <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "16px", fontWeight: 600, height: "52px" }}>
                        {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (selectedProperty?.type === 'terrain' || selectedProperty?.type === 'lotissement' ? "Envoyer ma demande d'achat" : "Envoyer ma demande de location")}
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
    </div>
  );
}
