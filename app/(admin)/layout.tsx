"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Activity, LogOut, Settings, ShieldAlert, Building, FileText, CreditCard, AlertTriangle, Crown, BarChart3 } from "lucide-react";
import { db } from "@/lib/store";
import { supabase } from "@/lib/supabase";

import { playNotificationBeep, playAlertBeep } from "@/lib/audio";

const inter = Inter({ subsets: ["latin"] });

const adminNavItems = [
  { label: "Vue Globale", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Analyses & Stats", href: "/admin/analyses", icon: BarChart3 },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { label: "Abonnements SaaS", href: "/admin/abonnements", icon: Crown },
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthorized(false);
        router.push("/login");
        return;
      }

      try {
        const profile = await db.getProfile();
        // Vérification stricte : seuls les rôles administrateurs ont accès à cet espace
        if (profile && profile.role === "admin") {
          setIsAuthorized(true);
        } else {
          // Tentative d'accès non autorisée détectée !
          // On envoie un broadcast (alerte) au Super Admin s'il est connecté
          const alertChannel = supabase.channel('admin_alerts');
          alertChannel.subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              alertChannel.send({
                type: 'broadcast',
                event: 'unauthorized_access',
                payload: { email: profile?.email }
              });
              // On peut fermer ce canal d'envoi après 1 seconde
              setTimeout(() => { supabase.removeChannel(alertChannel); }, 1000);
            }
          });

          setIsAuthorized(false);
          if (profile?.role === "tenant") router.push("/locataire/dashboard");
          else router.push("/dashboard"); // Redirection des intrus
        }
      } catch {
        setIsAuthorized(false);
        router.push("/login");
      }
    }
    checkAdminAccess();
  }, [router]);

  // Écouteur global pour les notifications sonores de l'Administrateur
  useEffect(() => {
    if (isAuthorized) {
      const channel = supabase.channel('admin_alerts')
        // Écouter les ajouts de biens
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'properties' }, () => {
          playNotificationBeep();
        })
        // Écouter les nouveaux incidents déclarés
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' }, () => {
          playNotificationBeep();
        })
        // Écouter les paiements de loyer
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
          playNotificationBeep();
        })
        // Écouter les alertes d'accès non autorisé
        .on('broadcast', { event: 'unauthorized_access' }, () => {
          playAlertBeep();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthorized]);

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
        zIndex: 50,
        overflowY: "auto"
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
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/system-admin'); }} className="admin-nav-item logout" style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer" }}>
            <LogOut size={22} className="admin-nav-icon" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ background: "#f8fafc", flex: 1, marginLeft: "300px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header className="header" style={{ 
          borderBottom: "1px solid #e2e8f0", 
          background: "#FFFFFF",
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="hide-mobile" style={{ fontWeight: 800, color: "#1e293b", fontSize: "22px" }}>Espace Super Administrateur</span>
            <span className="badge" style={{ background: "rgba(255, 130, 0, 0.1)", color: "#FF8200", border: "1px solid rgba(255, 130, 0, 0.2)", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: "bold" }}>ADMINISTRATEUR</span>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/system-admin'); }} className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "rgba(255, 130, 0, 0.1)", color: "#FF8200", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "14px", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255, 130, 0, 0.2)"; }} onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255, 130, 0, 0.1)"; }}>
             <LogOut size={16} />
             Déconnexion sécurisée
          </button>
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
        
        /* Mobile Responsive Admin Layout */
        @media (max-width: 768px) {
          .app-layout {
            flex-direction: column !important;
          }
          .sidebar {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            padding: 16px !important;
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0 !important;
            z-index: 10 !important;
          }
          .sidebar-logo {
            margin-bottom: 16px !important;
          }
          .sidebar-nav {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .admin-nav-item {
            padding: 10px !important;
          }
          .admin-nav-item span {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
          }
          .content-area {
            padding: 16px !important;
          }
          .header {
            padding: 16px !important;
          }
          .header span:first-child {
            font-size: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}
