"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import ProductCard from "@/components/home/ProductCard";
import { products } from "@/data/products";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown, Check } from "lucide-react";

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const filterParam = searchParams.get("filter");
  const searchQuery = searchParams.get("search") || "";
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryParam || "all");
  }, [categoryParam]);

  const [sortBy, setSortBy] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Drag-to-scroll for category pills
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, scrollLeft: 0, moved: false });

  const handleDragStart = (e: React.MouseEvent) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setIsDragging(false);
    dragState.current = { startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false };
    el.style.userSelect = "none";
  };

  const handleDragMove = (e: React.MouseEvent) => {
    const el = categoryScrollRef.current;
    if (!el || e.buttons !== 1) return;
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 3) {
      setIsDragging(true);
      dragState.current.moved = true;
    }
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handleDragEnd = () => {
    const el = categoryScrollRef.current;
    if (el) el.style.userSelect = "";
    setTimeout(() => setIsDragging(false), 0);
  };

  // Apply filter param (from homepage "View All" links)
  let baseProducts = [...products];
  if (filterParam === "flash-sale") {
    baseProducts = baseProducts.filter((p) => p.salePrice);
  } else if (filterParam === "new-arrivals") {
    baseProducts.sort((a, b) => b.id - a.id);
  } else if (filterParam === "most-popular") {
    baseProducts.sort((a, b) => b.rating - a.rating);
  }

  const filteredProducts = baseProducts
    .filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory)
        return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "default") return 0;
      switch (sortBy) {
        case "price-low":
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case "price-high":
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-r from-green-700 to-green-500 text-white py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {searchQuery ? `Search: "${searchQuery}"` : filterParam === "new-arrivals" ? "New Arrivals" : filterParam === "flash-sale" ? "Flash Sale" : filterParam === "most-popular" ? "Most Popular" : "Our Plants"}
            </h1>
            <p className="text-lg opacity-90">
              {searchQuery ? `Showing results for "${searchQuery}"` : filterParam === "new-arrivals" ? "Check out our latest additions" : filterParam === "flash-sale" ? "Grab these deals before they're gone" : filterParam === "most-popular" ? "Our customers' top-rated favorites" : "Browse our collection of fresh, home-grown plants"}
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Category Pills */}
            <div
              className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing pb-2"
              ref={categoryScrollRef}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <button
                onClick={() => !isDragging && setSelectedCategory("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-[#6FB644] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => !isDragging && setSelectedCategory(cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    selectedCategory === cat.slug
                      ? "bg-[#6FB644] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Filters:</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Sort Dropdown */}
                <div ref={sortRef} className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[2px] text-sm font-medium transition-all border ${
                      sortBy !== "default"
                        ? "bg-[#6FB644]/10 border-[#6FB644] text-[#6FB644]"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {sortBy === "default" ? "Sort By" : sortBy === "price-low" ? "Price: Low to High" : sortBy === "price-high" ? "Price: High to Low" : "Name: A to Z"}
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                  </button>
                  {sortOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                      {[
                        { value: "default", label: "Default" },
                        { value: "price-low", label: "Price: Low to High" },
                        { value: "price-high", label: "Price: High to Low" },
                        { value: "name", label: "Name: A to Z" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            sortBy === opt.value
                              ? "bg-[#6FB644]/10 text-[#6FB644] font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opt.label}
                          {sortBy === opt.value && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Results count */}
            <p className="text-gray-600 mb-6">
              Showing {filteredProducts.length} of {products.length} plants
            </p>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  No plants found matching your filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                  }}
                  className="mt-4 text-[#6FB644] font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
