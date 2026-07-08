"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { Payment, Expense } from "@/lib/types";
import { 
  Search, 
  Eye,
  CheckCircle,
  X,
  TrendingDown,
  TrendingUp,
  User,
  AlertCircle
} from "lucide-react";
import AlertModal from "@/components/AlertModal";

type TabType = "payments" | "expenses";
type ModalType = "Détails" | "Changer Statut" | "Annuler Paiement" | null;

export default function AdminFinancesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("payments");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, message: string, type: "error"|"success"|"info"}>({isOpen: false, title: "", message: "", type: "info"});

  useEffect(() => {
    async function fetchData() {
      try {
        const pays = await db.getPayments();
        const exps = await db.getExpenses();
        
        setPayments(pays);
        setExpenses(exps);
        setFilteredPayments(pays);
        setFilteredExpenses(exps);
      } catch (error) {
        console.error("Erreur lors du chargement des données financières", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle Search
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();

    if (activeTab === "payments") {
      if (!searchTerm.trim()) {
        setFilteredPayments(payments);
      } else {
        setFilteredPayments(payments.filter(p => 
          (p.tenant_name && p.tenant_name.toLowerCase().includes(lowercasedTerm)) ||
          (p.property_name && p.property_name.toLowerCase().includes(lowercasedTerm))
        ));
      }
    } else {
      if (!searchTerm.trim()) {
        setFilteredExpenses(expenses);
      } else {
        setFilteredExpenses(expenses.filter(e => 
          (e.description && e.description.toLowerCase().includes(lowercasedTerm)) ||
          (e.category && e.category.toLowerCase().includes(lowercasedTerm))
        ));
      }
    }
  }, [searchTerm, payments, expenses, activeTab]);

  const openPaymentModal = (type: ModalType, payment: Payment) => {
    setSelectedPayment(payment);
    setSelectedExpense(null);
    setModalType(type);
  };

  const openExpenseModal = (type: ModalType, expense: Expense) => {
    setSelectedExpense(expense);
    setSelectedPayment(null);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPayment(null);
    setSelectedExpense(null);
    setIsSubmitting(false);
  };

  const handleModalSubmit = async () => {
    if (!selectedPayment) return;
    setIsSubmitting(true);

    try {
      if (modalType === "Changer Statut" || modalType === "Annuler Paiement") {
        const newStatus = modalType === "Changer Statut" ? "paid" : "pending";
        const updatedPayment = { ...selectedPayment, status: newStatus as "paid" | "pending" | "late" };
        await db.updatePayment(updatedPayment);

        const updatedList = payments.map(p => p.id === updatedPayment.id ? updatedPayment : p);
        setPayments(updatedList);
        setFilteredPayments(updatedList);
      }
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      setAlertModal({ isOpen: true, title: "Erreur", message: "Une erreur est survenue.", type: "error" });
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return <span className="badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>Payé</span>;
      case 'pending':
        return <span className="badge" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>En attente</span>;
      case 'late':
        return <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>En retard</span>;
      default:
        return <span className="badge" style={{ background: "rgba(148, 163, 184, 0.1)", color: "#64748b" }}>{status}</span>;
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
  };

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.total, 0);
  const pendingRevenue = payments.filter(p => p.status === 'pending' || p.status === 'late').reduce((sum, p) => sum + p.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <div className="animate-fade-in" style={{ padding: "var(--space-6)" }}>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Supervision Globale</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Gestion Financière</h2>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingUp size={24} color="#10b981" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)" }}>Revenus Effectifs</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{formatMoney(totalRevenue)}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertCircle size={24} color="#f59e0b" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)" }}>Loyers en attente / retard</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{formatMoney(pendingRevenue)}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingDown size={24} color="#ef4444" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--gray-500)" }}>Total des dépenses</p>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{formatMoney(totalExpenses)}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button 
          onClick={() => setActiveTab("payments")}
          style={{ 
            padding: "10px 20px", 
            borderRadius: "8px", 
            fontWeight: 600, 
            cursor: "pointer", 
            border: "none",
            background: activeTab === "payments" ? "#1e293b" : "#f1f5f9",
            color: activeTab === "payments" ? "#fff" : "#475569",
            transition: "0.2s"
          }}
        >
          Paiements (Loyers)
        </button>
        <button 
          onClick={() => setActiveTab("expenses")}
          style={{ 
            padding: "10px 20px", 
            borderRadius: "8px", 
            fontWeight: 600, 
            cursor: "pointer", 
            border: "none",
            background: activeTab === "expenses" ? "#1e293b" : "#f1f5f9",
            color: activeTab === "expenses" ? "#fff" : "#475569",
            transition: "0.2s"
          }}
        >
          Dépenses
        </button>
      </div>

      {/* Barre de Recherche */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input 
            type="text" 
            placeholder={activeTab === "payments" ? "Rechercher un locataire ou un bien..." : "Rechercher une dépense..."} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "10px 10px 10px 40px", 
              borderRadius: "8px", 
              border: "1px solid #e2e8f0",
              outline: "none",
              fontSize: "14px"
            }}
          />
        </div>
        <div style={{ color: "var(--gray-500)", fontSize: "14px", fontWeight: "600" }}>
          {activeTab === "payments" ? `${filteredPayments.length} paiement(s)` : `${filteredExpenses.length} dépense(s)`}
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="card" style={{ overflow: "hidden", background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 250px)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              {activeTab === "payments" ? (
                <tr>
                  <th style={thStyle}>Date & Mois</th>
                  <th style={thStyle}>Locataire</th>
                  <th style={thStyle}>Bien Immobilier</th>
                  <th style={thStyle}>Montant</th>
                  <th style={thStyle}>Moyen</th>
                  <th style={thStyle}>Statut</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              ) : (
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Catégorie</th>
                  <th style={thStyle}>Bien (Optionnel)</th>
                  <th style={thStyle}>Montant</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                    Chargement des données...
                  </td>
                </tr>
              ) : activeTab === "payments" ? (
                filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                      Aucun paiement trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, idx) => (
                    <tr key={payment.id || idx} className="table-row">
                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 600, color: "var(--gray-900)" }}>{payment.month} {payment.year}</span>
                          <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>{payment.payment_date || "Non payé"}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-lightest)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px" }}>
                            {payment.tenant_name ? payment.tenant_name.substring(0, 2).toUpperCase() : <User size={14} />}
                          </div>
                          <span style={{ fontWeight: 500 }}>{payment.tenant_name || "Inconnu"}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: "#475569" }}>{payment.property_name || "Inconnu"}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{formatMoney(payment.total)}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ textTransform: "capitalize", fontSize: "13px", color: "#64748b" }}>{payment.payment_method}</span>
                      </td>
                      <td style={tdStyle}>{getStatusBadge(payment.status)}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button className="action-btn" title="Voir les détails" onClick={() => openPaymentModal("Détails", payment)}>
                            <Eye size={16} />
                          </button>
                          {payment.status === 'pending' && (
                            <button className="action-btn action-btn-success" title="Marquer comme payé" onClick={() => openPaymentModal("Changer Statut", payment)}>
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {payment.status === 'paid' && (
                            <button className="action-btn" title="Annuler la confirmation" onClick={() => openPaymentModal("Annuler Paiement", payment)}>
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--gray-500)" }}>
                      Aucune dépense trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense, idx) => (
                    <tr key={expense.id || idx} className="table-row">
                      <td style={tdStyle}>
                        <span style={{ color: "#64748b" }}>{expense.date}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 500, color: "#334155" }}>{expense.description}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ textTransform: "capitalize", fontSize: "13px", color: "#64748b" }}>{expense.category}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: "#475569" }}>{expense.property_name || "-"}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: "#ef4444" }}>- {formatMoney(expense.amount)}</span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button className="action-btn" title="Voir les détails" onClick={() => openExpenseModal("Détails", expense)}>
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Modal / Popup pour les actions */}
      {modalType && (selectedPayment || selectedExpense) && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            
            <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "18px" }}>
              {modalType === "Détails" ? (selectedPayment ? "Détails du Paiement" : "Détails de la Dépense") : modalType === "Changer Statut" ? "Confirmation de Statut" : "Annulation de Paiement"}
            </h3>

            {modalType === "Détails" && selectedPayment && (
              <div className="stats-grid">
                <div className="stat-box">
                  <span>Locataire</span>
                  <strong>{selectedPayment.tenant_name || "Inconnu"}</strong>
                </div>
                <div className="stat-box">
                  <span>Bien Immobilier</span>
                  <strong>{selectedPayment.property_name || "Inconnu"}</strong>
                </div>
                <div className="stat-box">
                  <span>Montant Total</span>
                  <strong>{formatMoney(selectedPayment.total)}</strong>
                </div>
                <div className="stat-box">
                  <span>Mois / Année</span>
                  <strong>{selectedPayment.month} {selectedPayment.year}</strong>
                </div>
                <div className="stat-box">
                  <span>Date limite</span>
                  <strong>{selectedPayment.due_date}</strong>
                </div>
                <div className="stat-box">
                  <span>Date de paiement</span>
                  <strong>{selectedPayment.payment_date || "En attente"}</strong>
                </div>
                <div className="stat-box">
                  <span>Mode de paiement</span>
                  <strong style={{ textTransform: "capitalize" }}>{selectedPayment.payment_method}</strong>
                </div>
                <div className="stat-box">
                  <span>Statut</span>
                  <div>{getStatusBadge(selectedPayment.status)}</div>
                </div>
              </div>
            )}

            {modalType === "Détails" && selectedExpense && (
              <div className="stats-grid">
                <div className="stat-box" style={{ gridColumn: 'span 2' }}>
                  <span>Description</span>
                  <strong>{selectedExpense.description}</strong>
                </div>
                <div className="stat-box">
                  <span>Catégorie</span>
                  <strong style={{ textTransform: "capitalize" }}>{selectedExpense.category}</strong>
                </div>
                <div className="stat-box">
                  <span>Montant</span>
                  <strong style={{ color: "#ef4444" }}>{formatMoney(selectedExpense.amount)}</strong>
                </div>
                <div className="stat-box">
                  <span>Date</span>
                  <strong>{selectedExpense.date}</strong>
                </div>
                <div className="stat-box">
                  <span>Bien associé</span>
                  <strong>{selectedExpense.property_name || "Aucun"}</strong>
                </div>
              </div>
            )}

            {modalType === "Changer Statut" && selectedPayment && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle size={48} color="#10b981" style={{ marginBottom: "16px" }} />
                <p style={{ margin: 0, color: "#334155" }}>
                  Confirmez-vous la réception du paiement de <strong>{formatMoney(selectedPayment.total)}</strong> par <strong>{selectedPayment.tenant_name}</strong> ?
                </p>
              </div>
            )}

            {modalType === "Annuler Paiement" && selectedPayment && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <X size={48} color="#ef4444" style={{ marginBottom: "16px" }} />
                <p style={{ margin: 0, color: "#334155" }}>
                  Voulez-vous vraiment retirer ou annuler la confirmation de ce paiement de <strong>{formatMoney(selectedPayment.total)}</strong> ? Il repassera en attente.
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={closeModal} disabled={isSubmitting}>
                Fermer
              </button>
              {(modalType === "Changer Statut" || modalType === "Annuler Paiement") && (
                <button 
                  className={`btn-primary ${modalType === "Annuler Paiement" ? "btn-danger" : ""}`} 
                  onClick={handleModalSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "En cours..." : modalType === "Changer Statut" ? "Confirmer le paiement" : "Retirer le paiement"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row {
          transition: background 0.2s;
        }
        .table-row:hover {
          background: #f8fafc;
        }
        
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .action-btn-success:hover {
          background: #d1fae5;
          color: #10b981;
          border-color: #6ee7b7;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: #fff;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          padding: 24px;
          position: relative;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }

        .modal-close {
          position: absolute;
          top: 16px; right: 16px;
          background: transparent; border: none;
          color: #94a3b8; cursor: pointer;
          transition: 0.2s;
        }
        .modal-close:hover { color: #0f172a; }

        .btn-secondary {
          padding: 10px 16px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #475569;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-secondary:hover { background: #e2e8f0; }

        .btn-primary {
          padding: 10px 16px;
          border-radius: 8px;
          background: #10b981;
          color: #fff;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary:hover { background: #059669; }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .stat-box {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .stat-box span {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
        }
        .stat-box strong {
          font-size: 16px;
          color: #0f172a;
        }
      `}</style>
      
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type as any}
        onClose={() => setAlertModal(prev => ({...prev, isOpen: false}))}
      />
    </>
  );
}

// Inline styles pour le tableau
const thStyle = {
  textAlign: "left" as const,
  padding: "16px 20px",
  background: "#f8fafc",
  color: "#475569",
  fontWeight: 600,
  fontSize: "13px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  borderBottom: "1px solid #e2e8f0",
  position: "sticky" as const,
  top: 0,
  zIndex: 10,
};

const tdStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "14px",
  color: "#334155",
};
