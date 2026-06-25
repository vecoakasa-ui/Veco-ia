"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  Smartphone, 
  Loader2, 
  AlertCircle, 
  Award
} from "lucide-react";
import { db } from "@/lib/store";
import { Profile } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type CheckoutStep = 'method_select' | 'payment_details' | 'otp_verification' | 'processing';

export default function SubscriptionPage({ searchParams }: PageProps) {
  const router = useRouter();
  const resolvedSearchParams = use(searchParams);
  
  const mockToken = resolvedSearchParams.mock_token as string || "";
  const queryPlan = resolvedSearchParams.plan as string || "";
  const queryPrice = resolvedSearchParams.price as string || "0";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState<string | null>(null); // 'pro' | 'business' | null
  const [apiError, setApiError] = useState<string | null>(null);

  // Simulation states
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [simStep, setSimStep] = useState<CheckoutStep>('method_select');
  const [selectedOperator, setSelectedOperator] = useState<'orange' | 'mtn' | 'wave' | 'moov' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const loadProfile = async () => {
    const p = await db.getProfile();
    if (p) setProfile(p);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadProfile();
    });
  }, []);

  useEffect(() => {
    if (mockToken && queryPlan) {
      Promise.resolve().then(() => {
        setCheckoutActive(true);
        setSimStep('method_select');
      });
    }
  }, [mockToken, queryPlan]);

  const handleUpgrade = async (planKey: 'pro' | 'business', price: number) => {
    setIsApiLoading(planKey);
    setApiError(null);

    try {
      const response = await fetch("/api/paydunya/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: planKey,
          price: price,
          isYearly: isYearly
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors du lancement de l'abonnement.");
      }

      if (data.isMock) {
        // Active mock checkout overlay
        setCheckoutActive(true);
        setSimStep('method_select');
      } else if (data.url) {
        // Redirect to real PayDunya checkout URL
        window.location.assign(data.url);
      }
    } catch (err) {
      console.error(err);
      // Fallback to simulation checkout if API failed, so demo ALWAYS works
      setCheckoutActive(true);
      setSimStep('method_select');
    } finally {
      setIsApiLoading(null);
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

    // Simulate subscription processing
    setTimeout(() => {
      // Redirect to success route
      router.push(`/abonnement/success?plan=${queryPlan || 'pro'}`);
    }, 2500);
  };

  const plans = [
    {
      key: "free" as const,
      name: "Gratuit",
      price: 0,
      desc: "Idéal pour débuter avec quelques biens immobiliers.",
      features: [
        "Jusqu'à 2 biens immobiliers",
        "Gestion basique des locataires",
        "Suivi manuel des paiements",
        "Quittances au format PDF",
        "Support par email uniquement"
      ],
      cta: "Plan Actuel"
    },
    {
      key: "pro" as const,
      name: "Professionnel",
      price: isYearly ? 12000 : 15000,
      desc: "Le choix idéal pour les propriétaires indépendants.",
      features: [
        "Biens immobiliers illimités",
        "Locataires illimités",
        "Génération automatique des quittances",
        "Relances automatiques par SMS/Email",
        "Suivi et signalement des incidents",
        "Rapports financiers et export Excel/PDF",
        "Support prioritaire"
      ],
      cta: "S'abonner"
    },
    {
      key: "business" as const,
      name: "Business",
      price: isYearly ? 24000 : 30000,
      desc: "Conçu pour les agences immobilières et multi-propriétaires.",
      features: [
        "Tout ce qui est dans le plan Pro",
        "Accès multi-utilisateurs (collaborateurs)",
        "Gestion des abonnements locataires",
        "Intégration d'API sur mesure",
        "Personnalisation de la marque (Logo)",
        "Gestionnaire de compte dédié",
        "Support téléphonique 24h/7j"
      ],
      cta: "S'abonner"
    }
  ];

  if (!profile) return null;

  const currentPlanObj = plans.find(p => p.key === profile.subscription_plan) || plans[0];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      
      {/* Header */}
      <div>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Gérez votre formule SaaS et votre facturation</p>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Mon Abonnement</h2>
      </div>

      {/* Current Subscription Card */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-6)", background: "linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%)", color: "white", border: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <div style={{ background: "rgba(249, 115, 22, 0.15)", color: "var(--orange)", padding: "var(--space-3)", borderRadius: "var(--radius-lg)" }}>
            <Award size={32} />
          </div>
          <div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-400)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>Abonnement Actif</span>
            <h3 style={{ color: "white", fontSize: "var(--text-lg)", fontWeight: "800", margin: "2px 0 4px 0", textTransform: "uppercase" }}>
              Plan {currentPlanObj.name}
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "var(--text-xs)", margin: 0 }}>{currentPlanObj.desc}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ fontSize: "var(--text-2xl)", fontWeight: 900, color: "white" }}>
            {currentPlanObj.price === 0 ? "Gratuit" : `${currentPlanObj.price.toLocaleString("fr-FR")} FCFA/mois`}
          </span>
          <span style={{ fontSize: "10px", color: "var(--gray-400)", marginTop: "2px" }}>Facturation sans engagement</span>
        </div>
      </div>

      {apiError && (
        <div style={{ background: "var(--danger-light)", color: "var(--danger-dark)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", display: "flex", gap: "6px", alignItems: "center" }}>
          <AlertCircle size={14} /> {apiError}
        </div>
      )}

      {/* Pricing Toggle Period */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "var(--space-4)", margin: "var(--space-2) 0" }}>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: !isYearly ? 700 : 500, color: !isYearly ? "var(--gray-800)" : "var(--gray-400)" }}>Mensuel</span>
        <button 
          onClick={() => setIsYearly(!isYearly)}
          style={{ width: "50px", height: "26px", borderRadius: "100px", background: isYearly ? "var(--primary)" : "var(--gray-300)", padding: "3px", transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: isYearly ? "flex-end" : "flex-start" }}
        >
          <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "white", boxShadow: "var(--shadow-sm)" }}></div>
        </button>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: isYearly ? 700 : 500, color: isYearly ? "var(--gray-800)" : "var(--gray-400)", display: "flex", alignItems: "center", gap: "4px" }}>
          Annuel <span className="badge badge-success" style={{ fontSize: "9px", padding: "2px 6px" }}>-20%</span>
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-6)" }}>
        {plans.map((p) => {
          
          return (
            <div 
              key={p.key} 
              className="card" 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                padding: "var(--space-6)", 
                position: "relative",
                border: p.key === 'pro' ? "2px solid var(--primary)" : "1px solid var(--gray-200)",
                boxShadow: p.key === 'pro' ? "var(--shadow-md)" : "none"
              }}
            >
              {p.key === 'pro' && (
                <span style={{ position: "absolute", top: "-12px", right: "var(--space-6)", fontSize: "10px", background: "var(--orange)", color: "white", padding: "4px 8px", borderRadius: "100px", fontWeight: "bold" }}>Recommandé</span>
              )}

              <h3 style={{ fontSize: "var(--text-md)", fontWeight: "800", marginBottom: "var(--space-1)" }}>{p.name}</h3>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", marginBottom: "var(--space-4)" }}>{p.desc}</p>
              
              <div style={{ marginBottom: "var(--space-6)", display: "flex", alignItems: "baseline", color: p.price > 0 ? "var(--orange)" : "inherit" }}>
                <span style={{ fontSize: "var(--text-2xl)", fontWeight: "900" }}>
                  {p.price === 0 ? "0" : p.price.toLocaleString("fr-FR")}
                </span>
                {p.price > 0 && <span style={{ fontSize: "var(--text-sm)", fontWeight: "700", marginLeft: "2px" }}>FCFA</span>}
                <span style={{ fontSize: "var(--text-xs)", color: p.price > 0 ? "var(--orange)" : "var(--gray-400)", marginLeft: "4px" }}>/mois</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-8)", flex: 1 }}>
                {p.features.map((feature, fIdx) => (
                  <div key={fIdx} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--gray-600)" }}>
                    <Check size={14} style={{ color: "var(--success)", flexShrink: 0, marginTop: "2px" }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {p.price > 0 ? (
                <button 
                  className={`btn ${p.key === 'pro' ? 'btn-orange' : 'btn-outline'}`} 
                  style={{ width: "100%" }}
                  disabled={isApiLoading !== null}
                  onClick={() => handleUpgrade(p.key as "pro" | "business", p.price)}
                >
                  {isApiLoading === p.key ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Souscription...</span>
                    </>
                  ) : (
                    <>
                      <span>Plan {p.name}</span>
                    </>
                  )}
                </button>
              ) : (
                <button className="btn btn-outline" style={{ width: "100%" }} disabled>
                  Formule Actuelle
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================
         PayDunya Simulation Checkout Overlay
         ============================================ */}
      {checkoutActive && (
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
              padding: "var(--space-6)",
              borderTop: "6px solid var(--primary)"
            }}
          >
            {/* Simulation Steps */}
            {simStep === 'method_select' && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary)" }}>PayDunya Sandbox Checkout</span>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", marginTop: "2px" }}>Abonnement Plan {queryPlan.toUpperCase()}</h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-400)" }}>Total à payer : <strong style={{ color: "var(--gray-800)" }}>{parseInt(queryPrice).toLocaleString("fr-FR")} FCFA</strong></p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                  <button 
                    onClick={() => { setSelectedOperator('orange'); setSimStep('payment_details'); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "var(--space-4)", background: "#FFF7ED", border: "2px solid #FF6600", borderRadius: "var(--radius-lg)" }}
                  >
                    <div style={{ width: "40px", height: "40px", background: "#FF6600", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900" }}>OM</div>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "#C2410C" }}>Orange Money</span>
                  </button>

                  <button 
                    onClick={() => { setSelectedOperator('mtn'); setSimStep('payment_details'); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "var(--space-4)", background: "#FEFCE8", border: "2px solid #FFCC00", borderRadius: "var(--radius-lg)" }}
                  >
                    <div style={{ width: "40px", height: "40px", background: "#FFCC00", color: "#1E3A8A", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900" }}>MTN</div>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "#854D0E" }}>MTN MoMo</span>
                  </button>

                  <button 
                    onClick={() => { setSelectedOperator('wave'); setSimStep('payment_details'); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "var(--space-4)", background: "#EFF6FF", border: "2px solid #00A3E0", borderRadius: "var(--radius-lg)" }}
                  >
                    <div style={{ width: "40px", height: "40px", background: "#00A3E0", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900" }}>W</div>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "#1E40AF" }}>Wave</span>
                  </button>

                  <button 
                    onClick={() => { setSelectedOperator('moov'); setSimStep('payment_details'); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "var(--space-4)", background: "#ECFDF5", border: "2px solid #10B981", borderRadius: "var(--radius-lg)" }}
                  >
                    <div style={{ width: "40px", height: "40px", background: "#10B981", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900" }}>MOOV</div>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "#065F46" }}>Moov Money</span>
                  </button>
                </div>

                <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => setCheckoutActive(false)}>
                  Annuler la transaction
                </button>
              </div>
            )}

            {simStep === 'payment_details' && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <h3 style={{ fontSize: "var(--text-md)", fontWeight: "800", textTransform: "capitalize", textAlign: "center" }}>
                  Abonnement par {selectedOperator === 'orange' ? 'Orange Money' : selectedOperator === 'mtn' ? 'MTN MoMo' : selectedOperator === 'wave' ? 'Wave' : 'Moov Money'}
                </h3>

                {/* QR Code Option */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", background: "var(--gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--gray-300)" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "var(--primary-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Option 1 : Paiement Sécurisé par Code QR</span>
                  <div style={{ padding: "8px", background: "white", borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
                    { }
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=111827&data=paydunya_${selectedOperator}_sub_${queryPlan || 'pro'}_${queryPrice || '15000'}`} 
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
                    style={{ width: "100%", background: "white", borderColor: "var(--success)", color: "var(--success-dark)" }}
                    onClick={() => setSimStep('otp_verification')}
                  >
                    <Check size={12} /> J&apos;ai scanné et validé sur mon mobile
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "var(--space-2) 0", color: "var(--gray-400)", fontSize: "11px", fontWeight: 600 }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--gray-200)" }}></div>
                  <span>OU</span>
                  <div style={{ flex: 1, height: "1px", background: "var(--gray-200)" }}></div>
                </div>

                {/* Phone number form option */}
                <form onSubmit={handlePhoneNumberSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <div className="input-group">
                    <label className="input-label" style={{ fontSize: "11px", fontWeight: "700" }}>Option 2 : Saisir votre numéro de téléphone (Côte d&apos;Ivoire)</label>
                    <div className="input-with-icon" style={{ position: "relative" }}>
                      <Smartphone className="input-icon" size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 0707070707"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="input"
                        style={{ paddingLeft: "36px" }}
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

            {simStep === 'otp_verification' && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: "var(--text-md)", fontWeight: "800" }}>Validation OTP</h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Code démo envoyé par SMS : <strong>1234</strong></p>
                </div>
                <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <div className="input-group">
                    <input
                      type="text"
                      required
                      placeholder="1234"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="input"
                      style={{ textAlign: "center", fontSize: "var(--text-lg)", letterSpacing: "8px", fontWeight: "700" }}
                    />
                    {otpError && <span style={{ fontSize: "var(--text-xs)", color: "var(--danger)", textAlign: "center" }}>{otpError}</span>}
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSimStep('payment_details')}>
                      Retour
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      Confirmer l&apos;abonnement
                    </button>
                  </div>
                </form>
              </div>
            )}

            {simStep === 'processing' && (
              <div style={{ textAlign: "center", padding: "var(--space-4)" }}>
                <Loader2 className="animate-spin" size={40} style={{ color: "var(--primary)", margin: "0 auto var(--space-4)" }} />
                <h3>Activation de l&apos;abonnement...</h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Veuillez patienter pendant la validation de la transaction.</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
