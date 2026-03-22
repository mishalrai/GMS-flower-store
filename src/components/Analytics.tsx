"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Analytics() {
  const pathname = usePathname();
  const visitIdRef = useRef<string | null>(null);
  const entryTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    // Reset entry time on each page
    entryTimeRef.current = Date.now();
    visitIdRef.current = null;

    const base = {
      page: pathname,
      referrer: document.referrer,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
    };

    const send = (extra: Record<string, unknown> = {}) => {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...base, ...extra }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.id) visitIdRef.current = d.id;
        })
        .catch(() => {});
    };

    fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) })
      .then((r) => r.json())
      .then((geo) => {
        send({
          geoCountry: geo.country_name || "",
          geoCity: geo.city || "",
          geoRegion: geo.region || "",
          geoIP: geo.ip || "",
          lat: geo.latitude || null,
          lng: geo.longitude || null,
        });
      })
      .catch(() => send());

    // Send duration on page leave
    const sendDuration = () => {
      const duration = Math.round((Date.now() - entryTimeRef.current) / 1000);
      const id = visitIdRef.current;
      if (!id || duration < 1) return;
      navigator.sendBeacon(
        "/api/analytics/duration",
        JSON.stringify({ id, duration })
      );
    };

    window.addEventListener("beforeunload", sendDuration);

    return () => {
      // Fires on route change (SPA navigation)
      sendDuration();
      window.removeEventListener("beforeunload", sendDuration);
    };
  }, [pathname]);

  return null;
}
