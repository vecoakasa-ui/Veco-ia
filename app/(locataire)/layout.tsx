"use client";
 

import { usePathname } from "next/navigation";
import { Home, FileText, AlertTriangle, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function LocataireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    // Extract tenant ID from URL (e.g. /locataire/tenant-1)
    const match = pathname.match(/\/locataire\/([^\/]+)/);
    if (match && match[1]) {
      setTenantId(match[1]);
    }
  }, [pathname]);

  const navItems = [
    { label: "Accueil", icon: Home, hash: "" },
    { label: "Paiements", icon: FileText, hash: "#paiements" },
    { label: "Incidents", icon: AlertTriangle, hash: "#incidents" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Top Navbar */}
      <header style={{ 
        background: "white", 
        borderBottom: "1px solid var(--gray-200)", 
        padding: "var(--space-4) var(--space-6)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <div style={{ background: "var(--primary-light)", color: "var(--primary-dark)", padding: "8px", borderRadius: "var(--radius-md)" }}>
            <User size={20} />
          </div>
          <span style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--gray-900)" }}>
            Espace <span style={{ color: "var(--primary)" }}>Locataire</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "var(--space-4)", paddingBottom: "100px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile & Desktop but max-width 800px) */}
      <nav style={{ 
        position: "fixed", 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: "white", 
        borderTop: "1px solid var(--gray-200)",
        display: "flex",
        justifyContent: "space-around",
        padding: "var(--space-3)",
        zIndex: 50,
        boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ display: "flex", width: "100%", maxWidth: "800px", margin: "0 auto", justifyContent: "space-around" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            // Simplified active state check for single-page dashboard with hashes

            return (
              <a 
                key={item.label}
                href={tenantId ? `/locataire/${tenantId}${item.hash}` : "#"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  color: "var(--gray-600)",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-lg)",
                  transition: "all var(--transition-fast)"
                }}
              >
                <Icon size={24} style={{ color: "var(--gray-500)" }} />
                <span style={{ fontSize: "10px", fontWeight: 600 }}>{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
