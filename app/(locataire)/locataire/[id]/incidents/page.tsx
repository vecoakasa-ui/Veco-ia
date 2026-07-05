"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  Plus,
  Image as ImageIcon
} from "lucide-react";
import { db } from "@/lib/store";
import { Incident, Tenant, IncidentPriority, IncidentStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const getIncidentStatusLabel = (status: IncidentStatus | "all") => {
  switch (status) {
    case "open": return "Ouvert";
    case "in_progress": return "En cours";
    case "resolved": return "Résolu";
    case "all": return "Tous";
    default: return status;
  }
};

const getIncidentStatusClass = (status: IncidentStatus) => {
  switch (status) {
    case "open": return "badge-danger";
    case "in_progress": return "badge-warning";
    case "resolved": return "badge-success";
    default: return "";
  }
};

const getIncidentPriorityLabel = (priority: IncidentPriority) => {
  switch (priority) {
    case "low": return "Basse";
    case "medium": return "Moyenne";
    case "high": return "Haute";
    case "urgent": return "Urgente";
    default: return priority;
  }
};

export default function IncidentsLocatairePage() {
  const params = useParams();
  
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    priority: "medium",
    status: "open",
    title: "",
    description: "",
    images: []
  });

  const loadData = async () => {
    setLoading(true);
    
    const profile = await db.getProfile();
    if (!profile) {
      setLoading(false);
      return;
    }

    const allTenants = await db.getTenants();
    let currentTenant = allTenants.find(t => t.profile_id === profile.id);
    
    if (!currentTenant) {
      currentTenant = {
        id: "temp-" + profile.id,
        profile_id: profile.id,
        property_id: "",
        owner_id: "",
        lease_start: "",
        lease_end: "",
        lease_type: "residential",
        status: "active",
        created_at: new Date().toISOString(),
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        property_name: "Aucun logement assigné"
      };
    }
    setTenant(currentTenant);

    if (currentTenant && currentTenant.property_id) {
      const allIncidents = await db.getIncidents();
      // Only keep incidents for this tenant
      const tenantIncidents = allIncidents.filter(i => i.tenant_id === currentTenant?.id);
      
      // Sort by creation date (most recent first)
      tenantIncidents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setIncidents(tenantIncidents);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
     
  }, [params.id]);

  const handleAddIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id || !tenant?.property_id || !newIncident.title || !newIncident.description) {
      return alert("Veuillez remplir tous les champs obligatoires");
    }
    
    setIsSubmitting(true);
    let imageUrl: string | null = null;
    
    if (imageFile && isSupabaseConfigured()) {
      try {
        const fileExt = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `inc-${Date.now()}.${fileExt}`;
        
        const { error } = await supabase.storage.from('incident-media').upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
        
        if (error) {
          console.error("Upload error", error);
          alert("Erreur d'upload de l'image.");
        } else {
          const { data: pubData } = supabase.storage.from('incident-media').getPublicUrl(fileName);
          imageUrl = pubData.publicUrl;
        }
      } catch (err) {
        console.error(err);
      }
    }

    try {
      await db.addIncident({
        tenant_id: tenant.id,
        property_id: tenant.property_id,
        title: newIncident.title,
        description: newIncident.description,
        priority: newIncident.priority as IncidentPriority,
        status: newIncident.status as IncidentStatus,
        images: imageUrl ? [imageUrl] : [],
      });
      setShowAddModal(false);
      setImageFile(null);
      setNewIncident({ priority: "medium", status: "open", title: "", description: "", images: [] });
      const list = await db.getIncidents();
      setIncidents(list.filter(i => i.tenant_id === tenant.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error(err);
      alert("Erreur lors du signalement de l'incident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIncidents = useMemo(() => {
    if (statusFilter === "all") return incidents;
    return incidents.filter(i => i.status === statusFilter);
  }, [incidents, statusFilter]);

  const activeIncidents = incidents.filter(i => i.status === "open" || i.status === "in_progress");
  const resolvedIncidents = incidents.filter(i => i.status === "resolved");

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
        <Loader2 size={48} className="animate-spin" style={{ color: "var(--primary)" }} />
        <h3 style={{ color: "var(--gray-600)" }}>Chargement de vos incidents...</h3>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
        <AlertTriangle size={48} style={{ color: "var(--warning)" }} />
        <h3>Locataire introuvable</h3>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, margin: "0 0 8px 0", color: "var(--gray-900)", display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={32} style={{ color: "var(--orange)" }} />
            Mes Incidents
          </h1>
          <p style={{ fontSize: "var(--text-md)", color: "var(--gray-600)", margin: 0 }}>
            Signalez des problèmes dans votre logement et suivez leur résolution.
          </p>
        </div>
        
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ padding: "12px 24px", fontSize: "16px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "8px", background: "var(--orange)", border: "none" }}>
          <Plus size={18} /> Signaler un incident
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-6)" }}>
        
        {/* Active Incidents Card */}
        <div className="card hover-scale" style={{ background: "linear-gradient(135deg, #E25822 0%, #C2410C 100%)", color: "white", padding: "var(--space-6)", border: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 25px -5px rgba(226, 88, 34, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                <AlertCircle size={24} style={{ color: "var(--white)" }} />
              </div>
              <div>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "rgba(255,255,255,0.8)", display: "block", textTransform: "uppercase", letterSpacing: "1px" }}>En cours</span>
              </div>
            </div>
            {activeIncidents.length > 0 ? (
              <span className="badge badge-warning" style={{ border: "none", fontWeight: 800 }}>En attente d'action</span>
            ) : (
              <span className="badge" style={{ background: "var(--success)", color: "white", border: "none", fontWeight: 800 }}>Tout va bien</span>
            )}
          </div>
          
          <div>
            <h2 style={{ fontSize: "42px", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-1px", color: "white" }}>{activeIncidents.length}</h2>
            {activeIncidents.length > 0 ? (
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-sm)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} /> Incident(s) non résolu(s)
              </p>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-sm)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={14} /> Aucun incident ouvert
              </p>
            )}
          </div>
        </div>

        {/* Resolved Incidents Card */}
        <div className="card hover-scale" style={{ background: "linear-gradient(135deg, #009E60 0%, #007A4B 100%)", color: "white", padding: "var(--space-6)", border: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 25px -5px rgba(0, 158, 96, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                <CheckCircle2 size={24} style={{ color: "var(--white)" }} />
              </div>
              <div>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "rgba(255,255,255,0.8)", display: "block", textTransform: "uppercase", letterSpacing: "1px" }}>Résolus</span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 style={{ fontSize: "42px", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-1px" }}>{resolvedIncidents.length}</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-sm)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={14} /> Incident(s) clôturé(s)
            </p>
          </div>
        </div>

      </div>

      {/* Main List Area */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        
        {/* Filters & Header */}
        <div style={{ padding: "var(--space-5)", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)", background: "var(--gray-50)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "10px", color: "var(--gray-800)" }}>
            <AlertTriangle size={20} style={{ color: "var(--orange)" }} /> Historique des Incidents
          </h3>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            <Filter size={16} style={{ color: "var(--gray-500)", marginRight: "4px" }} />
            {(["all", "open", "in_progress", "resolved"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  border: statusFilter === status ? "none" : "1px solid var(--gray-200)",
                  background: statusFilter === status ? "var(--orange)" : "var(--white)",
                  color: statusFilter === status ? "white" : "var(--gray-600)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap"
                }}
              >
                {getIncidentStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Incidents List */}
        <div style={{ display: "flex", flexDirection: "column", background: "var(--white)" }}>
          {filteredIncidents.length === 0 ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--gray-500)" }}>
              <div style={{ background: "var(--gray-100)", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-4) auto" }}>
                <AlertTriangle size={24} style={{ color: "var(--gray-400)" }} />
              </div>
              <h4 style={{ fontWeight: 600, color: "var(--gray-700)", margin: "0 0 4px 0" }}>Aucun incident trouvé</h4>
              <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>Il n'y a pas d'incidents correspondant à ce filtre.</p>
            </div>
          ) : (
            filteredIncidents.map((incident, index) => (
              <div 
                key={incident.id} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  padding: "var(--space-4) var(--space-5)", 
                  borderBottom: index < filteredIncidents.length - 1 ? "1px solid var(--gray-100)" : "none",
                  transition: "background 0.2s",
                  flexWrap: "wrap",
                  gap: "var(--space-4)"
                }}
                className="hover-bg-gray-50"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", minWidth: "200px" }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "var(--radius-md)", 
                    background: incident.status === 'resolved' ? "var(--success-lightest)" : incident.status === 'open' ? "var(--danger-lightest)" : "var(--warning-lightest)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: incident.status === 'resolved' ? "var(--success)" : incident.status === 'open' ? "var(--danger)" : "var(--warning-dark)"
                  }}>
                    {incident.status === 'resolved' ? <CheckCircle2 size={24} /> : incident.status === 'open' ? <AlertCircle size={24} /> : <Clock size={24} />}
                  </div>
                  
                  <div>
                    <h4 style={{ fontWeight: 800, margin: "0 0 4px 0", fontSize: "var(--text-md)", color: "var(--gray-900)" }}>
                      {incident.title}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--gray-500)" }}>
                      <span className={`badge ${getIncidentStatusClass(incident.status)}`} style={{ padding: "2px 8px", fontSize: "11px" }}>
                        {getIncidentStatusLabel(incident.status)}
                      </span>
                      <span>• Signalé le {formatDate(incident.created_at)}</span>
                      {incident.resolved_at && (
                        <span>• Résolu le {formatDate(incident.resolved_at)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase" }}>Priorité</span>
                    <span className={`badge`} style={{ 
                      background: incident.priority === 'urgent' ? "var(--danger)" : incident.priority === 'high' ? "var(--orange)" : incident.priority === 'medium' ? "var(--warning)" : "var(--gray-300)",
                      color: incident.priority === 'medium' ? "var(--gray-900)" : "white",
                      border: "none"
                    }}>
                      {getIncidentPriorityLabel(incident.priority)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Modal Signaler un Incident */}
      {showAddModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px", width: "90%" }}>
            <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, margin: "0 0 var(--space-4) 0", color: "var(--gray-900)" }}>
              Signaler un incident
            </h2>
            <form onSubmit={handleAddIncident}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--gray-700)" }}>Titre de l'incident *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Ex: Fuite d'eau, Chauffage en panne..."
                    value={newIncident.title}
                    onChange={e => setNewIncident({...newIncident, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--gray-700)" }}>Description détaillée *</label>
                  <textarea
                    required
                    className="input"
                    rows={4}
                    placeholder="Expliquer le problème avec un maximum de détails..."
                    value={newIncident.description}
                    onChange={e => setNewIncident({...newIncident, description: e.target.value})}
                    style={{
                      border: "2px solid var(--gray-300)",
                      backgroundColor: "var(--gray-50)",
                      borderRadius: "var(--radius-lg)",
                      padding: "16px",
                      minHeight: "120px",
                      resize: "vertical",
                      width: "100%",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--orange)";
                      e.target.style.backgroundColor = "var(--white)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--gray-300)";
                      e.target.style.backgroundColor = "var(--gray-50)";
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--gray-700)" }}>Priorité</label>
                  <select
                    className="input"
                    value={newIncident.priority}
                    onChange={e => setNewIncident({...newIncident, priority: e.target.value as IncidentPriority})}
                  >
                    <option value="low">Basse (Non urgent)</option>
                    <option value="medium">Moyenne (Gênant)</option>
                    <option value="high">Haute (Urgent)</option>
                    <option value="urgent">Urgente (Danger immédiat)</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--gray-700)" }}>Photo (Optionnel)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label className="btn btn-outline" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                      <ImageIcon size={18} />
                      Choisir une image
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    {imageFile && <span style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>{imageFile.name}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ background: "var(--orange)", border: "none" }}>
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" style={{ marginRight: "8px" }} /> Envoi...</> : "Signaler l'incident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hover-bg-gray-50:hover {
          background-color: var(--gray-50);
        }
      `}</style>
    </div>
  );
}
