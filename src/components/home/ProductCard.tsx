"use client";

import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

interface ProductCardProps {
  product: Product;
}

const plantImages: Record<string, string> = {
  "money-plant": "/uploads/1773556212668-w0sk9g.jpg",
  "snake-plant": "/uploads/1773556212675-6uw8zf.jpg",
  "peace-lily": "/uploads/1773556212671-rs2qts.jpg",
  "spider-plant": "/uploads/1773556212665-wnugmm.jpg",
  pothos: "/uploads/1773556212660-n4qo7a.jpg",
  "jade-plant": "/uploads/1773556212677-ytxqae.jpg",
  "aloe-vera": "/uploads/1773556212652-nfcwiz.jpg",
  "rubber-plant": "/uploads/1773556212674-3qmm3f.jpg",
  marigold: "/uploads/1773556212662-4ghup0.jpg",
  dahlia: "/uploads/1773556212663-q5e325.jpg",
  rose: "/uploads/1773556212663-q5e325.jpg",
  hibiscus: "/uploads/1773556212669-u3m0ay.jpg",
  jasmine: "/uploads/1773556212671-rs2qts.jpg",
  bougainvillea: "/uploads/1773556212662-4ghup0.jpg",
  chrysanthemum: "/uploads/1773556212669-u3m0ay.jpg",
  sunflower: "/uploads/1773556212672-cfl640.jpg",
};

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const { toggleItem, isInWishlist } = useWishlistStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;
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

  const imageUrl = plantImages[product.slug] || product.image;

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

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
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all ${
            isInWishlist(product.id)
              ? "bg-red-50"
              : "bg-white/90 backdrop-blur-sm"
          }`}
        >
          <Heart
            className={`w-[18px] h-[18px] ${
              isInWishlist(product.id)
                ? "text-red-500 fill-red-500"
                : "text-gray-500"
            }`}
          />
        </button>

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
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#6FB644]">
              Rs {(product.salePrice || product.price).toLocaleString()}
            </span>
            {product.salePrice && (
              <span className="text-sm text-gray-400 line-through">
                Rs {product.price.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              product.inStock
                ? "bg-[#6FB644] hover:bg-[#5a9636]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-white" />
          </button>
        </div>
        {!product.inStock && (
          <p className="text-xs text-red-500 mt-1 font-medium">Out of Stock</p>
        )}
      </div>
    </div>
  );
}
