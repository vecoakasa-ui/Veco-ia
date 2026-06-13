"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Search } from "lucide-react";
import { db } from "@/lib/store";
import { Payment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function QuittancesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Only get paid payments to generate quittances
    setPayments(db.getPayments().filter(p => p.status === "paid"));
  }, []);

  const filtered = payments.filter(p => 
    (p.tenant_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (p.property_name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Générez et gérez les reçus</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Quittances de Loyer</h2>
        </div>
      </div>

      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ maxWidth: "400px" }}>
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

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
              <tr>
                <th style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Locataire</th>
                <th style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Bien</th>
                <th style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Période</th>
                <th style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Montant payé</th>
                <th style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--gray-500)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--gray-500)" }}>
                    Aucune quittance trouvée pour cette recherche.
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--gray-100)" }}>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", fontWeight: 600 }}>{p.tenant_name}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>{p.property_name}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", color: "var(--gray-600)" }}>{p.month} {p.year}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--primary-dark)" }}>{formatCurrency(p.total)}</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => alert("Le téléchargement du PDF sera bientôt disponible !")} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <Download size={14} /> Télécharger PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
