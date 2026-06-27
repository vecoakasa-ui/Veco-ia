"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Search, CheckCircle, X, Camera, Loader2, Image as ImageIcon } from "lucide-react";
import { db } from "@/lib/store";
import { Incident, Property, Tenant, IncidentPriority, IncidentStatus } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [tenants, setTenants] = useState<Record<string, Tenant>>({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState<Incident | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    priority: "medium",
    status: "open",
    title: "",
    description: "",
    images: []
  });

  const [repairCost, setRepairCost] = useState<string>("");

  useEffect(() => {
    const loadIncidentsData = async () => {
      const list = await db.getIncidents();
      const rawProps = await db.getProperties();
      const rawTens = await db.getTenants();
      const props = rawProps.reduce((acc, p) => ({...acc, [p.id]: p}), {} as Record<string, Property>);
      const tens = rawTens.reduce((acc, t) => ({...acc, [t.id]: t}), {} as Record<string, Tenant>);
      
      setIncidents(list);
      setProperties(props);
      setTenants(tens);
    };
    loadIncidentsData();
  }, []);

  const handleAddIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.tenant_id || !newIncident.property_id || !newIncident.title || !newIncident.description) {
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
          alert("Erreur d'upload de l'image. Avez-vous créé le bucket 'incident-media' ?");
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
        tenant_id: newIncident.tenant_id,
        property_id: newIncident.property_id,
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
      setIncidents(list);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du signalement de l'incident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResolveModal) return;
    setIsSubmitting(true);
    try {
      const updated = {...showResolveModal, status: "resolved", resolved_at: new Date().toISOString()};
      await db.updateIncident(updated as Incident);
      
      const cost = Number(repairCost);
      if (cost > 0) {
        const p = properties[showResolveModal.property_id];
        const t = tenants[showResolveModal.tenant_id];
        await db.addExpense({
          property_id: showResolveModal.property_id,
          landlord_id: p?.landlord_id || undefined,
          property_name: p?.name || "Inconnu",
          landlord_name: p?.landlord_id ? "Landlord" : "Inconnu",
          amount: cost,
          description: `Réparation incident: ${showResolveModal.title}`,
          category: "maintenance",
          date: new Date().toISOString().split('T')[0],
          receipt_url: undefined
        });
      }
      
      setShowResolveModal(null);
      setRepairCost("");
      const list = await db.getIncidents();
      setIncidents(list);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la résolution de l'incident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = incidents.filter(i => {
    return i.title.toLowerCase().includes(search.toLowerCase()) || 
           i.description.toLowerCase().includes(search.toLowerCase());
  });

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') return <span className="badge badge-danger">Urgent</span>;
    if (priority === 'medium') return <span className="badge badge-warning">Normal</span>;
    return <span className="badge badge-info">Faible</span>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'open') return <span className="badge badge-warning">Nouveau</span>;
    if (status === 'in_progress') return <span className="badge badge-info">En cours</span>;
    return <span className="badge badge-success">Résolu</span>;
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Suivi des problèmes et réparations</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Incidents</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Signaler un incident
        </button>
      </div>

      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ maxWidth: "400px" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher un incident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-16)" }}>
          <AlertTriangle size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4) auto" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Aucun incident</h3>
          <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>Tout va bien dans vos propriétés !</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-4)" }}>
          {filtered.map(i => {
             const t = tenants[i.tenant_id];
             const p = properties[i.property_id];
             return (
               <div key={i.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                   <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                     {getPriorityBadge(i.priority)}
                     <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, margin: 0 }}>{i.title}</h3>
                   </div>
                   {getStatusBadge(i.status)}
                 </div>
                 {i.images && i.images.length > 0 && (
                   <div style={{ marginTop: "var(--space-2)", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--gray-200)" }}>
                     <img src={i.images[0]} alt="Incident" style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }} />
                   </div>
                 )}
                 <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)", margin: 0 }}>{i.description}</p>
                 <div style={{ display: "flex", gap: "var(--space-6)", fontSize: "var(--text-xs)", color: "var(--gray-500)", marginTop: "var(--space-2)" }}>
                   <div>Bien: <span style={{ color: "var(--gray-800)", fontWeight: 600 }}>{p ? p.name : "Inconnu"}</span></div>
                   <div>Locataire: <span style={{ color: "var(--gray-800)", fontWeight: 600 }}>{t ? t.full_name : "Inconnu"}</span></div>
                   <div>Signalé le: <span style={{ color: "var(--gray-800)", fontWeight: 600 }}>{new Date(i.created_at).toLocaleDateString()}</span></div>
                 </div>
                 {i.status !== "resolved" && (
                   <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "var(--space-3)", marginTop: "var(--space-2)", display: "flex", gap: "var(--space-2)" }}>
                     {i.status === "open" && (
                       <button className="btn btn-outline btn-sm" onClick={async () => {
                          const updated = {...i, status: "in_progress"};
                          await db.updateIncident(updated as Incident);
                          const list = await db.getIncidents();
                          setIncidents(list);
                       }}>
                         Marquer en cours
                       </button>
                     )}
                     <button className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => setShowResolveModal(i)}>
                       <CheckCircle size={14} /> Marquer comme résolu
                     </button>
                   </div>
                 )}
               </div>
             )
          })}
        </div>
      )}

      {/* Add Incident Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "var(--space-4)", backdropFilter: "blur(4px)" }} className="animate-fade-in">
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "500px", background: "white", padding: "var(--space-6)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <AlertTriangle size={24} style={{ color: "var(--primary)" }} />
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", margin: 0 }}>Nouveau Signalement</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)} style={{ padding: "4px" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddIncident} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Titre du problème</label>
                <input type="text" className="input" required placeholder="Ex: Fuite d'eau sous l'évier" value={newIncident.title || ""} onChange={e => setNewIncident({...newIncident, title: e.target.value})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div className="input-group">
                  <label className="input-label">Locataire</label>
                  <select className="input" required value={newIncident.tenant_id || ""} onChange={e => setNewIncident({...newIncident, tenant_id: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    {Object.values(tenants).map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Bien</label>
                  <select className="input" required value={newIncident.property_id || ""} onChange={e => setNewIncident({...newIncident, property_id: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    {Object.values(properties).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Niveau d'urgence</label>
                <select className="input" value={newIncident.priority || "medium"} onChange={e => setNewIncident({...newIncident, priority: e.target.value as "low" | "medium" | "high" | "urgent"})}>
                  <option value="low">Faible</option>
                  <option value="medium">Normal</option>
                  <option value="high">Urgent</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Description détaillée</label>
                <textarea className="input" required rows={3} value={newIncident.description || ""} onChange={e => setNewIncident({...newIncident, description: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">Photo (Optionnel)</label>
                <div style={{ border: "2px dashed var(--gray-300)", borderRadius: "8px", padding: "var(--space-4)", textAlign: "center", background: "var(--gray-50)", cursor: "pointer", position: "relative" }}>
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]); }} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }} />
                  {imageFile ? (
                    <div style={{ color: "var(--primary)", fontWeight: 600 }}>{imageFile.name}</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", color: "var(--gray-500)" }}>
                      <ImageIcon size={24} />
                      <span style={{ fontSize: "var(--text-sm)" }}>Cliquer pour ajouter une photo</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)} disabled={isSubmitting}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Envoi...</> : "Signaler"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Incident Modal */}
      {showResolveModal && (
        <div style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "var(--space-4)", backdropFilter: "blur(4px)" }} className="animate-fade-in">
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "400px", background: "white", padding: "var(--space-6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <CheckCircle size={24} style={{ color: "var(--primary)" }} />
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", margin: 0 }}>Résoudre l'incident</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowResolveModal(null)} style={{ padding: "4px" }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)", marginBottom: "var(--space-4)" }}>
              Le problème <strong>"{showResolveModal.title}"</strong> a été réparé. Si vous avez eu des frais d'intervention, vous pouvez les saisir ci-dessous pour qu'ils soient ajoutés à votre comptabilité.
            </p>
            <form onSubmit={handleResolveIncident} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Coût de la réparation (FCFA) - Optionnel</label>
                <input type="number" className="input" placeholder="Ex: 15000" value={repairCost} onChange={e => setRepairCost(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowResolveModal(null)} disabled={isSubmitting}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? "Validation..." : "Confirmer la résolution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
