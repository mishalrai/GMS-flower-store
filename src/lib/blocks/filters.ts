import { Product } from "@/data/products";
import { FeaturedTab, ProductFilter, ProductFilterMode } from "./types";

/**
 * Normalize a tab's filter config. Reads the new `filter` field if present,
 * otherwise falls back to legacy `productIds`/`tag` fields so existing data
 * keeps rendering without a migration.
 */
export function readTabFilter(tab: FeaturedTab): ProductFilter {
  if (tab.filter) return tab.filter;
  if (tab.productIds && tab.productIds.length > 0) {
    return { mode: "manual", productIds: tab.productIds };
  }
  if (tab.tag) {
    return { mode: "tag", tag: tab.tag };
  }
  return { mode: "newest" };
}

/**
 * Apply a normalized filter to a product list. Pure function — call site is
 * responsible for fetching and providing the full product set.
 *
 * "popular" sorts by total units sold (salesCount) descending; ties broken
 * by rating. Products with zero sales fall to the end but still appear so
 * a new shop without orders yet doesn't show an empty popular tab.
 */
export function filterProducts(products: Product[], filter: ProductFilter): Product[] {
  switch (filter.mode) {
    case "newest":
      return [...products].sort((a, b) => b.id - a.id);
    case "popular":
      return [...products].sort((a, b) => {
        const sa = a.salesCount ?? 0;
        const sb = b.salesCount ?? 0;
        if (sb !== sa) return sb - sa;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
    case "sale":
      return products.filter(
        (p) => p.salePrice != null && p.salePrice < p.price,
      );
    case "in-stock":
      return products.filter((p) => p.inStock);
    case "badge":
      return products.filter((p) => p.badge === filter.badge);
    case "category":
      return products.filter((p) => p.category === filter.category);
    case "tag":
      return products.filter((p) =>
        (p.tags ?? []).includes(filter.tag ?? ""),
      );
    case "manual": {
      const set = new Set(filter.productIds ?? []);
      const inSet = products.filter((p) => set.has(p.id));
      // Preserve the admin's chosen order
      return (filter.productIds ?? [])
        .map((id) => inSet.find((p) => p.id === id))
        .filter((p): p is Product => !!p);
    }
    case "all":
      return [...products].sort((a, b) => b.id - a.id);
  }
}

/**
 * Build the "View all" link target for the active filter. The shop page
 * supports the relevant query params via its existing filter UI.
 */
export function viewAllLinkFor(filter: ProductFilter): string {
  switch (filter.mode) {
    case "category":
      return filter.category ? `/shop?category=${encodeURIComponent(filter.category)}` : "/shop";
    case "tag":
      return filter.tag ? `/shop?tag=${encodeURIComponent(filter.tag)}` : "/shop";
    case "sale":
      return "/shop?sale=1";
    case "in-stock":
      return "/shop?inStock=1";
    default:
      return "/shop";
  }
}

/** All filter modes with human labels, used by the admin form's dropdown. */
export const FILTER_MODE_OPTIONS: { value: ProductFilterMode; label: string }[] = [
  { value: "newest", label: "Newest arrivals" },
  { value: "popular", label: "Most popular (by sales)" },
  { value: "sale", label: "On sale" },
  { value: "in-stock", label: "In stock" },
  { value: "badge", label: "Has a badge" },
  { value: "category", label: "By category" },
  { value: "tag", label: "By tag" },
  { value: "manual", label: "Pick specific products" },
  { value: "all", label: "All products" },
];
