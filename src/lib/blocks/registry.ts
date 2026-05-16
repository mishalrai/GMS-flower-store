import { ComponentType } from "react";
import { BlockType, BlockSettings } from "./types";
import HeroBlock from "@/components/blocks/HeroBlock";
import FeaturedProductsBlock from "@/components/blocks/FeaturedProductsBlock";
import SingleProductBlock from "@/components/blocks/SingleProductBlock";
import CTABlock from "@/components/blocks/CTABlock";
import TestimonialsBlock from "@/components/blocks/TestimonialsBlock";
import RichTextBlock from "@/components/blocks/RichTextBlock";
import CategoryGridBlock from "@/components/blocks/CategoryGridBlock";
import TrustBannerBlock from "@/components/blocks/TrustBannerBlock";
import FAQBlock from "@/components/blocks/FAQBlock";

// Renderers accept optional editable + onSettingsChange to support inline
// editing in the admin preview. Public PageRenderer just passes `settings`.
export type BlockRendererProps<T extends BlockType> = {
  settings: BlockSettings[T];
  editable?: boolean;
  onSettingsChange?: (settings: BlockSettings[T]) => void;
  /** When set (admin only), tells the block to enter reposition mode for this slide. */
  repositioningSlideIdx?: number | null;
  /** Called by the block when the user finishes (Done/Cancel) repositioning. */
  onExitReposition?: () => void;
  /** Hero only: notifies the editor of the currently visible slide index. */
  onActiveSlideChange?: (idx: number) => void;
  /** Hero only: editor-controlled active slide index. Navigates the Swiper. */
  activeSlideIdx?: number;
};

type BlockRenderer<T extends BlockType> = ComponentType<BlockRendererProps<T>>;

export const blockRegistry: { [T in BlockType]: BlockRenderer<T> } = {
  hero: HeroBlock,
  "featured-products": FeaturedProductsBlock,
  "single-product": SingleProductBlock,
  cta: CTABlock,
  testimonials: TestimonialsBlock,
  "rich-text": RichTextBlock,
  "category-grid": CategoryGridBlock,
  "trust-banner": TrustBannerBlock,
  faq: FAQBlock,
};
