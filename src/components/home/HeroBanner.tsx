"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import Link from "next/link";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const slides = [
  {
    title: "Make Your Home Beautiful with Plants",
    subtitle: "Fresh indoor & outdoor plants grown in our home garden",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    gradient: "from-green-800 via-green-700 to-green-600",
    emoji: "🌿",
  },
  {
    title: "Fresh From Our Garden to Your Home",
    subtitle: "Locally grown plants in Gauradaha, Jhapa, Nepal",
    buttonText: "Explore Plants",
    buttonLink: "/shop",
    gradient: "from-emerald-800 via-emerald-700 to-teal-600",
    emoji: "🌱",
  },
  {
    title: "Gift a Plant, Gift Life",
    subtitle: "Perfect plants for every occasion — birthdays, festivals & more",
    buttonText: "View Collection",
    buttonLink: "/shop",
    gradient: "from-green-900 via-green-800 to-emerald-700",
    emoji: "🎁",
  },
];

export default function HeroBanner() {
  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className={`bg-gradient-to-r ${slide.gradient} h-[350px] md:h-[500px] flex items-center justify-center px-4`}
            >
              <div className="max-w-3xl text-center text-white">
                <span className="text-5xl md:text-7xl block mb-4">
                  {slide.emoji}
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight animate-fade-in-up">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl mb-8 opacity-90">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.buttonLink}
                  className="inline-block bg-white text-green-800 px-8 py-3 rounded-full font-semibold text-lg hover:bg-green-50 transition-colors shadow-lg"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
