"use client";

import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Search, 
  AlertCircle, 
  CalendarClock, 
  Send,
  Phone,
  Building,
  CheckCircle2
} from "lucide-react";
import { db } from "@/lib/store";
import { Payment, Tenant } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type RelanceItem = Payment & {
  tenant?: Tenant;
};

export default function RelancesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setPayments(await db.getPayments());
    setTenants(await db.getTenants());
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Filter payments that need attention
  const needsAttention = payments.filter(p => p.status === "late" || p.status === "upcoming");
  
  // Attach tenant data
  const relanceItems: RelanceItem[] = needsAttention.map(p => ({
    ...p,
    tenant: tenants.find(t => t.id === p.tenant_id)
  })).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const filteredItems = relanceItems.filter((item) => {
    const term = search.toLowerCase();
    return (
      (item.tenant_name?.toLowerCase() || "").includes(term) ||
      (item.property_name?.toLowerCase() || "").includes(term)
    );
  });

  const totalLate = relanceItems.filter(i => i.status === "late").reduce((acc, i) => acc + i.total, 0);
  const totalUpcoming = relanceItems.filter(i => i.status === "upcoming").reduce((acc, i) => acc + i.total, 0);

  // Helper to format phone number for WhatsApp (remove spaces, ensure country code)
  const getWhatsAppNumber = (phone?: string) => {
    if (!phone) return "";
    let cleaned = phone.replace(/[\s\-\(\)]/g, "");
    if (cleaned.startsWith("0")) cleaned = "225" + cleaned.substring(1); // Default to CI if starts with 0
    if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    return cleaned;
  };

  const getSmsNumber = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/[\s\-\(\)]/g, "");
  };

  const getMessageText = (item: RelanceItem) => {
    const isLate = item.status === "late";
    const amount = formatCurrency(item.total);
    const month = item.month;
    const year = item.year;
    
    if (isLate) {
      return `Bonjour ${item.tenant_name}, sauf erreur de notre part, nous sommes toujours en attente du règlement de votre loyer de ${amount} pour le mois de ${month} ${year}. Merci de régulariser la situation dans les plus brefs délais. Cordialement, l'agence Vision Immo 2.0.`;
    } else {
      return `Bonjour ${item.tenant_name}, ceci est un rappel amical pour votre loyer de ${amount} concernant le mois de ${month} ${year}, qui arrive à échéance le ${formatDate(item.due_date)}. Merci d'avance. Cordialement, l'agence Vision Immo 2.0.`;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Communications et Recouvrement</p>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Relances Automatiques</h2>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-5)" }}>
          <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-md)" }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", margin: 0 }}>Impayés (En retard)</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", margin: 0, color: "var(--gray-900)" }}>{formatCurrency(totalLate)}</h3>
          </div>
        </div>
        
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-5)" }}>
          <div style={{ background: "var(--warning-light)", color: "var(--warning)", padding: "12px", borderRadius: "var(--radius-md)" }}>
            <CalendarClock size={24} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", margin: 0 }}>À venir (Imminent)</p>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", margin: 0, color: "var(--gray-900)" }}>{formatCurrency(totalUpcoming)}</h3>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ width: "100%" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher un locataire ou un bien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* List / Grid of Relances */}
      {isLoading ? (
        <div className="card" style={{ padding: "var(--space-16)", textAlign: "center" }}>
          <div style={{ width: "24px", height: "24px", border: "3px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto var(--space-4) auto" }}></div>
          <p style={{ color: "var(--gray-500)", fontWeight: 500, margin: 0 }}>Chargement des données...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-16)" }}>
          <CheckCircle2 size={48} style={{ color: "var(--success)", margin: "0 auto var(--space-4) auto" }} />
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Aucune relance nécessaire</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-500)", maxWidth: "400px", margin: "4px auto 0 auto" }}>
            Tous vos locataires sont à jour dans leurs paiements. Excellent travail !
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
          {filteredItems.map((item) => {
            const isLate = item.status === "late";
            const phone = item.tenant?.phone;
            const waNumber = getWhatsAppNumber(phone);
            const smsNumber = getSmsNumber(phone);
            const message = getMessageText(item);
            const waLink = `https://wa.me/${waNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
            const smsLink = `sms:${smsNumber}?body=${encodeURIComponent(message)}`;

            return (
              <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", borderLeft: `4px solid ${isLate ? 'var(--danger)' : 'var(--warning)'}` }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
                  <div>
                    <span className={`badge ${isLate ? 'badge-danger' : 'badge-warning'}`} style={{ textTransform: "uppercase", fontSize: "9px", padding: "2px 8px" }}>
                      {isLate ? "En retard" : "À venir"}
                    </span>
                    <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--gray-900)", marginTop: "8px" }}>
                      {item.tenant_name}
                    </h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "block", fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--primary-dark)" }}>
                      {formatCurrency(item.total)}
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>
                      Loyer {item.month} {item.year}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", margin: "var(--space-2) 0 var(--space-4) 0", flexGrow: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>
                    <Building size={14} style={{ color: "var(--gray-400)", flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.property_name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>
                    <Phone size={14} style={{ color: "var(--gray-400)", flexShrink: 0 }} />
                    <span>{phone || "Non renseigné"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: isLate ? "var(--danger)" : "var(--gray-600)", fontWeight: isLate ? 600 : 400 }}>
                    <CalendarClock size={14} style={{ flexShrink: 0 }} />
                    <span>Échéance: {formatDate(item.due_date)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "var(--space-4)", display: "flex", gap: "var(--space-3)", flexDirection: "column" }}>
                  <a 
                    href={waLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary" 
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#25D366", borderColor: "#25D366", color: "white", width: "100%" }}
                  >
                    <MessageSquare size={16} /> Relancer via WhatsApp
                  </a>
                  
                  <a 
                    href={smsLink} 
                    className="btn btn-outline" 
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%" }}
                  >
                    <Send size={16} /> Relancer par SMS
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
