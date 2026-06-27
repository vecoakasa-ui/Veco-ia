import { Inter } from "next/font/google";
import Link from "next/link";
import { LayoutDashboard, Users, Activity, LogOut, Settings } from "lucide-react";

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
  return (
    <div className={`app-layout ${inter.className}`}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ background: "var(--gray-900)" }}>
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ background: "var(--danger)" }}></div>
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
