"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"owner" | "tenant">("owner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("Login page rendered - check Google button");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errorQuery = searchParams.get("error");
    const expectedQuery = searchParams.get("expected");
    
    if (errorQuery === "role_mismatch" && expectedQuery) {
      const roleFr = expectedQuery === "owner" ? "Propriétaire" : "Locataire";
      const attemptFr = expectedQuery === "owner" ? "Locataire" : "Propriétaire";
      setError(`Ce compte est enregistré en tant que ${roleFr}. Vous ne pouvez pas vous connecter en tant que ${attemptFr}.`);
      window.history.replaceState(null, '', '/login');
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await db.getProfile();
        if (profile?.role === "tenant") {
          router.push("/locataire/dashboard");
        } else if (profile?.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === "Invalid login credentials") {
          throw new Error("Email ou mot de passe incorrect. Vérifiez vos identifiants ou assurez-vous d'avoir confirmé votre e-mail si Supabase l'exige.");
        } else if (signInError.message === "Email not confirmed") {
          throw new Error("Votre adresse e-mail n'a pas encore été confirmée. Veuillez vérifier votre boîte de réception.");
        } else {
          throw signInError;
        }
      }

      // Fetch profile to redirect to the correct dashboard
      const profile = await db.getProfile();
      
      if (profile && profile.role !== "admin" && profile.role !== role) {
        await supabase.auth.signOut();
        const roleFr = profile.role === "owner" ? "Propriétaire" : "Locataire";
        const attemptFr = role === "owner" ? "Propriétaire" : "Locataire";
        throw new Error(`Ce compte est enregistré en tant que ${roleFr}. Vous ne pouvez pas vous connecter en tant que ${attemptFr}.`);
      }

      if (profile?.role === "tenant") {
        router.push("/locataire/dashboard");
      } else if (profile?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
      
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>
            <ArrowLeft size={12} /> Retour à l&apos;accueil
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="logo-icon" style={{ background: 'var(--orange)' }}>V</div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: 0 }}>Vision Immo 2.0</h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0 }}>
            Connectez-vous à votre espace de gestion de façon sécurisée
          </p>
        </div>

        {error && (
          <div style={{ background: "var(--danger-lightest)", color: "var(--danger)", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "var(--space-4)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center' }}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '500' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-6) 0' }}>
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

          <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', margin: 0 }}>
              Vous n'avez pas encore de compte ?
            </p>
            <Link href="/register" className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              Créer un compte gratuitement
            </Link>
          </div>
      </div>
    </div>
  );
}
