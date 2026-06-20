"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      // 1. Verify password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          throw new Error("Veuillez confirmer votre adresse e-mail en cliquant sur le lien que nous vous avons envoyé lors de l'inscription.");
        } else if (signInError.message === "Invalid login credentials") {
          throw new Error("Email ou mot de passe incorrect. Avez-vous bien créé un compte ?");
        } else {
          throw signInError;
        }
      }

      // 2. Send OTP
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (otpError) throw otpError;

      setSuccessMsg("Un code de sécurité a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de réception.");
      setStep(2);
    } catch (err: unknown) {
      console.error("Login error:", err);
      const errorObj = err as Error;
      let errorMsg = errorObj.message || "Erreur lors de la connexion.";
      if (errorMsg === "Failed to fetch") {
        errorMsg = "Erreur de réseau. Veuillez vérifier votre connexion ou désactiver votre bloqueur de publicités.";
      }
      setError(errorMsg);
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
            </div>

            <div className="input-group">
              <label className="input-label">Mot de passe</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock className="input-icon" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--gray-500)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '8px' }}>
                Une fois votre mot de passe validé, un code de sécurité à 6 chiffres vous sera envoyé par e-mail.
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
