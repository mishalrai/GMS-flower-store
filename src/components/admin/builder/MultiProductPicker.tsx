"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";

interface ProductLite {
  id: number;
  name: string;
  image: string;
  price: number;
}

/**
 * Pick multiple products. Selected products render as removable chips above
 * the search input. Clicking a search result adds it to the array (no-op if
 * already selected). Preserves order of selection.
 */
export default function MultiProductPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  const byId = new Map(products.map((p) => [p.id, p]));
  const selected: ProductLite[] = value
    .map((id) => byId.get(id))
    .filter((p): p is ProductLite => !!p);
  const selectedSet = new Set(value);

  const filtered = (
    query
      ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      : products.slice(0, 12)
  ).filter((p) => !selectedSet.has(p.id));

  const add = (id: number) => {
    if (selectedSet.has(id)) return;
    onChange([...value, id]);
    setQuery("");
  };
  const remove = (id: number) => onChange(value.filter((v) => v !== id));

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="space-y-1.5">
          {selected.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50"
            >
              <Image
                src={p.image}
                alt={p.name}
                width={32}
                height={32}
                className="w-8 h-8 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">Rs {p.price}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                title="Remove"
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search + results */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              selected.length === 0
                ? "Search products to add..."
                : "Search to add more..."
            }
            className="w-full pl-9 pr-3 py-2 text-sm border-b border-gray-200 outline-none"
          />
        </div>
        <div className="max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-3 text-xs text-gray-400 text-center">
              {selected.length === products.length
                ? "All products selected"
                : "No products found"}
            </p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => add(p.id)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  width={28}
                  height={28}
                  className="w-7 h-7 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">Rs {p.price}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
