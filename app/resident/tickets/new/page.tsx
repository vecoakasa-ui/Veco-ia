"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, AlertTriangle, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function NewTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    // Demo: on récupère le premier locataire
    const getTenant = async () => {
      const { data } = await supabase.from('tenants').select('*').eq('status', 'active').limit(1).single();
      if (data) setTenant(data);
    };
    getTenant();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !tenant) return;
    
    setIsSubmitting(true);
    try {
      const ticketId = "tk_" + Math.random().toString(36).substr(2, 9);
      const { error } = await supabase.from('tickets').insert({
        id: ticketId,
        tenant_id: tenant.id,
        property_id: tenant.property_id,
        title: title,
        description: description,
        status: 'open'
      });

      if (error) throw error;
      
      alert("Votre signalement a bien été envoyé !");
      router.push("/resident/dashboard");
    } catch (error) {
      console.error("Failed to submit ticket:", error);
      alert("Erreur lors de l'envoi du signalement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <Link href="/resident/dashboard" className="btn btn-ghost" style={{ padding: "8px" }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: "var(--text-lg)", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>
          Signaler un problème
        </h1>
      </div>

      <div className="card" style={{ padding: "var(--space-5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "var(--space-6)", color: "var(--warning-dark)", background: "var(--warning-lightest)", padding: "12px", borderRadius: "8px" }}>
          <AlertTriangle size={24} />
          <p style={{ margin: 0, fontSize: "13px" }}>
            Veuillez décrire le problème avec le plus de détails possible pour aider notre équipe technique.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="input-group">
            <label className="input-label">Nature du problème</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Ex: Fuite d'eau sous l'évier" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Description détaillée</label>
            <textarea 
              className="input" 
              rows={4} 
              placeholder="Précisez la localisation, depuis quand le problème est apparu..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Placeholder for Photo Upload */}
          <div style={{ border: "2px dashed var(--gray-300)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", textAlign: "center", color: "var(--gray-500)", cursor: "pointer", background: "var(--gray-50)" }}>
            <ImageIcon size={32} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
            <span style={{ fontSize: "13px", fontWeight: "600" }}>Ajouter une photo (Optionnel)</span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", marginTop: "var(--space-4)", padding: "14px" }}
            disabled={isSubmitting || !tenant}
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer le signalement"}
          </button>
        </form>
      </div>
    </div>
  );
}
