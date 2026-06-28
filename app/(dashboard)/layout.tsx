"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Banknote,
  FileText,
  AlertTriangle,
  FolderLock,
  LogOut,
  Bell,
  Menu,
  X,
  Sparkles,
  Briefcase,
  Wallet,
  MessageSquare,
  ClipboardCheck,
  Settings,
  Mail,
  Phone,
  ShieldCheck
} from "lucide-react";
import { db } from "@/lib/store";
import { Profile } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
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
      if (p) setProfile(p);
    };
    loadProfile();

    const handleStorage = () => {
      loadProfile();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const navigationGroups = [
    {
      groupName: "Gestion",
      items: [
        { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { name: "Propriétaires", href: "/proprietaires", icon: Briefcase },
        { name: "Biens immobiliers", href: "/biens", icon: Building2 },
        { name: "Locataires", href: "/locataires", icon: Users },
        { name: "Contrats de bail", href: "/contrats", icon: FolderLock },
        { name: "Incidents", href: "/incidents", icon: AlertTriangle },
      ]
    },
    {
      groupName: "Finances",
      items: [
        { name: "Loyers & Paiements", href: "/paiements", icon: Banknote },
        { name: "Quittances", href: "/quittances", icon: FileText },
        { name: "Comptabilité", href: "/comptabilite", icon: Wallet },
        { name: "Relances", href: "/relances", icon: MessageSquare },
        { name: "Cautions & États", href: "/cautions", icon: ClipboardCheck },
      ]
    },
    {
      groupName: "Système",
      items: [
        { name: "Paramètres (Base)", href: "/settings", icon: Settings },
        { name: "Mon Abonnement", href: "/abonnement", icon: Sparkles },
      ]
    }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", textDecoration: "none" }}>
            <div className="logo-icon" style={{ background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={16} className="text-orange" />
            </div>
            <span style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--white)" }}>
              VENANCE IMO<span className="text-orange">.CI</span>
            </span>
          </Link>
        </div>

        {/* Menu links */}
        <nav style={{ flex: 1, padding: "var(--space-6) var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-4)", overflowY: "auto" }}>
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div style={{ padding: "0 var(--space-4)", marginBottom: "8px", fontSize: "11px", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {group.groupName}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {group.items.map((item) => {
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
                      {Icon ? <Icon size={18} /> : <div style={{ width: 18, height: 18 }} />}
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile section */}
        <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--gray-800)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <div className="avatar avatar-sm" style={{ background: "var(--primary-lighter)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "VI"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <h5 style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--white)", margin: 0 }}>{profile.full_name}</h5>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "2px", textTransform: "uppercase" }}>
                <Sparkles size={10} style={{ color: "var(--warning)" }} /> Plan {profile.subscription_plan}
              </span>
            </div>
          </div>

          {profile.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-3)",
                background: "rgba(16, 185, 129, 0.1)",
                color: "var(--success)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background var(--transition-fast)",
                textDecoration: "none",
                marginBottom: "var(--space-2)"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)"}
            >
              <ShieldCheck size={14} />
              <span>Espace Super Admin</span>
            </Link>
          )}

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
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", textDecoration: "none" }}>
                <div className="logo-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary)" }}>
                  <Building2 size={16} className="text-orange" />
                </div>
                <span style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--white)" }}>
                  VENANCE IMO<span className="text-orange">.CI</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{ color: "var(--white)" }}>
                <X size={20} />
              </button>
            </div>

            {/* Menu Links */}
            <nav style={{ flex: 1, padding: "var(--space-6) var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-4)", overflowY: "auto" }}>
              {navigationGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  <div style={{ padding: "0 var(--space-4)", marginBottom: "8px", fontSize: "11px", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {group.groupName}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {group.items.map((item) => {
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
                          {Icon ? <Icon size={18} /> : <div style={{ width: 18, height: 18 }} />}
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* User section */}
            <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--gray-800)", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                <div className="avatar avatar-sm" style={{ background: "var(--primary-lighter)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "VI"}
                </div>
                <div>
                  <h5 style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0 }}>{profile.full_name}</h5>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", textTransform: "uppercase" }}>Plan {profile.subscription_plan}</span>
                </div>
              </div>

              {profile.role === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-2) var(--space-3)",
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "var(--success)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "none",
                    marginBottom: "var(--space-2)"
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Espace Super Admin</span>
                </Link>
              )}

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
              {navigationGroups.flatMap(g => g.items).find(nav => nav.href === pathname)?.name || "Tableau de bord"}
            </h1>
          </div>

          {/* Right: tools */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", position: "relative" }}>
            {/* Notifications Dropdown */}
            <div style={{ position: "relative" }}>
              <button 
                style={{ padding: "8px", position: "relative", color: "var(--gray-600)", borderRadius: "50%", background: showNotifications ? "var(--gray-100)" : "transparent", border: "none", cursor: "pointer" }}
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
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
              
              {showNotifications && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: "-10px",
                  width: "320px",
                  maxWidth: "calc(100vw - 32px)",
                  background: "var(--white)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--gray-200)",
                  zIndex: 50,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transformOrigin: "top right"
                }} className="animate-fade-in">
                  <div style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0, color: "var(--gray-900)" }}>Notifications</h3>
                    <span style={{ fontSize: "11px", color: "var(--primary)", cursor: "pointer", fontWeight: "500" }}>Tout marquer comme lu</span>
                  </div>
                  <div style={{ maxHeight: "300px", overflowY: "auto", padding: "0" }}>
                    <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>
                      <Bell size={24} style={{ margin: "0 auto var(--space-2)", color: "var(--gray-300)" }} />
                      <p style={{ margin: 0 }}>Vous n'avez pas de nouvelles notifications.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: "1px", height: "24px", background: "var(--gray-200)" }}></div>

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }}>
              <button 
                style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", background: showProfileMenu ? "var(--gray-100)" : "transparent", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "var(--radius-md)", transition: "background 0.2s" }}
                className={showProfileMenu ? "hover-bg-gray-100" : ""}
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              >
                <div className="avatar avatar-sm" style={{ background: "var(--primary-lightest)", color: "var(--primary-dark)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", overflow: "hidden" }}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "VI"
                  )}
                </div>
                <span className="hide-mobile" style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--gray-700)" }}>
                  {profile.full_name}
                </span>
              </button>

              {showProfileMenu && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: "0",
                  width: "280px",
                  maxWidth: "calc(100vw - 32px)",
                  background: "var(--white)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--gray-200)",
                  zIndex: 50,
                  overflow: "hidden",
                  transformOrigin: "top right"
                }} className="animate-fade-in">
                  {/* Profil Header riche */}
                  <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--gray-200)", background: "var(--gray-50)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-lightest)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", overflow: "hidden", border: "2px solid white", boxShadow: "var(--shadow-sm)" }}>
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "VI"
                        )}
                      </div>
                      <span style={{ position: "absolute", bottom: 0, right: 0, width: "14px", height: "14px", background: "var(--success)", border: "2px solid white", borderRadius: "50%" }}></span>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <h4 style={{ fontSize: "var(--text-md)", fontWeight: "700", color: "var(--gray-900)", margin: 0 }}>{profile.full_name || "Utilisateur"}</h4>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--primary)", fontWeight: "600", margin: "2px 0 0 0", textTransform: "uppercase" }}>
                        {profile.role === "owner" ? "Propriétaire" : profile.role === "tenant" ? "Locataire" : "Administrateur"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Informations détaillées */}
                  <div style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--gray-200)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>
                        <Mail size={14} style={{ color: "var(--gray-400)" }} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>
                          <Phone size={14} style={{ color: "var(--gray-400)" }} />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: "var(--space-2)" }}>
                    <Link 
                      href="/settings" 
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)", color: "var(--gray-700)", textDecoration: "none", borderRadius: "var(--radius-sm)", transition: "background 0.2s" }}
                      className="hover-bg-gray-100"
                    >
                      <Settings size={16} /> Mon Profil & Paramètres
                    </Link>
                    <button 
                      onClick={handleLogout}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)", color: "var(--danger)", background: "transparent", border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", transition: "background 0.2s", textAlign: "left" }}
                      className="hover-bg-danger-lightest"
                    >
                      <LogOut size={16} /> Se déconnecter
                    </button>
                  </div>
                </div>
              )}
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
        .hover-bg-gray-100:hover {
          background: var(--gray-100) !important;
        }
        .hover-bg-danger-lightest:hover {
          background: rgba(239, 68, 68, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
