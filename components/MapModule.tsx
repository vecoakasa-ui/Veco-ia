"use client";

import { useMemo, useState } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface MapModuleProps {
  properties: Property[];
}

export default function MapModule({ properties }: MapModuleProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Abidjan coordinates as default center
  const defaultCenter = useMemo(() => ({ lat: 5.359951, lng: -4.008256 }), []);
  
  const propertiesWithCoords = properties.filter(p => p.lat && p.lng);

  const center = propertiesWithCoords.length > 0 && propertiesWithCoords[0].lat && propertiesWithCoords[0].lng 
    ? { lat: propertiesWithCoords[0].lat, lng: propertiesWithCoords[0].lng }
    : defaultCenter;

  if (loadError) {
    return (
      <div style={{ height: "400px", width: "100%", borderRadius: "var(--radius-lg)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--gray-200)", padding: "20px", textAlign: "center" }}>
        <span style={{ color: "var(--danger-dark)", fontWeight: "500" }}>
          Erreur lors du chargement de Google Maps. Veuillez vérifier votre clé API.
        </span>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ height: "400px", width: "100%", borderRadius: "var(--radius-lg)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--gray-200)" }}>
        <span style={{ color: "var(--gray-500)", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "20px", height: "20px", border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          Chargement de la carte Google Maps...
        </span>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--gray-200)" }}>
      <GoogleMap
        zoom={11}
        center={center}
        mapContainerStyle={{ width: "100%", height: "100%" }}
      >
        {propertiesWithCoords.map(property => (
          property.lat && property.lng ? (
            <Marker
              key={property.id}
              position={{ lat: property.lat, lng: property.lng }}
              onClick={() => setSelectedProperty(property)}
            />
          ) : null
        ))}

        {selectedProperty && selectedProperty.lat && selectedProperty.lng && (
          <InfoWindow
            position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div style={{ padding: "4px", minWidth: "180px", color: "var(--gray-900)" }}>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold" }}>{selectedProperty.name}</h4>
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--gray-600)" }}>{selectedProperty.address}, {selectedProperty.city}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", color: "var(--primary)" }}>{formatCurrency(selectedProperty.monthly_rent)}</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
