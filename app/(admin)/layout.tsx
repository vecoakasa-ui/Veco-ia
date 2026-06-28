"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Activity, LogOut, Settings, ShieldAlert, Building, FileText, CreditCard, AlertTriangle } from "lucide-react";
import { db } from "@/lib/store";

const inter = Inter({ subsets: ["latin"] });

const adminNavItems = [
  { label: "Vue Globale", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { label: "Gestion des Biens", href: "/admin/biens", icon: Building },
  { label: "Gestion des Contrats", href: "/admin/contrats", icon: FileText },
  { label: "Gestion Financière", href: "/admin/finances", icon: CreditCard },
  { label: "Support & Incidents", href: "/admin/incidents", icon: AlertTriangle },
  { label: "Système & Anomalies", href: "/admin/systeme", icon: Activity },
  { label: "Paramètres", href: "/admin/parametres", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--gray-200)", borderTopColor: "#009A44", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ color: "var(--gray-500)", fontSize: "14px", fontWeight: "600" }}>Vérification des droits d'accès sécurisés...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Redirection en cours
  }

  return (
    <div className={`app-layout ${inter.className}`} style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Épurée (Thème Côte d'Ivoire) */}
      <aside className="sidebar" style={{ 
        background: "#FFFFFF", 
        borderRight: "1px solid #e2e8f0",
        padding: "32px 20px",
        display: "flex",
        flexDirection: "column",
        width: "300px",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        height: "100vh",
        zIndex: 50
      }}>
        <div className="sidebar-logo" style={{ marginBottom: "40px", padding: "0 12px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="logo-icon" style={{ 
            background: "#009A44", // Vert Drapeau CI
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            borderRadius: "12px",
            width: "48px",
            height: "48px",
            boxShadow: "0 8px 16px rgba(0, 154, 68, 0.2)",
            flexShrink: 0
          }}>
            <ShieldAlert size={24} color="#FFFFFF" />
          </div>
          <span style={{ color: "#1e293b", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
            Veco<span style={{ color: "#FF8200" }}>Admin</span>
          </span>
        </div>
        
        <nav className="sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`admin-nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={22} className="admin-nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div style={{ marginTop: "auto" }}>
          <div style={{ height: "1px", background: "#e2e8f0", margin: "24px 0" }}></div>
          <Link href="/dashboard" className="admin-nav-item logout">
            <LogOut size={22} className="admin-nav-icon" />
            <span>Quitter l'espace Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ background: "#f8fafc", flex: 1, marginLeft: "300px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header className="header" style={{ 
          borderBottom: "1px solid #e2e8f0", 
          background: "#FFFFFF",
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: 800, color: "#1e293b", fontSize: "22px" }}>Espace Super Administrateur</span>
            <span className="badge" style={{ background: "rgba(255, 130, 0, 0.1)", color: "#FF8200", border: "1px solid rgba(255, 130, 0, 0.2)", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: "bold" }}>ADMINISTRATEUR</span>
          </div>
        </header>
        <div className="content-area" style={{ flex: 1, padding: "32px" }}>
          {children}
        </div>
      </main>

      <style jsx global>{`
        .admin-nav-item {
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          color: #64748b;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        .admin-nav-item:hover {
          background: rgba(255, 130, 0, 0.05);
          color: #FF8200;
          border-color: rgba(255, 130, 0, 0.1);
        }
        .admin-nav-item:hover .admin-nav-icon {
          color: #FF8200;
        }
        .admin-nav-item.active {
          background: #FF8200;
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(255, 130, 0, 0.2);
        }
        .admin-nav-item.active .admin-nav-icon {
          color: #FFFFFF;
        }
        .admin-nav-icon {
          color: #94a3b8;
          transition: color 0.3s ease;
          flex-shrink: 0;
        }
        .admin-nav-item.logout {
          background: #f1f5f9;
          color: #475569;
          border-color: #e2e8f0;
        }
        .admin-nav-item.logout:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fca5a5;
        }
        .admin-nav-item.logout:hover .admin-nav-icon {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}
