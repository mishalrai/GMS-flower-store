"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
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
    image: "/uploads/1773556212666-zs8ueh.jpg",
  },
  {
    title: "Fresh From Our Garden to Your Home",
    subtitle: "Locally grown plants in Gauradaha, Jhapa, Nepal",
    buttonText: "Explore Plants",
    buttonLink: "/shop",
    image: "/uploads/1773556212663-q5e325.jpg",
  },
  {
    title: "Gift a Plant, Gift Life",
    subtitle: "Perfect plants for every occasion — birthdays, festivals & more",
    buttonText: "View Collection",
    buttonLink: "/shop",
    image: "/uploads/1773556212662-4ghup0.jpg",
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
            <div className="relative h-[350px] md:h-[500px] flex items-center justify-center px-4">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative max-w-3xl text-center text-white z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl mb-8 opacity-90 drop-shadow">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.buttonLink}
                  className="inline-block bg-[#6FB644] text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#5a9636] transition-colors shadow-lg"
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
