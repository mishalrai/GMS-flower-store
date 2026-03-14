"use client";

import { Heart, ShoppingCart, Eye } from "lucide-react";
import Link from "next/link";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

interface ProductCardProps {
  product: Product;
}

const plantEmojis: Record<string, string> = {
  "money-plant": "🪴",
  "snake-plant": "🌵",
  "peace-lily": "🌸",
  "spider-plant": "🌿",
  pothos: "🍃",
  "jade-plant": "🪴",
  "aloe-vera": "🌵",
  "rubber-plant": "🌳",
  marigold: "🌼",
  dahlia: "🌺",
  rose: "🌹",
  hibiscus: "🌺",
  jasmine: "🤍",
  bougainvillea: "🌸",
  chrysanthemum: "💐",
  sunflower: "🌻",
};

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const { toggleItem, isInWishlist } = useWishlistStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toggleCart();
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem(product);
  };

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const emoji = plantEmojis[product.slug] || "🌿";

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {emoji}
        </span>

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-white text-xs font-bold rounded-full ${
              product.badge === "SALE"
                ? "bg-red-500"
                : product.badge === "NEW"
                  ? "bg-[#1ad441]"
                  : "bg-[#e62e05]"
            }`}
          >
            {product.badge === "SALE" ? `-${discount}%` : product.badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-4 h-4 ${
              isInWishlist(product.id)
                ? "text-red-500 fill-red-500"
                : "text-gray-400"
            }`}
          />
        </button>

        {/* Quick Actions */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#6FB644] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          {product.category} • {product.size}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-[#6FB644] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-[#6FB644]">
            Rs {(product.salePrice || product.price).toLocaleString()}
          </span>
          {product.salePrice && (
            <span className="text-sm text-gray-400 line-through">
              Rs {product.price.toLocaleString()}
            </span>
          )}
        </div>
        {!product.inStock && (
          <p className="text-xs text-red-500 mt-1 font-medium">Out of Stock</p>
        )}
      </div>
    </div>
  );
}
