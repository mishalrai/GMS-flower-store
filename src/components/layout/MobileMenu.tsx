"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Home, ShoppingBag, Info, Phone, ChevronRight, LogIn, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface MobileMenuProps {
  onClose: () => void;
}

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeLogo, setStoreLogo] = useState("");
  const [storeName, setStoreName] = useState("GMS Flower Store");
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.logo) setStoreLogo(data.logo);
        if (data.storeName) setStoreName(data.storeName);
      })
      .catch(() => {});
  }, []);
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
            {storeLogo ? (
              <Image src={storeLogo} alt={storeName} width={28} height={28} className="w-7 h-7 object-contain" />
            ) : (
              <span className="text-xl">🌱</span>
            )}
            <span className="font-bold text-[#6FB644]">{storeName}</span>
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
            {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  onClick={onClose}
                  className="block py-2 text-sm text-gray-600 hover:text-[#6FB644]"
                >
                  {cat.name}
                </Link>
              ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t bg-gray-50 space-y-2">
          {session ? (
            <div>
              <div className="flex items-center gap-2 px-1 mb-2">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#6FB644]" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">{session.user?.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">{session.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { onClose(); signOut({ callbackUrl: "/" }); }}
                className="flex items-center justify-center gap-2 w-full border border-red-200 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full border border-[#6FB644] text-[#6FB644] py-2.5 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login / Register
            </Link>
          )}
          <a
            href="https://wa.me/9779840036888"
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
