"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { BlockSettings } from "@/lib/blocks/types";
import { Product } from "@/data/products";

export default function SingleProductBlock({ settings }: { settings: BlockSettings["single-product"] }) {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!settings.productId) return;
    fetch(`/api/products/${settings.productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProduct(data))
      .catch(() => {});
  }, [settings.productId]);

  if (!product) return null;

  const isRight = settings.layout === "right-image";
  const price = product.salePrice ?? product.price;

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className={`grid md:grid-cols-2 gap-10 items-center ${isRight ? "md:[direction:rtl]" : ""}`}>
          <div className="md:[direction:ltr]">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-[#6FB644] text-white text-xs font-bold px-3 py-1 rounded">
                  {product.badge}
                </span>
              )}
            </div>
          </div>
          <div className="md:[direction:ltr]">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{product.name}</h2>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-sm text-gray-500 ml-2">{product.rating.toFixed(1)}</span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-[#6FB644]">Rs {price}</span>
              {product.salePrice && (
                <span className="text-lg text-gray-400 line-through">Rs {product.price}</span>
              )}
            </div>
            <Link
              href={`/products/${product.slug}`}
              className="inline-block bg-[#6FB644] text-white px-8 py-3 font-semibold hover:bg-[#5a9636] transition-colors"
            >
              {settings.ctaLabel || "Shop Now"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
