"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import SocialLinks from "./SocialLinks";
import { useState, useEffect } from "react";

export default function Footer() {
  const [storeLogo, setStoreLogo] = useState("");
  const [storeName, setStoreName] = useState("GMS Flower Store");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.logo) setStoreLogo(data.logo);
        if (data.storeName) setStoreName(data.storeName);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {storeLogo ? (
                <Image
                  src={storeLogo}
                  alt={storeName}
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-2xl">🌱</span>
              )}
              <h3 className="text-xl font-bold text-white">{storeName}</h3>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Fresh indoor & outdoor plants grown with love in our home garden
              in Gauradaha, Jhapa, Nepal. Making every home greener, one plant
              at a time.
            </p>
            <SocialLinks />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/shop", label: "Shop" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[#6FB644] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Shipping Policy", href: "/contact" },
                { label: "Return Policy", href: "/contact" },
                { label: "Plant Care Tips", href: "/contact" },
                { label: "FAQs", href: "/faqs" },
                { label: "Terms & Conditions", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-[#6FB644] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#6FB644]" />
                Gauradaha, Jhapa, Nepal
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#6FB644]" />
                +977-9840036888
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#6FB644]" />
                gmsflowerstore@gmail.com
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#6FB644]" />
                Sun-Fri: 7:00 AM - 6:00 PM
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
          <p>© 2025 {storeName}. All Rights Reserved.</p>
          <p className="text-gray-500">
            Made with 🌿 in Gauradaha, Jhapa, Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
