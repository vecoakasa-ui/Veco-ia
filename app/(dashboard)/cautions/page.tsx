"use client";

import { useEffect, useState } from "react";
import { 
  ClipboardCheck, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  X,
  Camera,
  Banknote,
  Building,
  User
} from "lucide-react";
import { db } from "@/lib/store";
import { Lease, DepositStatus, InventoryStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CautionsPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [search, setSearch] = useState("");
  
  // Modals state
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);

  // Form states
  const [invType, setInvType] = useState<"in" | "out">("in");
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [depositAction, setDepositAction] = useState<"refund_full" | "refund_partial" | "hold_full">("refund_full");
  const [deductionAmount, setDeductionAmount] = useState("");

  const loadData = async () => {
    setLeases(await db.getLeases());
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const filteredLeases = leases.filter((l) => {
    const term = search.toLowerCase();
    return (
      (l.tenant_name?.toLowerCase() || "").includes(term) ||
      (l.property_name?.toLowerCase() || "").includes(term)
    );
  });

  // KPIs
  const totalHeldDeposits = leases
    .filter(l => l.deposit_status === "held" || !l.deposit_status)
    .reduce((acc, l) => acc + l.deposit_amount, 0);

  const leasesToRefund = leases.filter(l => 
    (l.status === "expired" || l.status === "terminated") && 
    (l.deposit_status === "held" || !l.deposit_status)
  );

  const totalToRefund = leasesToRefund.reduce((acc, l) => acc + l.deposit_amount, 0);

  // Handlers
  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLease) return;

    const updatedLease = { ...selectedLease };
    if (invType === "in") {
      updatedLease.inventory_in_status = "completed";
      updatedLease.inventory_in_date = invDate;
    } else {
      updatedLease.inventory_out_status = "completed";
      updatedLease.inventory_out_date = invDate;
      // Auto-update lease status to terminated if out-inventory is done
      if (updatedLease.status === "active") {
        updatedLease.status = "terminated";
      }
    }

    await db.updateLease(updatedLease);
    setShowInventoryModal(false);
    await loadData();
    window.dispatchEvent(new Event("storage"));
  };

  const handleSaveDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLease) return;

    const updatedLease = { ...selectedLease };
    
    if (depositAction === "refund_full") {
      updatedLease.deposit_status = "refunded";
      updatedLease.deposit_returned = selectedLease.deposit_amount;
      updatedLease.deposit_deductions = 0;
    } else if (depositAction === "hold_full") {
      updatedLease.deposit_status = "held"; // completely retained
      updatedLease.deposit_returned = 0;
      updatedLease.deposit_deductions = selectedLease.deposit_amount;
    } else {
      const dedAmount = Number(deductionAmount);
      updatedLease.deposit_status = "partially_refunded";
      updatedLease.deposit_deductions = dedAmount;
      updatedLease.deposit_returned = selectedLease.deposit_amount - dedAmount;
    }

    await db.updateLease(updatedLease);
    setShowDepositModal(false);
    await loadData();
    window.dispatchEvent(new Event("storage"));
  };

  const openInventoryModal = (lease: Lease, type: "in" | "out") => {
    setSelectedLease(lease);
    setInvType(type);
    setInvDate(new Date().toISOString().split('T')[0]);
    setShowInventoryModal(true);
  };

  const openDepositModal = (lease: Lease) => {
    setSelectedLease(lease);
    setDepositAction("refund_full");
    setDeductionAmount("");
    setShowDepositModal(true);
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Garanties et Remises des clés</p>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>États des lieux & Cautions</h2>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-5)" }}>
          <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "12px", borderRadius: "var(--radius-md)" }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", margin: 0 }}>Cautions détenues</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", margin: 0, color: "var(--gray-900)" }}>{formatCurrency(totalHeldDeposits)}</h3>
          </div>
        </div>
        
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-5)" }}>
          <div style={{ background: leasesToRefund.length > 0 ? "var(--warning-light)" : "var(--gray-100)", color: leasesToRefund.length > 0 ? "var(--warning-dark)" : "var(--gray-500)", padding: "12px", borderRadius: "var(--radius-md)" }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", margin: 0 }}>Cautions à restituer</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", margin: 0, color: "var(--gray-900)" }}>{formatCurrency(totalToRefund)}</h3>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-400)" }}>{leasesToRefund.length} baux concernés</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ width: "100%" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher par locataire ou bien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {filteredLeases.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "var(--space-12)" }}>
            <ClipboardCheck size={48} style={{ color: "var(--gray-300)", margin: "0 auto var(--space-4) auto" }} />
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--gray-600)" }}>Aucun bail trouvé</h3>
          </div>
        ) : (
          filteredLeases.map((lease) => {
            const inDone = lease.inventory_in_status === "completed";
            const outDone = lease.inventory_out_status === "completed";
            const depositStatus = lease.deposit_status || "held";
            
            return (
              <div key={lease.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-2)" }}>
                  <div>
                    <h3 style={{ fontSize: "var(--text-md)", fontWeight: "700", color: "var(--gray-900)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <User size={16} style={{ color: "var(--primary)" }}/> {lease.tenant_name}
                    </h3>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <Building size={14} /> {lease.property_name}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`badge ${lease.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {lease.status === 'active' ? 'Bail Actif' : 'Bail Terminé'}
                    </span>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", marginTop: "4px" }}>
                      Du {formatDate(lease.start_date)} au {formatDate(lease.end_date)}
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)", background: "var(--gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--gray-200)" }}>
                  
                  {/* Inventory IN */}
                  <div>
                    <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--gray-500)", marginBottom: "8px", textTransform: "uppercase" }}>État des lieux (Entrée)</p>
                    {inDone ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--success-dark)" }}>
                        <CheckCircle2 size={16} /> Fait le {formatDate(lease.inventory_in_date!)}
                      </div>
                    ) : (
                      <button className="btn btn-sm btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={() => openInventoryModal(lease, "in")}>
                        <Camera size={14} style={{ marginRight: "6px" }} /> Faire l'EDL
                      </button>
                    )}
                  </div>

                  {/* Inventory OUT */}
                  <div>
                    <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--gray-500)", marginBottom: "8px", textTransform: "uppercase" }}>État des lieux (Sortie)</p>
                    {outDone ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--gray-700)" }}>
                        <CheckCircle2 size={16} /> Fait le {formatDate(lease.inventory_out_date!)}
                      </div>
                    ) : (
                      <button className="btn btn-sm btn-ghost" style={{ width: "100%", justifyContent: "center", background: "white", border: "1px dashed var(--gray-300)" }} onClick={() => openInventoryModal(lease, "out")} disabled={!inDone}>
                        <Camera size={14} style={{ marginRight: "6px" }} /> Faire l'EDL
                      </button>
                    )}
                  </div>

                  {/* Deposit */}
                  <div>
                    <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--gray-500)", marginBottom: "8px", textTransform: "uppercase" }}>Caution</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <span style={{ fontWeight: 700, color: "var(--gray-900)" }}>{formatCurrency(lease.deposit_amount)}</span>
                      {depositStatus === "held" && (
                        <button className="btn btn-sm btn-primary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => openDepositModal(lease)}>
                          <Banknote size={12} style={{ marginRight: "4px" }} /> Gérer
                        </button>
                      )}
                      {depositStatus === "refunded" && (
                        <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600 }}>Restituée</span>
                      )}
                      {depositStatus === "partially_refunded" && (
                        <span style={{ fontSize: "11px", color: "var(--warning-dark)", fontWeight: 600 }}>Partielle</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================
         Inventory Modal
         ============================================ */}
      {showInventoryModal && selectedLease && (
        <div 
          style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "var(--space-4)" }}
          className="animate-fade-in"
        >
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800" }}>
                État des lieux de {invType === "in" ? "l'entrée" : "sortie"}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInventoryModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveInventory} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Date de l'état des lieux</label>
                <input
                  type="date"
                  required
                  value={invDate}
                  onChange={(e) => setInvDate(e.target.value)}
                  className="input"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Photos / Document (Optionnel)</label>
                <input
                  type="file"
                  className="input"
                  style={{ padding: "10px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowInventoryModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Valider l'EDL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
         Deposit Modal
         ============================================ */}
      {showDepositModal && selectedLease && (
        <div 
          style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "var(--space-4)" }}
          className="animate-fade-in"
        >
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "450px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800" }}>Restitution de Caution</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDepositModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ background: "var(--gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-6)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>Montant total détenu :</span>
              <span style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--gray-900)" }}>{formatCurrency(selectedLease.deposit_amount)}</span>
            </div>

            <form onSubmit={handleSaveDeposit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              <div className="input-group">
                <label className="input-label">Action sur la caution</label>
                <select
                  value={depositAction}
                  onChange={(e) => setDepositAction(e.target.value as "refund_full" | "refund_partial" | "hold_full")}
                  className="input"
                  style={{ appearance: "auto" }}
                >
                  <option value="refund_full">Restitution intégrale (Locataire réglo)</option>
                  <option value="refund_partial">Restitution avec retenue (Dégradations)</option>
                  <option value="hold_full">Retenue totale (Gros travaux / Impayés)</option>
                </select>
              </div>

              {depositAction === "refund_partial" && (
                <div className="input-group animate-fade-in" style={{ padding: "var(--space-4)", border: "1px solid var(--warning)", borderRadius: "var(--radius-md)", background: "rgba(245,158,11,0.05)" }}>
                  <label className="input-label" style={{ color: "var(--warning-dark)" }}>Montant de la retenue (Frais de remise en état)</label>
                  <input
                    type="number"
                    required
                    max={selectedLease.deposit_amount}
                    min="0"
                    placeholder={`Ex: 50000 (Max: ${selectedLease.deposit_amount})`}
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(e.target.value)}
                    className="input"
                  />
                  {deductionAmount && Number(deductionAmount) > 0 && (
                    <p style={{ fontSize: "12px", color: "var(--gray-600)", marginTop: "8px" }}>
                      Le locataire sera remboursé de : <strong style={{ color: "var(--success)" }}>{formatCurrency(selectedLease.deposit_amount - Number(deductionAmount))}</strong>
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowDepositModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Valider l'opération</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
