"use client";

import {
  Image as ImageIcon,
  ShoppingBag,
  Package,
  Megaphone,
  MessageSquareQuote,
  Type,
  LayoutGrid,
  ShieldCheck,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { ComponentType } from "react";
import { BlockType, BlockSettings } from "@/lib/blocks/types";
import {
  HeroForm,
  FeaturedProductsForm,
  SingleProductForm,
  CTAForm,
  TestimonialsForm,
  RichTextForm,
  CategoryGridForm,
  TrustBannerForm,
  FAQForm,
} from "./blockForms";

type Form<T extends BlockType> = ComponentType<{
  settings: BlockSettings[T];
  onChange: (s: BlockSettings[T]) => void;
}>;

interface BlockMeta<T extends BlockType> {
  type: T;
  label: string;
  description: string;
  icon: LucideIcon;
  form: Form<T>;
}

export const blockMeta: { [T in BlockType]: BlockMeta<T> } = {
  hero: {
    type: "hero",
    label: "Hero / Banner",
    description: "Full-width carousel with title, subtitle, and CTA",
    icon: ImageIcon,
    form: HeroForm,
  },
  "featured-products": {
    type: "featured-products",
    label: "Featured Products",
    description: "Tabbed product grid",
    icon: ShoppingBag,
    form: FeaturedProductsForm,
  },
  "single-product": {
    type: "single-product",
    label: "Single Product",
    description: "Highlight one product with image and CTA",
    icon: Package,
    form: SingleProductForm,
  },
  cta: {
    type: "cta",
    label: "Call to Action",
    description: "Promo banner with headline and button",
    icon: Megaphone,
    form: CTAForm,
  },
  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    description: "Customer reviews carousel",
    icon: MessageSquareQuote,
    form: TestimonialsForm,
  },
  "rich-text": {
    type: "rich-text",
    label: "Rich Text",
    description: "WYSIWYG content block",
    icon: Type,
    form: RichTextForm,
  },
  "category-grid": {
    type: "category-grid",
    label: "Category Grid",
    description: "Horizontal scroll of category cards",
    icon: LayoutGrid,
    form: CategoryGridForm,
  },
  "trust-banner": {
    type: "trust-banner",
    label: "Trust Banner",
    description: "Row of icon-text trust signals",
    icon: ShieldCheck,
    form: TrustBannerForm,
  },
  faq: {
    type: "faq",
    label: "FAQ",
    description: "Accordion of frequently asked questions",
    icon: HelpCircle,
    form: FAQForm,
  },
};

export const blockMetaList = Object.values(blockMeta);
