"use client";

import Link from "next/link";
import { X, Home, ShoppingBag, Info, Phone, ChevronRight } from "lucide-react";

interface MobileMenuProps {
  onClose: () => void;
}

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop All Plants", icon: ShoppingBag },
    { href: "/about", label: "About Us", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Menu */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white z-50 animate-slide-in-left flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="font-bold text-[#6FB644]">GMS Flower Store</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center justify-between px-6 py-3.5 hover:bg-green-50 hover:text-[#6FB644] transition-colors"
            >
              <div className="flex items-center gap-3">
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          ))}

          <div className="px-6 py-4 mt-4 border-t">
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Categories
            </p>
            {["Indoor Plants", "Outdoor Plants", "Succulents", "Flowering Plants"].map(
              (cat) => (
                <Link
                  key={cat}
                  href="/shop"
                  onClick={onClose}
                  className="block py-2 text-sm text-gray-600 hover:text-[#6FB644]"
                >
                  {cat}
                </Link>
              )
            )}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t bg-gray-50">
          <a
            href="https://wa.me/977XXXXXXXXXX"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-semibold hover:bg-[#1da851] transition-colors"
          >
            <Phone className="w-4 h-4" />
            Contact on WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
