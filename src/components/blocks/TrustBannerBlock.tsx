import { Truck, Shield, Headphones, RefreshCw, LucideIcon } from "lucide-react";
import { BlockSettings } from "@/lib/blocks/types";

const fallbackIcons: LucideIcon[] = [Truck, Shield, Headphones, RefreshCw];

export default function TrustBannerBlock({ settings }: { settings: BlockSettings["trust-banner"] }) {
  const items = settings.items?.length
    ? settings.items
    : [
        { title: "Free Delivery", subtitle: "On orders over Rs 2,000" },
        { title: "Safe Payment", subtitle: "100% secure payment" },
        { title: "24/7 Support", subtitle: "Dedicated support" },
        { title: "Easy Returns", subtitle: "7-day return policy" },
      ];

  return (
    <section className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((feature, i) => {
            const Icon = fallbackIcons[i % fallbackIcons.length];
            return (
              <div
                key={i}
                className="flex items-center gap-3 justify-center md:justify-start"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-[#6FB644]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-800">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
