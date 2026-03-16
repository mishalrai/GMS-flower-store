"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ startX: 0, scrollLeft: 0, isDragging: false });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 1;
    setIsOverflowing(overflow);
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState, categories]);

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el || !isOverflowing) return;
    dragState.current = { startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, isDragging: false };
    el.style.userSelect = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el || e.buttons !== 1 || !isOverflowing) return;
    const walk = (e.pageX - el.offsetLeft) - dragState.current.startX;
    if (Math.abs(walk) > 3) dragState.current.isDragging = true;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    const el = scrollRef.current;
    if (el) el.style.userSelect = "";
  };

  const scrollToCenter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (dragState.current.isDragging) {
      e.preventDefault();
      dragState.current.isDragging = false;
      return;
    }
    if (!isOverflowing) return;
    const item = e.currentTarget;
    const containerRect = el.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2;
    const containerCenter = containerRect.left + containerRect.width / 2;
    const offset = itemCenter - containerCenter;

    if (Math.abs(offset) > 20) {
      el.scrollBy({ left: offset, behavior: "smooth" });
    }
  }, [isOverflowing]);

  if (categories.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollBy("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className={`flex gap-4 overflow-x-auto scrollbar-hide ${isOverflowing ? "cursor-grab active:cursor-grabbing" : ""}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              onClick={scrollToCenter}
              className="group relative overflow-hidden rounded-xl aspect-[2/1] flex items-center justify-center flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(16.666%-14px)]"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="relative text-center text-white z-10">
                <h3 className="text-sm md:text-base font-bold mb-0.5 drop-shadow-lg">
                  {category.name}
                </h3>
                <span className="text-xs opacity-80 group-hover:opacity-100 transition-opacity">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
