"use client";


import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

// Fix Leaflet's default icon issue with Next.js/Webpack
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface MapModuleProps {
  properties: Property[];
}

export default function MapModule({ properties }: MapModuleProps) {
  // Abidjan coordinates as default center
  const defaultCenter: [number, number] = [5.359951, -4.008256];
  
  const propertiesWithCoords = properties.filter(p => p.lat && p.lng);

  const center: [number, number] = propertiesWithCoords.length > 0 && propertiesWithCoords[0].lat && propertiesWithCoords[0].lng 
    ? [propertiesWithCoords[0].lat, propertiesWithCoords[0].lng]
    : defaultCenter;

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--gray-200)", zIndex: 0, position: "relative" }}>
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", color: "var(--primary)" }}>{formatCurrency(property.monthly_rent)}</span>
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
