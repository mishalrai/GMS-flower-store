"use client";

import { useState } from "react";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import Link from "next/link";

const tabs = [
  { id: "all", label: "All" },
  { id: "indoor", label: "Indoor" },
  { id: "outdoor", label: "Outdoor" },
];

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts =
    activeTab === "all"
      ? products.slice(0, 8)
      : products.filter((p) => p.category === activeTab).slice(0, 8);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            New Arrivals
          </h2>
          <p className="text-gray-500">Fresh plants from our garden</p>
          <div className="w-16 h-1 bg-[#6FB644] mx-auto mt-4 rounded-full" />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-[#6FB644] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-block border-2 border-[#6FB644] text-[#6FB644] px-8 py-3 rounded-full font-semibold hover:bg-[#6FB644] hover:text-white transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
