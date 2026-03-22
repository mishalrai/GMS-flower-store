"use client";

import { useState, useEffect } from "react";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import Link from "next/link";

const allTabs = [
  { id: "new-arrivals", label: "New Arrivals", viewAllText: "View All New Arrivals" },
  { id: "flash-sale", label: "Flash Sale", viewAllText: "View All Sale Items" },
  { id: "most-popular", label: "Most Popular", viewAllText: "View All Popular Products" },
];

interface HomepageTabs {
  "new-arrivals"?: boolean;
  "flash-sale"?: boolean;
  "most-popular"?: boolean;
}

export default function FeaturedProducts() {
  const [activeMainTab, setActiveMainTab] = useState("");
  const [visibleTabs, setVisibleTabs] = useState(allTabs);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const tabSettings: HomepageTabs = data.homepageTabs || {};
        const filtered = allTabs.filter(
          (tab) => tabSettings[tab.id as keyof HomepageTabs] !== false
        );
        setVisibleTabs(filtered);
        if (filtered.length > 0) {
          setActiveMainTab(filtered[0].id);
        }
        setLoaded(true);
      })
      .catch(() => {
        setVisibleTabs(allTabs);
        setActiveMainTab("new-arrivals");
        setLoaded(true);
      });
  }, []);

  const getAllForTab = () => {
    switch (activeMainTab) {
      case "new-arrivals":
        return [...products].sort((a, b) => b.id - a.id);
      case "flash-sale":
        return products.filter((p) => p.salePrice);
      case "most-popular":
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return [...products];
    }
  };

  if (!loaded || visibleTabs.length === 0) return null;

  const allForTab = getAllForTab();
  const filteredProducts = allForTab.slice(0, 16);
  const hasMore = allForTab.length > 16;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Tabs */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                activeMainTab === tab.id
                  ? "bg-[#6FB644] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-400 py-10">
              No products found in this category.
            </p>
          )}
        </div>

        {/* View All - only show if there are more products than displayed */}
        {hasMore && (
          <div className="text-center mt-10">
            <Link
              href={`/shop?filter=${activeMainTab}`}
              className="inline-block border-2 border-[#6FB644] text-[#6FB644] px-8 py-3 font-semibold hover:bg-[#6FB644] hover:text-white transition-colors"
            >
              {visibleTabs.find((t) => t.id === activeMainTab)?.viewAllText ?? "View All Products"}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
