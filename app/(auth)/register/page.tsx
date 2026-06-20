"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, Phone, User, CheckCircle2, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function RegisterPage({ searchParams }: PageProps) {
  const router = useRouter();
  const resolvedSearchParams = use(searchParams);
  const plan = (resolvedSearchParams.plan as string) || "free";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "tenant">("owner");
  const [step, setStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: role,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user && !data.session) {
        // This means Supabase requires email confirmation
        setSuccessMsg("Votre compte a été créé ! Un code de sécurité a été envoyé à votre adresse e-mail.");
        setStep(2);
        setLoading(false);
        return;
      }

      // If session is available immediately
      localStorage.setItem("userRole", role);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorObj = err as Error;
      setError(errorObj.message || "Une erreur est survenue lors de l'inscription");
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
        type: 'signup'
      });

      if (verifyError) throw verifyError;

      localStorage.setItem("userRole", role);
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
      padding: 'var(--space-6) var(--space-4)'
    }} className="animate-fade-in">
      <div className="card" style={{ width: '100%', maxWidth: '480px', background: 'white', padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>
            <ArrowLeft size={12} /> Retour à l&apos;accueil
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="logo-icon" style={{ background: 'var(--orange)' }}>V</div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: 0 }}>VENANCE IMO</h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0 }}>
            {step === 1 
              ? (plan !== 'free' ? "Créez votre compte pour activer votre abonnement" : "Créez votre compte gratuit en moins de 2 minutes")
              : "Vérification de votre adresse e-mail"}
          </p>
          {(plan === 'pro' || plan === 'business') && step === 1 && (
            <div style={{ background: "var(--primary-lightest)", padding: "10px 12px", borderRadius: "8px", border: "1px dashed var(--primary)", marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
              <span style={{ fontSize: "11px", color: "var(--primary-dark)", fontWeight: "600" }}>
                Paiement validé ! Plan {plan.toUpperCase()} pré-activé.
              </span>
            </div>
          )}
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Role selector tab */}
            <div className="input-group">
              <label className="input-label">Vous êtes un :</label>
              <div style={{ display: 'flex', background: 'var(--gray-100)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${role === 'owner' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setRole('owner')}
                  style={{ flex: 1, borderRadius: 'var(--radius-md)', padding: '6px' }}
                >
                  Propriétaire / Bailleur
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${role === 'tenant' ? 'btn-orange' : 'btn-ghost'}`}
                  onClick={() => setRole('tenant')}
                  style={{ flex: 1, borderRadius: 'var(--radius-md)', padding: '6px' }}
                >
                  Locataire
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Nom complet</label>
              <div className="input-with-icon">
                <User className="input-icon" size={16} />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Jean Koffi"
                  className="input"
                />
              </div>
            </div>

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
              <label className="input-label">Numéro de Téléphone</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={16} />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +225 07 00 00 00"
                  className="input"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Mot de passe</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <input type="checkbox" id="terms" required style={{ accentColor: 'var(--primary)', marginTop: '3px' }} />
              <label htmlFor="terms" style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', cursor: 'pointer', lineHeight: '1.4' }}>
                J&apos;accepte les <a href="#" style={{ color: 'var(--primary)', fontWeight: '500' }}>Conditions Générales d&apos;Utilisation</a> et la <a href="#" style={{ color: 'var(--primary)', fontWeight: '500' }}>Politique de Confidentialité</a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center' }}
            >
              {loading ? "Création en cours..." : "Créer mon compte"}
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
              {loading ? "Vérification..." : "Valider mon inscription"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', marginTop: '8px', fontWeight: '500' }}
            >
              Retour
            </button>
          </form>
        )}

        {step === 1 && (
          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            Vous avez déjà un compte ?{" "}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Se connecter
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

