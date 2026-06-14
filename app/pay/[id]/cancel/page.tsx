"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentCancelPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--gray-50)", padding: "var(--space-4)" }}>
      <div className="card animate-scale-in" style={{ maxWidth: "440px", width: "100%", textAlign: "center", padding: "var(--space-8)", boxShadow: "var(--shadow-xl)" }}>
        
        <XCircle size={56} style={{ color: "var(--danger)", margin: "0 auto var(--space-4)" }} />
        
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", marginBottom: "var(--space-2)" }}>
          Paiement Annulé
        </h2>
        
        <p style={{ color: "var(--gray-500)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
          La transaction a été annulée ou n&apos;a pas pu aboutir. Aucun montant n&apos;a été débité de votre compte.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <button 
            className="btn btn-primary" 
            style={{ width: "100%", justifyContent: "center", gap: "8px" }}
            onClick={() => router.push(`/pay/${id}`)}
          >
            <RefreshCw size={16} /> Réessayer le règlement
          </button>
          
          <button 
            className="btn btn-outline" 
            style={{ width: "100%", justifyContent: "center", gap: "8px" }}
            onClick={() => router.push("/paiements")}
          >
            <ArrowLeft size={16} /> Quitter
          </button>
        </div>

      </div>
    </div>
  );
}
