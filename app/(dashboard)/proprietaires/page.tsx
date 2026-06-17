"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Plus, 
  X, 
  Mail, 
  Phone, 
  Briefcase,
  Building,
  Percent
} from "lucide-react";
import { db } from "@/lib/store";
import { Landlord } from "@/lib/types";

export default function ProprietairesPage() {
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [commission, setCommission] = useState("10");

  const loadData = async () => {
    setLandlords(await db.getLandlords());
  };

  useEffect(() => {
    loadData();
    // Listen for storage changes from other tabs/pages
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleAddLandlord = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Étape 1 : Bouton cliqué ! Début de l'enregistrement...");
    if (!fullName || !phone) {
        alert("Étape 1.5 : Erreur, le nom ou le téléphone est vide.");
        return;
    }

    await db.addLandlord({
      full_name: fullName,
      email: email,
      phone: phone,
      commission_rate: parseFloat(commission) || 10,
    });

    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setCommission("10");
    setShowAddModal(false);
    alert("Étape 2 : Modal fermé, chargement des données...");

    // Reload lists
    await loadData();
    window.dispatchEvent(new Event("storage"));
  };

  const filteredLandlords = landlords.filter((l) => {
    const term = search.toLowerCase();
    return (
      (l.full_name?.toLowerCase() || "").includes(term) ||
      (l.email?.toLowerCase() || "").includes(term) ||
      (l.phone?.toLowerCase() || "").includes(term)
    );
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Gestion des mandats et commissions</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Propriétaires Bailleurs</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> Ajouter un propriétaire
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="input-with-icon" style={{ width: "100%" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Landlords Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nom du propriétaire</th>
                <th>Coordonnées</th>
                <th>Taux de commission</th>
                <th>Biens associés</th>
              </tr>
            </thead>
            <tbody>
              {filteredLandlords.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--gray-400)" }}>
                    Aucun propriétaire enregistré.
                  </td>
                </tr>
              ) : (
                filteredLandlords.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                        <div className="avatar avatar-sm" style={{ background: "var(--primary-lightest)", color: "var(--primary-dark)" }}>
                          <Briefcase size={14} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "700", margin: 0 }}>{l.full_name}</h4>
                          <span style={{ fontSize: "10px", color: "var(--gray-400)" }}>ID: {l.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "var(--text-xs)", color: "var(--gray-600)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Mail size={12} /> {l.email || "Non renseigné"}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Phone size={12} /> {l.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-warning" style={{ fontSize: "11px", display: "inline-flex", gap: "4px" }}>
                        <Percent size={12} />
                        {l.commission_rate}% de frais de gestion
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--gray-800)", display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)" }}>
                        <Building size={14} style={{ color: "var(--gray-400)" }} />
                        {l.property_count || 0} bien(s)
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================
         Add Landlord Modal
         ============================================ */}
      {showAddModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "var(--space-4)",
            backdropFilter: "blur(4px)"
          }}
          className="animate-fade-in"
        >
          <div 
            className="card animate-scale-in"
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "white",
              padding: "var(--space-6)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "800" }}>Ajouter un propriétaire bailleur</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)} style={{ padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Nom complet ou Société</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: M. Jean-Paul Bédié"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Numéro de Téléphone</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +225 01 02 03 04 05"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Adresse E-mail (Optionnel)</label>
                <input
                  type="email"
                  placeholder="Ex: jpbedie@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Frais de gestion (Commission de l'agence %)</label>
                <div className="input-with-icon">
                  <Percent className="input-icon" size={16} />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    className="input"
                  />
                </div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", marginTop: "4px" }}>
                  Ce pourcentage sera déduit des loyers perçus pour calculer la part reversée au propriétaire.
                </p>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddLandlord}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
