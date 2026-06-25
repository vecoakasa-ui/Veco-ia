"use client";

import { useEffect, useState } from "react";
import { 
  ClipboardCheck, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  X,
  Camera,
  Banknote,
  Building,
  User,
  Eye,
  Download,
  FileText,
  Video,
  Loader2,
  Play
} from "lucide-react";
import { db } from "@/lib/store";
import { Lease } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function CautionsPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [search, setSearch] = useState("");
  
  // Modals state
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);

  // PDF Preview states
  const [previewEDLLease, setPreviewEDLLease] = useState<{lease: Lease, type: "in" | "out"} | null>(null);
  const [previewDepositLease, setPreviewDepositLease] = useState<Lease | null>(null);

  // Form states
  const [invType, setInvType] = useState<"in" | "out">("in");
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
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
    
    setIsUploading(true);
    let videoUrl: string | undefined = undefined;
    
    if (videoFile && isSupabaseConfigured()) {
      try {
        const fileExt = videoFile.name.split('.').pop() || 'mp4';
        const fileName = `inventory-${selectedLease.id}-${invType}-${Date.now()}.${fileExt}`;
        
        const { error } = await supabase.storage.from('inventory-videos').upload(fileName, videoFile, {
          cacheControl: '3600',
          upsert: false
        });
        
        if (error) {
          console.error("Upload error", error);
          alert("Erreur d'upload de la vidéo. Avez-vous créé le bucket 'inventory-videos' dans Supabase ?");
        } else {
          const { data: pubData } = supabase.storage.from('inventory-videos').getPublicUrl(fileName);
          videoUrl = pubData.publicUrl;
        }
      } catch (err) {
        console.error("Erreur inattendue:", err);
      }
    }

    const updatedLease = { ...selectedLease };
    if (invType === "in") {
      updatedLease.inventory_in_status = "completed";
      updatedLease.inventory_in_date = invDate;
      if (videoUrl) updatedLease.inventory_in_video_url = videoUrl;
    } else {
      updatedLease.inventory_out_status = "completed";
      updatedLease.inventory_out_date = invDate;
      if (videoUrl) updatedLease.inventory_out_video_url = videoUrl;
      // Auto-update lease status to terminated if out-inventory is done
      if (updatedLease.status === "active") {
        updatedLease.status = "terminated";
      }
    }

    await db.updateLease(updatedLease);
    setIsUploading(false);
    setShowInventoryModal(false);
    setVideoFile(null);
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

  const generateEDLPDF = async (lease: Lease, type: "in" | "out") => {
    const element = document.getElementById(`edl-content-${lease.id}-${type}`);
    if (!element) return;
    
    const opt = {
      margin:       10,
      filename:     `Etat_des_Lieux_${type === "in" ? "Entree" : "Sortie"}_${lease.tenant_name?.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().set(opt).from(element).save();
  };

  const generateDepositPDF = async (lease: Lease) => {
    const element = document.getElementById(`deposit-content-${lease.id}`);
    if (!element) return;
    
    const opt = {
      margin:       10,
      filename:     `Recu_Caution_${lease.tenant_name?.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().set(opt).from(element).save();
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
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--success-dark)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <CheckCircle2 size={16} /> {formatDate(lease.inventory_in_date!)}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {lease.inventory_in_video_url && (
                            <a href={lease.inventory_in_video_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: "4px", color: "var(--primary)" }} title="Voir Vidéo">
                              <Play size={16} />
                            </a>
                          )}
                          <button className="btn btn-ghost btn-sm" style={{ padding: "4px" }} onClick={() => setPreviewEDLLease({lease, type: "in"})} title="Voir EDL (PDF)">
                            <Eye size={16} />
                          </button>
                        </div>
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
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--gray-700)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <CheckCircle2 size={16} /> {formatDate(lease.inventory_out_date!)}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {lease.inventory_out_video_url && (
                            <a href={lease.inventory_out_video_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: "4px", color: "var(--primary)" }} title="Voir Vidéo">
                              <Play size={16} />
                            </a>
                          )}
                          <button className="btn btn-ghost btn-sm" style={{ padding: "4px" }} onClick={() => setPreviewEDLLease({lease, type: "out"})} title="Voir EDL (PDF)">
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-sm btn-ghost" style={{ width: "100%", justifyContent: "center", background: "white", border: "1px dashed var(--gray-300)" }} onClick={() => openInventoryModal(lease, "out")}>
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
                      {(depositStatus === "refunded" || depositStatus === "partially_refunded") && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "11px", color: depositStatus === "refunded" ? "var(--success)" : "var(--warning-dark)", fontWeight: 600 }}>
                            {depositStatus === "refunded" ? "Restituée" : "Partielle"}
                          </span>
                          <button className="btn btn-ghost btn-sm" style={{ padding: "4px" }} onClick={() => setPreviewDepositLease(lease)} title="Reçu de Caution">
                            <Eye size={16} />
                          </button>
                        </div>
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
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Video size={16} /> Preuve Vidéo de l'État des Lieux (Optionnel)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.size > 50 * 1024 * 1024) {
                        alert("La vidéo est trop volumineuse (max 50MB).");
                        e.target.value = '';
                        return;
                      }
                      setVideoFile(file);
                    }
                  }}
                  className="input"
                  style={{ padding: "10px" }}
                />
                <p style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '4px' }}>
                  Conseil: Sélectionnez un fichier vidéo depuis votre explorateur ou filmez directement. (Si la vidéo est lourde, compressez-la avant. Max: 50 Mo).
                </p>
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => {setShowInventoryModal(false); setVideoFile(null);}} disabled={isUploading}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isUploading}>
                  {isUploading ? <><Loader2 className="animate-spin" size={16} style={{marginRight: '8px'}} /> Envoi en cours...</> : "Valider l'EDL"}
                </button>
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

      {/* ============================================
         Preview EDL PDF Modal
         ============================================ */}
      {previewEDLLease && (
        <div 
          style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "var(--space-4)", backdropFilter: "blur(4px)" }}
          className="animate-fade-in"
          onClick={() => setPreviewEDLLease(null)}
        >
          <div className="animate-scale-in" style={{ width: "100%", maxWidth: "800px", height: "90vh", display: "flex", flexDirection: "column", background: "transparent", gap: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="btn btn-primary" onClick={() => generateEDLPDF(previewEDLLease.lease, previewEDLLease.type)} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Download size={16} /> Télécharger l'EDL PDF
              </button>
              <button className="btn btn-outline" onClick={() => setPreviewEDLLease(null)} style={{ background: "white" }}>
                <X size={16} /> Fermer
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", background: "var(--gray-100)", borderRadius: "8px", display: "flex", justifyContent: "center", padding: "32px 16px" }}>
              
              <div id={`edl-content-${previewEDLLease.lease.id}-${previewEDLLease.type}`} style={{ background: "white", width: "210mm", minHeight: "297mm", padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", color: "#000", fontFamily: "Arial, sans-serif" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #f0f0f0", paddingBottom: "20px", marginBottom: "30px" }}>
                  <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1a1a1a", margin: "0 0 8px 0" }}>
                      ÉTAT DES LIEUX DE {previewEDLLease.type === "in" ? "L'ENTRÉE" : "SORTIE"}
                    </h1>
                    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                      Fait le {new Date(previewEDLLease.type === "in" ? previewEDLLease.lease.inventory_in_date! : previewEDLLease.lease.inventory_out_date!).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "40px", height: "40px", background: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={24} color="white" /></div>
                    <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)" }}>Veco Immo</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>Propriétaire / Bailleur</h3>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "16px" }}>Agence Veco Immo</p>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>Locataire</h3>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "16px" }}>{previewEDLLease.lease.tenant_name}</p>
                    <p style={{ margin: 0, color: "#444", fontSize: "14px" }}>{previewEDLLease.lease.property_name}</p>
                  </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", color: "#555" }}>Pièce / Élément</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ddd", color: "#555" }}>Très Bon</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ddd", color: "#555" }}>Bon</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ddd", color: "#555" }}>Moyen</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ddd", color: "#555" }}>Mauvais</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Salon - Murs & Plafonds', 'Salon - Sols', 'Salon - Fenêtres', 'Cuisine - Éviers & Robinetterie', 'Cuisine - Électroménager', 'Chambre 1 - Murs & Sols', 'SDB - Douche/Baignoire', 'SDB - Toilettes', 'SDB - Carrelage'].map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "12px", borderBottom: "1px solid #eee", color: "#333", fontSize: "14px" }}>{item}</td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #eee", textAlign: "center" }}><div style={{ width: "16px", height: "16px", border: "1px solid #999", borderRadius: "2px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>{idx % 3 === 0 ? "✓" : ""}</div></td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #eee", textAlign: "center" }}><div style={{ width: "16px", height: "16px", border: "1px solid #999", borderRadius: "2px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>{idx % 3 === 1 ? "✓" : ""}</div></td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #eee", textAlign: "center" }}><div style={{ width: "16px", height: "16px", border: "1px solid #999", borderRadius: "2px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>{idx % 3 === 2 ? "✓" : ""}</div></td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #eee", textAlign: "center" }}><div style={{ width: "16px", height: "16px", border: "1px solid #999", borderRadius: "2px", margin: "0 auto" }}></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginBottom: "40px" }}>
                  <p style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>Observations générales :</p>
                  <div style={{ border: "1px solid #eee", borderRadius: "4px", minHeight: "100px", padding: "12px", fontSize: "14px", color: "#555" }}>
                    R.A.S. - Le logement est conforme aux attentes. {previewEDLLease.type === "in" ? "Remise de 2 jeux de clés." : "Restitution de 2 jeux de clés."}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "80px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#333", fontWeight: "bold" }}>Le Bailleur</p>
                    <div style={{ width: "160px", height: "60px", borderBottom: "1px dashed #ccc", margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "8px" }}>
                      <span style={{ fontFamily: "cursive", fontSize: "24px", color: "var(--primary)" }}>Veco</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#333", fontWeight: "bold" }}>Le Locataire</p>
                    <div style={{ width: "160px", height: "60px", borderBottom: "1px dashed #ccc", margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "8px" }}>
                      <span style={{ fontFamily: "cursive", fontSize: "20px", color: "#333" }}>Lu et Approuvé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
         Preview Deposit Receipt PDF Modal
         ============================================ */}
      {previewDepositLease && (
        <div 
          style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "var(--space-4)", backdropFilter: "blur(4px)" }}
          className="animate-fade-in"
          onClick={() => setPreviewDepositLease(null)}
        >
          <div className="animate-scale-in" style={{ width: "100%", maxWidth: "800px", height: "90vh", display: "flex", flexDirection: "column", background: "transparent", gap: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="btn btn-primary" onClick={() => generateDepositPDF(previewDepositLease)} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Download size={16} /> Télécharger le Reçu PDF
              </button>
              <button className="btn btn-outline" onClick={() => setPreviewDepositLease(null)} style={{ background: "white" }}>
                <X size={16} /> Fermer
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", background: "var(--gray-100)", borderRadius: "8px", display: "flex", justifyContent: "center", padding: "32px 16px" }}>
              
              <div id={`deposit-content-${previewDepositLease.id}`} style={{ background: "white", width: "210mm", minHeight: "297mm", padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", color: "#000", fontFamily: "Arial, sans-serif" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #f0f0f0", paddingBottom: "20px", marginBottom: "30px" }}>
                  <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1a1a1a", margin: "0 0 8px 0" }}>
                      REÇU DE RESTITUTION DE CAUTION
                    </h1>
                    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                      Généré le {new Date().toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "40px", height: "40px", background: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={24} color="white" /></div>
                    <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)" }}>Veco Immo</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>Propriétaire / Bailleur</h3>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "16px" }}>Agence Veco Immo</p>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>Locataire</h3>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "16px" }}>{previewDepositLease.tenant_name}</p>
                    <p style={{ margin: 0, color: "#444", fontSize: "14px" }}>{previewDepositLease.property_name}</p>
                  </div>
                </div>

                <div style={{ marginBottom: "40px", background: "#f8f9fa", padding: "20px", borderRadius: "8px" }}>
                  <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#333", margin: 0 }}>
                    Par la présente, nous confirmons la clôture du bail de <strong>{previewDepositLease.tenant_name}</strong> pour le bien situé à <strong>{previewDepositLease.property_name}</strong>, et procédons à la restitution de la caution locative selon le détail ci-dessous.
                  </p>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "16px", borderBottom: "1px solid #eee", color: "#333", fontSize: "15px" }}>Dépôt de garantie initial</td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #eee", textAlign: "right", color: "#333", fontWeight: "bold" }}>{formatCurrency(previewDepositLease.deposit_amount)}</td>
                    </tr>
                    {(previewDepositLease.deposit_deductions || 0) > 0 && (
                      <tr>
                        <td style={{ padding: "16px", borderBottom: "1px solid #eee", color: "var(--warning-dark)", fontSize: "15px" }}>Retenues appliquées (Réparations / Dégradations constatées)</td>
                        <td style={{ padding: "16px", borderBottom: "1px solid #eee", textAlign: "right", color: "var(--warning-dark)", fontWeight: "bold" }}>- {formatCurrency(previewDepositLease.deposit_deductions!)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: "20px 16px", fontWeight: "bold", fontSize: "16px", color: "#111", background: "#f0fdf4", borderTop: "2px solid #ccc" }}>MONTANT NET RESTITUÉ</td>
                      <td style={{ padding: "20px 16px", textAlign: "right", fontWeight: "900", fontSize: "20px", color: "var(--success-dark)", background: "#f0fdf4", borderTop: "2px solid #ccc" }}>{formatCurrency(previewDepositLease.deposit_returned || 0)}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "80px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#333", fontWeight: "bold" }}>Le Bailleur</p>
                    <div style={{ width: "160px", height: "60px", borderBottom: "1px dashed #ccc", margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "8px" }}>
                      <span style={{ fontFamily: "cursive", fontSize: "24px", color: "var(--primary)" }}>Veco</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
