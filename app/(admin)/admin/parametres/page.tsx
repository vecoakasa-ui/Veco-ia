"use client";

import { useState } from "react";
import { Settings, Save, AlertCircle } from "lucide-react";

export default function AdminParametresPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", margin: 0 }}>Configuration globale</p>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>Paramètres du Système</h2>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "800px" }}>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "700", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Settings size={20} />
          Préférences Générales
        </h3>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="label">Nom de la plateforme</label>
            <input type="text" className="input" defaultValue="Vision Immo 2.0" />
          </div>

          <div>
            <label className="label">Email de contact système</label>
            <input type="email" className="input" defaultValue="vecoakasa@gmail.com" />
          </div>

          <div style={{ display: "flex", gap: "var(--space-4)" }}>
            <div style={{ flex: 1 }}>
              <label className="label">Commission par défaut (%)</label>
              <input type="number" className="input" defaultValue={10} min={0} max={100} />
              <p style={{ fontSize: "var(--text-xs)", color: "var(--gray-500)", marginTop: "4px" }}>
                Pourcentage prélevé automatiquement sur les loyers collectés.
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Devise par défaut</label>
              <select className="input">
                <option value="XOF">FCFA (XOF)</option>
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
              </select>
            </div>
          </div>

          <div style={{ padding: "var(--space-4)", background: "rgba(245, 158, 11, 0.1)", borderRadius: "var(--radius-md)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
            <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--warning-dark)", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 8px 0" }}>
              <AlertCircle size={16} />
              Intégration Paiements
            </h4>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--gray-700)", margin: 0 }}>
              Les clés API PayDunya sont actuellement configurées via les variables d'environnement (.env). 
              Pour modifier les clés en direct depuis cette interface, le module sécurisé est en cours de développement.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {loading ? (
                <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent" }}></div>
              ) : (
                <Save size={16} />
              )}
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>

          {success && (
            <div style={{ padding: "var(--space-3)", background: "var(--success-light)", color: "var(--success-dark)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", textAlign: "center", fontWeight: "500", marginTop: "var(--space-2)" }}>
              Paramètres enregistrés avec succès !
            </div>
          )}
        </form>
      </div>

      {/* Section Base de données (Local) */}
      <div className="card" style={{ maxWidth: "800px", border: "1px solid var(--danger-light)", marginTop: "var(--space-4)" }}>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "700", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "8px", color: "var(--danger-dark)" }}>
          <Settings size={20} />
          Données locales (Backup & Restauration)
        </h3>
        
        <p style={{ color: "var(--gray-500)", marginBottom: "var(--space-6)", fontSize: "var(--text-sm)" }}>
          Gestion de la base de données de test et des sauvegardes du système.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Sauvegarder */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--gray-100)" }}>
            <div>
              <p style={{ fontWeight: 600, color: "var(--gray-900)", margin: "0 0 4px 0" }}>Sauvegarder les données</p>
              <p style={{ color: "var(--gray-500)", fontSize: "12px", margin: 0, maxWidth: "400px" }}>Téléchargez une copie complète des données (locataires, biens, paiements) pour pouvoir les restaurer plus tard.</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                const data = JSON.stringify(localStorage);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `veco_immo_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
            >
              Télécharger (Backup)
            </button>
          </div>

          {/* Restaurer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--gray-100)" }}>
            <div>
              <p style={{ fontWeight: 600, color: "var(--gray-900)", margin: "0 0 4px 0" }}>Restaurer les données</p>
              <p style={{ color: "var(--gray-500)", fontSize: "12px", margin: 0, maxWidth: "400px" }}>Importez un fichier de sauvegarde précédemment téléchargé pour restaurer vos données.</p>
            </div>
            <label className="btn btn-outline" style={{ cursor: "pointer", margin: 0 }}>
              Importer (Restaurer)
              <input 
                type="file" 
                accept=".json" 
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (window.confirm("Êtes-vous sûr de vouloir écraser vos données actuelles avec cette sauvegarde ?")) {
                          localStorage.clear();
                          Object.keys(data).forEach(key => {
                            localStorage.setItem(key, data[key]);
                          });
                          window.location.reload();
                        }
                      } catch (err) {
                        alert("Le fichier de sauvegarde est invalide.");
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Vider */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 600, color: "var(--gray-900)", margin: "0 0 4px 0" }}>Vider les données</p>
              <p style={{ color: "var(--danger-dark)", fontSize: "12px", margin: 0, maxWidth: "400px" }}>Cette action supprimera toutes les données locales. Pensez à faire une sauvegarde avant !</p>
            </div>
            <button 
              className="btn"
              onClick={() => {
                if (window.confirm("Avez-vous fait une sauvegarde ? Cette action est irréversible. Voulez-vous vraiment vider toutes les données locales ?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              style={{ background: "var(--danger)", color: "var(--fixed-white)", border: "none", padding: "8px 16px", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600 }}
            >
              Vider le cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
