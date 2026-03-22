"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function MiniMap({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;

      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      const map = L.map(mapRef.current!, {
        scrollWheelZoom: false,
        zoomControl: false,
        dragging: false,
        attributionControl: false,
      }).setView([lat, lng], 10);

      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;background:#6FB644;border:2.5px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker([lat, lng], { icon }).addTo(map);

      setTimeout(() => map.invalidateSize(), 100);
    };

    init();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div className="rounded-lg overflow-hidden">
      <div ref={mapRef} style={{ height: 160 }} />
      <div className="bg-gray-50 px-3 py-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#6FB644] flex-shrink-0" />
        <span className="text-xs text-gray-600">{label}</span>
      </div>
    </div>
  );
}
