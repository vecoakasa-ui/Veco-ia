"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState<"owner" | "tenant" | "admin">("owner");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Update local storage explicitly to speed up dashboard rendering
      localStorage.setItem("userRole", role);
      
      // Route to dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Login error:", err);
      const errorObj = err as Error;
      let errorMsg = errorObj.message || "Email ou mot de passe incorrect";
      if (errorMsg === "Invalid login credentials" || errorMsg.includes("Email not confirmed")) {
        errorMsg = "Email ou mot de passe incorrect. Si vous venez de créer ce compte, assurez-vous d'avoir cliqué sur le lien de confirmation envoyé par e-mail, ou désactivez l'option 'Confirm Email' dans votre tableau de bord Supabase.";
      }
      setError(errorMsg);
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
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0 }}>Connectez-vous à votre espace de gestion</p>
        </div>

        {error && (
          <div style={{ background: "var(--danger-lightest)", color: "var(--danger)", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "var(--space-4)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Role selector tab */}
          <div style={{ display: 'flex', background: 'var(--gray-100)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
            <button
              type="button"
              className={`btn btn-sm ${role === 'owner' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setRole('owner')}
              style={{ flex: 1, borderRadius: 'var(--radius-md)', padding: '6px' }}
            >
              Propriétaire
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label">Mot de passe</label>
              <a href="#" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: '500' }}>
                Mot de passe oublié ?
              </a>
            </div>
            <div className="input-with-icon">
              <Lock className="input-icon" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <input type="checkbox" id="remember" defaultChecked style={{ accentColor: 'var(--primary)' }} />
            <label htmlFor="remember" style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', cursor: 'pointer' }}>
              Se souvenir de moi
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center' }}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
          Vous n&apos;avez pas encore de compte ?{" "}
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Inscrivez-vous gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
}
