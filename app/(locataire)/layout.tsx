"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  AlertTriangle,
  LogOut,
  Bell,
  Menu,
  X,
  Mail,
  User,
  LayoutDashboard,
  Wallet
} from "lucide-react";
import { db } from "@/lib/store";
import { Profile } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function LocataireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  const [profile, setProfile] = useState<Profile>({
    id: "tenant-1",
    full_name: "Locataire",
    email: "locataire@test.com",
    phone: "",
    role: "tenant",
    avatar_url: "",
    subscription_plan: "free",
    created_at: "",
  });

  const params = useParams();
  // Extract tenantId from params if available, otherwise fallback to pathname parsing
  const tenantId = (params?.id as string) || (pathname.match(/\/locataire\/([^\/]+)/)?.[1]) || null;

  useEffect(() => {
    const handleAvatarUpdate = () => {
      const customAvatar = localStorage.getItem("V_CUSTOM_AVATAR");
      if (customAvatar) {
        setProfile(prev => ({ ...prev, avatar_url: customAvatar }));
      }
    };
    
    window.addEventListener("avatarUpdate", handleAvatarUpdate);
    handleAvatarUpdate();

    const loadProfile = async () => {
      const p = await db.getProfile();
      if (p) {
        const customAvatar = localStorage.getItem("V_CUSTOM_AVATAR");
        if (customAvatar) {
          p.avatar_url = customAvatar;
        }
        setProfile(p);
      }
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthorized(false);
        router.push("/login");
        return;
      }
      
      const p = await db.getProfile();
      if (p) {
        if (p.role !== "tenant") {
          setIsAuthorized(false);
          router.push("/dashboard");
          return;
        }

        const customAvatar = localStorage.getItem("V_CUSTOM_AVATAR");
        if (customAvatar) {
          p.avatar_url = customAvatar;
        }
        setProfile(p);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.push("/login");
      }
    };
    checkAuth();

    const handleStorage = () => {
      loadProfile();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("avatarUpdate", handleAvatarUpdate);
    };
  }, [router]);

  useEffect(() => {
    setShowProfileMenu(false);
    setShowNotifications(false);
    setMobileOpen(false);
  }, [pathname]);

  const navigationGroups = [
    {
      groupName: "Mon Espace",
      items: [
        { name: "Accueil", href: tenantId ? `/locataire/${tenantId}` : "#", icon: LayoutDashboard },
        { name: "Explorer", href: tenantId ? `/locataire/${tenantId}/explorer` : "#", icon: Home },
        { name: "Mes Paiements", href: tenantId ? `/locataire/${tenantId}/paiements` : "#", icon: Wallet },
        { name: "Mes Quittances", href: tenantId ? `/locataire/${tenantId}/quittances` : "#", icon: FileText },
        { name: "Mes Incidents", href: tenantId ? `/locataire/${tenantId}/incidents` : "#", icon: AlertTriangle },
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("V_CUSTOM_AVATAR");
      window.location.href = "/login";
    }
  };

  if (isAuthorized === null) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--gray-50)", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--gray-200)", borderTopColor: "var(--orange)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ color: "var(--gray-500)", fontSize: "14px", fontWeight: "600" }}>Chargement de votre espace locataire...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-100)" }}>
      {/* Sidebar Desktop */}
      <aside 
        className="hide-mobile"
        style={{
          width: "var(--sidebar-width)",
          background: '#0f172a', // Slightly different dark blue to differentiate
          color: "var(--fixed-white)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div style={{ height: "var(--topbar-height)", display: "flex", alignItems: "center", padding: "0 var(--space-6)", borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", textDecoration: "none" }}>
            <div className="logo-icon" style={{ background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={16} className="text-orange" />
            </div>
            <span style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--fixed-white)" }}>
              Espace Locataire
            </span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "var(--space-6) var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-4)", overflowY: "auto" }}>
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div style={{ padding: "0 var(--space-4)", marginBottom: "8px", fontSize: "11px", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {group.groupName}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const basePath = item.href.split('#')[0];
                  const itemHash = item.href.includes('#') ? '#' + item.href.split('#')[1] : '';
                  const isPathMatch = pathname === basePath;
                  const isHashMatch = typeof window !== 'undefined' ? window.location.hash === itemHash : !itemHash;
                  const isActuallyActive = isPathMatch && isHashMatch;
                  
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
                        fontWeight: isActuallyActive ? 600 : 500,
                        color: isActuallyActive ? "#F77F00" : "var(--gray-400)",
                        background: isActuallyActive ? "rgba(247, 127, 0, 0.1)" : "transparent",
                        transition: "all 0.2s ease",
                        textDecoration: "none"
                      }}
                      className={isActuallyActive ? "" : "hover-sidebar-link"}
                    >
                      {Icon ? <Icon size={18} style={{ color: "#009E60" }} /> : <div style={{ width: 18, height: 18 }} />}
                      <span style={{ color: isActuallyActive ? "#F77F00" : "inherit" }}>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ padding: "var(--space-4)", borderTop: '1px solid rgba(255,255,255,0.05)', background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <div className="avatar avatar-sm" style={{ background: "var(--primary-lighter)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "VI"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <h5 style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--fixed-white)", margin: 0 }}>{profile.full_name}</h5>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "2px", textTransform: "uppercase" }}>
                Locataire
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

      {/* Sidebar Mobile Menu */}
      {mobileOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(15, 23, 42, 0.7)",
            zIndex: 50,
            backdropFilter: "blur(4px)"
          }}
          className="hide-desktop animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <aside 
            style={{
              width: "var(--sidebar-width)",
              background: '#0f172a',
              color: "var(--fixed-white)",
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
            <div style={{ height: "var(--topbar-height)", display: "flex", alignItems: "center", padding: "0 var(--space-6)", borderBottom: '1px solid rgba(255,255,255,0.05)', justifyContent: 'space-between' }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", textDecoration: "none" }}>
                <div className="logo-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary)" }}>
                  <User size={16} className="text-orange" />
                </div>
                <span style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--fixed-white)" }}>
                  Espace Locataire
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{ color: "var(--fixed-white)" }}>
                <X size={20} />
              </button>
            </div>

            <nav style={{ flex: 1, padding: "var(--space-6) var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-4)", overflowY: "auto" }}>
              {navigationGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  <div style={{ padding: "0 var(--space-4)", marginBottom: "8px", fontSize: "11px", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {group.groupName}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const basePath = item.href.split('#')[0];
                      const itemHash = item.href.includes('#') ? '#' + item.href.split('#')[1] : '';
                      const isPathMatch = pathname === basePath;
                      const isHashMatch = typeof window !== 'undefined' ? window.location.hash === itemHash : !itemHash;
                      const isActuallyActive = isPathMatch && isHashMatch;
                      
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
                            fontWeight: isActuallyActive ? 600 : 500,
                            color: isActuallyActive ? "#F77F00" : "var(--gray-400)",
                            background: isActuallyActive ? "rgba(247, 127, 0, 0.1)" : "transparent",
                            textDecoration: "none"
                          }}
                        >
                          {Icon ? <Icon size={18} style={{ color: isActuallyActive ? "#009E60" : "var(--gray-500)" }} /> : <div style={{ width: 18, height: 18 }} />}
                          <span style={{ color: isActuallyActive ? "#F77F00" : "inherit" }}>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div style={{ padding: "var(--space-4)", borderTop: '1px solid rgba(255,255,255,0.05)', background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                <div className="avatar avatar-sm" style={{ background: "var(--primary-lighter)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "VI"}
                </div>
                <div>
                  <h5 style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0 }}>{profile.full_name}</h5>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", textTransform: "uppercase" }}>Locataire</span>
                </div>
              </div>

              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <Link 
                href={tenantId ? `/locataire/${tenantId}/profil` : "#"}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-2) var(--space-3)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--fixed-white)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <User size={14} />
                <span>Mon Profil</span>
              </Link>
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
                  border: "none",
                }}
              >
                <LogOut size={14} />
                <span>Se déconnecter</span>
              </button>
            </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flex: 1 }}>
            <button 
              className="btn btn-ghost hide-desktop"
              onClick={() => setMobileOpen(true)}
              style={{ padding: "8px", color: "var(--gray-600)" }}
            >
              <Menu size={22} />
            </button>
            
            <h1 style={{ fontSize: "var(--text-lg)", fontWeight: "700", margin: 0, color: "var(--gray-900)" }}>
              {navigationGroups.flatMap(g => g.items).find(nav => nav.href.split('#')[0] === pathname)?.name || "Accueil"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <button 
                style={{ padding: "8px", position: "relative", color: "var(--gray-600)", borderRadius: "50%", background: showNotifications ? "var(--gray-100)" : "transparent", border: "none", cursor: "pointer" }}
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              >
                <Bell size={20} />
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
                }} className="animate-fade-in dropdown-mobile-fix">
                  <div style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--gray-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "600", margin: 0, color: "var(--gray-900)" }}>Notifications</h3>
                  </div>
                  <div style={{ maxHeight: "300px", overflowY: "auto", padding: "0" }}>
                    <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--gray-500)", fontSize: "var(--text-sm)" }}>
                      <p style={{ margin: 0 }}>Aucune notification.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ width: "1px", height: "24px", background: "var(--gray-200)" }}></div>

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
                    profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "L"
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
                }} className="animate-fade-in dropdown-mobile-fix">
                  <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--gray-200)", background: "var(--gray-50)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-lightest)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", overflow: "hidden", border: "2px solid white", boxShadow: "var(--shadow-sm)" }}>
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "L"
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <h4 style={{ fontSize: "var(--text-md)", fontWeight: "700", color: "var(--gray-900)", margin: 0 }}>{profile.full_name || "Locataire"}</h4>
                    </div>
                  </div>
                  
                  <div style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--gray-200)" }}>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--gray-400)", textTransform: "uppercase", marginBottom: "var(--space-2)", letterSpacing: "0.05em", marginTop: 0 }}>Informations</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>
                        <Mail size={14} style={{ color: "var(--gray-400)" }} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.email}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "var(--space-2)" }}>
                    <Link 
                      href={tenantId ? `/locataire/${tenantId}/profil` : "#"}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-sm)", color: "var(--gray-700)", background: "transparent", border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", transition: "background 0.2s", textDecoration: "none", marginBottom: "4px" }}
                      className="hover-bg-gray-100"
                    >
                      <User size={16} /> Mon Profil
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
        @media (max-width: 768px) {
          .dropdown-mobile-fix {
            position: fixed !important;
            top: 70px !important;
            right: 16px !important;
            left: 16px !important;
            width: auto !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}
