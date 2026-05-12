"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MovementEntry } from "@/lib/types";

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 1) {
      map.setView(positions[0], 13);
    } else if (positions.length > 1) {
      map.fitBounds(positions, { padding: [32, 32] });
    }
  }, [map, positions]);
  return null;
}

interface Props {
  locations: MovementEntry[];
}

export default function LocationMapInner({ locations }: Props) {
  const positions: [number, number][] = locations.map((m) => [m.coordinates.lat, m.coordinates.lng]);

  return (
    <MapContainer
      center={positions[0] ?? [14.5995, 120.9842]}
      zoom={10}
      style={{ height: 280, width: "100%", borderRadius: "0.75rem", zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <FitBounds positions={positions} />

      {positions.length > 1 && (
        <Polyline
          positions={positions}
          pathOptions={{ color: "#3b82f6", weight: 3, dashArray: "6 4" }}
        />
      )}

      {locations.map((m, i) => {
        const isFirst = i === 0;
        const isLast  = i === locations.length - 1;
        const color   = isFirst ? "#22c55e" : isLast ? "#f97316" : "#3b82f6";
        return (
          <CircleMarker
            key={m.id}
            center={[m.coordinates.lat, m.coordinates.lng]}
            radius={isFirst || isLast ? 9 : 7}
            pathOptions={{ fillColor: color, color: "#fff", weight: 2, fillOpacity: 1 }}
          >
            <Popup>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold">{m.stage}</p>
                <p>{m.location}</p>
                <p className="text-muted-foreground font-mono">
                  {m.coordinates.lat.toFixed(5)}, {m.coordinates.lng.toFixed(5)}
                </p>
                <p className="text-muted-foreground">{new Date(m.timestamp).toLocaleString('en-PH')}</p>
                <p className="font-medium">{m.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
