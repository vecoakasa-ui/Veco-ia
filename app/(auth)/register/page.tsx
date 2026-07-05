"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, User, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/store";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function RegisterPage({ searchParams }: PageProps) {
  const router = useRouter();
  const resolvedSearchParams = use(searchParams);
  const plan = (resolvedSearchParams.plan as string) || "free";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"owner" | "tenant">("owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await db.getProfile();
        if (profile) {
          if (profile.role === "tenant") {
            router.push("/locataire/dashboard");
          } else if (profile.role === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/dashboard");
          }
        } else {
          await supabase.auth.signOut();
          setError("Impossible de charger le profil de cet utilisateur. Veuillez réessayer.");
        }
      }
    };
    checkAuth();
  }, [router]);


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
            role: role,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        // Force the creation of a profile in the profiles table
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          role: role,
          phone: ""
        });
      }

      if (data?.session) {
        // Inscription réussie avec connexion immédiate
        if (role === "tenant") {
          router.push("/locataire/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Inscription réussie mais nécessite une confirmation d'email
        setSuccessMsg("Votre compte a été créé avec succès ! Veuillez vérifier votre boîte e-mail pour confirmer votre adresse avant de vous connecter.");
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorObj = err as Error;
      setError(errorObj.message || "Une erreur est survenue lors de l'inscription");
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
      <div className="card" style={{ width: '100%', maxWidth: '480px', background: 'var(--white)', padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>
            <ArrowLeft size={12} /> Retour à l&apos;accueil
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="logo-icon" style={{ background: 'var(--orange)' }}>V</div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: 0 }}>Vision Immo 2.0</h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0 }}>
            {plan !== 'free' ? "Créez votre compte pour activer votre abonnement" : "Créez votre compte gratuit en moins de 2 minutes"}
          </p>
          {(plan === 'pro' || plan === 'business') && (
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

        {successMsg && (
          <div style={{ background: "var(--success-lightest)", color: "var(--success)", padding: "15px", borderRadius: "8px", fontSize: "14px", marginBottom: "var(--space-4)", border: "1px solid var(--success)", textAlign: "center" }}>
            {successMsg}
          </div>
        )}

        {!successMsg && (
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
                <label className="input-label">Mot de passe</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <Lock className="input-icon" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
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
                {loading ? "Création en cours..." : "Créer mon compte par e-mail"}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-4) 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }}></div>
                <span style={{ padding: '0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: '500' }}>OU</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }}></div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('oauth_role', role);
                  }
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      queryParams: {
                        prompt: 'select_account',
                      },
                      redirectTo: `${window.location.origin}/dashboard`
                    }
                  });
                }}
                className="btn btn-outline"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: 'var(--space-3)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </button>
            </form>
        )}

          <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', margin: 0 }}>
              Vous avez déjà un compte ?
            </p>
            <Link href="/login" className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              Se connecter
            </Link>
          </div>
      </div>
    </div>
  );
}

