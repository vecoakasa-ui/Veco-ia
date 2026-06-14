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
  ExternalLink
} from "lucide-react";
import { db } from "@/lib/store";
import { Payment, PaymentMethod } from "@/lib/types";
import { formatCurrency, formatDate, getPaymentStatusClass, getPaymentStatusLabel } from "@/lib/utils";

export default function PaiementsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showPayModal, setShowPayModal] = useState(false);

  // Form states
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  const loadPayments = () => {
    setPayments(db.getPayments());
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

  const handleSettlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentId) return;

    const list = db.getPayments();
    const payment = list.find(p => p.id === selectedPaymentId);
    if (payment) {
      payment.status = "paid";
      payment.payment_method = payMethod;
      payment.payment_date = payDate;
      db.updatePayment(payment);
      
      // Reset & Reload
      setSelectedPaymentId("");
      setPayMethod("cash");
      setShowPayModal(false);
      loadPayments();
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
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
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Locataire</th>
                <th>Bien Immobilier</th>
                <th>Mois de loyer</th>
                <th>Échéance</th>
                <th>Total Dû</th>
                <th>Date règlement</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--gray-400)" }}>
                    Aucun paiement trouvé pour ce filtre.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id}>
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
                    <td>
                      {p.status !== "paid" ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button 
                            type="button"
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: "4px 8px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                            onClick={() => copyPaymentLink(p.id)}
                            title="Copier le lien de paiement"
                          >
                            <Copy size={12} /> Lien
                          </button>
                          <a 
                            href={`/pay/${p.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm text-primary" 
                            style={{ padding: "4px 8px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", color: "var(--primary)" }}
                            title="Ouvrir la page de paiement"
                          >
                            <ExternalLink size={12} /> Payer
                          </a>
                        </div>
                      ) : (
                        <span style={{ color: "var(--success)", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle size={12} /> Réglé
                        </span>
                      )}
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
              background: "white",
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
