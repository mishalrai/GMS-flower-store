"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Star, Quote, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import { BlockSettings, ManualTestimonial } from "@/lib/blocks/types";

interface ReviewRow {
  id: string;
  customerName: string;
  text: string;
  rating: number;
}

export default function TestimonialsBlock({ settings }: { settings: BlockSettings["testimonials"] }) {
  const [reviewItems, setReviewItems] = useState<ManualTestimonial[]>([]);

  useEffect(() => {
    if (settings.source !== "reviews") return;
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data: ReviewRow[]) => {
        const limit = settings.limit ?? 6;
        setReviewItems(
          data.slice(0, limit).map((r) => ({
            name: r.customerName,
            text: r.text,
            rating: r.rating,
          }))
        );
      })
      .catch(() => {});
  }, [settings.source, settings.limit]);

  // Manual items: read directly from settings so side-panel edits reflect live.
  const items: ManualTestimonial[] =
    settings.source === "manual" ? settings.manual ?? [] : reviewItems;

  if (items.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {settings.title && settings.title.trim() && (
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              {settings.title}
            </h2>
            <div className="w-16 h-1 bg-[#6FB644] mx-auto mt-4 rounded-full" />
          </div>
        )}

        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          className="pb-12"
        >
          {items.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full">
                <Quote className="w-8 h-8 text-[#6FB644] opacity-30 mb-3" />
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  {t.image ? (
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-[#6FB644]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{t.name}</p>
                    {t.location && (
                      <p className="text-xs text-gray-500 truncate">{t.location}</p>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
