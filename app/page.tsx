"use client";

 

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  FileText,
  BarChart3,
  Check,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Loader2,
  Smartphone,
  ArrowUp
} from "lucide-react";

interface HomeProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Home({ searchParams }: HomeProps) {
  const router = useRouter();
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const mockToken = resolvedSearchParams.mock_token as string || "";
  const queryPlan = resolvedSearchParams.plan as string || "";
  const queryPrice = resolvedSearchParams.price as string || "0";

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
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              Veco<span className="text-orange"> IA</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="navbar-menu hide-mobile">
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
              background: 'white',
              borderBottom: '1px solid var(--gray-200)',
              padding: 'var(--space-6) var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 99
            }}
          >
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
          background: 'linear-gradient(rgba(10, 61, 42, 0.88) 0%, rgba(10, 61, 42, 0.5) 100%), url("/gestimmo_hero_bg.png") center/cover no-repeat',
          paddingTop: 'calc(var(--navbar-height) + var(--space-20))',
          paddingBottom: 'var(--space-24)',
          color: 'white'
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <div className="hero-content animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '800px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'white', fontSize: 'var(--text-xs)', fontWeight: '600', marginBottom: 'var(--space-6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <span style={{ display: 'inline-flex', width: '16px', height: '12px', background: 'linear-gradient(to right, #E25822 33.3%, white 33.3%, white 66.6%, #0A3D2A 66.6%)', borderRadius: '1px' }}></span>
              Depuis la Côte d&apos;Ivoire
            </div>
            
            <h1 className="hero-title" style={{ color: 'white', fontSize: 'var(--text-5xl)', fontWeight: '900', lineHeight: 1.15, marginBottom: 'var(--space-6)', textAlign: 'center' }}>
              Gérez vos biens <span className="underline-white" style={{ color: 'var(--orange)', background: 'none', WebkitBackgroundClip: 'unset', backgroundClip: 'unset', WebkitTextFillColor: 'var(--orange)' }}>10x plus vite,</span> sans papier ni impayés.
            </h1>
            
            <p style={{ fontSize: 'var(--text-base)', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.65, maxWidth: '640px', marginBottom: 'var(--space-8)', textAlign: 'center', marginInline: 'auto' }}>
              Veco IA est la 1ère plateforme 100% digitale en Afrique qui encaisse vos loyers (Mobile Money), génère vos quittances et gère vos locataires automatiquement.
            </p>
            
            <div className="hero-buttons" style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '440px', margin: '0 auto' }}>
              <a href="/register" className="btn btn-orange" style={{ minWidth: '160px', padding: '10px 24px', fontSize: 'var(--text-sm)', fontWeight: '600' }}>
                Commencer l'essai gratuit <ArrowRight size={16} style={{ marginLeft: '6px' }} />
              </a>
              <a href="#features" className="btn btn-contact" style={{ minWidth: '160px', padding: '10px 24px', fontSize: 'var(--text-sm)', fontWeight: '600', background: 'transparent', borderColor: 'white', color: 'white' }}>
                Voir le fonctionnement
              </a>
            </div>
          </div>
        </div>
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
              <strong>Avant Veco IA :</strong> Vous courriez après les locataires pour les loyers, vous perdiez du temps à écrire des reçus papier, et les erreurs de comptabilité plombaient votre rentabilité (jusqu'à 20% de pertes !).
            </p>
            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-base)', lineHeight: 1.65 }}>
              <strong>Avec Veco IA :</strong> Vos loyers sont payés via Mobile Money, vos quittances sont générées automatiquement, vos incidents sont centralisés, et vous suivez la rentabilité de vos biens en temps réel depuis votre téléphone.
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
      <section id="features" className="section" style={{ background: 'var(--gray-50)' }}>
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

          <div className="stats-grid animate-scale-in">
            {/* Stat 1 */}
            <div className="stat-card">
              <div className="stat-icon orange">
                <Building2 size={20} />
              </div>
              <div className="stat-number">+100</div>
              <div className="stat-label">Biens gérés</div>
            </div>

            {/* Stat 2 */}
            <div className="stat-card">
              <div className="stat-icon green">
                <Users size={20} />
              </div>
              <div className="stat-number">+80</div>
              <div className="stat-label">Clients satisfaits</div>
            </div>

            {/* Stat 3 */}
            <div className="stat-card">
              <div className="stat-icon green">
                <Clock size={20} />
              </div>
              <div className="stat-number">+5</div>
              <div className="stat-label">Années d&apos;expérience</div>
            </div>

            {/* Stat 4 */}
            <div className="stat-card">
              <div className="stat-icon orange">
                <MapPin size={20} />
              </div>
              <div className="stat-number">Abidjan</div>
              <div className="stat-label">Couverture nationale</div>
            </div>
          </div>
        </div>
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
        <div className="cta-gestimmo animate-fade-in-up">
          <div className="cta-gestimmo-content">
            <h2 className="cta-gestimmo-title">Vous avez un bien immobilier ?</h2>
            <p className="cta-gestimmo-desc">
              Confiez-le à des professionnels pour valoriser, sécuriser et rentabiliser votre patrimoine. Nous nous occupons du reste.
            </p>
          </div>
          <div className="cta-gestimmo-actions">
            <Link href="/register" className="btn btn-white-green btn-lg" style={{ fontWeight: '700', borderRadius: 'var(--radius-lg)' }}>
              S'inscrire gratuitement <ArrowRight size={18} style={{ marginLeft: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
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
              <div className="card" style={{ background: 'white' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)', color: 'var(--primary)' }}>
                  <Phone size={18} /> Téléphone & WhatsApp
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', margin: 0, fontWeight: '600' }}>+225 07 48 11 09 42</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '4px' }}>Lun - Ven, 8h00 à 18h00</p>
              </div>

              <div className="card" style={{ background: 'white' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)', color: 'var(--primary)' }}>
                  <Mail size={18} /> E-mail
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', margin: 0, fontWeight: '600' }}>djafe247@gmail.com</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '4px' }}>Réponse sous 24h ouvrées</p>
              </div>

              <div className="card" style={{ background: 'white' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)', color: 'var(--primary)' }}>
                  <MapPin size={18} /> Adresse
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', margin: 0, fontWeight: '600' }}>Yamoussoukro, Côte d&apos;Ivoire</p>
              </div>
            </div>

            {/* Form */}
            <div className="card" style={{ background: 'white' }}>
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
            <div className="gestimmo-footer-logo-title">VENANCE IMO<span className="text-orange">.CI</span></div>
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
          <p>© {new Date().getFullYear()} VENANCE IMO.CI. Tous droits réservés.</p>
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
              background: "white",
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
                  <div style={{ padding: "8px", background: "white", borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
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
