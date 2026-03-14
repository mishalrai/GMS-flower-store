"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Star, Quote } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";

const testimonials = [
  {
    id: 1,
    name: "Sita Sharma",
    location: "Gauradaha, Jhapa",
    text: "I bought a money plant and snake plant from GMS Flower Store. Both are thriving beautifully! The plants were healthy and well-packaged. Highly recommend!",
    rating: 5,
  },
  {
    id: 2,
    name: "Rajesh Thapa",
    location: "Biratnagar",
    text: "Ordered roses and jasmine plants for my garden. They arrived in perfect condition. The team even shared care tips. Will definitely order again!",
    rating: 5,
  },
  {
    id: 3,
    name: "Priya Rai",
    location: "Kathmandu",
    text: "Gifted a peace lily to my mother for her birthday. She loved it! Great quality plants at reasonable prices. The WhatsApp ordering was so convenient.",
    rating: 4,
  },
  {
    id: 4,
    name: "Bikash Gurung",
    location: "Damak, Jhapa",
    text: "The best plant store in the Jhapa region! Their home-grown plants are much healthier than what you find in regular nurseries. Great customer service too.",
    rating: 5,
  },
  {
    id: 5,
    name: "Anita Limbu",
    location: "Birtamod, Jhapa",
    text: "I've been buying plants from GMS for months now. My balcony garden looks amazing thanks to their outdoor collection. Love the marigolds and dahlias!",
    rating: 5,
  },
  {
    id: 6,
    name: "Deepak Adhikari",
    location: "Itahari",
    text: "Ordered aloe vera and jade plants for my office. They add such a fresh vibe to the workspace. Delivery was fast and plants were carefully packed.",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            What Our Customers Say
          </h2>
          <p className="text-gray-500">
            Happy plant parents across Nepal
          </p>
          <div className="w-16 h-1 bg-[#6FB644] mx-auto mt-4 rounded-full" />
        </div>

        {/* Swiper */}
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full">
                <Quote className="w-8 h-8 text-[#6FB644] opacity-30 mb-3" />
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
