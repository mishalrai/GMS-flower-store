import Link from "next/link";
import { categories } from "@/data/products";

const categoryColors = [
  "from-green-600 to-green-500",
  "from-emerald-600 to-emerald-500",
  "from-teal-600 to-teal-500",
  "from-lime-600 to-lime-500",
  "from-green-700 to-emerald-600",
  "from-cyan-600 to-teal-500",
];

const categoryEmojis = ["🏠", "🌳", "🌵", "🌸", "🍃", "🎁"];

export default function CategoryGrid() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Shop by Category
          </h2>
          <p className="text-gray-500">Find the perfect plant for your needs</p>
          <div className="w-16 h-1 bg-[#6FB644] mx-auto mt-4 rounded-full" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href="/shop"
              className="group relative overflow-hidden rounded-2xl h-48 md:h-56 flex items-center justify-center"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${categoryColors[index]} group-hover:scale-105 transition-transform duration-500`}
              />
              <div className="relative text-center text-white z-10">
                <span className="text-4xl md:text-5xl block mb-3">
                  {categoryEmojis[index]}
                </span>
                <h3 className="text-lg md:text-xl font-bold mb-1">
                  {category.name}
                </h3>
                <span className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
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
