"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Heart,
  ShoppingCart,
  Menu,
  X,
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
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [storeLogo, setStoreLogo] = useState("");
  const [storeName, setStoreName] = useState("GMS Flower Store");

  const router = useRouter();
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white border-b border-gray-100 transition-shadow duration-300 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {storeLogo ? (
              <Image
                src={storeLogo}
                alt={storeName}
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
            ) : (
              <span className="text-xl">🌱</span>
            )}
            <h1 className="text-lg font-bold text-gray-800">
              {storeName}
            </h1>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#6FB644] transition-colors"
            >
              Home
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setShopDropdown(true)}
              onMouseLeave={() => setShopDropdown(false)}
            >
              <Link
                href="/shop"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#6FB644] transition-colors"
              >
                Shop <ChevronDown className="w-3.5 h-3.5" />
              </Link>
              {shopDropdown && (
                <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 min-w-[180px] z-50 border border-gray-100">
                  <Link
                    href="/shop"
                    className="block px-4 py-2 text-sm hover:bg-green-50 hover:text-[#6FB644]"
                  >
                    All Plants
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      className="block px-4 py-2 text-sm hover:bg-green-50 hover:text-[#6FB644]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/about"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#6FB644] transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#6FB644] transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/admin/login"
              className="hidden md:block text-sm text-gray-600 hover:text-[#6FB644] transition-colors mr-1"
            >
              Login / Register
            </Link>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Search className="w-[18px] h-[18px] text-gray-700" />
            </button>

            <Link
              href="/shop"
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Heart className="w-[18px] h-[18px] text-gray-700" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleCart}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <ShoppingCart className="w-[18px] h-[18px] text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#6FB644] text-white text-[10px] rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar - Expandable */}
        {isSearchOpen && (
          <div className="px-4 pb-3">
            <form
              className="max-w-xl mx-auto relative"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }
              }}
            >
              <input
                type="text"
                placeholder="Search plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </form>
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
