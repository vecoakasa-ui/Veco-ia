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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
        {filteredSales.map((sale) => {
          const prop = properties[sale.property_id];
          if (!prop) return null;
          
          const progress = Math.round(((sale.total_price - sale.remaining_balance) / sale.total_price) * 100);
          const isSold = sale.status === 'completed' || sale.remaining_balance <= 0;

          return (
            <div key={sale.id} style={{ background: "white", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--gray-200)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", aspectRatio: "1 / 1", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "45%", background: "var(--gray-100)", position: "relative", flexShrink: 0 }}>
                {prop.images && prop.images[0] ? (
                  <img src={prop.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Map size={32} color="var(--gray-300)" />
                  </div>
                )}
                <div style={{ 
                  position: "absolute", 
                  top: "8px", 
                  right: "8px", 
                  background: isSold ? "var(--success)" : "var(--primary)", 
                  color: "white", 
                  padding: "2px 6px", 
                  borderRadius: "20px", 
                  fontSize: "10px", 
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {isSold ? <><CheckCircle size={12} /> Soldé</> : <><Clock size={12} /> En cours</>}
                </div>
              </div>
              
              <div style={{ padding: "10px", display: "flex", flexDirection: "column", flexGrow: 1, gap: "4px", overflow: "hidden" }}>
                <h3 style={{ margin: "0", fontSize: "14px", fontWeight: "700", color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prop.name}</h3>
                <p style={{ margin: "0", fontSize: "10px", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <MapPin size={12} style={{ flexShrink: 0 }} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{prop.address}, {prop.city}</span>
                </p>
                
                <div style={{ background: "var(--gray-50)", padding: "6px", borderRadius: "6px", margin: "4px 0", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "10px", color: "var(--gray-500)" }}>Total</span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--gray-900)" }}>{formatCurrency(sale.total_price)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "10px", color: "var(--gray-500)" }}>Reste</span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--danger)" }}>{formatCurrency(sale.remaining_balance)}</span>
                  </div>
                </div>

                <div style={{ marginBottom: "2px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--gray-700)" }}>Progression</span>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--primary)" }}>{progress}%</span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "var(--gray-200)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: isSold ? "var(--success)" : "var(--primary)" }}></div>
                  </div>
                </div>
                
                <div style={{ marginTop: "auto", display: "flex", gap: "6px", paddingTop: "4px" }}>
                  <button style={{ flex: 1, padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", background: "white", border: "1px solid var(--gray-200)", borderRadius: "6px", color: "var(--gray-700)", fontWeight: "500", cursor: "pointer", fontSize: "10px" }}>
                    <FileText size={12} /> Contrat
                  </button>
                  <button style={{ flex: 1, padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", background: "white", border: "1px solid var(--gray-200)", borderRadius: "6px", color: "var(--gray-700)", fontWeight: "500", cursor: "pointer", fontSize: "10px" }}>
                    <MapPin size={12} /> Plan
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
