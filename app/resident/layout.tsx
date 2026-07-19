import React from "react";
import Link from "next/link";
import { Home, FileText, Wrench, User, LogOut } from "lucide-react";

export const metadata = {
  title: "Portail Résident - Vision Immo",
  description: "Espace locataire pour gérer vos loyers et charges",
};

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "var(--gray-50)" }}>
      {/* Mobile-first Header */}
      <header style={{ 
        backgroundColor: "var(--primary-dark)", 
        color: "white", 
        padding: "var(--space-4)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            backgroundColor: "white", 
            borderRadius: "8px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "var(--primary-dark)",
            fontWeight: "900",
            fontSize: "14px"
          }}>
            VI
          </div>
          <span style={{ fontSize: "16px", fontWeight: "700" }}>Espace Résident</span>
        </div>
        <button style={{ 
          background: "none", 
          border: "none", 
          color: "var(--gray-300)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer"
        }}>
          <LogOut size={20} />
          <span className="hide-mobile" style={{ fontSize: "13px" }}>Déconnexion</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "var(--space-4)", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav style={{ 
        backgroundColor: "white",
        borderTop: "1px solid var(--gray-200)",
        display: "flex",
        justifyContent: "space-around",
        padding: "12px 0 calc(12px + env(safe-area-inset-bottom))",
        position: "sticky",
        bottom: 0,
        zIndex: 50
      }}>
        <Link href="/resident/dashboard" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "var(--primary-dark)", textDecoration: "none" }}>
          <Home size={24} />
          <span style={{ fontSize: "10px", fontWeight: "600" }}>Accueil</span>
        </Link>
        <Link href="/resident/tickets/new" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "var(--gray-500)", textDecoration: "none" }}>
          <Wrench size={24} />
          <span style={{ fontSize: "10px", fontWeight: "600" }}>Assistance</span>
        </Link>
        <Link href="#" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "var(--gray-500)", textDecoration: "none" }}>
          <User size={24} />
          <span style={{ fontSize: "10px", fontWeight: "600" }}>Profil</span>
        </Link>
      </nav>
    </div>
  );
}
