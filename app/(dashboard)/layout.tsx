"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  FileText,
  AlertTriangle,
  FolderLock,
  LogOut,
  Bell,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { db } from "@/lib/store";
import { Profile } from "@/lib/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [profile, setProfile] = useState<Profile>({
    id: "owner-1",
    full_name: "Venance",
    email: "venance@venanceimo.com",
    phone: "+225 07 00 00 00 00",
    role: "owner",
    avatar_url: null,
    subscription_plan: "pro",
    created_at: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const p = await db.getProfile();
      setProfile(p);
    };
    loadProfile();

    const handleStorage = () => {
      loadProfile();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Biens immobiliers", href: "/biens", icon: Building2 },
    { name: "Locataires", href: "/locataires", icon: Users },
    { name: "Loyers & Paiements", href: "/paiements", icon: DollarSign },
    { name: "Quittances", href: "/quittances", icon: FileText },
    { name: "Contrats de bail", href: "/contrats", icon: FolderLock },
    { name: "Incidents", href: "/incidents", icon: AlertTriangle },
    { name: "Mon Abonnement", href: "/abonnement", icon: Sparkles },
  ];

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-100)" }}>
      {/* ============================================
         Sidebar Desktop
         ============================================ */}
      <aside 
        className="hide-mobile"
        style={{
          width: "var(--sidebar-width)",
          background: "var(--gray-900)",
          color: "var(--white)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
          borderRight: "1px solid var(--gray-800)"
        }}
      >
        {/* Logo */}
        <div style={{ height: "var(--topbar-height)", display: "flex", alignItems: "center", padding: "0 var(--space-6)", borderBottom: "1px solid var(--gray-800)" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", textDecoration: "none" }}>
            <div className="logo-icon" style={{ background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={16} className="text-orange" />
            </div>
            <span style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--white)" }}>
              GESTIMMO<span className="text-orange">.CI</span>
            </span>
          </Link>
        </div>

        {/* Menu links */}
        <nav style={{ flex: 1, padding: "var(--space-6) var(--space-3)", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "var(--text-sm)",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--white)" : "var(--gray-400)",
                  background: isActive ? "var(--primary)" : "transparent",
                  borderLeft: isActive ? "4px solid var(--orange)" : "4px solid transparent",
                  paddingLeft: isActive ? "calc(var(--space-4) - 4px)" : "var(--space-4)",
                  transition: "all var(--transition-fast)",
                  textDecoration: "none"
                }}
                className={isActive ? "" : "hover-sidebar-link"}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile section */}
        <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--gray-800)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <div className="avatar avatar-sm" style={{ background: "var(--primary-lighter)", color: "var(--primary-dark)" }}>
              VE
            </div>
            <div style={{ overflow: "hidden" }}>
              <h5 style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--white)", margin: 0 }}>{profile.full_name}</h5>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "2px", textTransform: "uppercase" }}>
                <Sparkles size={10} style={{ color: "var(--warning)" }} /> Plan {profile.subscription_plan}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-2)",
              padding: "var(--space-2) var(--space-3)",
              background: "rgba(239, 68, 68, 0.1)",
              color: "var(--danger)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background var(--transition-fast)"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
          >
            <LogOut size={14} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* ============================================
         Sidebar Mobile Menu (Overlay)
         ============================================ */}
      {mobileOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(17, 24, 39, 0.7)",
            zIndex: 50,
            backdropFilter: "blur(4px)"
          }}
          className="hide-desktop animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <aside 
            style={{
              width: "var(--sidebar-width)",
              background: "var(--gray-900)",
              color: "var(--white)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              boxShadow: "var(--shadow-xl)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo and close */}
            <div style={{ height: "var(--topbar-height)", display: "flex", alignItems: "center", padding: "0 var(--space-6)", borderBottom: "1px solid var(--gray-800)", justifyContent: 'space-between' }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <div className="logo-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary)" }}>
                  <Building2 size={16} className="text-orange" />
                </div>
                <span style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--white)" }}>
                  GESTIMMO<span className="text-orange">.CI</span>
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ color: "var(--white)" }}>
                <X size={20} />
              </button>
            </div>

            {/* Menu Links */}
            <nav style={{ flex: 1, padding: "var(--space-6) var(--space-3)", display: "flex", flexDirection: "column", gap: "4px" }}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-lg)",
                      fontSize: "var(--text-sm)",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--white)" : "var(--gray-400)",
                      background: isActive ? "var(--primary)" : "transparent",
                      borderLeft: isActive ? "4px solid var(--orange)" : "4px solid transparent",
                      paddingLeft: isActive ? "calc(var(--space-4) - 4px)" : "var(--space-4)",
                      textDecoration: "none"
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--gray-800)", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                <div className="avatar avatar-sm" style={{ background: "var(--primary-lighter)", color: "var(--primary-dark)" }}>
                  VE
                </div>
                <div>
                  <h5 style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0 }}>{profile.full_name}</h5>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", textTransform: "uppercase" }}>Plan {profile.subscription_plan}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-2) var(--space-3)",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "var(--danger)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <LogOut size={14} />
                <span>Se déconnecter</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ============================================
         Main Dashboard Content Area
         ============================================ */}
      <div 
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          marginLeft: "0px"
        }}
        className="dashboard-content-wrapper"
      >
        {/* Topbar Header */}
        <header 
          style={{
            height: "var(--topbar-height)",
            background: "var(--white)",
            borderBottom: "1px solid var(--gray-200)",
            display: "flex",
            alignItems: "center",
            padding: "0 var(--space-6)",
            position: "sticky",
            top: 0,
            zIndex: 30
          }}
        >
          {/* Left: mobile toggle & title */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flex: 1 }}>
            <button 
              className="btn btn-ghost hide-desktop"
              onClick={() => setMobileOpen(true)}
              style={{ padding: "8px", color: "var(--gray-600)" }}
            >
              <Menu size={22} />
            </button>
            
            <h1 style={{ fontSize: "var(--text-lg)", fontWeight: "700", margin: 0, color: "var(--gray-900)" }}>
              {navigation.find(nav => nav.href === pathname)?.name || "Tableau de bord"}
            </h1>
          </div>

          {/* Right: tools */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            {/* Fake Notifications Bell */}
            <button 
              style={{ padding: "8px", position: "relative", color: "var(--gray-600)", borderRadius: "50%" }}
              className="btn-ghost"
              onClick={() => alert("Aucune notification pour le moment.")}
            >
              <Bell size={20} />
              <span 
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "8px",
                  height: "8px",
                  background: "var(--danger)",
                  borderRadius: "50%",
                  border: "2px solid white"
                }}
              ></span>
            </button>

            {/* Divider */}
            <div style={{ width: "1px", height: "24px", background: "var(--gray-200)" }}></div>

            {/* Profile Avatar Trigger */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <div className="avatar avatar-sm" style={{ background: "var(--primary-lightest)", color: "var(--primary-dark)" }}>
                VE
              </div>
              <span className="hide-mobile" style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--gray-700)" }}>
                {profile.full_name}
              </span>
            </div>
          </div>
        </header>

        {/* Sub-page Body Container */}
        <main 
          style={{
            flex: 1,
            padding: "var(--space-6)",
            maxWidth: "100%",
            overflowX: "hidden"
          }}
        >
          {children}
        </main>
      </div>

      {/* Global CSS Inject to support margin offset and hover selectors */}
      <style jsx global>{`
        @media (min-width: 769px) {
          .dashboard-content-wrapper {
            margin-left: var(--sidebar-width) !important;
          }
        }
        .hover-sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: var(--white) !important;
        }
      `}</style>
    </div>
  );
}
