"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  LogOut,
  Bell,
  Menu,
  X,
  User,
  LayoutDashboard,
  Wallet
} from "lucide-react";
import { db } from "@/lib/store";
import { Profile } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function AcheteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  const [profile, setProfile] = useState<Profile>({
    id: "buyer-1",
    full_name: "Acheteur",
    email: "acheteur@test.com",
    phone: "",
    role: "buyer",
    avatar_url: "",
    subscription_plan: "free",
    created_at: "",
  });

  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      if (e && e.detail) {
        setProfile(prev => prev ? { ...prev, avatar_url: e.detail } : prev);
      }
    };

    const handleProfileUpdate = (e: any) => {
      if (e && e.detail) {
        setProfile(prev => prev ? { ...prev, full_name: e.detail.full_name, phone: e.detail.phone } : prev);
      }
    };
    
    window.addEventListener("avatarUpdate", handleAvatarUpdate as EventListener);
    window.addEventListener("profileUpdate", handleProfileUpdate as EventListener);
    handleAvatarUpdate(null);

    const loadProfile = async () => {
      const p = await db.getProfile();
      if (p) {
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
        let { data: buyers } = await supabase.from('buyers').select('id').ilike('email', (p.email || "").trim()).limit(1);
        let isBuyer = buyers && buyers.length > 0;

        if (!isBuyer && p.email) {
          const { data: acceptedInqs } = await supabase.from('inquiries').select('id').ilike('tenant_email', p.email.trim()).eq('status', 'accepted').limit(1);
          if (acceptedInqs && acceptedInqs.length > 0) {
            isBuyer = true;
            await supabase.from('profiles').update({ role: 'buyer' }).eq('id', p.id);
          }
        }

        if (isBuyer || p.role === "buyer") {
          setIsAuthorized(true);
          loadProfile();
        } else if (p.role === "owner") {
          setIsAuthorized(false);
          router.push("/dashboard");
          return;
        } else if (p.role === "admin") {
          setIsAuthorized(false);
          router.push("/admin/dashboard");
          return;
        } else if (p.role === "tenant") {
          setIsAuthorized(false);
          router.push("/locataire/dashboard");
          return;
        } else {
          setIsAuthorized(false);
          router.push("/login");
          return;
        }
      } else {
        setIsAuthorized(false);
        router.push("/login");
      }
    };

    checkAuth();

    return () => {
      window.removeEventListener("avatarUpdate", handleAvatarUpdate as EventListener);
      window.removeEventListener("profileUpdate", handleProfileUpdate as EventListener);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push("/login");
  };

  const navItems = [
    { name: "Vue d'ensemble", href: "/acheteur/dashboard", icon: LayoutDashboard },
    { name: "Mes Terrains", href: "/acheteur/terrains", icon: Home },
    { name: "Mes Échéances", href: "/acheteur/echeances", icon: Wallet },
  ];

  if (isAuthorized === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--gray-50)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(249, 115, 22, 0.2)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Sidebar Desktop */}
      <aside className="acheteur-sidebar" style={{
        width: '260px',
        background: 'var(--white)',
        borderRight: '1px solid var(--gray-200)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        transition: 'transform 0.3s ease'
      }}>
        <Link href="/" style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Vision Immo 2.0 Logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--gray-900)', lineHeight: '1.2' }}>
            Vision Immo 2.0 
            <span style={{ 
              color: 'var(--primary)', 
              fontSize: '12px', 
              display: 'inline-block',
              background: 'var(--primary-lightest)',
              padding: '4px 8px',
              borderRadius: '6px',
              marginTop: '4px',
              fontWeight: '600',
              border: '1px solid var(--primary-lighter)'
            }}>Espace Acheteur</span>
          </span>
        </Link>

        <nav style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link 
                key={item.href} 
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--primary)' : 'var(--gray-600)',
                  background: isActive ? 'rgba(249, 115, 22, 0.08)' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s',
                  textDecoration: 'none'
                }}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-600)',
              background: 'var(--gray-50)',
              border: '1px solid var(--gray-200)',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          height: '70px',
          background: 'var(--white)',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'var(--gray-50)', 
              border: '1px solid var(--gray-200)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <Bell size={20} color="var(--gray-600)" />
              <span style={{ 
                position: 'absolute', 
                top: '0', 
                right: '0', 
                width: '10px', 
                height: '10px', 
                background: 'var(--danger)', 
                borderRadius: '50%',
                border: '2px solid white'
              }}></span>
            </button>

            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--primary-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '2px solid white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={20} color="var(--primary)" />
                  )}
                </div>
              </button>

              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '240px',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  border: '1px solid var(--gray-200)',
                  overflow: 'hidden',
                  zIndex: 50
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)' }}>
                    <p style={{ fontWeight: '600', color: 'var(--gray-900)', margin: 0 }}>{profile?.full_name}</p>
                    <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>{profile?.email}</p>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <Link href="/acheteur/settings" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '10px', 
                        borderRadius: 'var(--radius-md)', 
                        color: 'var(--gray-700)',
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}
                    >
                      <User size={16} /> Mon Profil
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '32px', flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .acheteur-sidebar {
            transform: translateX(-100%);
          }
          main {
            marginLeft: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
