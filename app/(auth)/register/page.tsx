"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, User, CheckCircle2, Eye, EyeOff } from "lucide-react";
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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"owner" | "tenant">("owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      // Inscription réussie
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorObj = err as Error;
      setError(errorObj.message || "Une erreur est survenue lors de l'inscription");
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
            </form>

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

