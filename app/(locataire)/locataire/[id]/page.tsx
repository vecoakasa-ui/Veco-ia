"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Building, 
  CalendarClock, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Clock,
  X
} from "lucide-react";
import { db } from "@/lib/store";
import { Tenant, Lease, Payment, Incident } from "@/lib/types";
import { formatCurrency, formatDate, getPaymentStatusClass, getPaymentStatusLabel } from "@/lib/utils";

export default function PortailLocatairePage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [lease, setLease] = useState<Lease | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Incident Modal
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentPriority, setIncidentPriority] = useState<"low"|"medium"|"high"|"urgent">("medium");

  const loadData = async () => {
    if (!tenantId) return;
    
    const allTenants = await db.getTenants();
    const currentTenant = allTenants.find(t => t.id === tenantId) || null;
    setTenant(currentTenant);

    if (currentTenant) {
      const allLeases = await db.getLeases();
      setLease(allLeases.find(l => l.tenant_id === tenantId && l.status === "active") || null);

      const allPayments = await db.getPayments();
      setPayments(allPayments.filter(p => p.tenant_id === tenantId).sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()));

      const allIncidents = await db.getIncidents();
      setIncidents(allIncidents.filter(i => i.tenant_id === tenantId));
    }
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [tenantId]);

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !lease) return;

    await db.addIncident({
      tenant_id: tenant.id,
      property_id: lease.property_id,
      title: incidentTitle,
      description: incidentDesc,
      priority: incidentPriority,
      status: "open",
      images: []
    });

    setIncidentTitle("");
    setIncidentDesc("");
    setIncidentPriority("medium");
    setShowIncidentModal(false);
    
    await loadData();
    window.dispatchEvent(new Event("storage"));
    alert("Votre incident a bien été signalé à l'agence.");
  };

  if (!tenant) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column", gap: "16px" }}>
        <AlertTriangle size={48} style={{ color: "var(--warning)" }} />
        <h3>Locataire introuvable</h3>
      </div>
    );
  }

  const upcomingPayment = payments.find(p => p.status === "upcoming" || p.status === "late");

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      
      {/* Welcome Section */}
      <div>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--gray-900)", marginBottom: "4px" }}>
          Bonjour, {tenant.full_name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: "var(--gray-500)", margin: 0 }}>Bienvenue sur votre espace locataire personnel.</p>
      </div>

      {/* Hero Card: Next Rent */}
      {upcomingPayment ? (
        <div className="card" style={{ background: "var(--gray-900)", color: "white", padding: "var(--space-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-6)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "var(--radius-md)" }}>
                <CalendarClock size={20} />
              </div>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Prochain Loyer</span>
            </div>
            <span className={`badge ${upcomingPayment.status === 'late' ? 'badge-danger' : 'badge-warning'}`} style={{ border: "none" }}>
              {upcomingPayment.status === 'late' ? 'En retard' : 'À venir'}
            </span>
          </div>
          
          <h2 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 4px 0" }}>{formatCurrency(upcomingPayment.total)}</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--text-sm)", margin: "0 0 var(--space-6) 0" }}>
            Échéance le {formatDate(upcomingPayment.due_date)}
          </p>

          <a href={`/pay/${upcomingPayment.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "16px" }}>
            Payer maintenant
          </a>
        </div>
      ) : (
        <div className="card" style={{ background: "var(--success-light)", border: "1px solid var(--success)", padding: "var(--space-6)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
          <div>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--success-dark)", margin: 0 }}>Vous êtes à jour !</h3>
            <p style={{ color: "var(--gray-700)", fontSize: "var(--text-sm)", margin: 0 }}>Aucun loyer n'est en attente de paiement.</p>
          </div>
        </div>
      )}

      {/* Lease Details */}
      <section>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Building size={20} style={{ color: "var(--primary)" }} /> Mon Logement
        </h3>
        {lease ? (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--gray-100)", paddingBottom: "var(--space-3)" }}>
              <span style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>Adresse</span>
              <span style={{ fontWeight: 600 }}>{tenant.property_name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--gray-100)", paddingBottom: "var(--space-3)" }}>
              <span style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>Loyer de base</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(lease.rent_amount)} / mois</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>Fin du bail</span>
              <span style={{ fontWeight: 600 }}>{formatDate(lease.end_date)}</span>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>Aucun bail actif trouvé.</p>
        )}
      </section>

      {/* Payments History */}
      <section id="paiements">
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={20} style={{ color: "var(--primary)" }} /> Mes Paiements
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {payments.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--gray-500)" }}>
              Aucun historique de paiement.
            </div>
          ) : (
            payments.map(p => (
              <div key={p.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4)" }}>
                <div>
                  <h4 style={{ fontWeight: 700, margin: "0 0 4px 0" }}>{p.month} {p.year}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--gray-500)" }}>
                    <span className={`badge ${getPaymentStatusClass(p.status)}`} style={{ padding: "2px 6px", fontSize: "10px" }}>
                      {getPaymentStatusLabel(p.status)}
                    </span>
                    {p.payment_date && <span>• Le {formatDate(p.payment_date)}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <span style={{ fontWeight: 800 }}>{formatCurrency(p.total)}</span>
                  {p.status === "paid" && (
                    <button className="btn btn-ghost" style={{ padding: "8px", color: "var(--primary)" }} title="Télécharger la quittance" onClick={() => alert("Génération du PDF en cours...")}>
                      <Download size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Incidents */}
      <section id="incidents" style={{ marginBottom: "var(--space-8)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={20} style={{ color: "var(--danger)" }} /> Mes Signalements
          </h3>
          <button className="btn btn-outline btn-sm" onClick={() => setShowIncidentModal(true)}>
            Signaler un problème
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {incidents.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--gray-500)" }}>
              Aucun problème signalé. Tout va bien !
            </div>
          ) : (
            incidents.map(inc => (
              <div key={inc.id} className="card" style={{ padding: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
                  <h4 style={{ fontWeight: 700, margin: 0 }}>{inc.title}</h4>
                  <span className={`badge ${inc.status === 'open' || inc.status === 'in_progress' ? 'badge-warning' : 'badge-success'}`}>
                    {inc.status === 'open' ? 'En attente' : inc.status === 'in_progress' ? 'En cours' : 'Résolu'}
                  </span>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)", margin: "0 0 8px 0" }}>{inc.description}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--gray-400)" }}>
                  <Clock size={12} /> Signale le {formatDate(inc.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modal Incident */}
      {showIncidentModal && (
        <div 
          style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "var(--space-4)" }}
          className="animate-fade-in"
        >
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "450px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={20} style={{ color: "var(--danger)" }} />
                Nouveau Signalement
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowIncidentModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleReportIncident} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Titre du problème</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fuite d'eau dans la salle de bain"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description détaillée</label>
                <textarea
                  required
                  placeholder="Expliquez le problème..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  className="input"
                  style={{ minHeight: "100px", resize: "vertical" }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Niveau d'urgence</label>
                <select
                  value={incidentPriority}
                  onChange={(e) => setIncidentPriority(e.target.value as any)}
                  className="input"
                  style={{ appearance: "auto" }}
                >
                  <option value="low">Faible (Désagrément mineur)</option>
                  <option value="medium">Moyen (Gênant mais non bloquant)</option>
                  <option value="high">Élevé (Besoin d'intervention rapide)</option>
                  <option value="urgent">Urgent (Dégât des eaux, panne de courant totale...)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowIncidentModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: "var(--danger)", borderColor: "var(--danger)" }}>Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
