"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Redirection automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

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

      // 2. Send OTP (Magic Link)
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (otpError) throw otpError;

      setSuccessMsg("Un lien magique a été envoyé à votre adresse e-mail. Cliquez dessus pour vous connecter.");
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      if (error) throw error;
    } catch (err: unknown) {
      console.error("Google login error:", err);
      const errorObj = err as Error;
      setError(errorObj.message || "Erreur lors de la connexion avec Google.");
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn btn-outline"
              style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', borderRadius: 'var(--radius-lg)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.72 17.56V20.31H19.28C21.36 18.39 22.56 15.58 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.31L15.72 17.56C14.74 18.22 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.1H2.18V16.94C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                <path d="M5.84 14.1C5.62 13.44 5.49 12.73 5.49 12C5.49 11.27 5.62 10.56 5.84 9.9V7.06H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.94L5.84 14.1Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.03L19.35 3.89C17.45 2.11 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335"/>
              </svg>
              {loading ? "Connexion..." : "Continuer avec Google"}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-2) 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }}></div>
              <span style={{ margin: '0 10px', fontSize: '12px', color: 'var(--gray-500)', fontWeight: '500' }}>OU PAR E-MAIL</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }}></div>
            </div>

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
                  Une fois votre mot de passe validé, un lien de connexion magique vous sera envoyé par e-mail.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center' }}
              >
                {loading ? "Envoi du lien..." : "Recevoir mon lien de connexion"}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ background: "var(--primary-lightest)", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", marginBottom: "var(--space-2)" }}>
              <Mail size={40} style={{ color: "var(--primary)", margin: "0 auto var(--space-3)" }} />
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "600", marginBottom: "var(--space-2)", color: "var(--gray-900)" }}>
                Vérifiez vos e-mails
              </h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-600)", margin: 0, lineHeight: "1.5" }}>
                Nous avons envoyé un lien magique à <strong>{email}</strong>.
                <br /><br />
                Cliquez simplement sur le bouton dans cet e-mail pour accéder automatiquement à votre tableau de bord.
              </p>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: '0' }}>
              Vous ne trouvez pas l'e-mail ? Vérifiez le dossier spam.
            </p>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', marginTop: '8px', fontWeight: '500' }}
            >
              Je n'ai pas reçu d'e-mail (Réessayer)
            </button>
          </div>
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
