"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (signInError) throw signInError;

      setSuccessMsg("Un code de sécurité a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de réception.");
      setStep(2);
    } catch (err: unknown) {
      console.error("OTP send error:", err);
      const errorObj = err as Error;
      setError(errorObj.message || "Erreur lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email'
      });

      if (verifyError) throw verifyError;

      const userRole = data.user?.user_metadata?.role || "owner";

      // Update local storage explicitly to speed up dashboard rendering
      localStorage.setItem("userRole", userRole);
      
      // Route to dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("OTP verify error:", err);
      const errorObj = err as Error;
      setError(errorObj.message || "Code incorrect ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-lightest) 0%, var(--gray-100) 100%)',
      padding: 'var(--space-4)'
    }} className="animate-fade-in">
      <div className="card" style={{ width: '100%', maxWidth: '440px', background: 'white', padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', position: 'relative' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>
            <ArrowLeft size={12} /> Retour à l&apos;accueil
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="logo-icon" style={{ background: 'var(--orange)' }}>V</div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: 0 }}>VENANCE IMO</h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0 }}>
            {step === 1 ? "Connectez-vous à votre espace de gestion de façon sécurisée" : "Vérification de sécurité"}
          </p>
        </div>

        {error && (
          <div style={{ background: "var(--danger-lightest)", color: "var(--danger)", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "var(--space-4)" }}>
            {error}
          </div>
        )}

        {successMsg && step === 2 && (
          <div style={{ background: "var(--success-lightest)", color: "var(--success)", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "var(--space-4)" }}>
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label className="input-label">Adresse E-mail</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="input"
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '8px' }}>
                Un code de sécurité à 6 chiffres vous sera envoyé par e-mail.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center' }}
            >
              {loading ? "Envoi du code..." : "Recevoir mon code de connexion"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label className="input-label">Code de sécurité (OTP)</label>
              <div className="input-with-icon">
                <KeyRound className="input-icon" size={16} />
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Collez le code à 6 chiffres ici"
                  className="input"
                  style={{ letterSpacing: '2px', fontSize: '16px', fontWeight: 'bold' }}
                  maxLength={6}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '8px' }}>
                Consultez l'adresse {email}. Si vous ne voyez rien, vérifiez vos spams.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="btn btn-primary"
              style={{ width: '100%', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center' }}
            >
              {loading ? "Vérification..." : "Se connecter"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', marginTop: '8px', fontWeight: '500' }}
            >
              Je n'ai pas reçu de code (Réessayer)
            </button>
          </form>
        )}

        {step === 1 && (
          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Vous n&apos;avez pas encore de compte ?{" "}
            <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Inscrivez-vous gratuitement
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
