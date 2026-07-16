"use client";


import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

// Fix Leaflet's default icon issue with Next.js/Webpack
if (typeof window !== "undefined") {
   
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface MapModuleProps {
  properties: Property[];
  height?: string;
}

export default function MapModule({ properties, height = "400px" }: MapModuleProps) {
  // Abidjan coordinates as default center
  const defaultCenter: [number, number] = [5.359951, -4.008256];
  
  const propertiesWithCoords = properties.filter(p => p.lat && p.lng);

  const center: [number, number] = propertiesWithCoords.length > 0 && propertiesWithCoords[0].lat && propertiesWithCoords[0].lng 
    ? [propertiesWithCoords[0].lat, propertiesWithCoords[0].lng]
    : defaultCenter;

  return (
    <div style={{ height, width: "100%", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--gray-200)", zIndex: 0, position: "relative" }}>
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {propertiesWithCoords.map(property => (
          property.lat && property.lng ? (
            <Marker
              key={property.id}
              position={[property.lat, property.lng]}
            >
              <Popup>
                <div style={{ minWidth: "160px", color: "var(--gray-900)" }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold" }}>{property.name}</h4>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--gray-600)" }}>{property.address}, {property.city}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontWeight: "bold", color: "var(--primary)" }}>
                      {property.type === 'terrain' || property.type === 'lotissement' ? `Prix : ${formatCurrency(property.sale_price || 0)}` : `Loyer : ${formatCurrency(property.monthly_rent || 0)}`}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--gray-500)" }}>
                      GPS: {property.lat?.toFixed(5)}, {property.lng?.toFixed(5)}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}
