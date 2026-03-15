"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import ProductCard from "@/components/home/ProductCard";
import { products, categories } from "@/data/products";
import { useState, useRef } from "react";
import { SlidersHorizontal, Grid3X3, LayoutList } from "lucide-react";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory)
        return false;
      if (selectedSize !== "all" && p.size !== selectedSize) return false;
      return true;
    })
    .sort((a, b) => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Plants</h1>
            <p className="text-lg opacity-90">
              Browse our collection of fresh, home-grown plants
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
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
                >
                  <option value="all">All Sizes</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
                >
                  <option value="default">Sort By: Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-[#6FB644] text-white" : "bg-white text-gray-500"}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-[#6FB644] text-white" : "bg-white text-gray-500"}`}
                >
                  <LayoutList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Results count */}
            <p className="text-gray-600 mb-6">
              Showing {filteredProducts.length} of {products.length} plants
            </p>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
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
                    setSelectedSize("all");
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
