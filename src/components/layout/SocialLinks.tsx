"use client";

import { useEffect, useState } from "react";

interface SocialLinksData {
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}

const socialConfig = [
  { key: "facebook", label: "FB", hoverColor: "hover:bg-[#1877F2]" },
  { key: "instagram", label: "IG", hoverColor: "hover:bg-[#E4405F]" },
  { key: "youtube", label: "YT", hoverColor: "hover:bg-[#FF0000]" },
  { key: "tiktok", label: "TT", hoverColor: "hover:bg-[#000000]" },
] as const;

export default function SocialLinks() {
  const [links, setLinks] = useState<SocialLinksData | null>(null);
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setLinks(data.socialLinks || {});
        setWhatsapp(data.whatsappNumber || "");
      });
  }, []);

  return (
    <div className="flex gap-3">
      {links &&
        socialConfig.map(({ key, label, hoverColor }) => {
          const url = links[key];
          if (!url) return null;
          return (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-9 h-9 bg-gray-800 flex items-center justify-center ${hoverColor} transition-colors text-sm`}
            >
              {label}
            </a>
          );
        })}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 bg-gray-800 flex items-center justify-center hover:bg-[#25D366] transition-colors text-sm"
        >
          WA
        </a>
      )}
    </div>
  );
}
