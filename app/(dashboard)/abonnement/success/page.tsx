"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { db } from "@/lib/store";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function SubscriptionSuccessPage({ searchParams }: PageProps) {
  const router = useRouter();
  const resolvedSearchParams = use(searchParams);
  const plan = resolvedSearchParams.plan as string || "pro";

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update profile plan in localStorage
    const profile = db.getProfile();
    profile.subscription_plan = plan as "free" | "pro" | "business";
    db.updateProfile(profile);

    // Dispatch custom event to notify layout (sidebar) to reload profile
    window.dispatchEvent(new Event("storage"));
    
    Promise.resolve().then(() => {
      setLoading(false);
    });
  }, [plan]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="animate-spin" style={{ width: "32px", height: "32px", border: "4px solid var(--gray-200)", borderTopColor: "var(--primary)", borderRadius: "50%" }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: "var(--space-4)" }}>
      <div className="card animate-scale-in" style={{ maxWidth: "460px", width: "100%", textAlign: "center", padding: "var(--space-8)", boxShadow: "var(--shadow-lg)" }}>
        
        <div style={{ position: "relative", display: "inline-block", margin: "0 auto var(--space-4)" }}>
          <CheckCircle2 size={56} style={{ color: "var(--success)" }} />
          <Sparkles size={20} style={{ color: "var(--warning)", position: "absolute", top: "-6px", right: "-6px" }} />
        </div>

        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", marginBottom: "var(--space-2)" }}>
          Félicitations !
        </h2>
        
        <p style={{ color: "var(--gray-600)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
          Votre abonnement au **Plan {plan.toUpperCase()}** a bien été validé et activé avec succès.
        </p>

        <div style={{ background: "var(--primary-lightest)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", marginBottom: "var(--space-8)" }}>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--primary-dark)", fontWeight: "600", margin: 0 }}>
            Toutes les fonctionnalités de votre formule sont maintenant débloquées !
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: "100%", justifyContent: "center", gap: "8px" }}
          onClick={() => router.push("/dashboard")}
        >
          <span>Accéder au Tableau de Bord</span>
          <ArrowRight size={16} />
        </button>

      </div>
    </div>
  );
}
