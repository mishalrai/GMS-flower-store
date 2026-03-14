"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/977XXXXXXXXXX?text=Hi! I'm interested in buying plants from GMS Flower Store."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#1da851] transition-colors animate-pulse-green"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
