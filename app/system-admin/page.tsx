"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/store";

export default function SystemAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await db.getProfile();
        if (profile?.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          // If a non-admin is here, kick them out to their own dashboard
          if (profile?.role === "tenant") router.push("/locataire/dashboard");
          else router.push("/dashboard");
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
        throw new Error("Identifiants administrateur invalides ou non reconnus.");
      }

      // Check if they are actually an admin
      const profile = await db.getProfile();
      if (profile?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        // They logged in but aren't an admin. Send them away.
        if (profile?.role === "tenant") {
          router.push("/locataire/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: unknown) {
      console.error("Admin Login error:", err);
      const errorObj = err as Error;
      let errorMsg = errorObj.message || "Erreur lors de la connexion.";
      if (errorMsg === "Failed to fetch") {
        errorMsg = "Erreur de réseau. Veuillez vérifier votre connexion.";
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
      background: 'var(--gray-900)',
      padding: 'var(--space-4)'
    }} className="animate-fade-in">
      <div className="card" style={{ width: '100%', maxWidth: '440px', background: 'var(--gray-800)', border: '1px solid var(--gray-700)', padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', position: 'relative' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginBottom: 'var(--space-2)' }}>
            <ArrowLeft size={12} /> Retour au site public
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ShieldAlert size={28} color="var(--danger)" />
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--white)', margin: 0 }}>Portail Système</h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', margin: 0 }}>
            Accès restreint au Super Administrateur
          </p>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "1px solid var(--danger)", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "var(--space-4)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label className="input-label" style={{ color: 'var(--gray-300)' }}>Adresse E-mail Admin</label>
                <div className="input-with-icon" style={{ background: 'var(--gray-700)', border: 'none' }}>
                  <Mail className="input-icon" size={16} color="var(--gray-400)" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vecoakasa.com"
                    className="input"
                    style={{ background: 'transparent', color: 'var(--white)' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ color: 'var(--gray-300)' }}>Mot de passe</label>
                <div className="input-with-icon" style={{ position: 'relative', background: 'var(--gray-700)', border: 'none' }}>
                  <Lock className="input-icon" size={16} color="var(--gray-400)" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    style={{ paddingRight: '40px', background: 'transparent', color: 'var(--white)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 'var(--space-3)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--gray-400)',
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
                style={{ width: '100%', padding: 'var(--space-3)', display: 'flex', justifyContent: 'center', background: 'var(--danger)', color: 'white', marginTop: 'var(--space-2)' }}
              >
                {loading ? "Vérification..." : "Accéder au système"}
              </button>
            </form>
      </div>
    </div>
  );
}
