"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { SubscriptionRecord } from "@/lib/types";
import { Crown, AlertTriangle, CheckCircle, Search, ShieldAlert, CreditCard, Ban, MailWarning, X, Activity } from "lucide-react";

export default function AbonnementsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'active' | 'late' | 'suspended' | 'all'>('all');

  // Modals state
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'warn' | 'suspend' | null; sub: SubscriptionRecord | null }>({
    isOpen: false,
    type: null,
    sub: null,
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await db.getAllSubscriptions();
        setSubscriptions(data);
      } catch (err) {
        console.error("Error loading subscriptions", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAction = (sub: SubscriptionRecord, type: 'warn' | 'suspend') => {
    setActionModal({ isOpen: true, type, sub });
  };

  const confirmAction = () => {
    // Dans une vraie app, ça appellerait l'API
    if (actionModal.sub) {
      alert(`Action ${actionModal.type === 'warn' ? 'Rappel envoyé' : 'Accès suspendu'} pour ${actionModal.sub.profile?.full_name}`);
      
      // Update local state for visual feedback
      if (actionModal.type === 'suspend') {
        setSubscriptions(subscriptions.map(s => s.id === actionModal.sub?.id ? { ...s, status: 'suspended' } : s));
      }
    }
    setActionModal({ isOpen: false, type: null, sub: null });
  };

  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.profile?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sub.profile?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalMRR = subscriptions.filter(s => s.status !== 'suspended').reduce((acc, sub) => acc + sub.amount, 0);
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const lateCount = subscriptions.filter(s => s.status === 'late').length;
  const suspendedCount = subscriptions.filter(s => s.status === 'suspended').length;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--primary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 4px 0" }}>
            Gestion SaaS
          </p>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
            <Crown size={28} className="text-primary" /> Abonnements & Accès
          </h2>
          <p style={{ color: "var(--gray-500)", marginTop: "8px", fontSize: "15px" }}>Gérez les souscriptions, relancez les impayés et suspendez les comptes en retard.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
        <div className="kpi-card" onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')} style={{ cursor: "pointer", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", outline: statusFilter === 'active' ? '3px solid #10b981' : 'none', outlineOffset: '2px' }}>
          <div className="kpi-icon"><Activity size={20} /></div>
          <div>
            <p className="kpi-label">Abonnements Actifs</p>
            <h3 className="kpi-value">{activeCount}</h3>
          </div>
        </div>
        
        <div className="kpi-card" onClick={() => setStatusFilter('all')} style={{ cursor: "pointer", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", outline: statusFilter === 'all' ? '3px solid #3b82f6' : 'none', outlineOffset: '2px' }}>
          <div className="kpi-icon"><CreditCard size={20} /></div>
          <div>
            <p className="kpi-label">Revenu Mensuel (MRR)</p>
            <h3 className="kpi-value">{totalMRR.toLocaleString()} FCFA</h3>
          </div>
        </div>

        <div className="kpi-card" onClick={() => setStatusFilter(statusFilter === 'late' ? 'all' : 'late')} style={{ cursor: "pointer", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white", outline: statusFilter === 'late' ? '3px solid #f59e0b' : 'none', outlineOffset: '2px' }}>
          <div className="kpi-icon"><AlertTriangle size={20} /></div>
          <div>
            <p className="kpi-label">Paiements en Retard</p>
            <h3 className="kpi-value">{lateCount}</h3>
          </div>
        </div>

        <div className="kpi-card" onClick={() => setStatusFilter(statusFilter === 'suspended' ? 'all' : 'suspended')} style={{ cursor: "pointer", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "white", outline: statusFilter === 'suspended' ? '3px solid #ef4444' : 'none', outlineOffset: '2px' }}>
          <div className="kpi-icon"><Ban size={20} /></div>
          <div>
            <p className="kpi-label">Comptes Suspendus</p>
            <h3 className="kpi-value">{suspendedCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Liste des Abonnés</h3>
          <div className="search-bar" style={{ position: "relative", width: "300px" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", transition: "all 0.2s" }}
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>Chargement des données...</div>
        ) : (
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 250px)" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Plan SaaS</th>
                  <th>Montant Mensuel</th>
                  <th>Prochaine Facturation</th>
                  <th>Statut</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Aucun abonnement trouvé.</td>
                  </tr>
                ) : (
                  filteredSubs.map((sub) => (
                    <tr key={sub.id} className="table-row-hover">
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div className="avatar-placeholder" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-600)", fontWeight: "700" }}>
                            {sub.profile?.full_name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: "600", color: "#1e293b" }}>{sub.profile?.full_name}</p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{sub.profile?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`plan-badge plan-${sub.plan}`}>
                          {sub.plan.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600", color: "#334155" }}>
                        {sub.amount.toLocaleString()} FCFA
                      </td>
                      <td style={{ color: "#64748b", fontSize: "14px" }}>
                        {new Date(sub.next_billing_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "100px", fontSize: "13px", fontWeight: "600",
                          ...(sub.status === 'active' ? { background: "#dcfce7", color: "#166534" } :
                              sub.status === 'late' ? { background: "#fef3c7", color: "#92400e" } :
                              { background: "#fee2e2", color: "#991b1b" })
                        }}>
                          {sub.status === 'active' && <CheckCircle size={14} />}
                          {sub.status === 'late' && <AlertTriangle size={14} />}
                          {sub.status === 'suspended' && <Ban size={14} />}
                          {sub.status === 'active' ? "Actif" : sub.status === 'late' ? "En Retard" : "Suspendu"}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          {sub.status !== 'suspended' && (
                            <button 
                              onClick={() => handleAction(sub, 'warn')}
                              className="action-btn warn-btn" 
                              title="Envoyer un rappel de paiement"
                            >
                              <MailWarning size={16} /> Rappel
                            </button>
                          )}
                          {sub.status !== 'suspended' ? (
                            <button 
                              onClick={() => handleAction(sub, 'suspend')}
                              className="action-btn suspend-btn"
                              title="Couper l'accès à la plateforme"
                            >
                              <ShieldAlert size={16} /> Suspendre
                            </button>
                          ) : (
                            <button 
                              className="action-btn restore-btn"
                              title="Restaurer l'accès"
                              onClick={() => {
                                // Simulate restore
                                setSubscriptions(subscriptions.map(s => s.id === sub.id ? { ...s, status: 'active' } : s));
                                alert(`Accès restauré pour ${sub.profile?.full_name}`);
                              }}
                            >
                              <CheckCircle size={16} /> Restaurer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && actionModal.sub && (
        <div className="modal-overlay" onClick={() => setActionModal({ isOpen: false, type: null, sub: null })}>
          <div className="modal-content glass-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header ${actionModal.type === 'suspend' ? 'bg-danger-light' : 'bg-warning-light'}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {actionModal.type === 'suspend' ? 
                  <ShieldAlert size={24} className="text-danger" /> : 
                  <MailWarning size={24} className="text-warning" />
                }
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
                  {actionModal.type === 'suspend' ? "Suspension de compte" : "Rappel de paiement"}
                </h3>
              </div>
              <button className="close-btn" onClick={() => setActionModal({ isOpen: false, type: null, sub: null })}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: "24px" }}>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.6" }}>
                {actionModal.type === 'suspend' ? (
                  <>Voulez-vous vraiment suspendre l'accès de <strong>{actionModal.sub.profile?.full_name}</strong> ? Cette action l'empêchera de se connecter à la plateforme jusqu'à la régularisation de sa situation.</>
                ) : (
                  <>Un email de rappel sera envoyé à <strong>{actionModal.sub.profile?.email}</strong> pour l'informer de son retard de paiement de {actionModal.sub.amount.toLocaleString()} FCFA.</>
                )}
              </p>
              
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button className="btn-secondary" onClick={() => setActionModal({ isOpen: false, type: null, sub: null })}>Annuler</button>
                <button 
                  className={`btn-primary ${actionModal.type === 'suspend' ? 'btn-danger' : 'btn-warning'}`}
                  onClick={confirmAction}
                >
                  {actionModal.type === 'suspend' ? "Confirmer la suspension" : "Envoyer le rappel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .kpi-card {
          padding: 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .kpi-icon {
          background: rgba(255, 255, 255, 0.2);
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kpi-label {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.9;
        }
        .kpi-value {
          margin: 4px 0 0 0;
          font-size: 24px;
          font-weight: 800;
        }
        
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-table th {
          text-align: left;
          padding: 16px 24px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .admin-table td {
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }
        .table-row-hover:hover {
          background: #f8fafc;
        }
        
        .plan-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .plan-free { background: #f1f5f9; color: #475569; }
        .plan-pro { background: #e0e7ff; color: #4f46e5; }
        .plan-business { background: #fae8ff; color: #c026d3; }
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
          background: transparent;
        }
        .warn-btn {
          color: #d97706;
          background: #fffbeb;
        }
        .warn-btn:hover {
          background: #fef3c7;
          border-color: #fde68a;
        }
        .suspend-btn {
          color: #dc2626;
          background: #fef2f2;
        }
        .suspend-btn:hover {
          background: #fee2e2;
          border-color: #fca5a5;
        }
        .restore-btn {
          color: #16a34a;
          background: #f0fdf4;
        }
        .restore-btn:hover {
          background: #dcfce7;
          border-color: #bbf7d0;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        
        .glass-modal {
          background: #ffffff;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .modal-header {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .bg-danger-light { background: #fef2f2; }
        .bg-warning-light { background: #fffbeb; }
        .text-danger { color: #ef4444; }
        .text-warning { color: #f59e0b; }
        
        .close-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .close-btn:hover {
          background: rgba(0,0,0,0.05);
          color: #0f172a;
        }
        
        .btn-secondary {
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          background: #f1f5f9;
          color: #475569;
          border: none;
          cursor: pointer;
        }
        .btn-secondary:hover { background: #e2e8f0; }
        
        .btn-primary {
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          color: white;
          border: none;
          cursor: pointer;
        }
        .btn-danger { background: #ef4444; }
        .btn-danger:hover { background: #dc2626; }
        .btn-warning { background: #f59e0b; }
        .btn-warning:hover { background: #d97706; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
