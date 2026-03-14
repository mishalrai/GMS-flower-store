"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import ProductCard from "@/components/home/ProductCard";
import { products } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Star,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = products.find((p) => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const { toggleItem, isInWishlist } = useWishlistStore();

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Plant Not Found
            </h1>
            <Link
              href="/shop"
              className="text-[#6FB644] hover:underline font-medium"
            >
              Browse all plants
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toggleCart();
  };

  const whatsappMessage = `Hi! I'd like to order:\n\n🌿 ${product.name}\nSize: ${product.size}\nQuantity: ${quantity}\nPrice: Rs ${((product.salePrice || product.price) * quantity).toLocaleString()}\n\nPlease confirm availability.`;

  const displayPrice = product.salePrice || product.price;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-gray-50 py-3 px-4">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#6FB644]">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/shop" className="hover:text-[#6FB644]">
              Shop
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-800 font-medium">{product.name}</span>
          </div>
        </div>

        {/* Product Detail */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl aspect-square flex items-center justify-center">
                <span className="text-8xl">🌿</span>
              </div>
              {product.badge && (
                <span
                  className={`absolute top-4 left-4 px-3 py-1 text-white text-sm font-bold rounded-full ${
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
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  {product.category} Plant
                </span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500 capitalize">
                  {product.size} size
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({product.rating}/5)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-[#6FB644]">
                  Rs {displayPrice.toLocaleString()}
                </span>
                {product.salePrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      Rs {product.price.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-3 font-medium min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#6FB644] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#5a9636] transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => toggleItem(product)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    isInWishlist(product.id)
                      ? "border-red-400 bg-red-50 text-red-500"
                      : "border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${isInWishlist(product.id) ? "fill-red-500" : ""}`}
                  />
                </button>
              </div>

              {/* WhatsApp Order */}
              <a
                href={`https://wa.me/977XXXXXXXXXX?text=${encodeURIComponent(whatsappMessage)}`}
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#1da851] transition-colors mb-8"
              >
                <MessageCircle className="w-5 h-5" />
                Order via WhatsApp
              </a>

              {/* Trust */}
              <div className="grid grid-cols-3 gap-4 border-t pt-6">
                {[
                  { icon: Truck, text: "Free Delivery\nOver Rs 2,000" },
                  { icon: Shield, text: "Healthy Plant\nGuarantee" },
                  { icon: RefreshCw, text: "7-Day\nReturn Policy" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-center">
                    <item.icon className="w-5 h-5 text-[#6FB644] flex-shrink-0" />
                    <span className="text-xs text-gray-600 whitespace-pre-line">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
