"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  onLocationSelectRef.current = onLocationSelect;
  const removedRef = useRef(false);

  const [locating, setLocating] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressText, setAddressText] = useState("");

  // Default: Gauradaha, Jhapa, Nepal
  const defaultCenter: [number, number] = [26.5708, 87.8497];

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    removedRef.current = false;

    let map: any;
    let L: any;

    const init = async () => {
      L = (await import("leaflet")).default;

      if (removedRef.current || !mapRef.current) return;

      // Clear any stale Leaflet state on the DOM element (React strict mode double-mount)
      const container = mapRef.current as any;
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      map = L.map(mapRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapInstance.current = map;

      const icon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#6FB644" stroke="white" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const doPlaceMarker = (lat: number, lng: number) => {
        if (removedRef.current || !mapInstance.current) return;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(mapInstance.current);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current?.getLatLng();
            if (pos) {
              setCoords({ lat: pos.lat, lng: pos.lng });
              doReverseGeocode(pos.lat, pos.lng);
            }
          });
        }
        setCoords({ lat, lng });
        doReverseGeocode(lat, lng);
      };

      const doReverseGeocode = async (lat: number, lng: number) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setAddressText(address);
          onLocationSelectRef.current(lat, lng, address);
        } catch {
          const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setAddressText(fallback);
          onLocationSelectRef.current(lat, lng, fallback);
        }
      };

      // Store helpers on ref so handleRelocate can use them
      (mapInstance.current as any)._helpers = { doPlaceMarker };

      // Click to place/move marker
      map.on("click", (e: any) => {
        doPlaceMarker(e.latlng.lat, e.latlng.lng);
      });

      // Auto-detect location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (removedRef.current || !mapInstance.current) return;
            const { latitude, longitude } = position.coords;
            mapInstance.current.setView([latitude, longitude], 17);
            doPlaceMarker(latitude, longitude);
            setLocating(false);
          },
          () => setLocating(false),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setLocating(false);
      }
    };

    init();

    return () => {
      removedRef.current = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRelocate = () => {
    if (!navigator.geolocation || !mapInstance.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mapInstance.current) return;
        const { latitude, longitude } = position.coords;
        mapInstance.current.setView([latitude, longitude], 17);
        const helpers = (mapInstance.current as any)._helpers;
        if (helpers?.doPlaceMarker) {
          helpers.doPlaceMarker(latitude, longitude);
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Delivery Location
        </label>
        <button
          type="button"
          onClick={handleRelocate}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-medium text-[#6FB644] hover:text-[#5a9636] transition-colors disabled:opacity-50"
        >
          {locating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          {locating ? "Detecting location..." : "Re-detect My Location"}
        </button>
      </div>

      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-[250px] rounded-lg border border-gray-300 overflow-hidden z-0"
        />
        {locating && !coords && (
          <div className="absolute inset-0 bg-white/70 rounded-lg flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 className="w-6 h-6 text-[#6FB644] animate-spin" />
            <p className="text-sm text-gray-500">Detecting your location...</p>
          </div>
        )}
      </div>

      {coords ? (
        <div className="flex items-start gap-2 p-2.5 bg-green-50 rounded-lg">
          <MapPin className="w-4 h-4 text-[#6FB644] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs text-gray-700 font-medium">Location pinned</p>
            <p className="text-[11px] text-gray-500 truncate">{addressText}</p>
          </div>
        </div>
      ) : !locating ? (
        <p className="text-xs text-gray-400">
          We couldn&apos;t detect your location automatically. Click on the map to pin your delivery spot, or tap &quot;Re-detect My Location&quot;.
        </p>
      ) : null}
    </div>
  );
}
