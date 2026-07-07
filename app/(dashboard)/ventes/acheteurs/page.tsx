"use client";

import { useEffect, useState } from "react";
import { Users, Search, Plus, X, Briefcase, DollarSign, Calendar } from "lucide-react";
import { db } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function AcheteursPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add Buyer Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [startDate, setStartDate] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allSales = await db.getSales();
      setSales(allSales);

      const allProps = await db.getProperties();
      // Only vacant terrains/lots
      const availableLots = allProps.filter(p => (p.type === 'terrain' || p.type === 'lotissement') && p.status === 'vacant');
      setLots(availableLots);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update total price when property changes
  useEffect(() => {
    if (propertyId) {
      const prop = lots.find(l => l.id === propertyId);
      if (prop) {
        setTotalPrice(prop.sale_price || 0);
      }
    }
  }, [propertyId, lots]);

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !fullName || !startDate) return;

    // 1. Create Buyer
    const buyer = await db.addBuyer({
      full_name: fullName,
      email,
      phone,
      avatar_url: null
    });

    // 2. Create Sale
    const sale = await db.addSale({
      property_id: propertyId,
      buyer_id: buyer.id,
      total_price: totalPrice,
      advance_payment: advance,
      remaining_balance: totalPrice - advance,
      start_date: startDate
    });

    // 3. Create initial advance payment installment
    if (advance > 0) {
      const inst = await db.addSaleInstallment({
        sale_id: sale.id,
        amount: advance,
        due_date: startDate
      });
      await db.payInstallment(inst.id, 'cash');
    }

    // 4. Update property status to occupied
    const prop = lots.find(l => l.id === propertyId);
    if (prop) {
      await db.updateProperty({ ...prop, status: 'occupied' });
    }

    // Reset Form
    setFullName("");
    setEmail("");
    setPhone("");
    setPropertyId("");
    setTotalPrice(0);
    setAdvance(0);
    setStartDate("");
    setShowAddModal(false);

    await loadData();
    window.dispatchEvent(new Event("storage"));
  };

  const filteredSales = sales.filter((s) => {
    const searchString = search.toLowerCase();
    return (
      (s.buyer_name || "").toLowerCase().includes(searchString) ||
      (s.property_name || "").toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Ventes & Terrains</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Acheteurs & Ventes</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Ajouter une vente
        </button>
      </div>

      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ maxWidth: "400px" }}>
          <Search className="input-icon" size={16} />
          <input type="text" placeholder="Rechercher un acheteur ou un lot..." value={search} onChange={(e) => setSearch(e.target.value)} className="input" />
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: "32px", textAlign: "center" }}>Chargement...</div>
      ) : filteredSales.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-16)" }}>
          <Users size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4) auto" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Aucune vente enregistrée</h3>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {filteredSales.map((sale) => (
            <div key={sale.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--primary-lighter)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {(sale.buyer_name || "A")[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>{sale.buyer_name}</h3>
                  <p style={{ fontSize: "13px", color: "var(--gray-500)", margin: 0 }}>{sale.property_name}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--primary-dark)" }}>{formatCurrency(sale.total_price)}</div>
                <div style={{ fontSize: "12px", color: "var(--gray-500)" }}>Reste à payer: {formatCurrency(sale.remaining_balance)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px" }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", background: 'white', padding: "24px", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px", textAlign: "center" }}>Enregistrer une vente</h3>
            
            <form onSubmit={handleAddSale} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="input-group">
                <label className="input-label">Lot / Terrain</label>
                <select required value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="input" style={{ appearance: "auto" }}>
                  <option value="">Sélectionnez un lot disponible</option>
                  {lots.map(l => <option key={l.id} value={l.id}>{l.name} - {formatCurrency(l.sale_price || 0)}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Nom de l'acheteur</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
                </div>
                <div className="input-group">
                  <label className="input-label">Téléphone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Prix Total (FCFA)</label>
                <input type="number" required value={totalPrice} onChange={(e) => setTotalPrice(Number(e.target.value))} className="input" />
              </div>

              <div className="input-group">
                <label className="input-label">Avance Payée (FCFA)</label>
                <input type="number" required value={advance} onChange={(e) => setAdvance(Number(e.target.value))} className="input" />
              </div>

              <div className="input-group">
                <label className="input-label">Reste à payer : {formatCurrency(totalPrice - advance)}</label>
              </div>

              <div className="input-group">
                <label className="input-label">Date d'achat</label>
                <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Valider la vente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
