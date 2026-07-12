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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '8px', fontWeight: 'bold' }}>
              <Building2 size={20} className="text-orange" />
            </div>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: '900', letterSpacing: '-0.02em' }}>
              Vision Immo<span className="text-orange"> 2.0</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="navbar-menu hide-mobile">
            <Link href="/explorer" className="navbar-link" style={{ fontWeight: 'bold', color: 'var(--orange)' }}>Biens Disponibles</Link>
            <a href="#about" className="navbar-link">À propos</a>
            <a href="#services" className="navbar-link">Nos services</a>
            <a href="#why-us" className="navbar-link">Pourquoi nous choisir</a>
            <a href="#pricing" className="navbar-link">Tarifs</a>
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
            <a 
              href="#pricing" 
              className="navbar-link" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-2) 0' }}
            >
              Tarifs
            </a>
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
         Hero Section
         ============================================ */}
      <section 
        className="hero-section"
        style={{
          background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--gray-200) 100%)',
          paddingTop: 'calc(var(--navbar-height) + var(--space-20))',
          paddingBottom: 'var(--space-24)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center' }}>
          
          {/* Left Column : Text */}
          <div className="hero-content animate-fade-in-up" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            {/* Dotted pattern behind "Solution N°1" */}
            <div style={{ position: 'absolute', top: '-30px', left: '-20px', width: '120px', height: '120px', backgroundImage: 'radial-gradient(var(--gray-400) 2px, transparent 2px)', backgroundSize: '16px 16px', opacity: 0.3, zIndex: -1, borderRadius: '50%' }}></div>

            {/* Faint Phone Mockup Background */}
            <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', opacity: 0.04, zIndex: -1, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
              <Smartphone size={320} strokeWidth={0.75} color="var(--gray-900)" />
              <MapPin size={36} style={{ position: 'absolute', top: '25%', left: '35%', color: 'var(--gray-900)' }} />
              <MapPin size={24} style={{ position: 'absolute', top: '45%', right: '35%', color: 'var(--gray-900)' }} />
              <MapPin size={48} style={{ position: 'absolute', top: '65%', left: '25%', color: 'var(--gray-900)' }} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--white)', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'var(--gray-900)', fontSize: 'var(--text-xs)', fontWeight: '700', marginBottom: 'var(--space-6)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ display: 'inline-flex', width: '16px', height: '12px', background: 'linear-gradient(to right, #E25822 33.3%, white 33.3%, white 66.6%, #0A3D2A 66.6%)', borderRadius: '1px' }}></span>
              Solution N°1 en Afrique
            </div>
            
            <h1 className="hero-title" style={{ color: 'var(--gray-900)', fontSize: 'calc(var(--text-4xl) + 1vw)', fontWeight: '900', lineHeight: 1.15, marginBottom: 'var(--space-6)', letterSpacing: '-0.03em' }}>
              Concentrez-vous sur vos revenus. <span style={{ color: 'var(--orange)' }}>Nous gérons le reste.</span>
            </h1>
            
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--gray-600)', lineHeight: 1.65, marginBottom: 'var(--space-8)' }}>
              La plateforme SaaS premium pour automatiser la gestion immobilière. Multipliez vos revenus, éliminez les impayés et sécurisez vos investissements grâce aux paiements Mobile Money et à notre intelligence artificielle.
            </p>
            
            <div className="hero-buttons hide-mobile" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <a href="/register" className="btn btn-orange pulse-btn" style={{ padding: '12px 28px', fontSize: 'var(--text-base)', fontWeight: '700', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderRadius: 'var(--radius-lg)' }}>
                <Calendar size={18} /> Demander une démo
              </a>
              <a href="#services" className="btn" style={{ padding: '12px 28px', fontSize: 'var(--text-base)', fontWeight: '700', background: 'var(--white)', color: 'var(--gray-900)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                Commencer gratuitement
              </a>
            </div>
          </div>

          {/* Right Column : Image with animations */}
          <div className="hero-image-wrapper" style={{ position: 'relative', display: 'flex', justifyContent: 'center', animation: 'float 6s ease-in-out infinite' }}>
            <img 
              src="/hero-immo-mockup.png" 
              alt="Vision Immo 2.0 Mockup" 
              style={{ width: '100%', maxWidth: '380px', height: 'auto', filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))', borderRadius: '24px', zIndex: 2, position: 'relative' }} 
            />
            {/* Floating badges for extra animation */}
            <div className="floating-badge badge-left" style={{ position: 'absolute', top: '10%', left: '-15%', background: 'var(--white)', padding: '12px 16px', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 5s ease-in-out infinite reverse', zIndex: 3 }}>
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px', borderRadius: '50%' }}><Check size={20} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>Paiement reçu</p>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--gray-900)', fontWeight: 800 }}>+ 150 000 FCFA</p>
              </div>
            </div>
            
            <div className="floating-badge badge-right" style={{ position: 'absolute', bottom: '15%', right: '-15%', background: 'var(--white)', padding: '12px 16px', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 7s ease-in-out infinite', zIndex: 3 }}>
              <div style={{ background: '#fef3c7', color: '#d97706', padding: '8px', borderRadius: '50%' }}><Sparkles size={20} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>Locataire satisfait</p>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--gray-900)', fontWeight: 800 }}>Quittance envoyée</p>
              </div>
            </div>

            {/* Location pins */}
            <div className="floating-pin" style={{ position: 'absolute', top: '30%', right: '5%', background: '#16a34a', color: 'white', padding: '6px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(22, 163, 74, 0.4)', animation: 'float 4s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
              <MapPin size={16} fill="white" />
            </div>
            <div className="floating-pin" style={{ position: 'absolute', bottom: '35%', left: '0%', background: '#f97316', color: 'white', padding: '6px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(249, 115, 22, 0.4)', animation: 'float 5s ease-in-out infinite reverse', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
              <MapPin size={16} fill="white" />
            </div>
          </div>

          {/* Mobile Buttons : Shown only on mobile below the image */}
          <div className="hero-buttons hide-desktop" style={{ display: 'none', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
            <a href="/register" className="btn btn-orange pulse-btn" style={{ padding: '12px 28px', fontSize: 'var(--text-base)', fontWeight: '700', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderRadius: 'var(--radius-lg)' }}>
              <Calendar size={18} /> Demander une démo
            </a>
            <a href="#services" className="btn" style={{ padding: '12px 28px', fontSize: 'var(--text-base)', fontWeight: '700', background: 'var(--white)', color: 'var(--gray-900)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              Commencer gratuitement
            </a>
          </div>

        </div>
        
        {/* CSS for float and mobile responsiveness */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          @keyframes pulse-btn-anim {
            0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.6); }
            70% { box-shadow: 0 0 0 15px rgba(249, 115, 22, 0); }
            100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
          }
          .pulse-btn {
            animation: pulse-btn-anim 2s infinite;
          }
          @media (max-width: 992px) {
            .hero-section .container {
              grid-template-columns: 1fr !important;
              gap: var(--space-8) !important;
            }
            .hide-mobile {
              display: none !important;
            }
            .hide-desktop {
              display: flex !important;
            }
            .hero-content {
              align-items: center !important;
              text-align: center !important;
            }
            .hero-title {
              font-size: var(--text-4xl) !important;
            }
            .hero-buttons {
              justify-content: center !important;
            }
            .hero-image-wrapper {
              margin-top: 1rem;
              padding: 0 1rem;
            }
            .hero-image-wrapper img {
              max-width: 90% !important;
            }
            /* Adjust badges so they don't overflow screen horizontally */
            .badge-left {
              left: -5% !important;
              transform: scale(0.85);
              transform-origin: left center;
            }
            .badge-right {
              right: -5% !important;
              transform: scale(0.85);
              transform-origin: right center;
            }
            .floating-pin {
              transform: scale(0.9);
            }
          }
          @media (max-width: 480px) {
            .badge-left {
              top: 5% !important;
              left: 5% !important;
              transform: scale(0.75);
            }
            .badge-right {
              bottom: 10% !important;
              right: 5% !important;
              transform: scale(0.75);
            }
          }
        `}} />
      </section>

      {/* Values Banner overlapping hero */}
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="values-banner-marquee animate-scale-in">
          <div className="marquee-content">
            {/* Group 1 */}
            <div className="marquee-group">
              <div className="value-item">
                <div className="value-icon-wrapper">
                  <Smartphone size={18} />
                </div>
                <div>
                  <div className="value-title">Paiements Mobile</div>
                  <div className="value-desc">Intégration PayDunya & Mobile Money.</div>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon-wrapper">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="value-title">Quittances Auto</div>
                  <div className="value-desc">Reçus générés et envoyés instantanément.</div>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon-wrapper">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <div className="value-title">Temps Réel</div>
                  <div className="value-desc">Tableau de bord financier en direct.</div>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon-wrapper">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="value-title">100% Adapté CI</div>
                  <div className="value-desc">Conçu pour l'immobilier ivoirien.</div>
                </div>
              </div>
            </div>

            {/* Group 2 (Duplicate for seamless infinite marquee scroll) */}
            <div className="marquee-group">
              <div className="value-item">
                <div className="value-icon-wrapper">
                  <Smartphone size={18} />
                </div>
                <div>
                  <div className="value-title">Paiements Mobile</div>
                  <div className="value-desc">Intégration PayDunya & Mobile Money.</div>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon-wrapper">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="value-title">Quittances Auto</div>
                  <div className="value-desc">Reçus générés et envoyés instantanément.</div>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon-wrapper">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <div className="value-title">Temps Réel</div>
                  <div className="value-desc">Tableau de bord financier en direct.</div>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon-wrapper">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="value-title">100% Adapté CI</div>
                  <div className="value-desc">Conçu pour l'immobilier ivoirien.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
         About Us Section
         ============================================ */}
      <section id="about" className="section" style={{ background: 'var(--white)', paddingTop: 'var(--space-24)' }}>
        <div className="container about-grid">
          <div className="animate-slide-in-left">
            <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} className="text-orange" /> FINI LES IMPAYÉS ET LE PAPIER
            </span>
            <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', margin: 'var(--space-3) 0 var(--space-6) 0', color: 'var(--gray-900)' }}>
              La fin du stress pour les <span style={{ color: 'var(--orange)' }}>gestionnaires</span>{" "}immobiliers
            </h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)', lineHeight: 1.65 }}>
              <strong>Avant Vision Immo 2.0 :</strong> Vous courriez après les locataires pour les loyers, vous perdiez du temps à écrire des reçus papier, et les erreurs de comptabilité plombaient votre rentabilité (jusqu'à 20% de pertes !).
            </p>
            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-base)', lineHeight: 1.65 }}>
              <strong>Avec Vision Immo 2.0 :</strong> Vos loyers sont payés via Mobile Money, vos quittances sont générées automatiquement, vos incidents sont centralisés, et vous suivez la rentabilité de vos biens en temps réel depuis votre téléphone.
            </p>
            <a href="#contact" className="btn btn-green-to-white" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              En savoir plus sur nous <ArrowRight size={16} />
            </a>
          </div>

          <div className="animate-scale-in" style={{ position: 'relative', width: '100%', height: 'auto', display: 'flex', justifyContent: 'center' }}>
            { }
            <img 
              src="/gestimmo_about_img.png" 
              alt="Salon chic Gestimmo" 
              className="about-image-3d"
            />
            {/* Floating badge on image */}
            <div className="about-badge-floating hide-mobile">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '8px' }}>
                <Users size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: '800' }}>+100</span>
                <span style={{ fontSize: '9px', fontWeight: '600', lineHeight: 1.2 }}>biens gérés avec succès en Côte d&apos;Ivoire</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
         Services Section
         ============================================ */}
      <section id="services" className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span className="section-label">Fonctionnalités Clés</span>
          <h2 className="section-title">
            Tout ce dont vous avez besoin, dans un seul <span className="text-orange underline-green">logiciel</span>
          </h2>
        </div>

        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
          {/* Card 1 */}
          <div className="service-card">
            <div className="service-icon-wrapper">
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>Tableau de bord financier</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
              Suivi des revenus, relances automatiques et taux d'occupation de votre parc immobilier en temps réel.
            </p>
            <a href="#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--orange)', marginTop: 'auto' }}>
              Découvrir les plans <ArrowRight size={12} />
            </a>
          </div>

          {/* Card 2 */}
          <div className="service-card">
            <div className="service-icon-wrapper">
              <Smartphone size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>Paiement Mobile Money</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
              Intégration native PayDunya. Vos locataires paient avec Orange, MTN, Wave sans se déplacer.
            </p>
            <a href="#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--orange)', marginTop: 'auto' }}>
              Découvrir les plans <ArrowRight size={12} />
            </a>
          </div>

          {/* Card 3 */}
          <div className="service-card">
            <div className="service-icon-wrapper">
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>Quittances automatiques</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
              Fini les carnets à souche. À chaque paiement, une quittance dématérialisée est générée et envoyée.
            </p>
            <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--orange)', marginTop: 'auto' }}>
              En savoir plus <ArrowRight size={12} />
            </a>
          </div>

          {/* Card 4 */}
          <div className="service-card">
            <div className="service-icon-wrapper">
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>Tickets d'incidents</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
              Les locataires peuvent signaler une fuite ou une panne directement depuis l'application avec photos.
            </p>
            <a href="#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--orange)', marginTop: 'auto' }}>
              Découvrir les plans <ArrowRight size={12} />
            </a>
          </div>

          {/* Card 5 */}
          <div className="service-card">
            <div className="service-icon-wrapper">
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>Portail Locataire & Propriétaire</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
              Chaque acteur a son espace personnalisé pour une transparence et une confiance maximales.
            </p>
            <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--orange)', marginTop: 'auto' }}>
              En savoir plus <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================
         Why Choose Us Section
         ============================================ */}
      <section id="why-us" className="section" style={{ background: 'var(--white)' }}>
        <div className="container about-grid">
          <div className="animate-slide-in-left">
            <span className="section-label">Pourquoi nous choisir ?</span>
            <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', margin: 'var(--space-3) 0 var(--space-6) 0', color: 'var(--gray-900)' }}>
              L&apos;expertise locale, la performance au cœur de notre <span className="text-orange underline-green">engagement.</span>
            </h2>
            
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                "Une équipe expérimentée et réactive",
                "Une connaissance approfondie du marché ivoirien",
                "Des outils digitaux pour un suivi en temps réel",
                "Un engagement pour votre tranquillité d&apos;esprit"
              ].map((item, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-base)', color: 'var(--gray-700)', fontWeight: '500' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-lighter)', color: 'var(--primary)', borderRadius: '50%', padding: '4px' }}>
                    <Check size={16} />
                  </div>
                  <span dangerouslySetInnerHTML={{ __html: item }}></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="why-us-image-wrapper" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'float 6s ease-in-out infinite', padding: 'var(--space-8) 0' }}>
            {/* Background decorative shape */}
            <div style={{ position: 'absolute', width: '350px', height: '350px', background: 'linear-gradient(135deg, #f9731633 0%, #16a34a33 100%)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 0 }}></div>
            
            <img 
              src="/dashboard-mockup.png" 
              alt="Vision Immo 2.0 Dashboard" 
              style={{ width: '100%', maxWidth: '440px', height: 'auto', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', zIndex: 1, position: 'relative', border: '6px solid var(--white)' }}
            />
            
            {/* Floating Stat 1 */}
            <div className="floating-stat-card" style={{ position: 'absolute', top: '5%', right: '-5%', background: 'var(--white)', padding: '12px 16px', borderRadius: '16px', boxShadow: 'var(--shadow-xl)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 5s ease-in-out infinite reverse', zIndex: 2 }}>
              <div style={{ background: '#ffedd5', color: '#ea580c', padding: '10px', borderRadius: '50%' }}><Building2 size={24} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '18px', color: 'var(--gray-900)', fontWeight: 900 }}>+100</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>Biens gérés</p>
              </div>
            </div>

            {/* Floating Stat 2 */}
            <div className="floating-stat-card" style={{ position: 'absolute', bottom: '25%', left: '-10%', background: 'var(--white)', padding: '12px 16px', borderRadius: '16px', boxShadow: 'var(--shadow-xl)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 7s ease-in-out infinite', zIndex: 2 }}>
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '50%' }}><Users size={24} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '18px', color: 'var(--gray-900)', fontWeight: 900 }}>+80</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>Clients satisfaits</p>
              </div>
            </div>
            
            {/* Floating Stat 3 */}
            <div className="floating-stat-card" style={{ position: 'absolute', bottom: '-5%', right: '15%', background: 'var(--white)', padding: '12px 16px', borderRadius: '16px', boxShadow: 'var(--shadow-xl)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'float 4s ease-in-out infinite reverse', zIndex: 2 }}>
              <div style={{ background: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '50%' }}><Clock size={24} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '18px', color: 'var(--gray-900)', fontWeight: 900 }}>+5 Ans</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>D&apos;expérience</p>
              </div>
            </div>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 992px) {
            .floating-stat-card {
              transform: scale(0.8);
            }
            .why-us-image-wrapper {
              margin-top: var(--space-8);
            }
          }
          @media (max-width: 480px) {
            .floating-stat-card {
              transform: scale(0.7);
            }
          }
        `}} />
      </section>

      {/* ============================================
         Testimonials Section
         ============================================ */}
      <section id="testimonials" className="section" style={{ background: 'var(--white)', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span className="section-label">Avis Clients</span>
            <h2 className="section-title">Ce qu'ils pensent de Vision Immo 2.0</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Découvrez les retours des propriétaires et agences qui utilisent notre solution au quotidien.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)', position: 'relative' }}>
            {/* Background decorative element */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(22,163,74,0.1) 0%, transparent 60%)', zIndex: 0, animation: 'float 8s ease-in-out infinite' }}></div>
            
            {/* Review 1 */}
            <div className="testimonial-card" style={{ position: 'relative', zIndex: 1, background: 'var(--white)', padding: 'var(--space-6)', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', transform: 'perspective(1000px) rotateY(5deg)', transition: 'all 0.5s ease' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: 'var(--space-4)' }}>
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
              </div>
              <p style={{ fontSize: 'var(--text-md)', color: 'var(--gray-700)', lineHeight: 1.6, marginBottom: 'var(--space-6)', fontStyle: 'italic' }}>
                "Depuis que j'utilise Vision Immo 2.0, la gestion de mes 15 appartements est devenue un jeu d'enfant. Les quittances automatiques sont un vrai gain de temps."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }}>
                  A
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: '800', color: 'var(--gray-900)' }}>Amadou K.</h4>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="var(--orange)" /> Abidjan, Cocody
                  </p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="testimonial-card" style={{ position: 'relative', zIndex: 2, background: 'var(--white)', padding: 'var(--space-6)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)', transform: 'perspective(1000px) scale(1.05)', transition: 'all 0.5s ease' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: 'var(--space-4)' }}>
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
              </div>
              <p style={{ fontSize: 'var(--text-md)', color: 'var(--gray-700)', lineHeight: 1.6, marginBottom: 'var(--space-6)', fontStyle: 'italic' }}>
                "L'intégration des paiements par Mobile Money a révolutionné notre agence. Nos locataires paient plus vite et sans se déplacer."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', fontWeight: 'bold', fontSize: '20px' }}>
                  S
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: '800', color: 'var(--gray-900)' }}>Sarah M.</h4>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="var(--primary)" /> Yamoussoukro
                  </p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="testimonial-card" style={{ position: 'relative', zIndex: 1, background: 'var(--white)', padding: 'var(--space-6)', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', transform: 'perspective(1000px) rotateY(-5deg)', transition: 'all 0.5s ease' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: 'var(--space-4)' }}>
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
              </div>
              <p style={{ fontSize: 'var(--text-md)', color: 'var(--gray-700)', lineHeight: 1.6, marginBottom: 'var(--space-6)', fontStyle: 'italic' }}>
                "Le tableau de bord est super intuitif. En un coup d'œil, je vois les loyers impayés et j'envoie des relances automatiques."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontWeight: 'bold', fontSize: '20px' }}>
                  M
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: '800', color: 'var(--gray-900)' }}>Marc T.</h4>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="#fbbf24" /> San-Pédro
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .testimonial-card:hover {
            transform: perspective(1000px) rotateY(0deg) scale(1.08) !important;
            box-shadow: 0 30px 60px -15px rgba(0,0,0,0.15) !important;
            z-index: 10 !important;
          }
          @media (max-width: 992px) {
            .testimonial-card {
              transform: none !important;
            }
            .testimonial-card:hover {
              transform: translateY(-10px) !important;
            }
          }
        `}} />
      </section>

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
         CTA Banner Section
         ============================================ */}
      <section className="container section">
        <div className="cta-animated-wrapper animate-fade-in-up" style={{ 
          position: 'relative', 
          overflow: 'hidden', 
          borderRadius: '32px', 
          padding: 'var(--space-12) var(--space-6)', 
          background: 'linear-gradient(135deg, var(--primary) 0%, #064e3b 100%)',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(10, 61, 42, 0.4)'
        }}>
          {/* Animated Background Elements */}
          <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite' }}></div>
          <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(22,163,74,0.3) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 10s ease-in-out infinite reverse' }}></div>
          
          {/* Floating Map Pins */}
          <div style={{ position: 'absolute', top: '20%', left: '15%', animation: 'float 6s ease-in-out infinite' }}>
            <MapPin size={32} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
          </div>
          <div style={{ position: 'absolute', bottom: '25%', left: '8%', animation: 'float 4s ease-in-out infinite reverse' }}>
            <MapPin size={48} color="rgba(249,115,22,0.6)" strokeWidth={1.5} />
          </div>
          <div style={{ position: 'absolute', top: '15%', right: '10%', animation: 'float 7s ease-in-out infinite' }}>
            <MapPin size={40} color="rgba(22,163,74,0.6)" strokeWidth={1.5} />
          </div>
          <div style={{ position: 'absolute', bottom: '20%', right: '18%', animation: 'float 5s ease-in-out infinite reverse' }}>
            <MapPin size={24} color="rgba(255,255,255,0.3)" strokeWidth={2} />
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span style={{ fontSize: '20px' }}>🏡</span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: '700', letterSpacing: '0.5px' }}>Propriétaires & Bailleurs</span>
            </div>
            
            <h2 style={{ fontSize: 'calc(var(--text-4xl) + 0.5vw)', color: '#ffffff', fontWeight: '900', lineHeight: 1.2, margin: 0 }}>
              Vous avez un bien immobilier ? <br/>
              <span style={{ color: 'var(--orange)' }}>Gérez-le facilement.</span>
            </h2>
            
            <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>
              Rejoignez des centaines de propriétaires qui ont automatisé leur gestion locative avec Vision Immo 2.0. Fini les retards, fini le stress.
            </p>

            <Link href="/register" className="btn btn-orange pulse-btn" style={{ padding: '16px 36px', fontSize: 'var(--text-lg)', fontWeight: '800', marginTop: 'var(--space-4)', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.5)' }}>
              Commencer gratuitement <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
         Contact Section
         ============================================ */}
      <section id="contact" className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span className="section-label">Contactez-nous</span>
            <h2 className="section-title">Une question ? Notre équipe vous répond</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Que vous soyez bailleur particulier ou agence immobilière, nous sommes à votre disposition pour vous accompagner.
            </p>
          </div>

          <div className="contact-grid">
            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="card" style={{ background: 'var(--white)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)', color: 'var(--primary)' }}>
                  <Phone size={18} /> Téléphone & WhatsApp
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', margin: 0, fontWeight: '600' }}>+225 07 48 11 09 42</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '4px' }}>Lun - Ven, 8h00 à 18h00</p>
              </div>

              <div className="card" style={{ background: 'var(--white)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)', color: 'var(--primary)' }}>
                  <Mail size={18} /> E-mail
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', margin: 0, fontWeight: '600' }}>djafe247@gmail.com</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '4px' }}>Réponse sous 24h ouvrées</p>
              </div>

              <div className="card" style={{ background: 'var(--white)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)', color: 'var(--primary)' }}>
                  <MapPin size={18} /> Adresse
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', margin: 0, fontWeight: '600' }}>Yamoussoukro, Côte d&apos;Ivoire</p>
              </div>
            </div>

            {/* Form */}
            <div className="card" style={{ background: 'var(--white)' }}>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message envoyé avec succès ! Notre équipe vous contactera rapidement.'); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-row-2col">
                  <div className="input-group">
                    <label className="input-label">Nom complet</label>
                    <input type="text" placeholder="Ex: Jean Koffi" required className="input" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">E-mail</label>
                    <input type="email" placeholder="Ex: jean@mail.com" required className="input" />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Téléphone</label>
                  <input type="tel" placeholder="Ex: +225 07 00 00 00" className="input" />
                </div>

                <div className="input-group">
                  <label className="input-label">Sujet</label>
                  <select className="input" required style={{ appearance: 'auto' }}>
                    <option value="">Sélectionnez un sujet</option>
                    <option value="demo">Demande de devis</option>
                    <option value="pricing">Question sur les tarifs</option>
                    <option value="partnership">Partenariat / Affiliation</option>
                    <option value="other">Autre demande</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Votre message</label>
                  <textarea placeholder="Décrivez votre besoin ou vos questions ici..." required className="input" rows={4} style={{ resize: 'none' }}></textarea>
                </div>

                <button type="submit" className="btn btn-orange" style={{ width: '100%', padding: 'var(--space-3)' }}>
                  Envoyer mon message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
         FAQ Section
         ============================================ */}
      <section id="faq" className="section" style={{ background: 'var(--white)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-lighter)', color: 'var(--primary)', padding: '16px', borderRadius: '50%', marginBottom: 'var(--space-4)', animation: 'float 4s ease-in-out infinite', boxShadow: 'var(--shadow-md)' }}>
              <HelpCircle size={36} />
            </div>
            <span className="section-label">Foire Aux Questions</span>
            <h2 className="section-title">Vous avez des questions ? Nous avons les réponses.</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Retrouvez ici les réponses aux questions les plus fréquemment posées par nos bailleurs et gestionnaires.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {[
              { q: "Comment fonctionne la période d'essai gratuit ?", a: "Vous disposez de 14 jours pour tester l'intégralité de la plateforme sans aucun engagement. Aucune carte bancaire n'est requise lors de l'inscription." },
              { q: "Mes données sont-elles sécurisées ?", a: "Absolument. Nous utilisons des protocoles de chiffrement de niveau bancaire. Vos données et celles de vos locataires sont stockées de manière ultra-sécurisée et sauvegardées quotidiennement." },
              { q: "Puis-je gérer plusieurs propriétés à la fois ?", a: "Oui, Vision Immo 2.0 est conçu pour s'adapter à votre portefeuille. Que vous ayez 1 ou 100 biens, notre interface vous permet de tout piloter depuis un seul et même tableau de bord avec une vue d'ensemble claire." },
              { q: "Proposez-vous une assistance en cas de problème ?", a: "Notre équipe support est disponible 7j/7 par chat, WhatsApp et email pour vous accompagner à chaque étape de votre gestion. Un centre d'aide détaillé est également à votre disposition." },
              { q: "Comment les paiements des loyers sont-ils gérés ?", a: "Vos locataires peuvent payer directement en ligne via mobile money (Orange, MTN, Wave, Moov) ou par carte bancaire. Les fonds sont reversés automatiquement et les quittances sont générées sans votre intervention." }
            ].map((faq, index) => (
              <div 
                key={index}
                className="card"
                style={{ 
                  background: openFaq === index ? 'var(--primary-lighter)' : 'var(--white)', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: openFaq === index ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
                  boxShadow: openFaq === index ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                }}
                onClick={() => toggleFaq(index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: openFaq === index ? '800' : '700', color: openFaq === index ? 'var(--primary)' : 'var(--gray-900)' }}>
                    {faq.q}
                  </h4>
                  <div style={{ 
                    color: openFaq === index ? 'var(--primary)' : 'var(--gray-500)',
                    transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    background: openFaq === index ? 'var(--white)' : 'var(--gray-100)',
                    padding: '8px',
                    borderRadius: '50%'
                  }}>
                    <ChevronDown size={20} />
                  </div>
                </div>
                
                <div style={{ 
                  maxHeight: openFaq === index ? '200px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease, margin-top 0.4s ease, opacity 0.4s ease',
                  marginTop: openFaq === index ? 'var(--space-4)' : '0',
                  opacity: openFaq === index ? 1 : 0
                }}>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            background: 'var(--orange)',
            color: 'white',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            border: 'none',
            zIndex: 99,
            transition: 'all 0.3s ease',
          }}
          aria-label="Retour en haut"
        >
          <ArrowUp size={24} />
        </button>
      )}

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
              <a href="#pricing" className="footer-link">Tarifs</a>
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
