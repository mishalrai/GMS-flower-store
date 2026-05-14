"use client";

import CategoryGrid from "@/components/home/CategoryGrid";
import { BlockSettings } from "@/lib/blocks/types";

export default function CategoryGridBlock({}: { settings: BlockSettings["category-grid"] }) {
  // Title is rendered inside CategoryGrid; setting reserved for future use.
  return <CategoryGrid />;
}
