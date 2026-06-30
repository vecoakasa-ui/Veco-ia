"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Target, Presentation, Video, PhoneCall } from "lucide-react";

export default function MarketingPage() {
  const [activeSection, setActiveSection] = useState("strategie");

  // Gérer le surlignage du menu au scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["strategie", "pitchdeck", "video", "vente"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <nav className="fixed top-0 left-0 w-64 h-full bg-white border-r border-slate-200 p-6 hidden md:flex flex-col overflow-y-auto z-10 shadow-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <div className="bg-orange-500 text-white p-2 rounded-lg font-bold flex items-center justify-center w-10 h-10">V</div>
          <span className="text-xl font-extrabold text-slate-800">
            Vision Immo<span className="text-orange-500"> 2.0</span>
          </span>
        </Link>
        
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Votre Stratégie</div>
        
        <ul className="space-y-1 flex-1">
          <li>
            <button 
              onClick={() => scrollTo("strategie")} 
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${activeSection === 'strategie' ? 'bg-slate-100 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Target size={18} className={activeSection === 'strategie' ? 'text-orange-600' : 'text-slate-400'} />
              1. Stratégie Globale
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollTo("pitchdeck")} 
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${activeSection === 'pitchdeck' ? 'bg-slate-100 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Presentation size={18} className={activeSection === 'pitchdeck' ? 'text-orange-600' : 'text-slate-400'} />
              2. Le Pitch Deck
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollTo("video")} 
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${activeSection === 'video' ? 'bg-slate-100 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Video size={18} className={activeSection === 'video' ? 'text-orange-600' : 'text-slate-400'} />
              3. Script Vidéo
            </button>
          </li>
          <li>
            <button 
              onClick={() => scrollTo("vente")} 
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${activeSection === 'vente' ? 'bg-slate-100 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <PhoneCall size={18} className={activeSection === 'vente' ? 'text-orange-600' : 'text-slate-400'} />
              4. Script d'Appel
            </button>
          </li>
        </ul>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 font-medium transition-colors">
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-6 md:p-12 lg:p-16 max-w-4xl w-full">
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Programme de Pitch & Communication
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mt-4 leading-relaxed">
            Le guide complet pour convaincre investisseurs et gérants immobiliers.
          </p>
        </header>

        {/* SECTION 1 : STRATEGIE */}
        <section id="strategie" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-10 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-sm">Étape 1</span>
            <h2 className="text-2xl font-bold text-slate-800 m-0">La Stratégie Globale</h2>
          </div>
          <p className="text-slate-500 mb-8 text-lg">L'Elevator pitch adapté à chaque cible.</p>

          <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span> La Proposition de Valeur
          </h3>
          <ul className="space-y-4 text-slate-700 list-none pl-0">
            <li className="flex gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <div>
                <strong className="text-slate-900 block mb-1">Pour les Investisseurs :</strong> 
                "Vision Immo 2.0 est une plateforme SaaS qui digitalise et automatise la gestion immobilière en Afrique. Nous transformons un secteur traditionnellement informel, opaque et chronophage en une industrie structurée, transparente et hautement rentable grâce à des paiements intégrés (Mobile Money) et une gestion automatisée."
              </div>
            </li>
            <li className="flex gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <div>
                <strong className="text-slate-900 block mb-1">Pour les Agences (B2B) :</strong> 
                "Fini les impayés, les relances manuelles et la paperasse. Vision Immo 2.0 est votre assistant virtuel qui encaisse vos loyers, gère vos contrats et suit les incidents. Gagnez 10h par semaine et sécurisez vos revenus."
              </div>
            </li>
            <li className="flex gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-orange-500 font-bold mt-1">•</span>
              <div>
                <strong className="text-slate-900 block mb-1">Pour les Locataires (B2C) :</strong> 
                "Payez votre loyer depuis votre téléphone, signalez un problème en un clic, et retrouvez toutes vos quittances au même endroit."
              </div>
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mt-10 mb-4 flex items-center gap-2">
            <span className="text-2xl">🧠</span> Comment convaincre les novices
          </h3>
          <ol className="space-y-4 text-slate-700 list-decimal pl-5">
            <li className="pl-2">
              <strong className="text-slate-900">L'Éducation :</strong> Montrer un gérant frustré avec ses cahiers (Avant) VS un gérant détendu qui reçoit une notification sur Vision Immo 2.0 (Après).
            </li>
            <li className="pl-2">
              <strong className="text-slate-900">L'Offre Irrésistible :</strong> Essai gratuit de 30 jours + Onboarding gratuit (vous importez leurs fichiers Excel pour eux).
            </li>
            <li className="pl-2">
              <strong className="text-slate-900">La Preuve Sociale :</strong> Filmer les premiers clients satisfaits.
            </li>
          </ol>
        </section>

        {/* SECTION 2 : PITCH DECK */}
        <section id="pitchdeck" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-10 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">Étape 2</span>
            <h2 className="text-2xl font-bold text-slate-800 m-0">Contenu du Pitch Deck (Investisseurs)</h2>
          </div>
          <p className="text-slate-500 mb-8 text-lg">Le texte exact à mettre dans vos slides PowerPoint.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 p-5 rounded-xl border border-red-100">
              <h3 className="text-lg font-bold text-red-700 mb-3 mt-0 flex items-center justify-between">
                Slide 2 : Le Problème <span>❌</span>
              </h3>
              <p className="text-slate-700 mb-3 text-sm font-medium">En Afrique, la gestion immobilière souffre de 3 maux :</p>
              <ul className="list-disc pl-5 text-slate-700 space-y-1 text-sm">
                <li><strong>L'opacité et les impayés</strong></li>
                <li><strong>Le tout-papier</strong> (pertes, erreurs)</li>
                <li><strong>Le manque de confiance</strong></li>
              </ul>
            </div>
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
              <h3 className="text-lg font-bold text-emerald-700 mb-3 mt-0 flex items-center justify-between">
                Slide 3 : La Solution <span>✅</span>
              </h3>
              <p className="text-slate-700 mb-3 text-sm font-medium">Vision Immo 2.0, le gestionnaire 100% digital :</p>
              <ul className="list-disc pl-5 text-slate-700 space-y-1 text-sm">
                <li>Suivi en temps réel des encaissements</li>
                <li>Paiement facile via Mobile Money</li>
                <li>Transparence totale</li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Slide 6 : Business Model 💰</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-2">
              <li><strong>Abonnement SaaS :</strong> Plan Pro et Plan Business.</li>
              <li><strong>Frais Fintech :</strong> Commission sur chaque loyer payé via PayDunya.</li>
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Slide 9 : La Concurrence ⚔️</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-2">
              <li><strong>Concurrent N°1 : Le Papier & Excel (90%).</strong> Le but est d'éduquer. Vision Immo 2.0 est infiniment plus rapide.</li>
              <li><strong>Logiciels Étrangers :</strong> Ignorent la réalité africaine (Pas de Mobile Money).</li>
              <li><strong>Logiciels Locaux :</strong> Vieillissants et complexes. Vision Immo 2.0 est simple et intuitif.</li>
            </ul>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-xl mt-8 shadow-inner">
            <h3 className="text-xl font-bold text-white mb-3 mt-0">Slide 11 : Le Ask (L'Offre) 🤝</h3>
            <p className="text-slate-300 leading-relaxed">
              Nous levons actuellement <strong className="text-white bg-white/20 px-2 py-0.5 rounded">[Insérez le montant]</strong> pour : 
              40% Marketing, 30% Commercial terrain, 30% Technique. <br/>
              <span className="inline-block mt-2 text-orange-400 font-semibold">Objectif : 500 agences d'ici 12 mois.</span>
            </p>
          </div>
        </section>

        {/* SECTION 3 : VIDEO */}
        <section id="video" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-10 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-sm">Étape 3</span>
            <h2 className="text-2xl font-bold text-slate-800 m-0">Script Vidéo (2 Minutes)</h2>
          </div>
          <p className="text-slate-500 mb-8 text-lg">Ce qu'il faut montrer à l'écran et lire en voix-off.</p>

          <div className="space-y-6">
            <div className="border-l-4 border-slate-300 pl-5 relative">
              <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[8px] top-1.5"></div>
              <div className="font-bold text-slate-500 uppercase tracking-wider text-sm mb-1">0:00 - 0:15 | L'Accroche</div>
              <p className="text-slate-700 mb-3"><strong className="text-slate-900">📹 Écran :</strong> Logo Vision Immo 2.0 puis écran de connexion.</p>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg text-slate-700 italic font-medium">
                "Gérer des dizaines de locataires avec des cahiers et des fichiers Excel ? C'est de l'histoire ancienne. Découvrez Vision Immo 2.0..."
              </div>
            </div>

            <div className="border-l-4 border-slate-300 pl-5 relative">
              <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[8px] top-1.5"></div>
              <div className="font-bold text-slate-500 uppercase tracking-wider text-sm mb-1">0:15 - 0:45 | Le Tableau de Bord</div>
              <p className="text-slate-700 mb-3"><strong className="text-slate-900">📹 Écran :</strong> Survol des statistiques et graphiques.</p>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg text-slate-700 italic font-medium">
                "Dès votre connexion, votre tableau de bord vous offre une transparence totale. En un clin d'œil, vous suivez vos revenus..."
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-5 relative">
              <div className="absolute w-3 h-3 bg-orange-500 rounded-full -left-[8px] top-1.5 shadow-[0_0_0_4px_rgba(249,115,22,0.2)]"></div>
              <div className="font-bold text-orange-600 uppercase tracking-wider text-sm mb-1">0:45 - 1:15 | Paiements (La feature clé)</div>
              <p className="text-slate-700 mb-3"><strong className="text-slate-900">📹 Écran :</strong> Vue locataire (Mobile Money) ➔ Notification gérant ➔ Quittance PDF générée.</p>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg text-slate-700 italic font-medium">
                "La vraie révolution ? Les paiements via Mobile Money. Dès que le paiement est validé, une quittance est envoyée automatiquement. C'est magique."
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 : SCRIPT VENTE */}
        <section id="vente" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-10 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-sm">Étape 4</span>
            <h2 className="text-2xl font-bold text-slate-800 m-0">Script d'Appel (Cold Calling)</h2>
          </div>
          <p className="text-slate-500 mb-8 text-lg">L'objectif est de décrocher 10 minutes de visio pour montrer la vidéo.</p>

          <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📞</span> L'Introduction & L'Accroche
          </h3>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0 shadow-sm">V</div>
              <div>
                <strong className="text-slate-900 block mb-1">Vous :</strong>
                <p className="text-slate-700 m-0">"Bonjour, c'est Venance de Vision Immo 2.0. Est-ce que vous avez 30 secondes ?"</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0 shadow-sm">V</div>
              <div>
                <strong className="text-slate-900 block mb-1">Vous :</strong>
                <p className="text-slate-700 m-0">"Dites-moi, c'est toujours vous qui courrez après les locataires à la fin du mois, ou vous avez déjà automatisé ça ?"</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0 shadow-sm">V</div>
              <div>
                <strong className="text-slate-900 block mb-1">Vous :</strong>
                <p className="text-slate-700 m-0">"C'est exactement pour ça que j'appelle. On a créé un logiciel qui encaisse les loyers via Mobile Money, génère les quittances, et enlève la paperasse."</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-slate-800 mt-10 mb-4 flex items-center gap-2">
            <span className="text-2xl">🛡️</span> Gestion des Objections
          </h3>
          <div className="grid gap-4">
            <div className="border border-slate-200 rounded-xl p-5 hover:border-orange-300 transition-colors">
              <strong className="text-slate-900 text-lg block mb-2">"J'utilise déjà Excel..."</strong>
              <span className="text-slate-600">"Excel est super, mais Excel n'encaisse pas l'argent sur Mobile Money à votre place et n'envoie pas de SMS de relance. Laissez-moi vous montrer en 10 minutes."</span>
            </div>
            <div className="border border-slate-200 rounded-xl p-5 hover:border-orange-300 transition-colors">
              <strong className="text-slate-900 text-lg block mb-2">"Mes locataires ne sauront pas utiliser ça..."</strong>
              <span className="text-slate-600">"Ils n'ont rien à télécharger. Ils reçoivent un SMS avec un lien, ils valident sur Orange Money ou Wave, et c'est fini. S'ils ont WhatsApp, ils sauront utiliser Vision Immo 2.0."</span>
            </div>
          </div>
        </section>

        <footer className="text-center text-slate-400 text-sm pb-12 mt-16 border-t border-slate-200 pt-8">
          Créé pour <strong className="text-slate-600">Vision Immo 2.0</strong> en 2026.
        </footer>
      </main>
    </div>
  );
}
