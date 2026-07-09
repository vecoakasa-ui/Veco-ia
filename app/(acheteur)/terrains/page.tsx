"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, 
  Map,
  FileText,
  Search,
  CheckCircle,
  Clock
} from "lucide-react";
import { db } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Sale, Property } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function AcheteurTerrains() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        const allSales = await db.getSales();
        setSales(allSales);

        const allProps = await db.getProperties();
        const propsMap: Record<string, Property> = {};
        allProps.forEach(p => propsMap[p.id] = p);
        setProperties(propsMap);
        
      } catch (error) {
        console.error("Error loading terrains:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredSales = sales.filter(s => {
    const prop = properties[s.property_id];
    if (!prop) return false;
    return prop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           prop.address.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(249, 115, 22, 0.2)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--gray-900)", margin: "0 0 8px 0" }}>
            Mes Terrains & Acquisitions
          </h1>
          <p style={{ color: "var(--gray-500)", margin: 0 }}>
            Retrouvez ici la liste de tous les biens que vous avez acquis ou qui sont en cours de paiement.
          </p>
        </div>
        
        <div style={{ position: "relative", width: "300px" }}>
          <Search size={18} color="var(--gray-400)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Rechercher un terrain..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "10px 12px 10px 40px", 
              borderRadius: "8px", 
              border: "1px solid var(--gray-200)",
              outline: "none",
              fontSize: "14px"
            }} 
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
        {filteredSales.map((sale) => {
          const prop = properties[sale.property_id];
          if (!prop) return null;
          
          const progress = Math.round(((sale.total_price - sale.remaining_balance) / sale.total_price) * 100);
          const isSold = sale.status === 'completed' || sale.remaining_balance <= 0;

          return (
            <div key={sale.id} style={{ background: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--gray-200)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <div style={{ height: "160px", background: "var(--gray-100)", position: "relative" }}>
                {prop.images && prop.images[0] ? (
                  <img src={prop.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Map size={48} color="var(--gray-300)" />
                  </div>
                )}
                <div style={{ 
                  position: "absolute", 
                  top: "12px", 
                  right: "12px", 
                  background: isSold ? "var(--success)" : "var(--primary)", 
                  color: "white", 
                  padding: "4px 10px", 
                  borderRadius: "20px", 
                  fontSize: "12px", 
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {isSold ? <><CheckCircle size={14} /> Soldé</> : <><Clock size={14} /> En cours</>}
                </div>
              </div>
              
              <div style={{ padding: "20px" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700", color: "var(--gray-900)" }}>{prop.name}</h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={16} /> {prop.address}, {prop.city}
                </p>
                
                <div style={{ background: "var(--gray-50)", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "var(--gray-500)" }}>Prix total</span>
                    <span style={{ fontWeight: "700", color: "var(--gray-900)" }}>{formatCurrency(sale.total_price)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "var(--gray-500)" }}>Montant payé</span>
                    <span style={{ fontWeight: "600", color: "var(--success)" }}>{formatCurrency(sale.total_price - sale.remaining_balance)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "var(--gray-500)" }}>Reste à payer</span>
                    <span style={{ fontWeight: "600", color: "var(--danger)" }}>{formatCurrency(sale.remaining_balance)}</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--gray-700)" }}>Progression du paiement</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--primary)" }}>{progress}%</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "var(--gray-200)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: \`\${progress}%\`, height: "100%", background: isSold ? "var(--success)" : "var(--primary)" }}></div>
                  </div>
                </div>
                
                <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
                  <button style={{ flex: 1, padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "white", border: "1px solid var(--gray-200)", borderRadius: "8px", color: "var(--gray-700)", fontWeight: "500", cursor: "pointer" }}>
                    <FileText size={16} /> Contrat
                  </button>
                  <button style={{ flex: 1, padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "white", border: "1px solid var(--gray-200)", borderRadius: "8px", color: "var(--gray-700)", fontWeight: "500", cursor: "pointer" }}>
                    <MapPin size={16} /> Plan
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredSales.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gray-500)", background: "white", borderRadius: "16px", border: "1px dashed var(--gray-300)" }}>
          <Map size={48} style={{ margin: "0 auto 16px auto", opacity: 0.3 }} />
          <p style={{ fontSize: "16px" }}>Aucun terrain trouvé.</p>
        </div>
      )}
    </div>
  );
}
