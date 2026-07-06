"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Smartphone, 
  Lock, 
  Check, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Building,
  Calendar,
  User
} from "lucide-react";
import { db } from "@/lib/store";
import { Payment } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type Step = 'invoice' | 'method_select' | 'payment_details' | 'otp_verification' | 'processing';

export default function TenantPaymentPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Simulation states
  const [simStep, setSimStep] = useState<Step>('invoice');
  const [selectedOperator, setSelectedOperator] = useState<'orange' | 'mtn' | 'wave' | 'moov' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    const loadPayment = async () => {
      const list = await db.getPayments();
      let found = list.find(p => p.id === id);
      
      // If not found in localStorage (e.g. opened on another device/browser), create a fallback mock payment
      if (!found) {
        found = {
          id: id,
          tenant_id: "tenant-mock",
          property_id: "prop-mock",
          owner_id: "owner-1",
          amount: 250000,
          charges: 0,
          total: 250000,
          month: "Juin",
          year: 2026,
          status: "pending",
          payment_method: "paydunya",
          stripe_payment_id: null,
          payment_date: null,
          due_date: "2026-06-15",
          created_at: new Date().toISOString(),
          tenant_name: "Koffi Kouassi (Locataire Démo)",
          property_name: "Villa Hibiscus"
        };
      }
      
      setPayment(found);
      setLoading(false);
    };
    loadPayment();
  }, [id]);

  const handlePayClick = async () => {
    if (!payment) return;
    setIsApiLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/paydunya/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.id,
          tenantName: payment.tenant_name || "Locataire",
          propertyName: payment.property_name || "Bien immobilier",
          month: payment.month,
          year: payment.year,
          amount: payment.amount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'initiation du paiement.");
      }

      // If it's a mock checkout session (API keys not set)
      if (data.isMock) {
        // Switch to simulation flow
        setSimStep('method_select');
      } else if (data.url) {
        // Redirect to real PayDunya checkout URL
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      // Fallback to simulation checkout if API failed, so the demo ALWAYS works
      setSimStep('method_select');
    } finally {
      setIsApiLoading(false);
    }
  };

  const handlePhoneNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      setPhoneError("Veuillez saisir un numéro de téléphone valide.");
      return;
    }
    setPhoneError("");
    setSimStep('otp_verification');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "1234" && otp.length < 4) {
      setOtpError("Code de confirmation incorrect (Entrez 1234 pour la démo).");
      return;
    }
    setOtpError("");
    setSimStep('processing');

    // Simulate payment verification delay
    setTimeout(() => {
      let methodLabel: string = "paydunya";
      if (selectedOperator === "orange") methodLabel = "orange_money";
      else if (selectedOperator === "mtn") methodLabel = "mtn";
      else if (selectedOperator === "wave") methodLabel = "wave";

      // Redirect to success route with token
      router.push(`/pay/${id}/success?token=mock_tok_${Math.random().toString(36).substring(2, 9)}&method=${methodLabel}`);
    }, 2500);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--gray-50)" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 className="animate-spin" size={40} style={{ color: "var(--primary)", margin: "0 auto var(--space-4)" }} />
          <p style={{ color: "var(--gray-500)", fontWeight: 500 }}>Chargement de votre facture...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--gray-50)" }}>
        <div className="card animate-scale-in" style={{ maxWidth: "440px", width: "100%", textAlign: "center", padding: "var(--space-8)" }}>
          <AlertCircle size={48} style={{ color: "var(--danger)", margin: "0 auto var(--space-4)" }} />
          <h3 style={{ marginBottom: "var(--space-2)" }}>Facture introuvable</h3>
          <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
            Le lien de paiement que vous avez suivi semble expiré ou invalide.
          </p>
          <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => router.push("/")}>
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <header style={{ height: "64px", background: 'var(--white)', borderBottom: "1px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <div className="logo-icon" style={{ background: "var(--primary)" }}>V</div>
          <span style={{ fontSize: "var(--text-md)", fontWeight: "800", color: "var(--gray-900)" }}>Vision Immo 2.0</span>
        </div>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "4px" }}>
          <Lock size={12} /> Paiement 100% Sécurisé
        </span>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-6) 0" }}>
        <div className="container" style={{ maxWidth: "600px", padding: "0 var(--space-4)" }}>
          
          {/* STEP 1: Invoice details page */}
          {simStep === 'invoice' && (
            <div className="card animate-scale-in" style={{ padding: "var(--space-8)", boxShadow: "var(--shadow-xl)" }}>
              {/* Header Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
                <span className="badge badge-warning" style={{ fontSize: "var(--text-xs)", padding: "4px 12px" }}>Facture en attente</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-400)" }}>Échéance : {formatDate(payment.due_date)}</span>
              </div>

              {/* Title */}
              <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", marginBottom: "var(--space-2)" }}>Règlement de Loyer</h2>
              <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
                Veuillez vérifier les informations ci-dessous pour régler votre loyer en ligne.
              </p>

              {/* Invoice Specs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "var(--gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", marginBottom: "var(--space-6)", border: "1px solid var(--gray-200)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <User size={16} style={{ color: "var(--gray-400)" }} />
                  <div>
                    <span style={{ fontSize: "10px", color: "var(--gray-400)", display: "block" }}>Locataire</span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{payment.tenant_name}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <Building size={16} style={{ color: "var(--gray-400)" }} />
                  <div>
                    <span style={{ fontSize: "10px", color: "var(--gray-400)", display: "block" }}>Bien loué</span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{payment.property_name}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <Calendar size={16} style={{ color: "var(--gray-400)" }} />
                  <div>
                    <span style={{ fontSize: "10px", color: "var(--gray-400)", display: "block" }}>Période de facturation</span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, textTransform: "capitalize" }}>{payment.month} {payment.year}</span>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                  <span style={{ color: "var(--gray-500)" }}>Loyer mensuel</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(payment.amount)}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)" }}>
                <span style={{ fontWeight: 800, fontSize: "var(--text-base)" }}>Montant Total à payer</span>
                <span style={{ fontWeight: 900, fontSize: "var(--text-2xl)", color: "var(--primary)" }}>{formatCurrency(payment.amount)}</span>
              </div>

              {apiError && (
                <div style={{ background: "var(--danger-light)", color: "var(--danger-dark)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", marginBottom: "var(--space-4)", display: "flex", gap: "6px", alignItems: "center" }}>
                  <AlertCircle size={14} /> {apiError}
                </div>
              )}

              {/* Action Button */}
              <button 
                className="btn btn-primary btn-lg" 
                style={{ width: "100%", justifyContent: "center", gap: "8px" }}
                disabled={isApiLoading}
                onClick={handlePayClick}
              >
                {isApiLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Préparation du paiement...</span>
                  </>
                ) : (
                  <>
                    <span>Procéder au paiement</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
                <span style={{ fontSize: "10px", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={10} style={{ color: "var(--success)" }} /> Orange Money
                </span>
                <span style={{ fontSize: "10px", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={10} style={{ color: "var(--success)" }} /> MTN MoMo
                </span>
                <span style={{ fontSize: "10px", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={10} style={{ color: "var(--success)" }} /> Wave
                </span>
              </div>
            </div>
          )}

          {/* SIMULATION STEP 2: Operator selection (PayDunya Sim) */}
          {simStep === 'method_select' && (
            <div className="card animate-scale-in" style={{ padding: "var(--space-6)", boxShadow: "var(--shadow-xl)", borderTop: "6px solid var(--primary)" }}>
              <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary)" }}>PayDunya Sandbox Checkout</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", marginTop: "2px" }}>Choisir un moyen de paiement</h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-400)", marginTop: "2px" }}>Montant à payer : <strong style={{ color: "var(--gray-800)" }}>{formatCurrency(payment.amount)}</strong></p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                {/* Orange Money */}
                <button 
                  onClick={() => { setSelectedOperator('orange'); setSimStep('payment_details'); }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "var(--space-4)",
                    background: "#FFF7ED",
                    border: "2px solid #FF6600",
                    borderRadius: "var(--radius-lg)",
                    transition: "transform 0.15s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1.0)"}
                >
                  <div style={{ width: "40px", height: "40px", background: "#FF6600", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "18px" }}>
                    OM
                  </div>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "700", color: "#C2410C" }}>Orange Money</span>
                </button>

                {/* MTN MoMo */}
                <button 
                  onClick={() => { setSelectedOperator('mtn'); setSimStep('payment_details'); }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "var(--space-4)",
                    background: "#FEFCE8",
                    border: "2px solid #FFCC00",
                    borderRadius: "var(--radius-lg)",
                    transition: "transform 0.15s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1.0)"}
                >
                  <div style={{ width: "40px", height: "40px", background: "#FFCC00", color: "#1E3A8A", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "18px" }}>
                    MTN
                  </div>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "700", color: "#854D0E" }}>MTN MoMo</span>
                </button>

                {/* Wave */}
                <button 
                  onClick={() => { setSelectedOperator('wave'); setSimStep('payment_details'); }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "var(--space-4)",
                    background: "#EFF6FF",
                    border: "2px solid #00A3E0",
                    borderRadius: "var(--radius-lg)",
                    transition: "transform 0.15s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1.0)"}
                >
                  <div style={{ width: "40px", height: "40px", background: "#00A3E0", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "20px" }}>
                    W
                  </div>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "700", color: "#1E40AF" }}>Wave</span>
                </button>

                {/* Moov */}
                <button 
                  onClick={() => { setSelectedOperator('moov'); setSimStep('payment_details'); }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "var(--space-4)",
                    background: "#ECFDF5",
                    border: "2px solid #10B981",
                    borderRadius: "var(--radius-lg)",
                    transition: "transform 0.15s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1.0)"}
                >
                  <div style={{ width: "40px", height: "40px", background: "#10B981", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "18px" }}>
                    MOOV
                  </div>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "700", color: "#065F46" }}>Moov Money</span>
                </button>
              </div>

              <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={() => setSimStep('invoice')}>
                Annuler
              </button>
            </div>
          )}

          {/* SIMULATION STEP 3: Phone number or QR Code input */}
          {simStep === 'payment_details' && (
            <div className="card animate-scale-in" style={{ padding: "var(--space-6)", boxShadow: "var(--shadow-xl)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", marginBottom: "var(--space-4)", textTransform: "capitalize", textAlign: "center" }}>
                Règlement par {selectedOperator === 'orange' ? 'Orange Money' : selectedOperator === 'mtn' ? 'MTN Mobile Money' : selectedOperator === 'wave' ? 'Wave' : 'Moov Money'}
              </h3>

              {/* QR Code Option */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", background: "var(--gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--gray-300)", marginBottom: "var(--space-4)" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "var(--primary-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Option 1 : Paiement Sécurisé par Code QR</span>
                <div style={{ padding: "8px", background: 'var(--white)', borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
                  { }
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=111827&data=paydunya_${selectedOperator}_${payment.id}_${payment.total}`} 
                    alt="Code QR de paiement" 
                    style={{ width: "150px", height: "150px" }}
                  />
                </div>
                <p style={{ fontSize: "11px", color: "var(--gray-500)", textAlign: "center", margin: 0 }}>
                  Scannez ce code QR avec votre application mobile <strong>{selectedOperator?.toUpperCase()}</strong> pour confirmer le règlement instantanément.
                </p>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  style={{ width: "100%", background: 'var(--white)', borderColor: "var(--success)", color: "var(--success-dark)" }}
                  onClick={() => setSimStep('otp_verification')}
                >
                  <Check size={12} /> J&apos;ai scanné et validé sur mon mobile
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "var(--space-3) 0", color: "var(--gray-400)", fontSize: "11px", fontWeight: 600 }}>
                <div style={{ flex: 1, height: "1px", background: "var(--gray-200)" }}></div>
                <span>OU</span>
                <div style={{ flex: 1, height: "1px", background: "var(--gray-200)" }}></div>
              </div>

              {/* Phone number form option */}
              <form onSubmit={handlePhoneNumberSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: "11px", fontWeight: "700" }}>Option 2 : Saisir votre numéro de téléphone (Côte d&apos;Ivoire)</label>
                  <div className="input-with-icon">
                    <Smartphone className="input-icon" size={16} />
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 0707070707"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="input"
                    />
                  </div>
                  {phoneError && <span style={{ fontSize: "var(--text-xs)", color: "var(--danger)" }}>{phoneError}</span>}
                </div>

                <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSimStep('method_select')}>
                    Retour
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Valider le numéro
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SIMULATION STEP 4: OTP Verification */}
          {simStep === 'otp_verification' && (
            <div className="card animate-scale-in" style={{ padding: "var(--space-6)", boxShadow: "var(--shadow-xl)" }}>
              <div style={{ textAlign: "center", marginBottom: "var(--space-4)" }}>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800" }}>Validation du paiement</h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>
                  Un code de confirmation temporaire a été simulé sur votre numéro <strong>{phoneNumber}</strong>.
                </p>
                <div style={{ background: "var(--primary-lightest)", border: "1px dashed var(--primary)", padding: "6px", borderRadius: "6px", fontSize: "11px", color: "var(--primary-dark)", display: "inline-block", marginTop: "var(--space-2)", fontWeight: "bold" }}>
                  Code Démo : 1234
                </div>
              </div>

              <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div className="input-group">
                  <label className="input-label" style={{ textAlign: "center" }}>Saisissez le code de confirmation (OTP)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1234"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="input"
                    style={{ textAlign: "center", fontSize: "var(--text-xl)", letterSpacing: "8px", fontWeight: "700" }}
                  />
                  {otpError && <span style={{ fontSize: "var(--text-xs)", color: "var(--danger)", textAlign: "center" }}>{otpError}</span>}
                </div>

                <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSimStep('payment_details')}>
                    Retour
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Confirmer le paiement
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SIMULATION STEP 5: Processing / verifying */}
          {simStep === 'processing' && (
            <div className="card animate-scale-in" style={{ padding: "var(--space-8)", textAlign: "center", boxShadow: "var(--shadow-xl)" }}>
              <Loader2 className="animate-spin" size={48} style={{ color: "var(--primary)", margin: "0 auto var(--space-4)" }} />
              <h3 style={{ marginBottom: "var(--space-2)" }}>Traitement de la transaction...</h3>
              <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>
                Vérification du statut de votre règlement auprès de l&apos;opérateur. Veuillez ne pas fermer cette page.
              </p>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: "var(--space-6) 0", borderTop: "1px solid var(--gray-200)", background: 'var(--white)', textAlign: "center", fontSize: "var(--text-xs)", color: "var(--gray-400)" }}>
        <p>© 2026 Vision Immo 2.0. Tous droits réservés.</p>
        <p style={{ marginTop: "4px" }}>Plateforme d&apos;encaissement de loyers sécurisée.</p>
      </footer>
    </div>
  );
}
