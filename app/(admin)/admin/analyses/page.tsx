"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/store";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { TrendingUp, Users, Activity, CreditCard } from "lucide-react";

export default function AdminAnalysesPage() {
   
  const [data, setData] = useState<{ revenueData: any[], usersData: any[] } | null>(null);

  useEffect(() => {
    async function loadData() {
      const analyticsData = await db.getAnalyticsData();
      setData(analyticsData);
    }
    loadData();
  }, []);

  if (!data) {
    return <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--gray-500)" }}>Chargement des données d'analyse...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--gray-900)", marginBottom: "8px" }}>Analyses & Statistiques</h1>
        <p style={{ color: "var(--gray-500)", margin: 0 }}>Suivez la croissance et les métriques clés de la plateforme en temps réel.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
        <div className="card" style={{ padding: "24px", background: "white", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(0, 154, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={24} color="#009A44" />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "var(--gray-500)", fontWeight: "600", marginBottom: "4px" }}>Croissance Mensuelle</p>
            <p style={{ fontSize: "24px", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>+15%</p>
          </div>
        </div>

        <div className="card" style={{ padding: "24px", background: "white", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255, 130, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={24} color="#FF8200" />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "var(--gray-500)", fontWeight: "600", marginBottom: "4px" }}>Taux de Rétention</p>
            <p style={{ fontSize: "24px", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>92%</p>
          </div>
        </div>

        <div className="card" style={{ padding: "24px", background: "white", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={24} color="#3b82f6" />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "var(--gray-500)", fontWeight: "600", marginBottom: "4px" }}>Utilisateurs Actifs</p>
            <p style={{ fontSize: "24px", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>80%</p>
          </div>
        </div>

        <div className="card" style={{ padding: "24px", background: "white", border: "1px solid var(--gray-200)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={24} color="#8b5cf6" />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "var(--gray-500)", fontWeight: "600", marginBottom: "4px" }}>Revenu / Abonné</p>
            <p style={{ fontSize: "24px", fontWeight: "800", color: "var(--gray-900)", margin: 0 }}>18 500 F</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
        
        {/* Evolution du Chiffre d'Affaires */}
        <div className="card" style={{ padding: "24px", background: "white", border: "1px solid var(--gray-200)" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--gray-900)", margin: 0 }}>Évolution du Chiffre d'Affaires Mensuel (FCFA)</h2>
            <p style={{ fontSize: "14px", color: "var(--gray-500)", margin: "4px 0 0 0" }}>Comparaison entre le CA global généré et la part liée aux abonnements SaaS.</p>
          </div>
          <div style={{ width: "100%", height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009A44" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#009A44" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAbo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8200" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF8200" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--gray-400)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--gray-400)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-200)" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(Number(value) || 0)}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="chiffre_daffaire" name="CA Global" stroke="#009A44" strokeWidth={3} fillOpacity={1} fill="url(#colorCA)" />
                <Area type="monotone" dataKey="abonnements" name="Revenus Abonnements" stroke="#FF8200" strokeWidth={3} fillOpacity={1} fill="url(#colorAbo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inscriptions et Utilisateurs */}
        <div className="card" style={{ padding: "24px", background: "white", border: "1px solid var(--gray-200)" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--gray-900)", margin: 0 }}>Acquisition et Rétention Utilisateurs</h2>
            <p style={{ fontSize: "14px", color: "var(--gray-500)", margin: "4px 0 0 0" }}>Nouveaux inscrits vs utilisateurs actifs sur la plateforme.</p>
          </div>
          <div style={{ width: "100%", height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.usersData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-200)" />
                <XAxis dataKey="name" stroke="var(--gray-400)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--gray-400)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="inscrits" name="Total Inscrits" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="actifs" name="Utilisateurs Actifs" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
