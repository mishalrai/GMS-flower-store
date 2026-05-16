export type BlockType =
  | "hero"
  | "featured-products"
  | "single-product"
  | "cta"
  | "testimonials"
  | "rich-text"
  | "category-grid"
  | "trust-banner"
  | "faq";

export type ButtonVariant = "primary" | "secondary" | "outline" | "dark" | "white";
export type ButtonSize = "sm" | "md" | "lg";

export interface HeroButton {
  text: string;
  link?: string; // optional — button without a link renders as plain non-clickable label
  variant?: ButtonVariant; // visual style; falls back to position-based default
  size?: ButtonSize; // padding + text scale; defaults to "md"
  /** Hex color override for button background. Overrides variant when set. */
  bgColor?: string;
  /** Hex color override for button text. Overrides variant when set. */
  textColor?: string;
  /** Hex color for a 2px border. When set, adds (or overrides) the variant border. */
  borderColor?: string;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  image: string;
  /** Image focal point (object-position) as percentages 0–100. Default: 50/50. */
  imagePosition?: { x: number; y: number };
  /** @deprecated moved to block-level settings; kept for backward compat. */
  buttons?: HeroButton[];
  /** @deprecated moved to block-level settings. */
  overlayColor?: string;
  /** @deprecated moved to block-level settings. */
  overlayOpacity?: number;
  /** @deprecated moved to block-level settings. */
  textColor?: string;
  /** @deprecated kept for backward compatibility with previously stored slides. */
  buttonText?: string;
  /** @deprecated */
  buttonLink?: string;
  /** @deprecated */
  button2Text?: string;
  /** @deprecated */
  button2Link?: string;
}

export interface ManualTestimonial {
  name: string;
  location?: string;
  text: string;
  rating: number;
  /** Optional avatar URL shown next to the customer name. */
  image?: string;
}

export type TrustIconKey =
  | "truck"
  | "shield"
  | "headphones"
  | "refresh"
  | "lock"
  | "star"
  | "heart"
  | "award"
  | "clock"
  | "gift"
  | "thumbs-up"
  | "check-circle"
  | "leaf"
  | "package";

export type ProductFilterMode =
  | "newest"
  | "popular"
  | "sale"
  | "in-stock"
  | "badge"
  | "category"
  | "tag"
  | "manual"
  | "all";

export interface ProductFilter {
  mode: ProductFilterMode;
  tag?: string;
  badge?: "NEW" | "HOT" | "SALE";
  category?: string;
  productIds?: number[];
}

export interface FeaturedTab {
  label: string;
  filter?: ProductFilter;
  limit?: number;
  /** @deprecated use filter.tag instead. */
  tag?: string;
  /** @deprecated use filter.productIds with mode='manual' instead. */
  productIds?: number[];
}

export type BlockSettings = {
  hero: {
    manual?: HeroSlide[];
    height?: "sm" | "md" | "lg";
    /** Horizontal alignment of title/subtitle/buttons. Default: center. */
    contentAlign?: "left" | "center" | "right";
    /** Shared across all slides. */
    buttons?: HeroButton[];
    /** Shared overlay color. Default: #000000. */
    overlayColor?: string;
    /** Shared overlay opacity 0–100. Default: 40. */
    overlayOpacity?: number;
    /** Shared title + subtitle color. Default: #ffffff. */
    textColor?: string;
  };
  "featured-products": {
    title: string;
    tabs: FeaturedTab[];
  };
  "single-product": {
    productId: number | null;
    layout: "left-image" | "right-image";
    ctaLabel?: string;
  };
  cta: {
    title: string;
    subtitle?: string;
    buttonText: string;
    buttonLink: string;
    bgImage?: string;
    bgColor?: string;
    align?: "left" | "center";
  };
  testimonials: {
    title?: string;
    source: "reviews" | "manual";
    limit?: number;
    manual?: ManualTestimonial[];
  };
  "rich-text": {
    content: string;
    align?: "left" | "center" | "right";
    maxWidth?: "sm" | "md" | "lg" | "full";
  };
  "category-grid": {
    title?: string;
    /** Category slugs to show. When undefined or empty, all categories are shown in their default order. */
    categorySlugs?: string[];
  };
  "trust-banner": {
    items?: { icon?: TrustIconKey; title: string; subtitle: string }[];
  };
  faq: {
    title?: string;
    subtitle?: string;
    /** Specific FAQ IDs to show in display order. When undefined or empty, all active FAQs are shown. */
    faqIds?: number[];
  };
};

export type Block<T extends BlockType = BlockType> = {
  id: string;
  type: T;
  settings: BlockSettings[T];
};

export type AnyBlock = {
  [T in BlockType]: Block<T>;
}[BlockType];
