import { Instagram } from "lucide-react";

const feedItems = [
  { color: "from-green-300 to-green-500", emoji: "🌿" },
  { color: "from-emerald-300 to-emerald-500", emoji: "🌱" },
  { color: "from-lime-300 to-lime-500", emoji: "🌻" },
  { color: "from-teal-300 to-teal-500", emoji: "🌹" },
  { color: "from-green-400 to-emerald-600", emoji: "🪴" },
  { color: "from-cyan-300 to-green-500", emoji: "🌸" },
];

export default function InstagramFeed() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Follow Us on Instagram
          </h2>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6FB644] font-medium hover:underline"
          >
            @gmsflowerstore
          </a>
          <div className="w-16 h-1 bg-[#6FB644] mx-auto mt-4 rounded-full" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {feedItems.map((item, index) => (
            <a
              key={index}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.color}`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">{item.emoji}</span>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
