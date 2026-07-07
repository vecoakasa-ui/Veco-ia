"use client";

import dynamic from "next/dynamic";
import { Property } from "@/lib/types";

// Dynamically import the map to avoid SSR issues with Leaflet using the window object
const MapModule = dynamic(() => import("./MapModule"), { 
  ssr: false,
  loading: () => (
    <div style={{ height: "400px", width: "100%", borderRadius: "var(--radius-lg)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--gray-200)" }}>
      <span style={{ color: "var(--gray-500)", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "20px", height: "20px", border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        Chargement de la carte...
      </span>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
});

interface MapModuleWrapperProps {
  properties: Property[];
  height?: string;
}

export default function MapModuleWrapper({ properties, height }: MapModuleWrapperProps) {
  return <MapModule properties={properties} height={height} />;
}
