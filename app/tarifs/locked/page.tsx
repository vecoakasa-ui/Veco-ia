"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle2, ShieldAlert, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/store";
import { Profile } from "@/lib/types";

export default function LockedPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      
      const p = await db.getProfile();
      if (p) {
        setProfile(p);
        
        // If they somehow are active, redirect back to dashboard
        const now = new Date();
        let isLocked = false;
        
        if (p.subscription_status === "expired" || p.subscription_status === "past_due") {
          isLocked = true;
        } else if (p.subscription_status === "trialing" && p.trial_end_date) {
          const trialEnd = new Date(p.trial_end_date);
          if (trialEnd < now) {
            isLocked = true;
          }
        }

        if (!isLocked) {
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--gray-50)", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--gray-200)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-100)", display: "flex", flexDirection: "column" }}>
      {/* Header minimaliste */}
      <header style={{ background: "var(--white)", borderBottom: "1px solid var(--gray-200)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>V</div>
          <span style={{ fontWeight: 800, fontSize: "18px", color: "var(--gray-900)" }}>Vision Immo 2.0</span>
        </div>
        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", color: "var(--gray-500)", cursor: "pointer", fontWeight: 500 }}>
          <LogOut size={16} /> Déconnexion
        </button>
      </header>

      {/* Contenu principal */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="card animate-fade-in" style={{ maxWidth: "500px", width: "100%", textAlign: "center", padding: "40px 32px" }}>
          <div style={{ width: 64, height: 64, background: "var(--danger-lightest)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Lock size={32} style={{ color: "var(--danger)" }} />
          </div>
          
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--gray-900)", marginBottom: "16px" }}>
            Accès Suspendu
          </h1>
          
          <p style={{ color: "var(--gray-600)", lineHeight: 1.6, marginBottom: "32px" }}>
            {profile?.subscription_status === "trialing" 
              ? "Votre période d'essai gratuit de 1 mois est arrivée à son terme. Pour continuer à gérer vos biens, vos locataires et suivre vos paiements, veuillez choisir un plan d'abonnement."
              : "Votre abonnement est expiré ou suspendu. Veuillez réactiver votre abonnement pour retrouver l'accès à votre espace de gestion."}
          </p>

          <div style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: "12px", padding: "20px", marginBottom: "32px", textAlign: "left" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--gray-900)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={16} style={{ color: "var(--primary)" }} /> Ce que vous conservez :
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "Toutes vos données sont conservées en sécurité.",
                "Vos locataires peuvent toujours accéder à leur espace.",
                "Dès la réactivation, vous retrouvez votre tableau de bord intact."
              ].map((text, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--gray-700)" }}>
                  <CheckCircle2 size={16} style={{ color: "var(--success)" }} /> {text}
                </li>
              ))}
            </ul>
          </div>

          <Link 
            href="/#pricing" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "14px", fontSize: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
          >
            Voir les offres d'abonnement <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    </div>
  );
}
