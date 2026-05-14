import { BlockType, BlockSettings, AnyBlock } from "./types";

export function defaultSettings<T extends BlockType>(type: T): BlockSettings[T] {
  switch (type) {
    case "hero":
      return {
        height: "md",
        buttons: [{ text: "Shop Now", link: "/shop" }],
        overlayColor: "#000000",
        overlayOpacity: 40,
        textColor: "#ffffff",
        manual: [
          {
            title: "Your headline here",
            subtitle: "A short, compelling subtitle that tells visitors what you offer.",
            image: "/images/banner-placeholder.svg",
          },
        ],
      } as BlockSettings[T];
    case "featured-products":
      return {
        title: "Featured Products",
        tabs: [
          { label: "New Arrivals", filter: { mode: "newest" } },
          { label: "On Sale", filter: { mode: "sale" } },
          { label: "Most Popular", filter: { mode: "popular" } },
        ],
      } as BlockSettings[T];
    case "single-product":
      return { productId: null, layout: "left-image", ctaLabel: "Shop Now" } as BlockSettings[T];
    case "cta":
      return {
        title: "Ready to bring nature home?",
        subtitle: "Browse our collection of fresh, home-grown plants.",
        buttonText: "Shop Now",
        buttonLink: "/shop",
        bgColor: "#6FB644",
        align: "center",
      } as BlockSettings[T];
    case "testimonials":
      return {
        title: "What Our Customers Say",
        source: "reviews",
        limit: 6,
      } as BlockSettings[T];
    case "rich-text":
      return {
        content: "<p>Add your content here…</p>",
        align: "left",
        maxWidth: "md",
      } as BlockSettings[T];
    case "category-grid":
      return { title: "Shop by Category" } as BlockSettings[T];
    case "trust-banner":
      return {
        items: [
          { title: "Free Delivery", subtitle: "On orders over Rs 2,000" },
          { title: "Safe Payment", subtitle: "100% secure payment" },
          { title: "24/7 Support", subtitle: "Dedicated support" },
          { title: "Easy Returns", subtitle: "7-day return policy" },
        ],
      } as BlockSettings[T];
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}

export function newBlock<T extends BlockType>(type: T): AnyBlock {
  return {
    id: crypto.randomUUID(),
    type,
    settings: defaultSettings(type),
  } as AnyBlock;
}
