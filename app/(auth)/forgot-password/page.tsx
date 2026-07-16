"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccessMsg("Un lien de réinitialisation a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de réception (et vos spams).");
      setCountdown(60);
    } catch (err: unknown) {
      console.error("Reset password error:", err);
      const errorObj = err as Error;
      setError(errorObj.message || "Erreur lors de la demande de réinitialisation.");
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
      <div className="card" style={{ width: '100%', maxWidth: '440px', background: 'var(--white)', padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', position: 'relative' }}>
          <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>
            <ArrowLeft size={12} /> Retour à la connexion
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            { }
            <img src="/logo.png" alt="Vision Immo 2.0 Logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: 0 }}>Mot de passe oublié</h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0 }}>
            Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {error && (
          <div style={{ background: "var(--danger-lightest)", color: "var(--danger)", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "var(--space-4)" }}>
            {error}
          </div>
        )}

        {successMsg ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ background: "var(--success-lightest)", color: "var(--success)", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}>
              {successMsg}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
              {countdown > 0 ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0 }}>
                  Vous n'avez pas reçu l'e-mail ? Vous pourrez le renvoyer dans <strong style={{ color: 'var(--primary)' }}>{countdown}s</strong>.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0 }}>
                    Vous n'avez toujours rien reçu ?
                  </p>
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="btn btn-outline"
                    style={{ width: '100%', padding: 'var(--space-2)', display: 'flex', justifyContent: 'center' }}
                  >
                    {loading ? "Envoi en cours..." : "Renvoyer le lien"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center' }}
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
