"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Search,
  Heart,
  ShoppingCart,
  Menu,
  X,
  User,
  Phone,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import CartSidebar from "./CartSidebar";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopDropdown, setShopDropdown] = useState(false);

  const toggleCart = useCartStore((state) => state.toggleCart);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#6FB644] text-white text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            <span>+977-XXX-XXXXXXX</span>
          </div>
          <p className="hidden md:block">
            🌿 Free delivery on orders over Rs 2,000
          </p>
          <div className="flex items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
              FB
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
              IG
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          isScrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#6FB644]">
                GMS Flower Store
              </h1>
              <p className="text-[10px] text-gray-500 hidden sm:block">
                Gauradaha, Jhapa, Nepal
              </p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none text-sm"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search toggle - mobile */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            <Link
              href="/about"
              className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg"
            >
              <User className="w-5 h-5 text-gray-700" />
            </Link>

            <Link
              href="/shop"
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Heart className="w-5 h-5 text-gray-700" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleCart}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#6FB644] text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-8 py-3">
              <li>
                <Link
                  href="/"
                  className="font-medium text-gray-800 hover:text-[#6FB644] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li
                className="relative"
                onMouseEnter={() => setShopDropdown(true)}
                onMouseLeave={() => setShopDropdown(false)}
              >
                <Link
                  href="/shop"
                  className="flex items-center gap-1 font-medium text-gray-800 hover:text-[#6FB644] transition-colors"
                >
                  Shop <ChevronDown className="w-4 h-4" />
                </Link>
                {shopDropdown && (
                  <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 min-w-[200px] z-50">
                    <Link
                      href="/shop"
                      className="block px-4 py-2 hover:bg-green-50 hover:text-[#6FB644]"
                    >
                      All Plants
                    </Link>
                    <Link
                      href="/shop?category=indoor"
                      className="block px-4 py-2 hover:bg-green-50 hover:text-[#6FB644]"
                    >
                      Indoor Plants
                    </Link>
                    <Link
                      href="/shop?category=outdoor"
                      className="block px-4 py-2 hover:bg-green-50 hover:text-[#6FB644]"
                    >
                      Outdoor Plants
                    </Link>
                  </div>
                )}
              </li>
              <li>
                <Link
                  href="/about"
                  className="font-medium text-gray-800 hover:text-[#6FB644] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="font-medium text-gray-800 hover:text-[#6FB644] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="lg:hidden px-4 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none text-sm"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Cart Sidebar */}
      {isCartOpen && <CartSidebar />}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
}
