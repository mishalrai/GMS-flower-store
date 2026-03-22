"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface Location {
  lat: number;
  lng: number;
  city: string;
  country: string;
  count: number;
}

export default function VisitorMap({ locations }: { locations: Location[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Cleanup previous
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      const map = L.map(mapRef.current!, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([20, 0], 2);

      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      // Add markers
      const markerIcon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;background:#6FB644;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const bounds: [number, number][] = [];

      locations.forEach((loc) => {
        const marker = L.marker([loc.lat, loc.lng], { icon: markerIcon }).addTo(map);
        marker.bindPopup(
          `<div style="font-family:system-ui;font-size:13px;line-height:1.5;">
            <strong>${loc.city}</strong><br/>
            <span style="color:#666;">${loc.country}</span><br/>
            <span style="color:#6FB644;font-weight:600;">${loc.count} visit${loc.count > 1 ? "s" : ""}</span>
          </div>`,
          { closeButton: false, offset: [0, -4] }
        );
        bounds.push([loc.lat, loc.lng]);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 5);
      }

      // Fix tile rendering on container resize
      setTimeout(() => map.invalidateSize(), 200);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [locations]);

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <p className="text-gray-400 text-sm">No location data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Visitor Locations</h3>
        <span className="text-xs text-gray-400">
          {locations.length} location{locations.length !== 1 ? "s" : ""} &middot;{" "}
          {locations.reduce((s, l) => s + l.count, 0)} visits
        </span>
      </div>
      <div ref={mapRef} style={{ height: 400 }} />
      {/* Country labels */}
      <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-2">
        {locations
          .sort((a, b) => b.count - a.count)
          .map((loc) => (
            <span
              key={`${loc.city}-${loc.country}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-xs text-gray-600 rounded"
            >
              <span className="w-2 h-2 rounded-full bg-[#6FB644]" />
              {loc.city !== "Unknown" ? `${loc.city}, ` : ""}
              {loc.country}
              <span className="text-gray-400 ml-0.5">({loc.count})</span>
            </span>
          ))}
      </div>
    </div>
  );
}
