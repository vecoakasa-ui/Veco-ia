"use client";

import { useEffect, useState } from "react";
import { Users, Search, Plus, X, Briefcase, DollarSign, Calendar, MapPin, User, Mail, Phone, Home, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { db } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import MapModuleWrapper from "@/components/MapModuleWrapper";

export default function AcheteursPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add Buyer Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [startDate, setStartDate] = useState("");

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    // setTimeout(() => setToast(null), 5000); // Désactivé pour qu'il puisse lire l'erreur
  };

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

    try {
      // 1. Create Buyer
      const buyer = await db.addBuyer({
        full_name: fullName,
        email,
        phone,
        id_card_number: idCardNumber,
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
      setIdCardNumber("");
      setPropertyId("");
      setTotalPrice(0);
      setAdvance(0);
      setStartDate("");
      setShowAddModal(false);

      await loadData();
      window.dispatchEvent(new Event("storage"));
      showToast("La vente a été enregistrée avec succès !", "success");
    } catch (error: any) {
      console.error("Error creating sale:", error);
      alert("ERREUR SUPABASE: " + (error.message || JSON.stringify(error)));
      showToast(error.message || "Une erreur est survenue lors de l'enregistrement de la vente.", "error");
    }
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
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          background: toast.type === 'error' ? "#fee2e2" : "#dcfce7",
          color: toast.type === 'error' ? "#991b1b" : "#166534",
          padding: "24px 32px", borderRadius: "12px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          display: "flex", alignItems: "center", gap: "16px",
          fontWeight: "600", fontSize: "16px", animation: "slideIn 0.3s ease-out",
          maxWidth: "400px", wordWrap: "break-word"
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {toast.message}
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", marginLeft: "8px" }}>
            <X size={16} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 100, padding: "16px", backdropFilter: "blur(4px)", overflowY: "auto" }}>
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "850px", background: 'white', padding: "0", marginTop: "40px", marginBottom: "40px", maxHeight: "calc(100vh - 80px)", overflowY: "auto" }}>
            
            <div style={{ position: "sticky", top: 0, background: "white", zIndex: 10, padding: "24px 24px 20px 24px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "8px", lineHeight: "1.5" }}>
                <Briefcase size={20} style={{ color: "var(--primary)" }} /> Enregistrer une vente
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSale} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", padding: "24px" }}>
              
              {/* Left Column: Property */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Le Bien (Terrain / Lot)</h4>
                
                <div className="input-group">
                  <div className="input-with-icon">
                    <Home className="input-icon" size={16} />
                    <select required value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="input" style={{ appearance: "auto", paddingLeft: "36px" }}>
                      <option value="">Sélectionnez un lot disponible</option>
                      {lots.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Preview Card */}
                {propertyId ? (() => {
                  const prop = lots.find(l => l.id === propertyId);
                  if (!prop) return null;
                  return (
                    <div style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", overflow: "hidden", background: "var(--gray-50)", marginTop: "8px" }}>
                      <div style={{ height: "160px", background: prop.images?.[0] ? `url(${prop.images[0]}) center/cover` : "var(--gray-300)", position: "relative" }}>
                        <span className="badge badge-primary" style={{ position: "absolute", top: "12px", right: "12px", background: "white", color: "var(--gray-900)" }}>
                          {prop.type === 'lotissement' ? 'Lotissement' : 'Terrain'}
                        </span>
                      </div>
                      <div style={{ padding: "16px" }}>
                        <h5 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "800" }}>{prop.name}</h5>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--gray-500)", marginBottom: "12px" }}>
                          <MapPin size={14} /> {prop.address}, {prop.city}
                        </div>
                        <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary-dark)", display: "flex", alignItems: "center", gap: "6px", marginBottom: prop.lat && prop.lng ? "16px" : "0" }}>
                          Prix de base : {formatCurrency(prop.sale_price || 0)}
                        </div>
                        {prop.lat && prop.lng && (
                          <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "16px" }}>
                            <h6 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Emplacement Exact (GPS)</h6>
                            <MapModuleWrapper properties={[prop]} height="140px" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ flex: 1, border: "2px dashed var(--gray-200)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", color: "var(--gray-400)", textAlign: "center", background: "var(--gray-50)", marginTop: "8px" }}>
                    <MapPin size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: "14px" }}>Sélectionnez un lot pour voir l'aperçu</p>
                  </div>
                )}
              </div>

              {/* Right Column: Buyer & Payment */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Buyer Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>L'Acheteur</h4>
                  
                  <div className="input-group">
                    <label className="input-label">Nom complet</label>
                    <div className="input-with-icon">
                      <User className="input-icon" size={16} />
                      <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" style={{ paddingLeft: "36px" }} placeholder="Ex: Jean Dupont" />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Email (Optionnel)</label>
                      <div className="input-with-icon">
                        <Mail className="input-icon" size={16} />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" style={{ paddingLeft: "36px" }} placeholder="jean@email.com" />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Téléphone</label>
                      <div className="input-with-icon">
                        <Phone className="input-icon" size={16} />
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" style={{ paddingLeft: "36px" }} placeholder="07 00 00 00 00" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">N° Pièce d'identité <span style={{ color: "var(--danger)" }}>*</span></label>
                    <div className="input-with-icon">
                      <CreditCard className="input-icon" size={16} />
                      <input type="text" required value={idCardNumber} onChange={(e) => setIdCardNumber(e.target.value)} className="input" style={{ paddingLeft: "36px" }} placeholder="Ex: C001234567" />
                    </div>
                  </div>
                </div>

                <div style={{ height: "1px", background: "var(--gray-200)", margin: "4px 0" }}></div>

                {/* Financials */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Détails Financiers</h4>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Prix conclu (FCFA)</label>
                      <input type="number" required value={totalPrice} onChange={(e) => setTotalPrice(Number(e.target.value))} className="input" />
                    </div>
                    
                    <div className="input-group">
                      <label className="input-label">Date d'achat</label>
                      <div className="input-with-icon">
                        <Calendar className="input-icon" size={16} />
                        <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" style={{ paddingLeft: "36px" }} />
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Avance Payée (FCFA)</label>
                    <input 
                      type="number" 
                      required 
                      value={advance} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= totalPrice) setAdvance(val);
                      }} 
                      className="input" 
                      style={{ borderColor: advance > 0 ? "var(--primary)" : "" }} 
                    />
                  </div>

                  {/* Summary Box */}
                  <div style={{ background: "var(--primary-lighter)", border: "1px solid rgba(var(--primary-rgb), 0.2)", borderRadius: "var(--radius-md)", padding: "16px", marginTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ color: "var(--gray-600)", fontSize: "14px" }}>Prix Total</span>
                      <span style={{ fontWeight: "600" }}>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ color: "var(--gray-600)", fontSize: "14px" }}>Avance</span>
                      <span style={{ fontWeight: "600", color: "var(--primary)" }}>- {formatCurrency(advance)}</span>
                    </div>
                    <div style={{ height: "1px", background: "rgba(0,0,0,0.05)", margin: "0 -16px 12px -16px" }}></div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--primary-dark)", fontWeight: "800", fontSize: "16px" }}>Reste à payer</span>
                      <span style={{ fontWeight: "800", fontSize: "20px", color: "var(--primary-dark)" }}>{formatCurrency(totalPrice - advance)}</span>
                    </div>
                  </div>

                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Valider la vente</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
