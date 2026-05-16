"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/layout/PageBanner";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import ProductCard from "@/components/home/ProductCard";
import { products as staticProducts, Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { parseVideoSource } from "@/lib/video";

interface ApiProduct extends Product {
  sku?: string;
  images?: string[];
  videos?: string[];
  richText?: string;
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isAdmin, setIsAdmin] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const { toggleItem, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: ApiProduct[]) => {
        const found = data.find((p) => p.slug === slug);
        if (found) {
          setProduct(found);
        } else {
          // Fallback to static data
          const staticMatch = staticProducts.find((p) => p.slug === slug);
          if (staticMatch) setProduct(staticMatch);
        }
        setLoading(false);
      })
      .catch(() => {
        const staticMatch = staticProducts.find((p) => p.slug === slug);
        if (staticMatch) setProduct(staticMatch);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
        </main>
        <Footer />
      </>
    );
  }

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

  // Build a unified media list: images first (legacy `image` as fallback),
  // followed by videos. Thumbnails and main viewer iterate the same array.
  const imageUrls =
    product.images && product.images.length > 0 ? product.images : [product.image];
  const media: { type: "image" | "video"; url: string }[] = [
    ...imageUrls.map((url) => ({ type: "image" as const, url })),
    ...(product.videos ?? []).map((url) => ({ type: "video" as const, url })),
  ];
  const activeMedia = media[activeImageIndex] ?? media[0];

  const relatedProducts = staticProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 5);

  const handleAddToCart = () => {
    if (!product.inStock) return;
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
        <PageBanner
          title="Product Details"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: "Product Details" },
          ]}
        />

        {/* Product Detail */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative">
              {/* Main viewer (image, uploaded video, or YouTube iframe) */}
              <div className="relative rounded-2xl aspect-square overflow-hidden bg-gray-100">
                {activeMedia?.type === "video"
                  ? (() => {
                      const v = parseVideoSource(activeMedia.url);
                      if (v.kind === "youtube") {
                        return (
                          <iframe
                            key={v.id}
                            src={v.embed}
                            title="YouTube video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full bg-black"
                          />
                        );
                      }
                      return (
                        <video
                          key={activeMedia.url}
                          src={activeMedia.url}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover bg-black"
                        />
                      );
                    })()
                  : activeMedia && (
                      <Image
                        src={activeMedia.url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
              </div>

              {product.badge && (
                <span
                  className={`absolute top-4 left-4 px-3 py-1 text-white text-sm font-bold rounded-full z-10 ${
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

              {/* Thumbnail Slider (images + videos) */}
              {media.length > 1 && (
                <ThumbnailSlider
                  media={media}
                  activeIndex={activeImageIndex}
                  onSelect={setActiveImageIndex}
                  productName={product.name}
                />
              )}
            </div>

            {/* Info */}
            <div>
              {isAdmin && (
                <div className="flex justify-end mb-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex items-center gap-1.5 text-[#6FB644] text-sm font-medium hover:text-[#5a9636] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Product
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {product.sku && (
                  <>
                    <span className="text-sm font-mono text-gray-400">
                      {product.sku}
                    </span>
                    <span className="text-sm text-gray-300">|</span>
                  </>
                )}
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  {product.category} Plant
                </span>
                <span className="text-sm text-gray-300">|</span>
                <span className="text-sm text-gray-500 capitalize">
                  {product.size} size
                </span>
              </div>

              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-800">
                  {product.name}
                </h1>
                <button
                  onClick={() => toggleItem(product)}
                  className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                    isInWishlist(product.id)
                      ? "text-red-500"
                      : "text-gray-400 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${isInWishlist(product.id) ? "fill-red-500" : ""}`}
                  />
                </button>
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
              {!product.inStock && (
                <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-lg mb-4">
                  This product is currently out of stock
                </div>
              )}

              <div className="flex flex-col gap-2 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                    product.inStock
                      ? "bg-[#6FB644] text-white hover:bg-[#5a9636]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>

                {/* WhatsApp Order */}
                <a
                  href={`https://wa.me/9779840036888?text=${encodeURIComponent(whatsappMessage)}`}
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#1da851] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Order via WhatsApp
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* Rich Text Content */}
        {product.richText && product.richText !== "<p><br></p>" && (
          <section className="py-12 px-4 border-t border-gray-100">
            <div className="max-w-7xl mx-auto">
              <div
                className="rich-text-content prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-[#6FB644] prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: product.richText }}
              />
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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

function ThumbnailSlider({
  media,
  activeIndex,
  onSelect,
  productName,
}: {
  media: { type: "image" | "video"; url: string }[];
  activeIndex: number;
  onSelect: (index: number) => void;
  productName: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [media]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 80;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mt-4 group/slider">
      {/* Left arrow - only when scrollable */}
      {canScroll && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Thumbnails */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-1"
      >
        {media.map((m, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
              activeIndex === index
                ? "border-[#6FB644] ring-1 ring-[#6FB644]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {m.type === "image" ? (
              <Image
                src={m.url}
                alt={`${productName} ${index + 1}`}
                fill
                className="object-cover"
              />
            ) : (
              (() => {
                const v = parseVideoSource(m.url);
                return (
                  <>
                    {v.kind === "youtube" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.thumbnail}
                        alt={`${productName} video ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover bg-black"
                      />
                    ) : (
                      <video
                        src={m.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover bg-black"
                      />
                    )}
                    {/* Video indicator overlay (same look for files + YouTube) */}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                        <Play className="w-3.5 h-3.5 text-gray-800 fill-gray-800 ml-0.5" />
                      </span>
                    </span>
                  </>
                );
              })()
            )}
          </button>
        ))}
      </div>

      {/* Right arrow - only when scrollable */}
      {canScroll && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
}
