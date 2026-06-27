"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Activity, LogOut, Settings, ShieldAlert } from "lucide-react";
import { db } from "@/lib/store";

const inter = Inter({ subsets: ["latin"] });

const adminNavItems = [
  { label: "Vue Globale", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { label: "Système & Anomalies", href: "/admin/systeme", icon: Activity },
  { label: "Paramètres", href: "/admin/parametres", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const profile = await db.getProfile();
        // Vérification stricte : seul vecoakasa a accès à cet espace
        if (profile && profile.email?.toLowerCase() === "vecoakasa@gmail.com") {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push("/dashboard"); // Redirection des intrus
        }
      } catch (err) {
        setIsAuthorized(false);
        router.push("/login");
      }
    }
    checkAdminAccess();
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--gray-50)", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--gray-200)", borderTopColor: "var(--danger)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ color: "var(--gray-500)", fontSize: "14px", fontWeight: "600" }}>Vérification des droits d'accès sécurisés...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Redirection en cours
  }

  return (
    <div className={`app-layout ${inter.className}`}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ background: "var(--gray-900)" }}>
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ background: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={16} color="white" />
          </div>
          <span style={{ color: "white" }}>Veco Admin</span>
        </div>
        
        <nav className="sidebar-nav">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="nav-item">
                <Icon size={20} className="nav-icon" style={{ color: "var(--gray-400)" }} />
                <span style={{ color: "var(--gray-300)" }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div style={{ marginTop: "auto" }}>
          <Link href="/dashboard" className="nav-item" style={{ color: "var(--gray-400)" }}>
            <LogOut size={20} className="nav-icon" />
            <span>Quitter Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header" style={{ borderBottom: "1px solid var(--gray-200)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span style={{ fontWeight: 800, color: "var(--gray-900)" }}>Espace Super Administrateur</span>
            <span className="badge badge-primary" style={{ background: "var(--danger)", color: "white" }}>ADMIN</span>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
