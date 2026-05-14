"use client";

import CategoryGrid from "@/components/home/CategoryGrid";
import { BlockSettings } from "@/lib/blocks/types";

export default function CategoryGridBlock({
  settings,
  editable,
}: {
  settings: BlockSettings["category-grid"];
  editable?: boolean;
}) {
  return <CategoryGrid editable={editable} categorySlugs={settings.categorySlugs} />;
}
