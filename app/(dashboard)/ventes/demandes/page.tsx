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
  Map,
  X,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Inquiry, Property } from "@/lib/types";
import { db } from "@/lib/store";

export default function VentesDemandesPage() {
  const [inquiries, setInquiries] = useState<(Inquiry & { property?: Property })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  // Modal states for Conclure la Vente
  const [acceptingInquiry, setAcceptingInquiry] = useState<(Inquiry & { property?: Property }) | null>(null);
  const [totalPrice, setTotalPrice] = useState<string>("");
  const [advancePayment, setAdvancePayment] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAcceptModal = (inq: Inquiry & { property?: Property }) => {
    setAcceptingInquiry(inq);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setTotalPrice("");
    setAdvancePayment("");
  };

  const handleAcceptInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingInquiry || !startDate) return;
    
    setIsSubmitting(true);
    try {
      const normalizedEmail = acceptingInquiry.tenant_email.trim().toLowerCase();
      let finalProfileId = null;
      try {
        const { data } = await supabase.from("profiles").select("id").ilike("email", normalizedEmail).maybeSingle();
        if (data && data.id) {
          finalProfileId = data.id;
        }
      } catch (err) {}

      // Create the buyer
      const newBuyer = await db.addBuyer({
        full_name: acceptingInquiry.tenant_name,
        email: normalizedEmail,
        phone: acceptingInquiry.tenant_phone,
        profile_id: finalProfileId
      });

      if (finalProfileId) {
        // Update their role to 'buyer' so they get redirected to the acheteur dashboard
        await supabase.from("profiles").update({ role: "buyer" }).eq("id", finalProfileId);
      }

      // Create the sale
      const price = parseFloat(totalPrice) || 0;
      const advance = parseFloat(advancePayment) || 0;
      
      const newSale = await db.addSale({
        property_id: acceptingInquiry.property_id,
        buyer_id: newBuyer.id,
        total_price: price,
        advance_payment: advance,
        remaining_balance: price - advance,
        start_date: startDate
      });

      // If advance payment exists, create a paid installment for it
      if (advance > 0) {
        await supabase.from("sale_installments").insert({
          id: "inst-" + Math.random().toString(36).substring(2, 11),
          sale_id: newSale.id,
          amount: advance,
          due_date: startDate,
          status: 'paid',
          payment_method: 'cash',
          payment_date: new Date().toISOString()
        });
      }

      // Update property status
      await supabase.from("properties").update({ status: "sold" }).eq("id", acceptingInquiry.property_id);

      await updateStatus(acceptingInquiry.id, "accepted");
      setAcceptingInquiry(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'acceptation de la demande d'achat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
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

        const filteredCombined = combined.filter((inq: any) => {
          if (!inq.property) return false;
          return inq.property.type === 'terrain' || inq.property.type === 'lotissement';
        });

        setInquiries(filteredCombined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadInquiries();
    
    // Marquer la page comme vue pour les notifications
    db.getProfile().then(p => {
      if (p) {
        localStorage.setItem(`last_viewed_${p.id}_demandes_achat`, new Date().toISOString());
        window.dispatchEvent(new CustomEvent('notificationViewed', { detail: 'demandes_achat' }));
      }
    });
  }, []);

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
            Demandes d'Achat
          </h1>
          <p style={{ color: "var(--gray-500)", margin: 0 }}>Gérez les prospects intéressés par vos terrains et lotissements.</p>
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
              placeholder="Rechercher un prospect ou un lot..." 
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
          <p style={{ color: "var(--gray-500)", margin: 0 }}>Vous n'avez pas de demandes d'achat correspondant à ces critères.</p>
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
                    <Map size={16} style={{ color: "var(--primary)" }} />
                    <span style={{ fontWeight: 600 }}>{inq.property?.name || "Lot inconnu"}</span>
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
                  <button onClick={() => handleOpenAcceptModal(inq)} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                    Accepter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Conclure la Vente */}
      {acceptingInquiry && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>Conclure la vente</h2>
              <button className="btn-icon" onClick={() => setAcceptingInquiry(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--gray-600)", marginBottom: "var(--space-4)" }}>
                Vous êtes sur le point d'accepter la demande de <strong>{acceptingInquiry.tenant_name}</strong> pour <strong>{acceptingInquiry.property?.name}</strong>. Renseignez les détails de la vente.
              </p>
              
              <form onSubmit={handleAcceptInquiry} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                
                <div>
                  <label className="form-label">Prix Total Convenu (FCFA)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    value={totalPrice}
                    onChange={e => setTotalPrice(e.target.value)}
                    placeholder="Ex: 5000000"
                  />
                </div>

                <div>
                  <label className="form-label">Avance Versée (FCFA) - Optionnel</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={advancePayment}
                    onChange={e => setAdvancePayment(e.target.value)}
                    placeholder="Ex: 1000000"
                  />
                </div>

                <div>
                  <label className="form-label">Date de début / Signature</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required 
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>

                <div className="modal-footer" style={{ marginTop: "var(--space-2)" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setAcceptingInquiry(null)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Loader2 size={16} className="spinner" /> Validation...
                      </span>
                    ) : "Valider la Vente"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
