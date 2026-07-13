"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Printer, Smartphone, ArrowLeft } from "lucide-react";
import { db } from "@/lib/store";
import { Payment, PaymentMethod } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function PaymentSuccessPage({ params, searchParams }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const resolvedSearchParams = use(searchParams);

  const token = resolvedSearchParams.token as string || "";
  const queryMethod = resolvedSearchParams.method as string || "paydunya";

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Perform verification and state update
    const verifyAndSettle = async () => {
      try {
        let isInstallment = id.startsWith("inst-");
        let found: any = null;

        if (isInstallment) {
          // Verify with API route for token
          let isSuccess = false;
          let finalMethod = queryMethod;

          if (token.startsWith("mock_tok_")) {
            isSuccess = true;
          } else if (token) {
            const response = await fetch(`/api/paydunya/verify?token=${token}`);
            if (response.ok) {
              const data = await response.json();
              if (data.status === "completed") {
                isSuccess = true;
                if (data.paymentMethod) finalMethod = data.paymentMethod;
              }
            }
          } else {
            isSuccess = true;
          }

          if (isSuccess) {
            const { error } = await supabase
              .from('sale_installments')
              .update({
                status: 'paid',
                payment_method: finalMethod,
                payment_date: new Date().toISOString()
              })
              .eq('id', id);
            
            if (!error) {
               // Re-fetch installment for display
               const { data } = await supabase.from('sale_installments').select('*').eq('id', id).single();
               if (data) {
                 found = {
                   id: data.id,
                   amount: data.amount,
                   total: data.amount,
                   status: 'paid',
                   month: 'Échéance',
                   year: new Date(data.due_date).getFullYear(),
                   payment_date: data.payment_date,
                   payment_method: data.payment_method,
                   tenant_name: "Acheteur",
                   property_name: "Acquisition",
                   due_date: data.due_date
                 };
               }
            }
          }
        } else {
          // Normal rental payment flow
          const list = await db.getPayments();
          found = list.find(p => p.id === id);

          // Fallback mock payment if opened in a different browser/session
          if (!found) {
            found = {
              id: id,
              tenant_id: "tenant-mock",
              property_id: "prop-mock",
              owner_id: "owner-1",
              amount: 250000,
              charges: 15000,
              total: 265000,
              month: "Juin",
              year: 2026,
              status: "pending",
              payment_method: "paydunya",
              stripe_payment_id: null,
              payment_date: null,
              due_date: "2026-06-15",
              created_at: new Date().toISOString(),
              tenant_name: "Koffi Kouassi (Locataire Démo)",
              property_name: "Villa Hibiscus"
            };
          }

          let isSuccess = false;
          let finalMethod = queryMethod;

          if (token.startsWith("mock_tok_")) {
            isSuccess = true;
          } else if (token) {
            const response = await fetch(`/api/paydunya/verify?token=${token}`);
            if (response.ok) {
              const data = await response.json();
              if (data.status === "completed") {
                isSuccess = true;
                if (data.paymentMethod) {
                  finalMethod = data.paymentMethod;
                }
              }
            }
          } else {
            isSuccess = true;
          }

          if (isSuccess && found) {
            found.status = "paid";
            found.payment_method = finalMethod as PaymentMethod;
            found.payment_date = new Date().toISOString().split('T')[0];
            await db.updatePayment(found);
            window.dispatchEvent(new Event("storage"));
          }
        }

        
        setPayment(found);
      } catch (error) {
        console.error("Verification error:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyAndSettle();
  }, [id, token, queryMethod]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--gray-50)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid var(--gray-200)", borderTopColor: "var(--primary)", borderRadius: "50%", margin: "0 auto var(--space-4)" }}></div>
          <p style={{ color: "var(--gray-500)", fontWeight: 500 }}>Validation du règlement...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--gray-50)" }}>
        <div className="card" style={{ maxWidth: "400px", textAlign: "center" }}>
          <p style={{ color: "var(--danger)" }}>Erreur lors de la validation du loyer.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", display: "flex", flexDirection: "column", padding: "var(--space-8) 0" }}>
      {/* Receipt Page Printable Area */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="container" style={{ maxWidth: "520px", padding: "0 var(--space-4)" }}>
          <div className="card animate-scale-in" style={{ padding: "var(--space-8)", boxShadow: "var(--shadow-xl)", position: "relative" }}>
            
            {/* Success icon */}
            <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
              <CheckCircle2 size={56} style={{ color: "var(--success)", margin: "0 auto var(--space-3)" }} />
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)" }}>Paiement Réussi !</h2>
              <p style={{ color: "var(--gray-500)", fontSize: "var(--text-xs)", marginTop: "2px" }}>Votre règlement a bien été pris en compte.</p>
            </div>

            {/* Receipt Details */}
            <div style={{ borderTop: "2px dashed var(--gray-200)", borderBottom: "2px dashed var(--gray-200)", padding: "var(--space-5) 0", marginBottom: "var(--space-6)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--gray-500)" }}>ID de Transaction</span>
                  <span style={{ fontWeight: 600, color: "var(--gray-800)", fontFamily: "var(--font-mono)" }}>
                    {token.substring(0, 16) || "PAYDUNYA-DEMO"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--gray-500)" }}>Date de Paiement</span>
                  <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>
                    {payment.payment_date ? formatDate(payment.payment_date) : formatDate(new Date().toISOString().split('T')[0])}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--gray-500)" }}>Méthode</span>
                  <span style={{ fontWeight: 600, color: "var(--gray-800)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Smartphone size={12} />
                    {payment.payment_method?.replace("_", " ") || "PayDunya"}
                  </span>
                </div>

                <div style={{ width: "100%", height: "1px", background: "var(--gray-100)" }}></div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--gray-500)" }}>Locataire</span>
                  <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>{payment.tenant_name}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--gray-500)" }}>Bien immobilier</span>
                  <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>{payment.property_name}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--gray-500)" }}>Mois de Loyer</span>
                  <span style={{ fontWeight: 600, color: "var(--gray-800)", textTransform: "capitalize" }}>
                    {payment.month} {payment.year}
                  </span>
                </div>

                <div style={{ width: "100%", height: "1px", background: "var(--gray-100)" }}></div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>Montant réglé</span>
                  <span style={{ fontWeight: 900, fontSize: "var(--text-lg)", color: "var(--success-dark)" }}>
                    {formatCurrency(payment.total)}
                  </span>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }} className="hide-on-print">
              <button 
                className="btn btn-primary" 
                style={{ width: "100%", justifyContent: "center", gap: "8px" }}
                onClick={handlePrint}
              >
                <Printer size={16} /> Imprimer le reçu
              </button>

              <button 
                className="btn btn-outline" 
                style={{ width: "100%", justifyContent: "center", gap: "8px" }}
                onClick={() => router.push("/paiements")}
              >
                <ArrowLeft size={16} /> Retour aux paiements
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Global CSS to support printing hide-ons */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .hide-on-print {
            display: none !important;
          }
          .card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
