"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

function FitBounds({ geometry }: { geometry: GeoJsonObject }) {
  const map = useMap();

  useEffect(() => {
    if (!geometry) return;
    try {
      const layer = (window as any).L?.geoJSON
        ? (window as any).L.geoJSON(geometry)
        : null;
      // Fallback: gunakan bounds dari GeoJSON layer react-leaflet
    } catch {
      // ignore
    }
  }, [geometry, map]);

  return null;
}

interface MapPreviewProps {
  geometry: any;
}

export default function MapPreview({ geometry }: MapPreviewProps) {
  if (!geometry) return null;

  return (
    <div className="w-full h-72 md:h-80 rounded-2xl overflow-hidden border border-emerald-100 shadow-sm z-0">
      <MapContainer
        center={[-2.5, 118]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={geometry}
          style={() => ({
            color: "#059669",
            weight: 2,
            fillColor: "#10b981",
            fillOpacity: 0.35,
          })}
          eventHandlers={{
            add: (e) => {
              const layer = e.target;
              try {
                const bounds = layer.getBounds();
                if (bounds.isValid()) {
                  layer._map.fitBounds(bounds, { padding: [24, 24] });
                }
              } catch {
                // ignore
              }
            },
          }}
        />
      </MapContainer>
    </div>
  );
}