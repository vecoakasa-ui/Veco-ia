"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Banknote, Clock, CheckCircle, Receipt, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ResidentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [unit, setUnit] = useState<any>(null);
  const [syndicCharges, setSyndicCharges] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const loadResidentData = async () => {
      setIsLoading(true);
      try {
        // DEMO: On récupère le premier locataire actif pour la démonstration
        // Dans le futur, on récupèrera le locataire via son compte Supabase Auth
        const { data: tData } = await supabase.from('tenants').select('*').eq('status', 'active').limit(1).single();
        
        if (tData) {
          setTenant(tData);
          
          // Get unit
          const { data: uData } = await supabase.from('properties').select('*').eq('id', tData.property_id).single();
          if (uData) setUnit(uData);

          // Get Syndic Charges (Apportionments)
          const { data: cData } = await supabase.from('syndic_apportionments')
            .select('*, charge:syndic_charges(*)')
            .eq('tenant_id', tData.id)
            .order('created_at', { ascending: false });
          if (cData) setSyndicCharges(cData);

          // Get Tickets
          const { data: tkData } = await supabase.from('tickets')
            .select('*')
            .eq('tenant_id', tData.id)
            .order('created_at', { ascending: false });
          if (tkData) setTickets(tkData);
        }
      } catch (error) {
        console.error("Error loading resident data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResidentData();
  }, []);

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Chargement de votre espace...</div>;
  }

  if (!tenant) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "var(--space-8)" }}>
        <p>Aucun profil locataire trouvé pour le moment.</p>
      </div>
    );
  }

  const unpaidCharges = syndicCharges.filter(c => c.status === 'pending');
  const totalUnpaidCharges = unpaidCharges.reduce((sum, current) => sum + current.amount_due, 0);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Welcome Section */}
      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: "0 0 4px 0" }}>
          Bonjour, {tenant.full_name.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: "14px", color: "var(--gray-500)", margin: 0 }}>
          {unit?.name} &bull; Loyer : {formatCurrency(tenant.rent_amount)}/mois
        </p>
      </div>

      {/* Loyer Actuel (Fake Next Payment for Demo) */}
      <div className="card" style={{ padding: "0", overflow: "hidden", background: "linear-gradient(135deg, var(--primary-dark), var(--primary))", color: "white" }}>
        <div style={{ padding: "var(--space-5)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8, margin: "0 0 8px 0" }}>Prochain loyer</p>
            <h2 style={{ fontSize: "32px", fontWeight: "800", margin: 0 }}>{formatCurrency(tenant.rent_amount)}</h2>
            <p style={{ fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>Avant le 5 du mois prochain</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Banknote size={24} color="white" />
          </div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.1)", padding: "12px var(--space-5)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px" }}>Paiement Mobile Money</span>
          <button className="btn btn-sm" style={{ background: "white", color: "var(--primary-dark)" }}>
            Payer maintenant
          </button>
        </div>
      </div>

      {/* Charges Syndic */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h3 style={{ fontSize: "var(--text-md)", fontWeight: "700", margin: 0 }}>Mes Charges (Syndic)</h3>
          {unpaidCharges.length > 0 && (
            <span className="badge badge-warning">{unpaidCharges.length} à payer</span>
          )}
        </div>
        
        {syndicCharges.length === 0 ? (
          <div className="card" style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--gray-500)", fontSize: "13px" }}>
            Aucune charge syndic enregistrée.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {syndicCharges.map((app) => (
              <div key={app.id} className="card" style={{ padding: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {app.status === 'paid' ? (
                    <CheckCircle size={24} style={{ color: "var(--success)" }} />
                  ) : (
                    <Clock size={24} style={{ color: "var(--warning)" }} />
                  )}
                  <div>
                    <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "600" }}>{app.charge?.title}</h4>
                    <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>Échéance : {new Date(app.charge?.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: app.status === 'paid' ? "var(--success)" : "var(--gray-900)" }}>
                    {formatCurrency(app.amount_due)}
                  </div>
                  {app.status === 'pending' && (
                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--primary)", padding: 0, marginTop: "4px", fontSize: "12px" }}>
                      Payer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raccourcis Tickets */}
      <div style={{ marginTop: "var(--space-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h3 style={{ fontSize: "var(--text-md)", fontWeight: "700", margin: 0 }}>Assistance technique</h3>
        </div>
        
        <Link href="/resident/tickets/new" className="card card-interactive" style={{ padding: "var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "inherit", background: "var(--warning-lightest)", borderColor: "var(--warning)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "white", padding: "8px", borderRadius: "50%" }}>
              <AlertTriangle size={20} style={{ color: "var(--warning)" }} />
            </div>
            <div>
              <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "700" }}>Signaler une panne</h4>
              <span style={{ fontSize: "12px", color: "var(--gray-600)" }}>Plomberie, électricité, etc.</span>
            </div>
          </div>
          <ArrowRight size={20} style={{ color: "var(--warning)" }} />
        </Link>

        {tickets.length > 0 && (
          <div style={{ marginTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase", margin: 0 }}>Mes signalements</p>
            {tickets.slice(0, 3).map(ticket => (
              <div key={ticket.id} className="card" style={{ padding: "12px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong>{ticket.title}</strong>
                  <span className={`badge ${ticket.status === 'resolved' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: "10px" }}>
                    {ticket.status === 'resolved' ? 'Résolu' : ticket.status === 'in_progress' ? 'En cours' : 'Ouvert'}
                  </span>
                </div>
                <div style={{ color: "var(--gray-500)", fontSize: "11px" }}>{new Date(ticket.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
