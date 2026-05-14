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

export default function ProductPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  const selected = value != null ? products.find((p) => p.id === value) : null;
  const filtered = query
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : products.slice(0, 12);

  if (selected && !open) {
    return (
      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <Image src={selected.image} alt={selected.name} width={40} height={40} className="w-10 h-10 object-cover rounded" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{selected.name}</p>
          <p className="text-xs text-gray-500">Rs {selected.price}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-[#6FB644] hover:underline"
        >
          Change
        </button>
        <button
          onClick={() => onChange(null)}
          title="Clear"
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-3 py-2 text-sm border-b border-gray-200 outline-none"
          autoFocus
        />
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-gray-400 text-center">No products found</p>
        ) : (
          filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onChange(p.id);
                setOpen(false);
                setQuery("");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
            >
              <Image src={p.image} alt={p.name} width={32} height={32} className="w-8 h-8 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">Rs {p.price}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
