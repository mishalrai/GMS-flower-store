"use client";

import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function WhatsAppButton() {
  const [whatsappNumber, setWhatsappNumber] = useState("9779840036888");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.whatsappNumber) {
          const num = data.whatsappNumber.startsWith("977")
            ? data.whatsappNumber
            : `977${data.whatsappNumber}`;
          setWhatsappNumber(num);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=Hi! I'm interested in buying plants from GMS Flower Store.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#1da851] transition-colors animate-pulse-green"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
