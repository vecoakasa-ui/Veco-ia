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
  Wallet,
  MessageSquare,
  ClipboardCheck,
  Settings,
  Mail,
  Phone,
  Map,
  Briefcase
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
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  const [profile, setProfile] = useState<Profile>({
    id: "owner-1",
    full_name: "Venance",
    email: "contact@visionimmo.com",
    phone: "+225 07 00 00 00 00",
    role: "owner",
    avatar_url: "/owner_avatar.png",
    subscription_plan: "pro",
    created_at: "",
  });

  useEffect(() => {
    const handleAvatarUpdate = () => {
      const customAvatar = localStorage.getItem("V_CUSTOM_AVATAR");
      if (customAvatar) {
        setProfile(prev => ({ ...prev, avatar_url: customAvatar }));
      }
    };
    
    window.addEventListener("avatarUpdate", handleAvatarUpdate);
    handleAvatarUpdate(); // Vérifier au montage

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
        const oauthRole = localStorage.getItem('oauth_role');
        if (oauthRole && p.role !== "admin" && oauthRole !== p.role) {
          localStorage.removeItem('oauth_role');
          await supabase.auth.signOut();
          setIsAuthorized(false);
          router.push(`/login?error=role_mismatch&expected=${p.role}`);
          return;
        }

        if (oauthRole) {
          localStorage.removeItem('oauth_role');
        }

        if (p.role === "tenant") {
          setIsAuthorized(false);
          router.push("/locataire/dashboard");
          return;
        } else if (p.role === "admin") {
          setIsAuthorized(false);
          router.push("/admin/dashboard");
          return;
        }

        const customAvatar = localStorage.getItem("V_CUSTOM_AVATAR");
        if (customAvatar) {
          p.avatar_url = customAvatar;
        }
        setProfile(p);

        // Access Control based on subscription
        if (p.role === "owner") {
          const now = new Date();
          let locked = false;
          
          if (p.subscription_status === "expired" || p.subscription_status === "past_due") {
            locked = true;
          } else if (p.subscription_status === "trialing" && p.trial_end_date) {
            const trialEnd = new Date(p.trial_end_date);
            if (trialEnd < now) {
              locked = true;
            }
          }
          
          if (locked) {
            setIsAuthorized(false);
            router.push("/abonnement/locked");
            return;
          }
        }

        setIsAuthorized(true);
      } else {
        // Fallback for missing profile
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

  // Fermer les menus lors du changement de page
  useEffect(() => {
    setShowProfileMenu(false);
    setShowNotifications(false);
    setMobileOpen(false);
  }, [pathname]);

  const navigationGroups = [
    {
      groupName: "Ma Gestion",
      items: [
        { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { name: "Mes Biens", href: "/biens", icon: Building2 },
        { name: "Mes Locataires", href: "/locataires", icon: Users },
        { name: "Mes Contrats", href: "/contrats", icon: FolderLock },
        { name: "Demandes", href: "/demandes", icon: MessageSquare },
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
      groupName: "Ventes & Terrains",
      items: [
        { name: "Lots & Terrains", href: "/ventes/lots", icon: Map },
        { name: "Acheteurs & Ventes", href: "/ventes/acheteurs", icon: Briefcase },
      ]
    },
    {
      groupName: "Système",
      items: [
        { name: "Mon Abonnement", href: "/abonnement", icon: Sparkles },
        { name: "Paramètres", href: "/settings", icon: Settings },
      ]
    }
  ];

  // Super Admin Navigation removed to keep it completely invisible from the dashboard

  const [hasNewDemandes, setHasNewDemandes] = useState(false);
  const [hasNewIncidents, setHasNewIncidents] = useState(false);

  useEffect(() => {
    if (!isAuthorized || profile.role !== "owner") return;

    const checkNotifications = async () => {
      try {
        const lastViewedDemandes = localStorage.getItem(`last_viewed_${profile.id}_demandes`);
        const lastViewedIncidents = localStorage.getItem(`last_viewed_${profile.id}_incidents`);

        // Get properties
        const { data: props } = await supabase.from('properties').select('id').eq('owner_id', profile.id);
        const propIds = props?.map((p: any) => p.id) || [];

        if (propIds.length > 0) {
          // Check demandes
          let inqQuery = supabase.from('inquiries').select('id', { count: 'exact', head: true }).in('property_id', propIds).eq('status', 'pending');
          if (lastViewedDemandes) {
            inqQuery = inqQuery.gt('created_at', lastViewedDemandes);
          }
          const { count: inqCount } = await inqQuery;
          setHasNewDemandes((inqCount || 0) > 0);

          // Check incidents
          let incQuery = supabase.from('incidents').select('id', { count: 'exact', head: true }).in('property_id', propIds).eq('status', 'open');
          if (lastViewedIncidents) {
            incQuery = incQuery.gt('created_at', lastViewedIncidents);
          }
          const { count: incCount } = await incQuery;
          setHasNewIncidents((incCount || 0) > 0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkNotifications();

    const handleViewed = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === 'demandes') setHasNewDemandes(false);
      if (customEvent.detail === 'incidents') setHasNewIncidents(false);
    };
    window.addEventListener('notificationViewed', handleViewed);

    return () => {
      window.removeEventListener('notificationViewed', handleViewed);
    };
  }, [isAuthorized, profile.id, profile.role]);

  const hasBadge = (itemName: string) => {
    if (itemName === "Demandes") return hasNewDemandes;
    if (itemName === "Incidents") return hasNewIncidents;
    return false;
  };

  if (isAuthorized === null) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--gray-50)", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--gray-200)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ color: "var(--gray-500)", fontSize: "14px", fontWeight: "600" }}>Chargement de votre espace sécurisé...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // console.error(err);
    } finally {
      localStorage.removeItem("V_CUSTOM_AVATAR");
      window.location.href = "/login";
    }
  };

  const remainingDays = (() => {
    if (profile.subscription_status === "trialing" && profile.trial_end_date) {
      const diff = new Date(profile.trial_end_date).getTime() - new Date().getTime();
      const days = Math.ceil(diff / (1000 * 3600 * 24));
      return days > 0 ? days : 0;
    }
    return null;
  })();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-100)" }}>
      {/* ============================================
         Sidebar Desktop
         ============================================ */}
      <aside 
        className="hide-mobile"
        style={{
          width: "var(--sidebar-width)",
          background: '#111827',
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
        {/* Logo */}
        <div style={{ height: "var(--topbar-height)", display: "flex", alignItems: "center", padding: "0 var(--space-6)", borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", textDecoration: "none" }}>
            <div className="logo-icon" style={{ background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={16} className="text-orange" />
            </div>
            <span style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--orange)" }}>
              Vision Immo 2.0
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
                      <span style={{ flex: 1 }}>{item.name}</span>
                      {hasBadge(item.name) && (
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--danger)", boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)" }}></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile section */}
        <div style={{ padding: "var(--space-4)", borderTop: '1px solid rgba(255,255,255,0.05)', background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <div className="avatar avatar-sm" style={{ background: "var(--primary-lighter)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "VI"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <h5 style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--fixed-white)", margin: 0 }}>{profile.full_name}</h5>
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
              background: '#111827',
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
            {/* Logo and close */}
            <div style={{ height: "var(--topbar-height)", display: "flex", alignItems: "center", padding: "0 var(--space-6)", borderBottom: '1px solid rgba(255,255,255,0.05)', justifyContent: 'space-between' }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", textDecoration: "none" }}>
                <div className="logo-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary)" }}>
                  <Building2 size={16} className="text-orange" />
                </div>
                <span style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--orange)" }}>
                  Vision Immo 2.0
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{ color: "var(--fixed-white)" }}>
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
                          <span style={{ flex: 1 }}>{item.name}</span>
                          {hasBadge(item.name) && (
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--danger)", boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)" }}></div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* User section */}
            <div style={{ padding: "var(--space-4)", borderTop: '1px solid rgba(255,255,255,0.05)', background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                <div className="avatar avatar-sm" style={{ background: "var(--primary-lighter)", color: "var(--primary-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "VI"}
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
                }} className="animate-fade-in dropdown-mobile-fix">
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
                }} className="animate-fade-in dropdown-mobile-fix">
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
                    <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--gray-400)", textTransform: "uppercase", marginBottom: "var(--space-2)", letterSpacing: "0.05em", marginTop: 0 }}>Informations de connexion</p>
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

        {/* Trial Alert Banner */}
        {remainingDays !== null && (
          <div style={{ background: "var(--warning-lightest)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(245, 158, 11, 0.2)", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <AlertTriangle size={18} style={{ color: "var(--warning-dark)" }} />
              <span style={{ fontSize: "14px", color: "var(--warning-dark)", fontWeight: 500 }}>
                {remainingDays > 0 
                  ? `Il vous reste ${remainingDays} jour${remainingDays > 1 ? 's' : ''} d'essai gratuit. Pensez à vous abonner pour ne pas perdre l'accès à vos données.`
                  : "Votre période d'essai expire aujourd'hui. Veuillez vous abonner pour éviter le blocage de votre espace."}
              </span>
            </div>
            <Link href="/abonnement" className="btn btn-sm" style={{ background: "var(--warning)", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
              S'abonner maintenant
            </Link>
          </div>
        )}

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
