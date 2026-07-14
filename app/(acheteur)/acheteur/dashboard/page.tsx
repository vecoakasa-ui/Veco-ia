"use client";

import { useState, useEffect } from "react";
import { 
  CalendarClock, 
  Download, 
  CheckCircle2, 
  FileText,
  Home,
  Wallet,
  ArrowRight,
  Compass,
  Sparkles,
  Sun,
  MapPin,
  TrendingUp,
  PieChart
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Sale, Property, SaleInstallment } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function AcheteurDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [installments, setInstallments] = useState<SaleInstallment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyerName, setBuyerName] = useState("Acheteur");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { sales, properties, installments } = await db.getAcheteurDashboardData();
        setSales(sales);
        setProperties(properties);
        
        // Sort installments by due date
        const sortedInstallments = [...installments].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        setInstallments(sortedInstallments);
        
        const p = await db.getProfile();
        if (p && p.full_name) {
          setBuyerName(p.full_name.split(' ')[0]);
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--gray-200)", borderTopColor: "var(--orange)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <h3 style={{ color: "var(--gray-600)" }}>Chargement en cours...</h3>
      </div>
    );
  }

  // Determine the next upcoming payment
  const upcomingPayment = installments.find(inst => inst.status === "pending");
  const isLate = upcomingPayment ? new Date(upcomingPayment.due_date) < new Date() : false;

  const totalInvested = sales.reduce((sum, s) => sum + s.total_price, 0);
  const totalPaid = sales.reduce((sum, s) => sum + (s.total_price - s.remaining_balance), 0);
  const remainingBalance = sales.reduce((sum, s) => sum + s.remaining_balance, 0);
  const progressPercent = totalInvested > 0 ? Math.round((totalPaid / totalInvested) * 100) : 0;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      
      {/* Premium Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)", // Blue for buyers
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-8)",
        color: "var(--white)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
      }}>
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
        
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, margin: 0, position: "relative", zIndex: 1 }}>
          Bonjour, {buyerName} 👋
        </h1>
        <p style={{ fontSize: "var(--text-lg)", color: "rgba(255,255,255,0.9)", margin: 0, position: "relative", zIndex: 1, maxWidth: "600px" }}>
          Bienvenue sur votre espace d'acquisition. Suivez vos achats immobiliers, vos échéances et votre progression en toute simplicité.
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
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "rgba(255,255,255,0.6)", display: "block", textTransform: "uppercase", letterSpacing: "1px" }}>Prochaine Échéance</span>
                </div>
              </div>
              <span className={`badge ${isLate ? 'badge-danger' : 'badge-warning'}`} style={{ border: "none", fontWeight: 800 }}>
                {isLate ? 'En retard' : 'À venir'}
              </span>
            </div>
            
            <div>
              <h2 style={{ fontSize: "42px", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-1px" }}>{formatCurrency(upcomingPayment.amount)}</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "var(--text-sm)", margin: "0 0 var(--space-6) 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <CalendarClock size={14} /> Échéance le {formatDate(upcomingPayment.due_date)}
              </p>
              <Link href="/acheteur/echeances" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "16px", borderRadius: "var(--radius-lg)", background: "white", color: "var(--success-dark)" }}>
                Payer maintenant
              </Link>
            </div>
          </div>
        ) : (
          <div className="card hover-scale" style={{ background: "var(--success-lightest)", border: "2px solid var(--success-light)", padding: "var(--space-6)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: "var(--space-4)" }}>
            <div style={{ background: "var(--white)", borderRadius: "50%", padding: "16px", boxShadow: "var(--shadow-sm)" }}>
              <CheckCircle2 size={40} style={{ color: "var(--success)" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--success-dark)", margin: "0 0 8px 0" }}>À jour !</h3>
              <p style={{ color: "var(--gray-700)", fontSize: "var(--text-md)", margin: 0 }}>Aucune échéance n'est en attente de paiement. Félicitations pour votre assiduité.</p>
            </div>
          </div>
        )}

        {/* Global Progress Card */}
        <div className="card hover-scale" style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(to bottom right, var(--white), var(--gray-50))" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-4)" }}>
              <div style={{ background: "var(--primary-lightest)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                <PieChart size={24} style={{ color: "var(--primary)" }} />
              </div>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--gray-900)", margin: 0 }}>Progression globale</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "var(--gray-500)", fontWeight: 600 }}>Total Payé</span>
                  <span style={{ fontSize: "13px", color: "var(--gray-900)", fontWeight: 700 }}>{formatCurrency(totalPaid)}</span>
                </div>
                <div style={{ background: "var(--gray-100)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--primary)", borderRadius: "4px" }}></div>
                </div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "var(--gray-50)", borderRadius: "8px", border: "1px solid var(--gray-200)" }}>
                <div>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: 700 }}>Reste à payer</span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--danger)" }}>{formatCurrency(remainingBalance)}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: 700 }}>Valeur totale</span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--gray-900)" }}>{formatCurrency(totalInvested)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Two Column Layout for Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginTop: "var(--space-4)" }}>
        
        {/* Left Column: Acquisitions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <section className="card" style={{ padding: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <Home size={20} style={{ color: "var(--primary)" }} /> Mes Acquisitions
              </h3>
              <Link href="/acheteur/terrains" style={{ color: "var(--primary)", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                Voir tout <ArrowRight size={14} />
              </Link>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {sales.length === 0 ? (
                <div style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--gray-500)", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
                  Vous n'avez pas encore d'acquisitions.
                </div>
              ) : (
                sales.slice(0, 3).map((sale) => {
                  const prop = properties[sale.property_id];
                  const progress = sale.total_price > 0 ? Math.round(((sale.total_price - sale.remaining_balance) / sale.total_price) * 100) : 0;
                  
                  return (
                    <div key={sale.id} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "var(--space-4)", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "50px", height: "50px", borderRadius: "8px", background: "var(--white)", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {prop?.images && prop.images[0] ? (
                            <img src={prop.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <MapPin size={20} color="var(--gray-400)" />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 2px 0", fontWeight: "700", color: "var(--gray-900)", fontSize: "14px" }}>{prop?.name || 'Bien non trouvé'}</h4>
                          <span style={{ display: "inline-block", fontSize: "10px", padding: "2px 6px", borderRadius: "10px", background: sale.status === 'completed' ? "rgba(16, 185, 129, 0.1)" : "rgba(249, 115, 22, 0.1)", color: sale.status === 'completed' ? "var(--success)" : "var(--primary)", fontWeight: "700" }}>
                            {sale.status === 'completed' ? 'Soldé' : 'En cours'}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ display: "block", fontSize: "11px", color: "var(--gray-500)", fontWeight: 600 }}>Prix d'achat</span>
                          <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--gray-900)" }}>{formatCurrency(sale.total_price)}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ flex: 1, background: "var(--gray-200)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${progress}%`, height: "100%", background: "var(--success)", borderRadius: "3px" }}></div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gray-600)" }}>{progress}% payé</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Payments History */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <section className="card" style={{ padding: "var(--space-5)", height: "100%" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, marginBottom: "var(--space-5)", display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={20} style={{ color: "var(--primary)" }} /> Échéances Récentes
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {installments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--gray-500)", background: "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
                  Aucun historique de paiement.
                </div>
              ) : (
                installments.slice(0, 5).map(inst => {
                  const sale = sales.find(s => s.id === inst.sale_id);
                  const propName = sale ? properties[sale.property_id]?.name : '';
                  const isPaid = inst.status === 'paid';
                  const isPending = inst.status === 'pending';
                  const late = isPending && new Date(inst.due_date) < new Date();
                  
                  return (
                    <div key={inst.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-3)", borderBottom: "1px solid var(--gray-100)" }}>
                      <div>
                        <h4 style={{ fontWeight: 700, margin: "0 0 2px 0", fontSize: "var(--text-sm)", color: "var(--gray-800)" }}>
                          {propName || "Échéance"}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--gray-500)", fontWeight: 500 }}>
                          <span className={`badge ${isPaid ? 'badge-success' : late ? 'badge-danger' : 'badge-warning'}`} style={{ padding: "2px 6px", fontSize: "9px" }}>
                            {isPaid ? 'Payé' : late ? 'En retard' : 'En attente'}
                          </span>
                          <span>• Échéance: {formatDate(inst.due_date)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                        <span style={{ fontWeight: 800, color: "var(--gray-900)" }}>{formatCurrency(inst.amount)}</span>
                        {isPaid && (
                          <button className="btn btn-ghost" style={{ padding: "6px", color: "var(--success)", background: "var(--success-lightest)" }} title="Télécharger le reçu" onClick={() => alert("Génération du reçu en cours...")}>
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {installments.length > 5 && (
              <Link href="/acheteur/echeances" className="btn btn-ghost" style={{ width: "100%", marginTop: "var(--space-4)", color: "var(--primary)", fontSize: "var(--text-sm)", fontWeight: 600, display: "flex", justifyContent: "center" }}>
                Voir tout l'échéancier
              </Link>
            )}
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
    </div>
  );
}
