"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  DollarSign,
  FileText,
  CreditCard,
  BarChart3,
  Check,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Percent,
  Plus,
  ShieldCheck,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Loader2
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
  const [activeTab, setActiveTab] = useState<"revenue" | "properties" | "tenants">("revenue");
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

  useEffect(() => {
    if (mockToken && queryPlan) {
      setCheckoutActive(true);
      setSelectedPlan(queryPlan);
      setSelectedPrice(parseInt(queryPrice));
      setSimStep('method_select');
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
        window.location.href = data.url;
      }
    } catch (err) {
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
    <div className="animate-fade-in">
      {/* ============================================
         Header / Navbar
         ============================================ */}
      <header className="navbar">
        <div className="container navbar-container">
          <Link href="/" className="logo-text">
            <div className="logo-icon">V</div>
            <span>VENANCE IMO</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="navbar-menu hide-mobile">
            <a href="#features" className="navbar-link">Fonctionnalités</a>
            <a href="#how-it-works" className="navbar-link">Comment ça marche</a>
            <a href="#pricing" className="navbar-link">Tarifs</a>
            <a href="#contact" className="navbar-link">Contact</a>
          </nav>

          <div className="navbar-actions hide-mobile">
            <Link href="/login" className="btn btn-ghost">
              Connexion
            </Link>
            <Link href="/register" className="btn btn-primary">
              Créer un compte
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
              href="#features" 
              className="navbar-link" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-2) 0' }}
            >
              Fonctionnalités
            </a>
            <a 
              href="#how-it-works" 
              className="navbar-link" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-2) 0' }}
            >
              Comment ça marche
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
              <Link href="/login" className="btn btn-outline" style={{ width: '100%' }}>
                Connexion
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ width: '100%' }}>
                Créer un compte
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ============================================
         Hero Section
         ============================================ */}
      <section className="section" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.85) 100%), url("/hero-bg.png") center/cover no-repeat', overflow: 'hidden' }}>
        <div className="container hero-grid">
          <div className="hero-content animate-fade-in-up">
            <div className="badge badge-primary" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex', gap: 'var(--space-1)', alignItems: 'center' }}>
              <Sparkles size={14} /> La gestion immobilière réinventée en Afrique
            </div>
            <h1 className="hero-title">
              Gérez vos biens, locataires et loyers en <span>toute simplicité</span>
            </h1>
            <p className="hero-desc" style={{ color: '#22c55e', fontWeight: 600, background: 'rgba(255, 255, 255, 0.9)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              Suivi des paiements mobiles (Orange Money, MTN MoMo, Stripe), édition automatique des baux et quittances, gestion des demandes de maintenance. Gagnez du temps et optimisez vos revenus.
            </p>
            <div className="hero-buttons">
              <Link href="/register" className="btn btn-primary btn-lg">
                Essayer gratuitement <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn btn-outline btn-lg">
                Voir comment ça marche
              </a>
            </div>

            {/* Quick trust metrics */}
            <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-12)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', color: 'var(--primary-dark)' }}>24+</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: '500' }}>Biens gérés par bailleur</p>
              </div>
              <div style={{ borderLeft: '1px solid var(--gray-200)', paddingLeft: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', color: 'var(--primary-dark)' }}>92%</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: '500' }}>Taux d'occupation moyen</p>
              </div>
              <div style={{ borderLeft: '1px solid var(--gray-200)', paddingLeft: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', color: 'var(--primary-dark)' }}>98%</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: '500' }}>Loyers payés à temps</p>
              </div>
            </div>
          </div>

          {/* Interactive visual mockup dashboard */}
          <div className="hero-visual animate-scale-in">
            <div className="mockup-bg"></div>

            {/* Floating micro-interactions */}
            <div className="floating-card floating-card-1">
              <div style={{ background: 'var(--success-light)', color: 'var(--success-dark)', borderRadius: '50%', padding: '6px' }}>
                <TrendingUp size={16} />
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: '500', margin: 0 }}>Revenus du mois</p>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>2 450 000 FCFA</h4>
              </div>
            </div>

            <div className="floating-card floating-card-2">
              <div style={{ background: 'var(--warning-light)', color: 'var(--warning-dark)', borderRadius: '50%', padding: '6px' }}>
                <Clock size={16} />
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: '500', margin: 0 }}>Retards de paiement</p>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0, color: 'var(--danger-dark)' }}>3 locataires</h4>
              </div>
            </div>

            {/* Main mockup card */}
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <span className="mockup-dot red"></span>
                <span className="mockup-dot yellow"></span>
                <span className="mockup-dot green"></span>
                <span style={{ fontSize: '11px', color: 'var(--gray-400)', marginLeft: 'var(--space-2)', fontWeight: '500' }}>dashboard.venanceimo.com</span>
              </div>

              {/* Tabs selector */}
              <div style={{ display: 'flex', background: 'white', padding: '10px 16px', gap: '4px', borderBottom: '1px solid var(--gray-200)' }}>
                <button 
                  onClick={() => setActiveTab("revenue")}
                  className={`btn btn-sm ${activeTab === "revenue" ? "btn-primary" : "btn-ghost"}`}
                  style={{ borderRadius: 'var(--radius-md)', padding: '6px 12px' }}
                >
                  <BarChart3 size={14} /> &nbsp;Revenus
                </button>
                <button 
                  onClick={() => setActiveTab("properties")}
                  className={`btn btn-sm ${activeTab === "properties" ? "btn-primary" : "btn-ghost"}`}
                  style={{ borderRadius: 'var(--radius-md)', padding: '6px 12px' }}
                >
                  <Building2 size={14} /> &nbsp;Nos Biens
                </button>
                <button 
                  onClick={() => setActiveTab("tenants")}
                  className={`btn btn-sm ${activeTab === "tenants" ? "btn-primary" : "btn-ghost"}`}
                  style={{ borderRadius: 'var(--radius-md)', padding: '6px 12px' }}
                >
                  <Users size={14} /> &nbsp;Locataires
                </button>
              </div>

              {/* Mockup content according to active tab */}
              <div className="mockup-body">
                {activeTab === "revenue" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} className="animate-fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                      <div className="card-flat" style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Taux d'occupation</span>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0 0 0' }}>92 %</h4>
                      </div>
                      <div className="card-flat" style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Total Loyers</span>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0 0 0', color: 'var(--success-dark)' }}>2.45M FCFA</h4>
                      </div>
                    </div>
                    {/* Small visual chart */}
                    <div>
                      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', padding: '10px 10px 0 10px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                        {[40, 60, 45, 80, 90, 85, 95, 75, 100].map((h, i) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '8%' }}>
                            <div style={{ width: '100%', height: `${h}%`, background: i === 8 ? 'var(--primary)' : 'var(--primary-lighter)', borderRadius: '3px 3px 0 0', transition: 'height 0.5s' }}></div>
                            <span style={{ fontSize: '8px', color: 'var(--gray-400)', marginTop: '4px' }}>M{i+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "properties" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="animate-fade-in">
                    {[
                      { name: "Villa Hibiscus", type: "Villa", rent: "450 000 FCFA", status: "occupied", statusLabel: "Occupé" },
                      { name: "Appartement Riviera C2", type: "Appartement", rent: "250 000 FCFA", status: "occupied", statusLabel: "Occupé" },
                      { name: "Studio Zone 4", type: "Studio", rent: "150 000 FCFA", status: "vacant", statusLabel: "Vacant" }
                    ].map((item, index) => (
                      <div key={index} style={{ background: 'white', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h5 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>{item.name}</h5>
                          <span style={{ fontSize: '10px', color: 'var(--gray-500)' }}>{item.type} • {item.rent}</span>
                        </div>
                        <span className={`badge ${item.status === 'occupied' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                          {item.statusLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "tenants" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="animate-fade-in">
                    {[
                      { name: "Koffi Kouassi", property: "Villa Hibiscus", amount: "450k FCFA", status: "paid", statusLabel: "Payé" },
                      { name: "Awa Diop", property: "Appartement Riviera C2", amount: "250k FCFA", status: "late", statusLabel: "En retard" },
                      { name: "Jean Dupont", property: "Studio Zone 4", amount: "150k FCFA", status: "pending", statusLabel: "En attente" }
                    ].map((item, index) => (
                      <div key={index} style={{ background: 'white', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h5 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>{item.name}</h5>
                          <span style={{ fontSize: '10px', color: 'var(--gray-500)' }}>{item.property} • {item.amount}</span>
                        </div>
                        <span className={`badge ${item.status === 'paid' ? 'badge-success' : item.status === 'late' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                          {item.statusLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: '500' }}>Données simulées en temps réel</span>
                  <Link href="/register" style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Voir le vrai dashboard <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
         Trust Band / Partners
         ============================================ */}
      <section className="partners">
        <div className="container">
          <p className="partners-title">Ils font confiance à VENANCE IMO</p>
          <div className="partners-grid">
            <span className="partner-logo">ImmoGabon</span>
            <span className="partner-logo">SenLogement</span>
            <span className="partner-logo">CamerImmo</span>
            <span className="partner-logo">IvoirBat</span>
            <span className="partner-logo">MaliBail</span>
            <span className="partner-logo">GbinLoc</span>
          </div>
        </div>
      </section>

      {/* ============================================
         Features Section
         ============================================ */}
      <section id="features" className="section">
        <div className="container" style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span className="section-label">Fonctionnalités</span>
          <h2 className="section-title">Tout ce dont vous avez besoin pour gérer vos biens</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Oubliez les fichiers Excel complexes et les relances manuelles pénibles. Notre outil gère l'ensemble du cycle de location.
          </p>
        </div>

        <div className="container grid-3">
          {/* Card 1 */}
          <div className="card feature-card">
            <div className="feature-icon-wrapper">
              <Building2 size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Gestion des Biens</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
              Ajoutez vos appartements, studios, villas et bureaux. Renseignez les loyers, charges, photos et suivez instantanément le statut d'occupation.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card feature-card">
            <div className="feature-icon-wrapper">
              <DollarSign size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Suivi des Loyers</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
              Sachez en un coup d'œil qui a payé, qui est en retard, et les loyers à venir. Marquez les paiements en cash ou suivez-les automatiquement.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card feature-card">
            <div className="feature-icon-wrapper">
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Quittances Automatiques</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
              Générez instantanément des quittances conformes au format PDF dès que le paiement est validé, et envoyez-les directement par email au locataire.
            </p>
          </div>

          {/* Card 4 */}
          <div className="card feature-card">
            <div className="feature-icon-wrapper">
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Espace Locataire</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
              Vos locataires disposent d'un espace personnel sécurisé pour consulter leur bail de location, télécharger les quittances et signaler les incidents.
            </p>
          </div>

          {/* Card 5 */}
          <div className="card feature-card">
            <div className="feature-icon-wrapper">
              <CreditCard size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Paiement en Ligne</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
              Permettez le règlement en ligne par cartes bancaires (Stripe) et par paiements mobiles locaux (Orange Money, MTN Mobile Money) pour réduire les délais.
            </p>
          </div>

          {/* Card 6 */}
          <div className="card feature-card">
            <div className="feature-icon-wrapper">
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Rapports et Statistiques</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
              Visualisez l'évolution de vos revenus locatifs nets, estimez vos impôts, observez votre taux d'occupation et téléchargez des rapports complets.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
         How It Works Section
         ============================================ */}
      <section id="how-it-works" className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span className="section-label">Processus</span>
          <h2 className="section-title">Commencez en seulement 3 étapes</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            La transition vers une gestion immobilière automatisée et sereine ne prend que quelques minutes.
          </p>
        </div>

        <div className="container grid-3">
          <div className="card step-card" style={{ background: 'white' }}>
            <div className="step-num">1</div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Créez votre compte</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
              Inscrivez-vous en choisissant le rôle Propriétaire/Bailleur. Configurez votre profil et votre devise en quelques clics.
            </p>
          </div>

          <div className="card step-card" style={{ background: 'white' }}>
            <div className="step-num">2</div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Ajoutez vos biens</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
              Saisissez les détails de vos logements (adresse, type, loyer) et associez vos locataires actuels avec les dates de bail de location.
            </p>
          </div>

          <div className="card step-card" style={{ background: 'white' }}>
            <div className="step-num">3</div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Gérez et encaissez</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
              Suivez les échéances. Notre plateforme s'occupe des relances, de la facturation et génère vos quittances automatiquement.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
         Pricing Section
         ============================================ */}
      <section id="pricing" className="section">
        <div className="container" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="section-label">Tarifs simples</span>
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
            <div key={index} className={`card pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <span className="pricing-badge">Populaire</span>}
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
                    <Check size={16} className="pricing-feature-icon" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                type="button"
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
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
         CTA Section (Call to Action)
         ============================================ */}
      <section className="container section">
        <div className="cta-section">
          <h2 className="section-title cta-title">Prêt à simplifier votre gestion immobilière ?</h2>
          <p className="cta-desc">
            Rejoignez des centaines de propriétaires immobiliers et agences en Côte d'Ivoire, au Sénégal, au Gabon et partout en Afrique qui utilisent VENANCE IMO pour automatiser leur gestion quotidienne.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ fontWeight: '700' }}>
              Créer mon compte gratuit
            </Link>
            <a href="#contact" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}>
              Demander une démonstration
            </a>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-12)', maxWidth: '1000px', margin: '0 auto' }} className="grid-3">
            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="card" style={{ background: 'white' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)' }}>
                  <Phone size={18} style={{ color: 'var(--primary)' }} /> Téléphone & WhatsApp
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', margin: 0 }}>+225 07 00 00 00 00</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '4px' }}>Lun - Ven, 8h00 à 18h00</p>
              </div>

              <div className="card" style={{ background: 'white' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)' }}>
                  <Mail size={18} style={{ color: 'var(--primary)' }} /> E-mail
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', margin: 0 }}>contact@venanceimo.com</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '4px' }}>Réponse sous 24h ouvrées</p>
              </div>

              <div className="card" style={{ background: 'white' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)' }}>
                  <MapPin size={18} style={{ color: 'var(--primary)' }} /> Adresse
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', margin: 0 }}>Cocody Riviera Faya, Abidjan, Côte d'Ivoire</p>
              </div>
            </div>

            {/* Form */}
            <div className="card" style={{ background: 'white' }}>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message envoyé avec succès ! Notre équipe vous contactera rapidement.'); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
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
                    <option value="demo">Demande de démonstration</option>
                    <option value="pricing">Question sur les tarifs</option>
                    <option value="partnership">Partenariat / SaaS Business</option>
                    <option value="other">Autre demande</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Votre message</label>
                  <textarea placeholder="Décrivez votre besoin ou vos questions ici..." required className="input" rows={4} style={{ resize: 'none' }}></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 'var(--space-3)' }}>
                  Envoyer mon message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
         Footer Section
         ============================================ */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="footer-logo">VENANCE IMO</div>
            <p className="footer-desc">
              La solution moderne de gestion immobilière conçue pour les bailleurs et agences en Afrique. Suivez, générez, encaissez en toute sérénité.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <span style={{ cursor: 'pointer', background: 'var(--gray-800)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', color: 'white', fontWeight: 'bold', justifyContent: 'center' }}>f</span>
              <span style={{ cursor: 'pointer', background: 'var(--gray-800)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', color: 'white', fontWeight: 'bold', justifyContent: 'center' }}>in</span>
              <span style={{ cursor: 'pointer', background: 'var(--gray-800)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', color: 'white', fontWeight: 'bold', justifyContent: 'center' }}>w</span>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Plateforme</h4>
            <div className="footer-links">
              <a href="#features" className="footer-link">Fonctionnalités</a>
              <a href="#pricing" className="footer-link">Tarifs</a>
              <Link href="/register" className="footer-link">Créer un compte</Link>
              <Link href="/login" className="footer-link">Connexion</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Légal</h4>
            <div className="footer-links">
              <a href="#" className="footer-link">Mentions Légales</a>
              <a href="#" className="footer-link">Politique de Confidentialité</a>
              <a href="#" className="footer-link">Conditions d'Utilisation</a>
              <a href="#" className="footer-link">CGV</a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Newsletter</h4>
            <p className="footer-desc" style={{ fontSize: 'var(--text-xs)' }}>
              Abonnez-vous pour recevoir nos conseils de gestion immobilière et nouveautés.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Merci pour votre abonnement !'); }} style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input type="email" placeholder="Votre email" required className="input btn-sm" style={{ background: 'var(--gray-800)', borderColor: 'var(--gray-700)', color: 'white' }} />
              <button type="submit" className="btn btn-primary btn-sm">Ok</button>
            </form>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} VENANCE IMO. Tous droits réservés. Développé pour VENANCE.</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Côte d'Ivoire • Sénégal • Gabon • Cameroun • Mali
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
              borderTop: "6px solid var(--primary)"
            }}
          >
            {simStep === 'method_select' && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary)" }}>PayDunya Sandbox Checkout</span>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", marginTop: "2px" }}>Abonnement Plan {selectedPlan.toUpperCase()}</h3>
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
                <h3 style={{ fontSize: "var(--text-md)", fontWeight: "800", textTransform: "capitalize" }}>
                  Abonnement par {selectedOperator === 'orange' ? 'Orange Money' : selectedOperator === 'mtn' ? 'MTN MoMo' : selectedOperator === 'wave' ? 'Wave' : 'Moov Money'}
                </h3>
                <form onSubmit={handlePhoneNumberSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <div className="input-group">
                    <label className="input-label">Numéro de téléphone mobile</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 0707070707"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="input"
                    />
                    {phoneError && <span style={{ fontSize: "var(--text-xs)", color: "var(--danger)" }}>{phoneError}</span>}
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSimStep('method_select')}>
                      Retour
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      Suivant
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
                      Confirmer l'abonnement
                    </button>
                  </div>
                </form>
              </div>
            )}

            {simStep === 'processing' && (
              <div style={{ textAlign: "center", padding: "var(--space-4)" }}>
                <Loader2 className="animate-spin" size={40} style={{ color: "var(--primary)", margin: "0 auto var(--space-4)" }} />
                <h3>Activation de l'abonnement...</h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Veuillez patienter pendant la validation de la transaction.</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
