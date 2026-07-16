"use client";

 

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Building2,
  Users,
  FileText,
  BarChart3,
  Check,
  ArrowRight,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Loader2,
  Smartphone,
  ArrowUp,
  Calendar,
  ChevronDown,
  HelpCircle,
  Star
} from "lucide-react";



function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mockToken = searchParams?.get("mock_token") || "";
  const queryPlan = searchParams?.get("plan") || "";
  const queryPrice = searchParams?.get("price") || "0";

  const [isYearly, setIsYearly] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulation states
  const [isApiLoading, setIsApiLoading] = useState<string | null>(null);
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [simStep, setSimStep] = useState<'method_select' | 'payment_details' | 'otp_verification' | 'processing'>('method_select');
  const [selectedOperator, setSelectedOperator] = useState<'orange' | 'mtn' | 'wave' | 'moov' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (mockToken && queryPlan) {
      Promise.resolve().then(() => {
        setCheckoutActive(true);
        setSelectedPlan(queryPlan);
        setSelectedPrice(parseInt(queryPrice));
        setSimStep('method_select');
      });
    }
  }, [mockToken, queryPlan, queryPrice]);

  const handlePlanClick = async (planKey: string, price: number) => {
    if (planKey === 'free') {
      router.push('/register?plan=free');
      return;
    }
    setIsApiLoading(planKey);
    try {
      const response = await fetch("/api/paydunya/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: planKey,
          price: price,
          isYearly: isYearly,
          isSignup: true
        })
      });

      const data = await response.json();

      if (data.isMock) {
        setCheckoutActive(true);
        setSelectedPlan(planKey);
        setSelectedPrice(price);
        setSimStep('method_select');
      } else if (data.url) {
        window.location.assign(data.url);
      }
    } catch {
      setCheckoutActive(true);
      setSelectedPlan(planKey);
      setSelectedPrice(price);
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

    setTimeout(() => {
      router.push(`/register?plan=${selectedPlan}&status=success`);
    }, 2500);
  };

  // Pricing plans helper
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
      popular: false,
      cta: "Commencer gratuitement",
      color: "var(--gray-600)"
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
      popular: true,
      cta: "Plan Professionnel",
      color: "var(--primary)"
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
        "Personnalisation de la marque (Logo & Couleurs)",
        "Gestionnaire de compte dédié",
        "Support téléphonique 24h/7j"
      ],
      popular: false,
      cta: "Plan Business",
      color: "var(--gray-900)"
    }
  ];

  return (
    <div className="animate-fade-in" style={{ overflowX: 'hidden' }}>
      {/* ============================================
         Header / Navbar
         ============================================ */}
      <header className="navbar">
        <div className="container navbar-container">
          <Link href="/" className="logo-text" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              { }
              <img src="/logo.png" alt="Vision Immo 2.0 Logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: '900', letterSpacing: '-0.02em', color: "var(--gray-900)" }}>
              Vision Immo<span className="text-orange"> 2.0</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="navbar-menu hide-mobile">
            <Link href="/explorer" className="navbar-link" style={{ fontWeight: 'bold', color: 'var(--orange)' }}>Biens Disponibles</Link>
            <a href="#about" className="navbar-link">À propos</a>
            <a href="#services" className="navbar-link">Nos services</a>
            <a href="#why-us" className="navbar-link">Pourquoi nous choisir</a>
            <Link href="/abonnement" className="navbar-link">Tarifs</Link>
            <a href="#contact" className="navbar-link">Contact</a>
          </nav>

          <div className="navbar-actions hide-mobile">
            <Link href="/login" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>
              Connexion
            </Link>
            <Link href="/register" className="btn btn-orange" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: '600' }}>
              S'inscrire <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="btn btn-ghost hide-desktop" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            style={{ padding: '8px' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div 
            className="hide-desktop animate-scale-in"
            style={{
              position: 'absolute',
              top: 'var(--navbar-height)',
              left: 0,
              width: '100%',
              background: 'var(--white)',
              borderBottom: '1px solid var(--gray-200)',
              padding: 'var(--space-6) var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 99
            }}
          >
            <Link 
              href="/explorer" 
              className="navbar-link" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-2) 0', fontWeight: 'bold', color: 'var(--orange)' }}
            >
              Biens Disponibles
            </Link>
            <a 
              href="#about" 
              className="navbar-link" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-2) 0' }}
            >
              À propos
            </a>
            <a 
              href="#services" 
              className="navbar-link" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-2) 0' }}
            >
              Nos services
            </a>
            <a 
              href="#why-us" 
              className="navbar-link" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-2) 0' }}
            >
              Pourquoi nous choisir
            </a>
            <Link 
              href="/abonnement" 
              className="navbar-link" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-2) 0' }}
            >
              Tarifs
            </Link>
            <a 
              href="#contact" 
              className="navbar-link" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-2) 0' }}
            >
              Contact
            </a>
            <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: 'var(--space-2) 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Link href="/login" className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                Connexion
              </Link>
              <Link href="/register" className="btn btn-orange" style={{ width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                S'inscrire
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ============================================
         Pricing Section (SaaS Integration)
         ============================================ */}
      <section id="pricing" className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="section-label">Tarifs</span>
          <h2 className="section-title">Choisissez le plan adapté à vos besoins</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Tous nos plans incluent les fonctionnalités fondamentales de gestion. Sans engagement de durée.
          </p>
        </div>

        {/* Pricing Toggle Billing Period */}
        <div className="pricing-toggle-container">
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: isYearly ? 500 : 700, color: isYearly ? 'var(--gray-500)' : 'var(--gray-900)' }}>Mensuel</span>
          <div 
            className={`toggle-switch ${isYearly ? 'annual-active' : ''}`}
            onClick={() => setIsYearly(!isYearly)}
          >
            <div className="toggle-slider"></div>
            <div className={`toggle-option ${!isYearly ? 'active' : ''}`}>Facturé au mois</div>
            <div className={`toggle-option ${isYearly ? 'active' : ''}`}>Annuel (-20%)</div>
          </div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: isYearly ? 700 : 500, color: isYearly ? 'var(--gray-900)' : 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Annuel <span className="badge badge-success" style={{ fontSize: '9px', padding: '2px 6px' }}>Économie</span>
          </span>
        </div>

        <div className="container grid-3">
          {plans.map((plan, index) => (
            <div key={index} className={`card pricing-card ${plan.popular ? 'popular' : ''}`} style={plan.popular ? { borderColor: 'var(--orange)', boxShadow: 'var(--shadow-lg)' } : {}}>
              {plan.popular && <span className="pricing-badge" style={{ background: 'var(--orange)' }}>Populaire</span>}
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>{plan.name}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>{plan.desc}</p>
              
              <div className="price-box">
                <span className="price-amount">
                  {plan.price === 0 ? "0" : plan.price.toLocaleString("fr-FR")}
                </span>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--gray-900)', marginLeft: '2px' }}>
                  {plan.price > 0 && " FCFA"}
                </span>
                <span className="price-period">/mois</span>
              </div>

              <div className="pricing-features">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="pricing-feature-item">
                    <Check size={16} className="pricing-feature-icon" style={{ color: 'var(--primary)' }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                type="button"
                className={`btn ${plan.popular ? 'btn-orange' : 'btn-outline'}`}
                style={{ width: '100%', marginTop: 'auto', display: 'flex', justifyContent: 'center' }}
                onClick={() => handlePlanClick(plan.key, plan.price)}
                disabled={isApiLoading !== null}
              >
                {isApiLoading === plan.key ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Redirection...</span>
                  </>
                ) : (
                  <span>{plan.cta}</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
         Footer Section
         ============================================ */}
      <footer className="gestimmo-footer">
        <div className="container footer-grid">
          <div>
            <div className="gestimmo-footer-logo-title">Vision Immo 2.0</div>
            <p className="footer-desc">
              SAS spécialisée dans la gestion immobilière en Côte d&apos;Ivoire. Notre mission est de vous offrir des solutions fiables et performantes pour la gestion de vos biens.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <span className="footer-social-badge" style={{ cursor: 'pointer' }}>f</span>
              <span className="footer-social-badge" style={{ cursor: 'pointer' }}>in</span>
              <span className="footer-social-badge" style={{ cursor: 'pointer' }}>w</span>
              <span className="footer-social-badge" style={{ cursor: 'pointer' }}>ig</span>
            </div>
          </div>

          <div>
            <h4 className="gestimmo-footer-title">Liens rapides</h4>
            <div className="footer-links">
              <a href="#about" className="footer-link">À propos</a>
              <a href="#services" className="footer-link">Nos services</a>
              <a href="#why-us" className="footer-link">Pourquoi nous choisir</a>
              <Link href="/abonnement" className="footer-link">Tarifs</Link>
              <Link href="/marketing" className="footer-link">Stratégie Pitch</Link>
              <a href="#contact" className="footer-link">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="gestimmo-footer-title">Nos services</h4>
            <div className="footer-links">
              <a href="#services" className="footer-link">Gestion locative</a>
              <a href="#services" className="footer-link">Gestion technique</a>
              <a href="#services" className="footer-link">Gestion administrative</a>
              <a href="#services" className="footer-link">Gestion financière</a>
              <a href="#services" className="footer-link">Conseil & valorisation</a>
            </div>
          </div>

          <div>
            <h4 className="gestimmo-footer-title">Contactez-nous</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} className="text-orange" />
                <span>+225 07 48 11 09 42</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} className="text-orange" />
                <span>djafe247@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={14} className="text-orange" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>Yamoussoukro, Côte d&apos;Ivoire</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p>© {new Date().getFullYear()} Vision Immo 2.0. Tous droits réservés.</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Abidjan • Yamoussoukro • Bouaké • San-Pédro • Korhogo
          </p>
        </div>
      </footer>

      {/* ============================================
         PayDunya Simulation Checkout Overlay for Landing Page
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
            zIndex: 1000,
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
              padding: "var(--space-6)",
              borderTop: "6px solid var(--primary)",
              color: "var(--gray-800)"
            }}
          >
            {simStep === 'method_select' && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary)" }}>PayDunya Sandbox Checkout</span>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", marginTop: "2px", color: "var(--gray-900)" }}>Abonnement Plan {selectedPlan.toUpperCase()}</h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-400)" }}>Total à payer : <strong style={{ color: "var(--gray-800)" }}>{selectedPrice.toLocaleString("fr-FR")} FCFA</strong></p>
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
                <h3 style={{ fontSize: "var(--text-md)", fontWeight: "800", textTransform: "capitalize", textAlign: "center", color: "var(--gray-900)" }}>
                  Abonnement par {selectedOperator === 'orange' ? 'Orange Money' : selectedOperator === 'mtn' ? 'MTN MoMo' : selectedOperator === 'wave' ? 'Wave' : 'Moov Money'}
                </h3>

                {/* QR Code Option */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", background: "var(--gray-50)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--gray-300)" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Option 1 : Paiement Sécurisé par Code QR</span>
                  <div style={{ padding: "8px", background: 'var(--white)', borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
                    { }
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=111827&data=paydunya_${selectedOperator}_sub_${selectedPlan || 'pro'}_${selectedPrice || '15000'}`} 
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
                  <h3 style={{ fontSize: "var(--text-md)", fontWeight: "800", color: "var(--gray-900)" }}>Validation OTP</h3>
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
                <h3 style={{ color: "var(--gray-900)" }}>Activation de l&apos;abonnement...</h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Veuillez patienter pendant la validation de la transaction.</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ display: "flex", height: "100vh", width: "100%", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin text-primary" size={32} /></div>}>
      <HomeContent />
    </Suspense>
  );
}
