"use client";

import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Building
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Inquiry, Property } from "@/lib/types";
import { db } from "@/lib/store";

export default function DemandesPage() {
  const [inquiries, setInquiries] = useState<(Inquiry & { property?: Property })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  useEffect(() => {
    loadInquiries();
    
    // Marquer la page comme vue pour les notifications
    db.getProfile().then(p => {
      if (p) {
        localStorage.setItem(`last_viewed_${p.id}_demandes`, new Date().toISOString());
        window.dispatchEvent(new CustomEvent('notificationViewed', { detail: 'demandes' }));
      }
    });
  }, []);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const profile = await db.getProfile();
      if (!profile) return;

      const { data: inqData, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const properties = await db.getProperties();
      
      const combined = (inqData || []).map((inq: any) => ({
        ...inq,
        property: properties.find(p => p.id === inq.property_id)
      }));

      setInquiries(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setInquiries(prev => prev.map(inq => 
        inq.id === id ? { ...inq, status: newStatus } : inq
      ));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la demande.");
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = 
      inq.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.property?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || inq.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--gray-200)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <h3 style={{ color: "var(--gray-600)" }}>Chargement des demandes...</h3>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--gray-900)", marginBottom: "4px" }}>
            Demandes de Location
          </h1>
          <p style={{ color: "var(--gray-500)", margin: 0 }}>Gérez les locataires intéressés par vos biens vacants.</p>
        </div>
      </div>

      {/* Stats/Filters */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flex: 1, minWidth: "250px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Rechercher un candidat ou un bien..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "36px", width: "100%" }}
            />
          </div>
          
          <div style={{ display: "flex", gap: "var(--space-3)", overflowX: "auto", paddingBottom: "4px" }}>
            <button 
              onClick={() => setFilterStatus("all")}
              className={`btn ${filterStatus === "all" ? "btn-primary" : "btn-outline"}`}
            >
              Toutes
            </button>
            <button 
              onClick={() => setFilterStatus("pending")}
              className={`btn ${filterStatus === "pending" ? "btn-warning" : "btn-outline"}`}
            >
              En attente
            </button>
            <button 
              onClick={() => setFilterStatus("accepted")}
              className={`btn ${filterStatus === "accepted" ? "btn-success" : "btn-outline"}`}
            >
              Acceptées
            </button>
            <button 
              onClick={() => setFilterStatus("rejected")}
              className={`btn ${filterStatus === "rejected" ? "btn-danger" : "btn-outline"}`}
            >
              Refusées
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredInquiries.length === 0 ? (
        <div className="card animate-fade-in" style={{ padding: "var(--space-8)", textAlign: "center" }}>
          <MessageSquare size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4)" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--gray-700)", margin: "0 0 var(--space-2)" }}>
            Aucune demande trouvée
          </h3>
          <p style={{ color: "var(--gray-500)", margin: 0 }}>Vous n'avez pas de demandes de location correspondant à ces critères.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "var(--space-5)" }}>
          {filteredInquiries.map((inq) => (
            <div key={inq.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* Header */}
              <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--gray-200)", background: "var(--gray-50)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <div className="avatar" style={{ background: "var(--primary-lightest)", color: "var(--primary-dark)" }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--gray-900)", margin: 0 }}>
                      {inq.tenant_name}
                    </h3>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>
                      {new Date(inq.created_at).toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div>
                  {inq.status === "pending" && (
                    <span className="badge badge-warning" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> En attente
                    </span>
                  )}
                  {inq.status === "accepted" && (
                    <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={12} /> Acceptée
                    </span>
                  )}
                  {inq.status === "rejected" && (
                    <span className="badge badge-danger" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <XCircle size={12} /> Refusée
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--gray-700)" }}>
                    <Building size={16} style={{ color: "var(--primary)" }} />
                    <span style={{ fontWeight: 600 }}>{inq.property?.name || "Bien inconnu"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--gray-600)", fontSize: "var(--text-sm)" }}>
                    <MapPin size={16} style={{ color: "var(--gray-400)" }} />
                    {inq.property?.address}, {inq.property?.city}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "var(--gray-50)", padding: "var(--space-3)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)" }}>
                    <Phone size={14} style={{ color: "var(--gray-500)" }} />
                    <a href={`tel:${inq.tenant_phone}`} style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>{inq.tenant_phone}</a>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)" }}>
                    <Mail size={14} style={{ color: "var(--gray-500)" }} />
                    <a href={`mailto:${inq.tenant_email}`} style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>{inq.tenant_email}</a>
                  </div>
                </div>

                {inq.message && (
                  <div style={{ background: "var(--primary-lightest)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--primary)", fontSize: "var(--text-sm)", color: "var(--gray-800)" }}>
                    "{inq.message}"
                  </div>
                )}
              </div>

              {/* Actions */}
              {inq.status === "pending" && (
                <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--gray-200)", display: "flex", gap: "var(--space-3)" }}>
                  <button onClick={() => updateStatus(inq.id, "rejected")} className="btn btn-outline" style={{ flex: 1, justifyContent: "center", color: "var(--danger)", borderColor: "var(--danger)" }}>
                    Refuser
                  </button>
                  <button onClick={() => updateStatus(inq.id, "accepted")} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                    Accepter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
