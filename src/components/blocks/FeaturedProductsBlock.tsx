"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/home/ProductCard";
import Link from "next/link";
import { BlockSettings } from "@/lib/blocks/types";
import { Product } from "@/data/products";
import { filterProducts, readTabFilter, viewAllLinkFor } from "@/lib/blocks/filters";

export default function FeaturedProductsBlock({ settings }: { settings: BlockSettings["featured-products"] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || settings.tabs.length === 0) return null;

  const tab = settings.tabs[activeTab] ?? settings.tabs[0];
  const filter = readTabFilter(tab);
  const filtered = filterProducts(products, filter);
  const limit = tab.limit ?? 16;
  const display = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {settings.title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{settings.title}</h2>
            <div className="w-16 h-1 bg-[#6FB644] mx-auto rounded-full" />
          </div>
        )}

        {settings.tabs.length > 1 && (
          <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
            {settings.tabs.map((t, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab(i);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={`pointer-events-auto cursor-pointer px-5 py-2 text-sm font-medium transition-all ${
                  i === activeTab
                    ? "bg-[#6FB644] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {display.length > 0 ? (
            display.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="col-span-full text-center text-gray-400 py-10">
              No products found in this category.
            </p>
          )}
        </div>

        {hasMore && (
          <div className="text-center mt-10">
            <Link
              href={viewAllLinkFor(filter)}
              className="inline-block border-2 border-[#6FB644] text-[#6FB644] px-8 py-3 font-semibold hover:bg-[#6FB644] hover:text-white transition-colors"
            >
              View All {tab.label}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
