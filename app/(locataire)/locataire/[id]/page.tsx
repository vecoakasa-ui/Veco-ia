"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  CalendarClock, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Clock,
  X,
  Loader2,
  Home,
  Wallet,
  Wrench,
  Search,
  ArrowRight,
  Compass,
  Sparkles,
  Sun
} from "lucide-react";
import { db } from "@/lib/store";
import { Tenant, Lease, Payment, Incident } from "@/lib/types";
import { formatCurrency, formatDate, getPaymentStatusClass, getPaymentStatusLabel } from "@/lib/utils";
import Link from "next/link";

export default function PortailLocatairePage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    
    const profile = await db.getProfile();
    if (!profile) {
      setLoading(false);
      return;
    }

    const allTenants = await db.getTenants();
    let currentTenant: Tenant | undefined;
    
    // If the logged-in user is a tenant, they can only see their own space
    if (profile.role === "tenant") {
      currentTenant = allTenants.find(t => t.profile_id === profile.id || (t.email && profile.email && t.email.toLowerCase() === profile.email.toLowerCase()));
    } else {
      // If the user is an owner or admin, they can view the tenant specified in the URL
      currentTenant = allTenants.find(t => t.id === tenantId);
      
      // SECURITY: Ensure the owner only views their OWN tenants
      if (currentTenant && profile.role === "owner" && currentTenant.owner_id !== profile.id) {
        currentTenant = undefined; // Block access
      }
    }
    
    // If no tenant record exists or access is blocked, create a temporary one for display (or return 404 in a real app)
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
      } as Tenant;
    }
    
    setTenant(currentTenant);

    if (currentTenant && currentTenant.property_id) {
      const allLeases = await db.getLeases();
      setLease(allLeases.find(l => l.tenant_id === currentTenant?.id && l.status === "active") || null);

      const allPayments = await db.getPayments();
      setPayments(allPayments.filter(p => p.tenant_id === currentTenant?.id).sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()));

      const allIncidents = await db.getIncidents();
      setIncidents(allIncidents.filter(i => i.tenant_id === currentTenant?.id));
    } else {
      setLease(null);
      setPayments([]);
      setIncidents([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
     
  }, [params.id]);

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

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--gray-200)", borderTopColor: "var(--orange)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <h3 style={{ color: "var(--gray-600)" }}>Chargement en cours...</h3>
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

  const upcomingPayment = payments.find(p => p.status === "upcoming" || p.status === "late");

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      
      {/* Premium Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #F77F00 0%, #D65A00 100%)", // Orange (Côte d'Ivoire)
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-8)",
        color: "var(--white)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 25px -5px rgba(247, 127, 0, 0.4)"
      }}>
        {/* CSS for animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes float-gentle {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}} />
        
        {/* Animated Background Elements */}
        <div style={{ position: "absolute", top: "-40px", right: "-20px", opacity: 0.15, animation: "spin-slow 20s linear infinite" }}>
          <Compass size={250} />
        </div>
        <div style={{ position: "absolute", bottom: "10px", right: "220px", opacity: 0.2, animation: "float-gentle 4s ease-in-out infinite" }}>
          <Sparkles size={40} />
        </div>
        <div style={{ position: "absolute", top: "20px", right: "280px", opacity: 0.1, animation: "spin-slow 15s linear infinite reverse" }}>
          <Sun size={80} />
        </div>
        
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, margin: 0, position: "relative", zIndex: 1 }}>
          Bonjour, {tenant.full_name?.split(' ')[0] || "Locataire"} 👋
        </h1>
        <p style={{ fontSize: "var(--text-lg)", color: "rgba(255,255,255,0.9)", margin: 0, position: "relative", zIndex: 1, maxWidth: "600px" }}>
          Bienvenue sur votre espace résidentiel. Gérez votre logement, vos paiements et vos demandes en toute simplicité.
        </p>
      </div>

      {/* Quick Actions & Main Overview Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)", marginTop: "var(--space-2)" }}>
        
        {/* Financial Status Card */}
        {upcomingPayment ? (
          <div className="card hover-scale" style={{ background: "linear-gradient(135deg, #009E60 0%, #007A4B 100%)", color: "white", padding: "var(--space-6)", border: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 25px -5px rgba(0, 158, 96, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                  <Wallet size={24} style={{ color: "var(--white)" }} />
                </div>
                <div>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "rgba(255,255,255,0.6)", display: "block", textTransform: "uppercase", letterSpacing: "1px" }}>Prochain Loyer</span>
                </div>
              </div>
              <span className={`badge ${upcomingPayment.status === 'late' ? 'badge-danger' : 'badge-warning'}`} style={{ border: "none", fontWeight: 800 }}>
                {upcomingPayment.status === 'late' ? 'En retard' : 'À venir'}
              </span>
            </div>
            
            <div>
              <h2 style={{ fontSize: "42px", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-1px" }}>{formatCurrency(upcomingPayment.total)}</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--text-sm)", margin: "0 0 var(--space-6) 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <CalendarClock size={14} /> Échéance le {formatDate(upcomingPayment.due_date)}
              </p>
              <a href={`/pay/${upcomingPayment.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "16px", borderRadius: "var(--radius-lg)" }}>
                Payer maintenant
              </a>
            </div>
          </div>
        ) : (
          <div className="card hover-scale" style={{ background: "var(--success-lightest)", border: "2px solid var(--success-light)", padding: "var(--space-6)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: "var(--space-4)" }}>
            <div style={{ background: "var(--white)", borderRadius: "50%", padding: "16px", boxShadow: "var(--shadow-sm)" }}>
              <CheckCircle2 size={40} style={{ color: "var(--success)" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--success-dark)", margin: "0 0 8px 0" }}>À jour !</h3>
              <p style={{ color: "var(--gray-700)", fontSize: "var(--text-md)", margin: 0 }}>Aucun loyer n'est en attente de paiement. Merci pour votre ponctualité.</p>
            </div>
          </div>
        )}

        {/* Explore Card */}
        <div className="card hover-scale" style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(to bottom right, var(--white), var(--gray-50))" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-4)" }}>
              <div style={{ background: "var(--primary-lightest)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                <Search size={24} style={{ color: "var(--primary)" }} />
              </div>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--gray-900)", margin: 0 }}>Trouver un Logement</h3>
            </div>
            <p style={{ color: "var(--gray-600)", fontSize: "var(--text-md)", margin: "0 0 var(--space-6) 0", lineHeight: 1.5 }}>
              Envie de déménager ou de découvrir de nouveaux biens ? Explorez notre catalogue exclusif de logements actuellement vacants.
            </p>
          </div>
          <Link href={`/locataire/${tenantId}/explorer`} className="btn btn-outline" style={{ width: "100%", justifyContent: "space-between", padding: "12px 16px", fontSize: "16px", borderRadius: "var(--radius-lg)", border: "2px solid var(--gray-200)" }}>
            Explorer les biens <ArrowRight size={18} />
          </Link>
        </div>

      </div>

      {/* Two Column Layout for Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginTop: "var(--space-4)" }}>
        
        {/* Left Column: Lease & Payments */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Mon Logement */}
          <section className="card" style={{ padding: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <Home size={20} style={{ color: "var(--primary)" }} /> Mon Logement actuel
              </h3>
            </div>
            
            {lease ? (
              <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ color: "var(--gray-500)", fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>Adresse complète</span>
                  <span style={{ fontWeight: 600, fontSize: "var(--text-md)", color: "var(--gray-900)" }}>{tenant.property_name}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ color: "var(--gray-500)", fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>Loyer de base</span>
                    <span style={{ fontWeight: 800, fontSize: "var(--text-lg)", color: "var(--primary)" }}>{formatCurrency(lease.rent_amount)}<span style={{ fontSize: "12px", color: "var(--gray-500)" }}>/mois</span></span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ color: "var(--gray-500)", fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>Fin du bail</span>
                    <span style={{ fontWeight: 600, fontSize: "var(--text-md)", color: "var(--gray-900)" }}>{formatDate(lease.end_date)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "var(--space-4)", textAlign: "center", background: "var(--gray-50)", borderRadius: "var(--radius-md)", color: "var(--gray-500)" }}>
                Aucun bail actif trouvé.
              </div>
            )}
          </section>

          {/* Payments History */}
          <section id="paiements" className="card" style={{ padding: "var(--space-5)" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, marginBottom: "var(--space-5)", display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={20} style={{ color: "var(--primary)" }} /> Historique des Paiements
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {payments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--gray-500)", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
                  Aucun historique de paiement.
                </div>
              ) : (
                payments.slice(0, 4).map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-3)", borderBottom: "1px solid var(--gray-100)" }}>
                    <div>
                      <h4 style={{ fontWeight: 700, margin: "0 0 4px 0", fontSize: "var(--text-md)", color: "var(--gray-800)" }}>{p.month} {p.year}</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--gray-500)" }}>
                        <span className={`badge ${getPaymentStatusClass(p.status)}`} style={{ padding: "2px 8px", fontSize: "10px" }}>
                          {getPaymentStatusLabel(p.status)}
                        </span>
                        {p.payment_date && <span>• {formatDate(p.payment_date)}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <span style={{ fontWeight: 800, color: "var(--orange)" }}>{formatCurrency(p.total)}</span>
                      {p.status === "paid" && (
                        <button className="btn btn-ghost" style={{ padding: "8px", color: "var(--orange)", background: "var(--orange-lightest)" }} title="Télécharger la quittance" onClick={() => alert("Génération du PDF en cours...")}>
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {payments.length > 4 && (
              <Link href={`/locataire/${tenantId}/paiements`} className="btn btn-ghost" style={{ width: "100%", marginTop: "var(--space-4)", color: "var(--primary)", fontSize: "var(--text-sm)", fontWeight: 600, display: "flex", justifyContent: "center" }}>
                Voir tout l'historique
              </Link>
            )}
          </section>
        </div>

        {/* Right Column: Incidents */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <section id="incidents" className="card" style={{ padding: "var(--space-5)", height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                <Wrench size={20} style={{ color: "var(--primary)" }} /> Mes Signalements
              </h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowIncidentModal(true)} style={{ borderRadius: "var(--radius-full)" }}>
                Signaler
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", flex: 1 }}>
              {incidents.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "var(--space-6)", color: "var(--gray-500)", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ background: "var(--white)", padding: "16px", borderRadius: "50%", marginBottom: "var(--space-3)", boxShadow: "var(--shadow-sm)" }}>
                    <AlertTriangle size={32} style={{ color: "var(--gray-300)" }} />
                  </div>
                  <h4 style={{ fontWeight: 600, color: "var(--gray-700)", margin: "0 0 4px 0" }}>Aucun problème</h4>
                  <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>Tout semble fonctionner correctement dans votre logement.</p>
                </div>
              ) : (
                incidents.map(inc => (
                  <div key={inc.id} style={{ padding: "var(--space-4)", background: "var(--gray-50)", borderRadius: "var(--radius-md)", borderLeft: `4px solid ${inc.status === 'resolved' ? 'var(--success)' : inc.status === 'in_progress' ? 'var(--warning)' : 'var(--danger)'}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
                      <h4 style={{ fontWeight: 700, margin: 0, color: "var(--gray-800)", fontSize: "var(--text-md)" }}>{inc.title}</h4>
                      <span className={`badge ${inc.status === 'open' ? 'badge-danger' : inc.status === 'in_progress' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: "10px" }}>
                        {inc.status === 'open' ? 'En attente' : inc.status === 'in_progress' ? 'En cours' : 'Résolu'}
                      </span>
                    </div>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)", margin: "0 0 10px 0", lineHeight: 1.4 }}>{inc.description}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--gray-400)", fontWeight: 600 }}>
                      <Clock size={12} /> Signalé le {formatDate(inc.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Global Style overrides for responsive columns */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Modal Incident */}
      {showIncidentModal && (
        <div 
          style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "var(--space-4)" }}
          className="animate-fade-in"
        >
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "500px", padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-4)", background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                <Wrench size={20} style={{ color: "var(--primary)" }} />
                Nouveau Signalement
              </h3>
              <button className="btn btn-ghost" onClick={() => setShowIncidentModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleReportIncident} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-5)" }}>
              <div className="form-group">
                <label className="form-label">Titre du problème</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fuite d'eau dans la salle de bain"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description détaillée</label>
                <textarea
                  required
                  placeholder="Expliquez le problème avec un maximum de détails..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  className="form-control"
                  style={{ minHeight: "120px", resize: "vertical" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Niveau d&apos;urgence</label>
                <select
                  value={incidentPriority}
                  onChange={(e) => setIncidentPriority(e.target.value as "low"|"medium"|"high"|"urgent")}
                  className="form-control"
                  style={{ appearance: "auto" }}
                >
                  <option value="low">Faible (Désagrément mineur)</option>
                  <option value="medium">Moyen (Gênant mais non bloquant)</option>
                  <option value="high">Élevé (Besoin d&apos;intervention rapide)</option>
                  <option value="urgent">Urgent (Dégât des eaux, panne totale...)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: "12px" }} onClick={() => setShowIncidentModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "12px" }}>Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
