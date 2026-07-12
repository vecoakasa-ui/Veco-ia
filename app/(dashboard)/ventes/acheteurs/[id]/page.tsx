"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Phone, Mail, Calendar, CheckCircle, AlertCircle, CreditCard, TrendingUp, Download, Plus, X, Smartphone, Lock, ArrowRight, ShieldCheck, Check, QrCode } from "lucide-react";
import { db } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function VenteDashboard() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sale, setSale] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState<any>(null);
  
  // Nouveau state pour la modale d'encaissement
  const [installmentToPay, setInstallmentToPay] = useState<any>(null);
  const [paymentMethodToUse, setPaymentMethodToUse] = useState<string>('credit_card'); // Default to credit card for better demo
  const [isPaying, setIsPaying] = useState(false);
  
  // Checkout flow states
  const [paymentStep, setPaymentStep] = useState<number>(1);
  const [paymentDetails, setPaymentDetails] = useState<any>({
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    phoneNumber: "",
    operator: "wave"
  });
  const [otpCode, setOtpCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Validation and UX states
  const [mobileMoneyMethod, setMobileMoneyMethod] = useState<'phone' | 'qr'>('phone');
  const [showOtpToast, setShowOtpToast] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("4321");

  const isCardValid = paymentDetails.cardName.length > 2 && paymentDetails.cardNumber.length >= 19 && paymentDetails.cardExpiry.length === 5 && paymentDetails.cardCvv.length >= 3;
  const isMobileValid = mobileMoneyMethod === 'qr' || (paymentDetails.phoneNumber.length >= 8);


  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const sales = await db.getSales();
        const currentSale = sales.find(s => s.id === id);
        
        if (!currentSale) {
          router.push("/ventes/acheteurs");
          return;
        }
        
        const allInstallments = await db.getSaleInstallments();
        const saleInstallments = allInstallments.filter(i => i.sale_id === id);
        const allProperties = await db.getProperties();
        const currentProperty = allProperties.find(p => p.id === currentSale.property_id);
        const propertyImage = currentProperty?.images?.[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentSale.buyer_name || "A")}&backgroundColor=e25822`;
        
        setSale({...currentSale, property_image: propertyImage});
        setInstallments(saleInstallments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sales = await db.getSales();
      const currentSale = sales.find(s => s.id === id);
      
      if (!currentSale) {
        router.push("/ventes/acheteurs");
        return;
      }
      
      const allInstallments = await db.getSaleInstallments();
      const saleInstallments = allInstallments.filter(i => i.sale_id === id);
      const allProperties = await db.getProperties();
      const currentProperty = allProperties.find(p => p.id === currentSale.property_id);
      const propertyImage = currentProperty?.images?.[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentSale.buyer_name || "A")}&backgroundColor=e25822`;
      
      setSale({...currentSale, property_image: propertyImage});
      setInstallments(saleInstallments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayInstallment = async (instId: string, method: string) => {
    setIsPaying(true);
    try {
      await db.payInstallment(instId, method);
      
      // If it's paid, we need to update the sale's remaining balance
      const inst = installments.find(i => i.id === instId);
      if (inst && sale) {
        const newBalance = Math.max(0, sale.remaining_balance - inst.amount);
        await db.updateSale(sale.id, {
          remaining_balance: newBalance
        });
      }
      
      await loadData();
      
      // Go to success step
      setPaymentStep(4);
    } catch (error) {
      console.error(error);
      alert("Erreur lors du paiement");
    } finally {
      setIsPaying(false);
    }
  };

  const handleNextStep = () => {
    if (paymentStep === 1) {
      if (paymentMethodToUse === 'cash') {
        // Cash can go straight to processing/validation
        simulateProcessingAndPay();
      } else {
        setPaymentStep(2);
      }
    } else if (paymentStep === 2) {
      if (paymentMethodToUse === 'mobile_money') {
        if (mobileMoneyMethod === 'qr') {
          // If they scan QR, simulate external payment success directly
          simulateProcessingAndPay();
        } else {
          // Go to OTP step
          setPaymentStep(3);
          // eslint-disable-next-line react-hooks/purity
          const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
          setGeneratedOtp(newOtp);
          setShowOtpToast(true);
          setTimeout(() => setShowOtpToast(false), 8000);
        }
      } else {
        // Credit card, Bank transfer, Cheque -> Validate directly
        simulateProcessingAndPay();
      }
    } else if (paymentStep === 3) {
      // Validate OTP
      if (otpCode !== generatedOtp) {
        alert("Le code OTP est incorrect.");
        return;
      }
      simulateProcessingAndPay();
    }
  };

  const simulateProcessingAndPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (installmentToPay) {
        handlePayInstallment(installmentToPay.id, paymentMethodToUse);
      }
    }, 1500);
  };

  const closePaymentModal = () => {
    if (isPaying || isProcessing) return;
    setInstallmentToPay(null);
    setTimeout(() => {
      setPaymentStep(1);
      setOtpCode("");
      setShowOtpToast(false);
      setMobileMoneyMethod('phone');
      setPaymentMethodToUse('credit_card');
    }, 300);
  };

  if (isLoading || !sale) return <div style={{ padding: "32px", textAlign: "center" }}>Chargement...</div>;

  // Calculate Progress
  const totalPaid = sale.total_price - sale.remaining_balance;
  const progressPercent = Math.min(100, Math.round((totalPaid / sale.total_price) * 100));

  // Calculate Pie Chart Data
  const amountPaid = installments.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const amountLate = installments.filter(i => i.status !== 'paid' && new Date(i.due_date) < new Date()).reduce((acc, curr) => acc + curr.amount, 0);
  const amountPending = installments.filter(i => i.status !== 'paid' && new Date(i.due_date) >= new Date()).reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = [
    { name: 'Payé', value: amountPaid, color: '#009A44' },
    { name: 'En retard', value: amountLate, color: '#FF8200' },
    { name: 'À venir', value: amountPending, color: '#e2e8f0' }
  ].filter(d => d.value > 0);

  const lateInstallments = installments.filter(i => i.status !== 'paid' && new Date(i.due_date) < new Date());

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <Link href="/ventes/acheteurs" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--gray-500)", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}>
            <ArrowLeft size={14} /> Retour aux acheteurs
          </Link>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            Dossier de Vente
            {sale.status === 'completed' && <span className="badge badge-success" style={{ fontSize: "12px" }}>Soldé</span>}
            {sale.status === 'pending' && <span className="badge badge-primary" style={{ fontSize: "12px" }}>En cours</span>}
          </h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        {/* Buyer & Property Info */}
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--primary-lighter)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src={sale.property_image} alt={sale.property_name || sale.buyer_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "900", margin: 0 }}>{sale.buyer_name}</h3>
              <p style={{ margin: "4px 0 0 0", color: "var(--gray-500)", fontSize: "14px" }}>Acheteur</p>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--gray-600)" }}>
              <Mail size={16} /> {sale.buyer_email || "Email non renseigné"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--gray-600)" }}>
              <Phone size={16} /> {sale.buyer_phone || "Téléphone non renseigné"}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--gray-200)", margin: "16px 0", paddingTop: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--gray-500)", textTransform: "uppercase", marginBottom: "12px" }}>Bien Acquis</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--primary-lighter)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPin size={24} />
              </div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>{sale.property_name}</div>
                <div style={{ fontSize: "13px", color: "var(--gray-500)" }}>Lot / Terrain</div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary & Progress */}
        <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 16px 0" }}>Bilan Financier</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div style={{ background: "var(--gray-50)", padding: "16px", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase" }}>Total Payé</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--success)", marginTop: "4px" }}>{formatCurrency(totalPaid)}</div>
            </div>
            <div style={{ background: "var(--gray-50)", padding: "16px", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "var(--gray-500)", fontWeight: "600", textTransform: "uppercase" }}>Reste à Payer</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--danger)", marginTop: "4px" }}>{formatCurrency(sale.remaining_balance)}</div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontWeight: "700", fontSize: "14px" }}>Progression du paiement</span>
              <span style={{ fontWeight: "800", color: "var(--primary)" }}>{progressPercent}%</span>
            </div>
            <div style={{ width: "100%", height: "12px", background: "var(--gray-200)", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--primary)", borderRadius: "6px", transition: "width 1s ease-in-out" }}></div>
            </div>
          </div>
          
          <div style={{ fontSize: "13px", color: "var(--gray-500)", display: "flex", justifyContent: "space-between" }}>
            <span>Prix total: {formatCurrency(sale.total_price)}</span>
            <span>Avance: {formatCurrency(sale.advance_payment)}</span>
          </div>

          {lateInstallments.length > 0 && (
            <div style={{ marginTop: "auto", background: "rgba(220, 38, 38, 0.1)", color: "var(--danger)", padding: "16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
              <AlertCircle size={20} />
              <div>
                <div style={{ fontWeight: "bold" }}>Retard de paiement</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>{lateInstallments.length} échéance(s) en retard</div>
              </div>
            </div>
          )}
        </div>
        {/* Payment Chart */}
        <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 16px 0" }}>Évolution des paiements</h3>
          <div style={{ height: "160px", width: "100%", flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px", fontSize: "12px", color: "var(--gray-600)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#009A44" }}></span> Payé</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF8200" }}></span> En retard</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#e2e8f0" }}></span> À venir</div>
          </div>
        </div>
      </div>

      {/* Installments List */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-6)" }}>
        <div className="card" style={{ padding: "0" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>Plan de paiement (Échéancier)</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)", textAlign: "left" }}>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Mois</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Montant</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase" }}>Statut</th>
                  <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "var(--gray-500)", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((inst, index) => {
                  const isLate = inst.status === 'late' || (inst.status === 'pending' && new Date(inst.due_date) < new Date());
                  const statusLabel = inst.status === 'paid' ? 'Payé' : isLate ? 'En retard' : 'En attente';
                  const statusClass = inst.status === 'paid' ? 'badge-success' : isLate ? 'badge-danger' : 'badge-ghost';
                  
                  return (
                    <tr key={inst.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-500)", fontWeight: "bold", fontSize: "14px" }}>
                            {index + 1}
                          </div>
                          <div>
                            <div style={{ fontWeight: "600" }}>{new Date(inst.due_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                            <div style={{ fontSize: "12px", color: "var(--gray-500)" }}>Au {new Date(inst.due_date).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: "bold" }}>
                        {formatCurrency(inst.amount)}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span className={`badge ${statusClass}`}>{statusLabel}</span>
                        {inst.payment_date && (
                          <div style={{ fontSize: "11px", color: "var(--gray-500)", marginTop: "4px" }}>
                            le {new Date(inst.payment_date).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        {inst.status !== 'paid' ? (
                          <button 
                            className="btn btn-primary btn-sm" 
                            style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }}
                            onClick={() => {
                              setInstallmentToPay(inst);
                              setPaymentMethodToUse('cash');
                            }}
                          >
                            Encaisser
                          </button>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                            <button 
                              className="btn btn-ghost"
                              onClick={() => setSelectedPaymentInfo(inst)}
                              style={{ padding: "4px 8px", color: "var(--success)", background: "transparent", border: "none" }}
                              title="Voir le mode de paiement"
                            >
                              <CheckCircle size={20} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>

      {/* Payment Details Modal */}
      {selectedPaymentInfo && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelectedPaymentInfo(null)}>
          <div style={{ background: "white", padding: "24px", borderRadius: "16px", width: "400px", maxWidth: "90%", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={20} color="var(--success)" />
                Détails du Paiement
              </h3>
              <button onClick={() => setSelectedPaymentInfo(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--gray-500)" }}><X size={20} /></button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "var(--gray-50)", padding: "16px", borderRadius: "8px" }}>
                <div style={{ fontSize: "13px", color: "var(--gray-500)", marginBottom: "4px" }}>Montant réglé</div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "var(--gray-900)" }}>{formatCurrency(selectedPaymentInfo.amount)}</div>
              </div>

              <div>
                <div style={{ fontSize: "13px", color: "var(--gray-500)", marginBottom: "4px" }}>Mode de paiement</div>
                <div style={{ fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={16} />
                  {selectedPaymentInfo.payment_method === 'cash' ? 'Espèces' : 
                   selectedPaymentInfo.payment_method === 'bank_transfer' ? 'Virement Bancaire' : 
                   selectedPaymentInfo.payment_method === 'mobile_money' ? 'Mobile Money' : 
                   selectedPaymentInfo.payment_method || 'Mode non renseigné'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "13px", color: "var(--gray-500)", marginBottom: "4px" }}>Date de paiement</div>
                <div style={{ fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={16} />
                  {selectedPaymentInfo.payment_date ? new Date(selectedPaymentInfo.payment_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date non renseignée'}
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: "100%", marginTop: "24px" }} onClick={() => setSelectedPaymentInfo(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* Multi-Step Payment Modal */}
      {installmentToPay && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={closePaymentModal}>
          <div className="animate-fade-in" style={{ background: "white", padding: "0", borderRadius: "20px", width: "450px", maxWidth: "95%", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            
            {paymentStep !== 4 && (
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--gray-50)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {paymentStep > 1 && !isProcessing && (
                    <button onClick={() => setPaymentStep(paymentStep - 1)} style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <ArrowLeft size={16} color="var(--gray-700)" />
                    </button>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--gray-900)" }}>
                      Encaisser un paiement
                    </h3>
                    <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--gray-500)" }}>Étape {paymentStep} sur {paymentMethodToUse === 'mobile_money' ? '3' : '2'}</p>
                  </div>
                </div>
                <button onClick={closePaymentModal} disabled={isProcessing} style={{ background: "transparent", border: "none", cursor: isProcessing ? "not-allowed" : "pointer", color: "var(--gray-400)" }}>
                  <X size={20} />
                </button>
              </div>
            )}

            <div style={{ padding: "24px" }}>
              {isProcessing ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", border: "4px solid rgba(0, 154, 68, 0.1)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite", marginBottom: "24px" }}></div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700", color: "var(--gray-900)" }}>Traitement en cours...</h3>
                  <p style={{ margin: 0, color: "var(--gray-500)", fontSize: "14px", textAlign: "center" }}>
                    Veuillez patienter pendant que nous communiquons<br />avec l'opérateur financier.
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : paymentStep === 1 ? (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ background: "var(--primary-lighter)", padding: "20px", borderRadius: "12px", border: "1px dashed var(--primary-light)", textAlign: "center" }}>
                    <div style={{ fontSize: "13px", color: "var(--primary-dark)", marginBottom: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Montant à encaisser</div>
                    <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--primary)" }}>{formatCurrency(installmentToPay.amount)}</div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--gray-800)" }}>
                      Choisissez un mode de paiement
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[
                        { id: 'credit_card', label: 'Carte Bancaire', icon: CreditCard, color: '#3b82f6' },
                        { id: 'mobile_money', label: 'Mobile Money (Wave, MTN, Moov)', icon: Smartphone, color: '#FF8200' },
                        { id: 'cash', label: 'Espèces', icon: CheckCircle, color: '#10b981' }
                      ].map(method => (
                        <div 
                          key={method.id}
                          onClick={() => setPaymentMethodToUse(method.id)}
                          style={{ 
                            display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "12px", 
                            border: paymentMethodToUse === method.id ? `2px solid ${method.color}` : "1px solid var(--gray-200)",
                            background: paymentMethodToUse === method.id ? `${method.color}08` : "white",
                            cursor: "pointer", transition: "all 0.2s"
                          }}
                        >
                          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${method.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: method.color }}>
                            <method.icon size={20} />
                          </div>
                          <div style={{ flex: 1, fontWeight: "600", color: paymentMethodToUse === method.id ? "var(--gray-900)" : "var(--gray-600)" }}>
                            {method.label}
                          </div>
                          <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: paymentMethodToUse === method.id ? `6px solid ${method.color}` : "2px solid var(--gray-300)" }}></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: "100%", padding: "14px", marginTop: "8px", fontSize: "16px", fontWeight: "700", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", borderRadius: "12px" }}
                    onClick={handleNextStep}
                  >
                    Continuer <ArrowRight size={18} />
                  </button>
                </div>
              ) : paymentStep === 2 ? (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {paymentMethodToUse === 'credit_card' && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--gray-900)" }}>Paiement Sécurisé</h4>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--gray-500)" }}>Entrez les détails de votre carte bancaire.</p>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--gray-700)" }}>Titulaire de la carte</label>
                        <input type="text" className="input" placeholder="Ex: Jean Dupont" value={paymentDetails.cardName} onChange={e => setPaymentDetails({...paymentDetails, cardName: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--gray-300)" }} />                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--gray-700)" }}>Numéro de carte</label>
                        <div style={{ position: "relative" }}>
                          <input type="text" className="input" placeholder="0000 0000 0000 0000" maxLength={19} value={paymentDetails.cardNumber} onChange={e => setPaymentDetails({...paymentDetails, cardNumber: (e.target.value.replace(/\D/g, '').match(/.{1,4}/g) || []).join(' ')})} style={{ width: "100%", padding: "12px", paddingLeft: "40px", borderRadius: "8px", border: "1px solid var(--gray-300)", fontFamily: "monospace", fontSize: "16px" }} />
                          <CreditCard size={18} color="var(--gray-400)" style={{ position: "absolute", left: "12px", top: "14px" }} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--gray-700)" }}>Date d'exp. (MM/AA)</label>
                          <input type="text" className="input" placeholder="MM/AA" maxLength={5} value={paymentDetails.cardExpiry} onChange={e => {
                            let v = e.target.value.replace(/\D/g, '');
                            if (v.length > 2) {
                              v = v.substring(0, 2) + '/' + v.substring(2, 4);
                            }
                            setPaymentDetails({...paymentDetails, cardExpiry: v});
                          }} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--gray-300)" }} />
                        </div>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--gray-700)" }}>CVC / CVV</label>
                          <div style={{ position: "relative" }}>
                            <input type="password" className="input" placeholder="123" maxLength={3} value={paymentDetails.cardCvv} onChange={e => setPaymentDetails({...paymentDetails, cardCvv: e.target.value.replace(/\\D/g, '')})} style={{ width: "100%", padding: "12px", paddingRight: "40px", borderRadius: "8px", border: "1px solid var(--gray-300)" }} />
                            <Lock size={16} color="var(--gray-400)" style={{ position: "absolute", right: "12px", top: "15px" }} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethodToUse === 'mobile_money' && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255, 130, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF8200" }}>
                          <Smartphone size={24} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--gray-900)" }}>Paiement Mobile</h4>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--gray-500)" }}>Choisissez comment vous souhaitez payer.</p>
                        </div>
                      </div>

                      <div style={{ display: "flex", background: "var(--gray-100)", borderRadius: "8px", padding: "4px" }}>
                        <button 
                          onClick={() => setMobileMoneyMethod('phone')}
                          style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", background: mobileMoneyMethod === 'phone' ? "white" : "transparent", boxShadow: mobileMoneyMethod === 'phone' ? "0 1px 3px rgba(0,0,0,0.1)" : "none", fontSize: "13px", fontWeight: "600", color: mobileMoneyMethod === 'phone' ? "var(--gray-900)" : "var(--gray-500)", cursor: "pointer", transition: "all 0.2s" }}
                        >
                          Saisir le numéro
                        </button>
                        <button 
                          onClick={() => setMobileMoneyMethod('qr')}
                          style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", background: mobileMoneyMethod === 'qr' ? "white" : "transparent", boxShadow: mobileMoneyMethod === 'qr' ? "0 1px 3px rgba(0,0,0,0.1)" : "none", fontSize: "13px", fontWeight: "600", color: mobileMoneyMethod === 'qr' ? "var(--gray-900)" : "var(--gray-500)", cursor: "pointer", transition: "all 0.2s" }}
                        >
                          Scanner QR Code
                        </button>
                      </div>

                      {mobileMoneyMethod === 'phone' ? (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--gray-700)" }}>Opérateur</label>
                            <select className="input" value={paymentDetails.operator} onChange={e => setPaymentDetails({...paymentDetails, operator: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--gray-300)" }}>
                              <option value="wave">Wave</option>
                              <option value="orange">Orange Money</option>
                              <option value="mtn">MTN Mobile Money</option>
                              <option value="moov">Moov Money</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--gray-700)" }}>Numéro de téléphone</label>
                            <div style={{ position: "relative" }}>
                              <input type="text" className="input" placeholder="01 23 45 67 89" value={paymentDetails.phoneNumber} onChange={e => setPaymentDetails({...paymentDetails, phoneNumber: e.target.value.replace(/\D/g, '')})} style={{ width: "100%", padding: "12px", paddingLeft: "60px", borderRadius: "8px", border: "1px solid var(--gray-300)", fontSize: "16px" }} />
                              <div style={{ position: "absolute", left: "1px", top: "1px", bottom: "1px", width: "48px", background: "var(--gray-100)", borderRight: "1px solid var(--gray-300)", borderTopLeftRadius: "7px", borderBottomLeftRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "600", color: "var(--gray-600)" }}>
                                +225
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: "16px" }}>
                          <div style={{ background: "white", padding: "12px", borderRadius: "12px", border: "1px solid var(--gray-200)", display: "inline-block" }}>
                            <QrCode size={160} strokeWidth={1.5} color="var(--gray-800)" />
                          </div>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--gray-500)", textAlign: "center" }}>
                            Scannez ce code depuis votre application<br/>pour valider le paiement.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <button 
                    className="btn btn-primary" 
                    disabled={paymentMethodToUse === 'credit_card' ? !isCardValid : !isMobileValid}
                    style={{ width: "100%", padding: "14px", marginTop: "16px", fontSize: "16px", fontWeight: "700", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", borderRadius: "12px", background: paymentMethodToUse === 'credit_card' ? "var(--primary)" : "#FF8200", opacity: (paymentMethodToUse === 'credit_card' ? !isCardValid : !isMobileValid) ? 0.5 : 1 }}
                    onClick={handleNextStep}
                  >
                    {paymentMethodToUse === 'credit_card' ? `Payer ${formatCurrency(installmentToPay.amount)}` : mobileMoneyMethod === 'qr' ? 'Paiement effectué' : 'Recevoir le code OTP'}
                    {paymentMethodToUse === 'credit_card' ? <Lock size={18} /> : mobileMoneyMethod === 'qr' ? <CheckCircle size={18} /> : <ArrowRight size={18} />}
                  </button>
                  <div style={{ textAlign: "center", fontSize: "12px", color: "var(--gray-400)", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <ShieldCheck size={14} /> Transactions sécurisées et chiffrées de bout en bout
                  </div>
                </div>
              ) : paymentStep === 3 ? (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", textAlign: "center", padding: "16px 0" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255, 130, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF8200" }}>
                    <Smartphone size={32} />
                  </div>
                  
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "800", color: "var(--gray-900)" }}>Vérification OTP</h3>
                    <p style={{ margin: 0, color: "var(--gray-500)", fontSize: "14px", lineHeight: "1.5" }}>
                      Un code à 4 chiffres a été envoyé au <br />
                      <strong style={{ color: "var(--gray-800)" }}>+225 {paymentDetails.phoneNumber}</strong> par SMS.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", margin: "16px 0" }}>
                    <input 
                      type="text" 
                      maxLength={4} 
                      placeholder="••••"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      style={{ 
                        width: "120px", height: "56px", fontSize: "32px", letterSpacing: "8px", 
                        textAlign: "center", borderRadius: "12px", border: "2px solid var(--gray-300)", 
                        fontFamily: "monospace", outline: "none", transition: "border-color 0.2s",
                        borderColor: otpCode.length === 4 ? "var(--primary)" : "var(--gray-300)"
                      }} 
                    />
                  </div>
                  
                  {/* Toast Notification Simulation pour l'OTP */}
                  {showOtpToast && (
                    <div className="animate-slide-up" style={{ background: "var(--gray-900)", color: "white", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", marginBottom: "8px" }}>
                      <Smartphone size={16} color="#FF8200" />
                      <div>
                        Nouveau SMS reçu : "Votre code de validation est le <strong>{generatedOtp}</strong>. Ne le partagez avec personne."
                      </div>
                    </div>
                  )}

                  <button 
                    className="btn btn-primary" 
                    disabled={otpCode.length < 4}
                    style={{ width: "100%", padding: "14px", fontSize: "16px", fontWeight: "700", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", borderRadius: "12px", opacity: otpCode.length < 4 ? 0.5 : 1 }}
                    onClick={handleNextStep}
                  >
                    Confirmer et Payer
                  </button>
                  
                  <button style={{ background: "transparent", border: "none", color: "var(--gray-500)", fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}>
                    Renvoyer le code
                  </button>
                </div>
              ) : paymentStep === 4 ? (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center", padding: "24px 0" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: "8px" }}>
                    <Check size={40} strokeWidth={3} />
                  </div>
                  
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "900", color: "var(--gray-900)" }}>Paiement Réussi !</h3>
                    <p style={{ margin: 0, color: "var(--gray-500)", fontSize: "15px", lineHeight: "1.5" }}>
                      Votre encaissement de <strong style={{ color: "var(--gray-800)" }}>{formatCurrency(installmentToPay.amount)}</strong><br />a été validé avec succès.
                    </p>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: "100%", padding: "14px", marginTop: "24px", fontSize: "16px", fontWeight: "700", borderRadius: "12px" }}
                    onClick={closePaymentModal}
                  >
                    Terminer
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
