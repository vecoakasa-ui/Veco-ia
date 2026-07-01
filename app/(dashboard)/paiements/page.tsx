"use client";

import { useEffect, useState } from "react";
import { 
  DollarSign, 
  Search, 
  X, 
  CheckCircle, 
  Smartphone, 
  CreditCard,
  Copy,
  ExternalLink,
  MessageSquare,
  MoreHorizontal
} from "lucide-react";
import { db } from "@/lib/store";
import { Payment, PaymentMethod } from "@/lib/types";
import { formatCurrency, formatDate, getPaymentStatusClass, getPaymentStatusLabel } from "@/lib/utils";

export default function PaiementsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Form states
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  const loadPayments = async () => {
    try {
      const list = await db.getPayments();
      setPayments(list);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPaymentLink = (id: string) => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const url = `${origin}/pay/${id}`;
      navigator.clipboard.writeText(url)
        .then(() => alert("Lien de paiement copié dans le presse-papiers !"))
        .catch((err) => console.error("Erreur de copie :", err));
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadPayments();
    });
  }, []);

  const handleSettlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentId) return;

    const list = await db.getPayments();
    const payment = list.find(p => p.id === selectedPaymentId);
    if (payment) {
      payment.status = "paid";
      payment.payment_method = payMethod;
      payment.payment_date = payDate;
      await db.updatePayment(payment);
      
      // Reset & Reload
      setSelectedPaymentId("");
      setPayMethod("cash");
      setShowPayModal(false);
      await loadPayments();
      // Dispatch storage update
      window.dispatchEvent(new Event("storage"));
    }
  };

  const filteredPayments = payments.filter((p) => {
    const term = search.toLowerCase();
    const matchesSearch = 
      (p.tenant_name || "").toLowerCase().includes(term) ||
      (p.property_name || "").toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const unpaidPayments = payments.filter(p => p.status !== "paid");

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Suivi des loyers encaissés et factures en attente</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Suivi des Paiements</h2>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            if (unpaidPayments.length === 0) {
              alert("Tous les loyers de ce mois sont déjà réglés !");
              return;
            }
            setShowPayModal(true);
          }} 
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <CheckCircle size={16} /> Enregistrer un règlement
        </button>
      </div>

      {/* Filter and search bar */}
      <div 
        className="card" 
        style={{ 
          display: "flex", 
          flexDirection: "row", 
          gap: "var(--space-4)", 
          alignItems: "center", 
          flexWrap: "wrap", 
          padding: "var(--space-4)"
        }}
      >
        <div className="input-with-icon" style={{ flex: 1, minWidth: "240px" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher par locataire ou bien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>

        {/* Tab filters */}
        <div style={{ display: "flex", gap: "2px", background: "var(--gray-100)", padding: "4px", borderRadius: "var(--radius-lg)" }}>
          {[
            { id: "all", label: "Tous" },
            { id: "paid", label: "Payés" },
            { id: "pending", label: "En attente" },
            { id: "late", label: "En retard" },
            { id: "upcoming", label: "À venir" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`btn btn-sm ${statusFilter === tab.id ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "var(--radius-md)", fontSize: "11px", padding: "6px 12px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="card" style={{ padding: 0, overflow: "visible" }}>
        <div className="table-container" style={{ minHeight: "300px", overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "50px", textAlign: "center" }}>Photo</th>
                <th>Locataire</th>
                <th>Bien Immobilier</th>
                <th>Mois de loyer</th>
                <th>Échéance</th>
                <th>Total Dû</th>
                <th>Date règlement</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th style={{ width: "60px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "var(--space-16)" }}>
                    <div style={{ width: "24px", height: "24px", border: "3px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto var(--space-4) auto" }}></div>
                    <p style={{ color: "var(--gray-500)", fontWeight: 500, margin: 0 }}>Chargement des données...</p>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--gray-400)" }}>
                    Aucun paiement trouvé pour ce filtre.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p, index) => (
                  <tr key={p.id}>
                    <td style={{ textAlign: "center" }}>
                      {p.tenant_avatar ? (
                        <img src={p.tenant_avatar} alt={p.tenant_name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--gray-200)" }} />
                      ) : (
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--gray-100)", border: "1px dashed var(--gray-300)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "12px", color: "var(--gray-500)", fontWeight: "600" }}>
                          {p.tenant_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.tenant_name}</td>
                    <td>{p.property_name}</td>
                    <td style={{ textTransform: "capitalize", fontWeight: 500 }}>
                      {p.month} {p.year}
                    </td>
                    <td>{formatDate(p.due_date)}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(p.total)}</td>
                    <td>
                      {p.payment_date ? formatDate(p.payment_date) : (
                        <span style={{ color: "var(--gray-400)", fontStyle: "italic", fontSize: "var(--text-xs)" }}>Non réglé</span>
                      )}
                    </td>
                    <td>
                      {p.status === "paid" ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "500", textTransform: "uppercase" }}>
                          {p.payment_method === 'stripe' && <CreditCard size={12} style={{ color: "var(--primary)" }} />}
                          {p.payment_method === 'orange_money' && <Smartphone size={12} style={{ color: "var(--warning-dark)" }} />}
                          {p.payment_method === 'mtn' && <Smartphone size={12} style={{ color: "var(--info-dark)" }} />}
                          {p.payment_method === 'wave' && <Smartphone size={12} style={{ color: "#00A3E0" }} />}
                          {p.payment_method === 'paydunya' && <Smartphone size={12} style={{ color: "var(--primary)" }} />}
                          {p.payment_method === 'cash' && <DollarSign size={12} style={{ color: "var(--success-dark)" }} />}
                          {p.payment_method?.replace("_", " ")}
                        </span>
                      ) : "—"}
                    </td>
                    <td>
                      <span className={`badge ${getPaymentStatusClass(p.status)}`}>
                        {getPaymentStatusLabel(p.status)}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ padding: "8px" }} 
                          title="Options"
                          onClick={() => {
                            setActiveDropdown(activeDropdown === p.id ? null : p.id);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeDropdown === p.id && (
                          <>
                            <div 
                              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(null);
                              }}
                            />
                            <div 
                              className="card animate-scale-in"
                              style={{
                                position: "absolute",
                                right: 0,
                                top: (index === filteredPayments.length - 1 && filteredPayments.length > 1) ? "auto" : "100%",
                                bottom: (index === filteredPayments.length - 1 && filteredPayments.length > 1) ? "100%" : "auto",
                                background: 'var(--white)',
                                padding: "var(--space-2)",
                                minWidth: "160px",
                                zIndex: 9999,
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                                border: "1px solid var(--gray-200)"
                              }}
                            >
                              {p.status !== "paid" && (
                                <>
                                  <button 
                                    className="btn btn-ghost btn-sm" 
                                    style={{ width: "100%", justifyContent: "flex-start", color: "var(--gray-700)", fontWeight: "500" }}
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      copyPaymentLink(p.id);
                                    }}
                                  >
                                    <Copy size={14} style={{ marginRight: "8px", color: "var(--gray-400)" }} /> 
                                    Copier le lien
                                  </button>
                                  <a 
                                    href={`/pay/${p.id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-ghost btn-sm text-primary" 
                                    style={{ width: "100%", justifyContent: "flex-start", fontWeight: "500", color: "var(--primary)" }}
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    <ExternalLink size={14} style={{ marginRight: "8px" }} /> 
                                    Ouvrir paiement
                                  </a>
                                  <a 
                                    href="/relances" 
                                    className="btn btn-ghost btn-sm" 
                                    style={{ width: "100%", justifyContent: "flex-start", color: "var(--warning-dark)", fontWeight: "500" }}
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    <MessageSquare size={14} style={{ marginRight: "8px", color: "var(--warning)" }} /> 
                                    Relancer
                                  </a>
                                </>
                              )}
                              {p.status === "paid" && (
                                <button 
                                  className="btn btn-ghost btn-sm" 
                                  style={{ width: "100%", justifyContent: "flex-start", color: "var(--gray-500)", fontWeight: "500", cursor: "default" }}
                                >
                                  <CheckCircle size={14} style={{ marginRight: "8px", color: "var(--success)" }} /> 
                                  Déjà réglé
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================
         Settle Payment Modal
         ============================================ */}
      {showPayModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "var(--space-4)",
            backdropFilter: "blur(4px)"
          }}
          className="animate-fade-in"
        >
          <div 
            className="card animate-scale-in"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: 'var(--white)',
              padding: "var(--space-6)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800" }}>Enregistrer un encaissement</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPayModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSettlePayment} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Sélectionner la facture en attente</label>
                <select
                  required
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(e.target.value)}
                  className="input"
                  style={{ appearance: "auto" }}
                >
                  <option value="">Sélectionnez un loyer dû</option>
                  {unpaidPayments.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.tenant_name} • {p.property_name} ({p.month} {p.year}) • {p.total.toLocaleString()} FCFA
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Mode de règlement</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="input"
                  style={{ appearance: "auto" }}
                >
                  <option value="cash">Espèces (Cash)</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="mtn">MTN Mobile Money</option>
                  <option value="wave">Wave</option>
                  <option value="paydunya">PayDunya</option>
                  <option value="stripe">Carte Bancaire (Stripe)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Date du règlement</label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowPayModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Valider le règlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
