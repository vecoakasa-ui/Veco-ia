"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Plus, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  Building,
  Briefcase,
  Calendar,
  AlertCircle
} from "lucide-react";
import { db } from "@/lib/store";
import { Expense, ExpenseCategory, Payment, Property, Landlord } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type Transaction = {
  id: string;
  type: "income" | "expense";
  date: string;
  amount: number;
  description: string;
  categoryOrMethod: string;
  entityName?: string; // Property or Landlord name
};

export default function ComptabilitePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>("maintenance");
  const [propertyId, setPropertyId] = useState("");
  const [landlordId, setLandlordId] = useState("");

  const loadData = async () => {
    try {
      setExpenses(await db.getExpenses());
      setPayments(await db.getPayments());
      setProperties(await db.getProperties());
      setLandlords(await db.getLandlords());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) return;

    let propName = undefined;
    if (propertyId) {
      propName = properties.find(p => p.id === propertyId)?.name;
    }
    let landName = undefined;
    if (landlordId) {
      landName = landlords.find(l => l.id === landlordId)?.full_name;
    }

    await db.addExpense({
      amount: Number(amount),
      description,
      category,
      date,
      property_id: propertyId || undefined,
      property_name: propName,
      landlord_id: landlordId || undefined,
      landlord_name: landName
    });

    // Reset form
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split('T')[0]);
    setCategory("maintenance");
    setPropertyId("");
    setLandlordId("");
    setShowAddModal(false);

    await loadData();
    window.dispatchEvent(new Event("storage"));
  };

  // Compile unified transactions
  const validPayments = payments.filter(p => p.status === "paid" && p.payment_date);
  
  const incomeTransactions: Transaction[] = validPayments.map(p => ({
    id: `inc-${p.id}`,
    type: "income",
    date: p.payment_date || p.due_date,
    amount: p.amount,
    description: `Loyer - ${p.tenant_name || 'Locataire'}`,
    categoryOrMethod: p.payment_method,
    entityName: p.property_name
  }));

  const expenseTransactions: Transaction[] = expenses.map(e => ({
    id: `exp-${e.id}`,
    type: "expense",
    date: e.date,
    amount: e.amount,
    description: e.description,
    categoryOrMethod: e.category,
    entityName: e.property_name || e.landlord_name
  }));

  const allTransactions = [...incomeTransactions, ...expenseTransactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filteredTransactions = allTransactions.filter((t) => {
    const term = search.toLowerCase();
    return (
      t.description.toLowerCase().includes(term) ||
      (t.entityName?.toLowerCase() || "").includes(term)
    );
  });

  // KPIs
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      maintenance: "Entretien / Travaux",
      tax: "Taxes / Impôts",
      admin: "Frais administratifs",
      insurance: "Assurance",
      payout: "Reversement Propriétaire",
      other: "Autre",
      // methods
      cash: "Espèces",
      wave: "Wave",
      orange_money: "Orange Money",
      mtn: "MTN Mobile Money",
      paydunya: "PayDunya",
      stripe: "Carte Bancaire"
    };
    return map[cat] || cat;
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Suivi des entrées et sorties</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Comptabilité & Trésorerie</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Ajouter une dépense
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-5)" }}>
          <div style={{ background: "var(--success-light)", color: "var(--success)", padding: "12px", borderRadius: "var(--radius-md)" }}>
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", margin: 0 }}>Loyer Brut (Entrées)</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", margin: 0, color: "var(--gray-900)" }}>{formatCurrency(totalIncome)}</h3>
          </div>
        </div>
        
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-5)" }}>
          <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-md)" }}>
            <ArrowDownRight size={24} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", margin: 0 }}>Commissions & Dépenses</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", margin: 0, color: "var(--gray-900)" }}>{formatCurrency(totalExpenses)}</h3>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-5)", background: 'var(--white)' }}>
          <div style={{ background: "var(--warning-light)", color: "var(--warning-dark)", padding: "12px", borderRadius: "var(--radius-md)" }}>
            <Wallet size={24} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--warning-dark)", margin: 0, fontWeight: "600" }}>Solde Net (À Reverser)</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", margin: 0, color: "var(--gray-900)" }}>{formatCurrency(netBalance)}</h3>
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ width: "100%" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher une transaction par description ou entité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Catégorie / Méthode</th>
                <th>Bien / Propriétaire lié</th>
                <th style={{ textAlign: "right" }}>Montant</th>
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
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--gray-400)" }}>
                    Aucune transaction financière trouvée.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>
                        <Calendar size={14} style={{ color: "var(--gray-400)" }} />
                        {formatDate(t.date)}
                      </div>
                    </td>
                    <td>
                      {t.type === "income" ? (
                        <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <ArrowUpRight size={12} /> Entrée
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <ArrowDownRight size={12} /> Sortie
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--gray-800)" }}>
                      {t.description}
                    </td>
                    <td>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", textTransform: "capitalize" }}>
                        {getCategoryLabel(t.categoryOrMethod)}
                      </span>
                    </td>
                    <td>
                      {t.entityName ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--gray-700)" }}>
                          {t.categoryOrMethod === 'payout' ? <Briefcase size={12} style={{ color: "var(--gray-400)" }}/> : <Building size={12} style={{ color: "var(--gray-400)" }} />}
                          {t.entityName}
                        </span>
                      ) : (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-400)" }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: t.type === "income" ? "var(--success)" : "var(--gray-900)" }}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================
         Add Expense Modal
         ============================================ */}
      {showAddModal && (
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
              maxWidth: "500px",
              background: 'var(--white)',
              padding: "var(--space-6)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                <ArrowDownRight size={20} style={{ color: "var(--danger)" }} />
                Ajouter une dépense (Sortie)
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Montant (FCFA)</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Ex: 15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Réparation plomberie..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div className="input-group">
                  <label className="input-label">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="input"
                    style={{ appearance: "auto" }}
                  >
                    <option value="maintenance">Entretien / Travaux</option>
                    <option value="tax">Taxes / Impôts</option>
                    <option value="admin">Frais administratifs</option>
                    <option value="insurance">Assurance</option>
                    <option value="payout">Reversement Propriétaire</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ padding: "var(--space-3)", background: "var(--gray-50)", borderRadius: "var(--radius-md)", border: "1px dashed var(--gray-300)" }}>
                <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--gray-600)", marginBottom: "var(--space-2)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <AlertCircle size={12} /> Liaison optionnelle (Sélectionnez-en un)
                </p>
                
                <div className="input-group" style={{ marginBottom: "var(--space-2)" }}>
                  <label className="input-label" style={{ fontSize: "11px" }}>Lier à un Bien Immobilier</label>
                  <select
                    value={propertyId}
                    onChange={(e) => {
                      setPropertyId(e.target.value);
                      if (e.target.value) setLandlordId(""); // reset the other
                    }}
                    className="input"
                    style={{ appearance: "auto", padding: "6px 12px", fontSize: "12px" }}
                  >
                    <option value="">-- Aucun --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ fontSize: "11px" }}>Ou lier à un Propriétaire Bailleur</label>
                  <select
                    value={landlordId}
                    onChange={(e) => {
                      setLandlordId(e.target.value);
                      if (e.target.value) setPropertyId(""); // reset the other
                    }}
                    className="input"
                    style={{ appearance: "auto", padding: "6px 12px", fontSize: "12px" }}
                  >
                    <option value="">-- Aucun --</option>
                    {landlords.map(l => (
                      <option key={l.id} value={l.id}>{l.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Enregistrer la sortie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
