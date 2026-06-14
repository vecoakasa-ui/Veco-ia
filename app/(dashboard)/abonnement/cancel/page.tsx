"use client";

import { useRouter } from "next/navigation";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: "var(--space-4)" }}>
      <div className="card animate-scale-in" style={{ maxWidth: "440px", width: "100%", textAlign: "center", padding: "var(--space-8)", boxShadow: "var(--shadow-lg)" }}>
        
        <XCircle size={56} style={{ color: "var(--danger)", margin: "0 auto var(--space-4)" }} />
        
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", marginBottom: "var(--space-2)" }}>
          Transaction Annulée
        </h2>
        
        <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
          La souscription à votre formule a été annulée ou n&apos;a pas pu être finalisée. Aucun montant n&apos;a été prélevé.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <button 
            className="btn btn-primary" 
            style={{ width: "100%", justifyContent: "center", gap: "8px" }}
            onClick={() => router.push("/abonnement")}
          >
            <RefreshCw size={16} /> Réessayer la souscription
          </button>
          
          <button 
            className="btn btn-outline" 
            style={{ width: "100%", justifyContent: "center", gap: "8px" }}
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft size={16} /> Retour au tableau de bord
          </button>
        </div>

      </div>
    </div>
  );
}
