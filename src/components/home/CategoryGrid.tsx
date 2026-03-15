import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/products";

const categoryImages = [
  "/uploads/1773556212666-zs8ueh.jpg",
  "/uploads/1773556212672-cfl640.jpg",
  "/uploads/1773556212659-sr70uz.jpg",
  "/uploads/1773556212663-q5e325.jpg",
  "/uploads/1773556212660-n4qo7a.jpg",
  "/uploads/1773556212669-u3m0ay.jpg",
];

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
              <Image
                src={categoryImages[index] || categoryImages[0]}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="relative text-center text-white z-10">
                <h3 className="text-lg md:text-xl font-bold mb-1 drop-shadow-lg">
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
