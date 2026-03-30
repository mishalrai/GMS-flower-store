"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, LayoutGrid, List } from "lucide-react";
import Image from "next/image";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import CustomSelect from "@/components/ui/CustomSelect";

interface Product {
  id: number;
  sku?: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  size: string;
  badge: string | null;
  inStock: boolean;
  image?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "grid">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("admin-products-view") as "list" | "grid") || "list";
    }
    return "list";
  });
  const { toast } = useToast();

  const toggleView = (v: "list" | "grid") => {
    setView(v);
    localStorage.setItem("admin-products-view", v);
  };

  const fetchProducts = async () => {
    const [prodRes, catRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
    ]);
    setProducts(await prodRes.json());
    setCategories(await catRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
    setProducts(products.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    toast("Product deleted successfully");
  };

  const filtered = products.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.sku || "").toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Products ({products.length})
        </h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
          />
        </div>
        <CustomSelect
          value={categoryFilter}
          onChange={(val) => setCategoryFilter(val)}
          className="min-w-[180px]"
          options={[
            { value: "all", label: "All Categories" },
            ...categories.map((cat) => ({ value: cat.slug, label: cat.name })),
          ]}
        />
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleView("list")}
            className={`p-2 ${view === "list" ? "bg-[#6FB644] text-white" : "text-gray-400 hover:bg-gray-50"}`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleView("grid")}
            className={`p-2 ${view === "grid" ? "bg-[#6FB644] text-white" : "text-gray-400 hover:bg-gray-50"}`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="bg-white rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Badge</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-500">{product.sku || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-sm">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{product.category}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium">Rs {(product.salePrice || product.price).toLocaleString()}</span>
                    {product.salePrice && (
                      <span className="text-gray-400 line-through ml-2 text-xs">Rs {product.price.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{product.size}</td>
                  <td className="px-4 py-3"><StatusBadge status={product.inStock ? "active" : "inactive"} /></td>
                  <td className="px-4 py-3">
                    {product.badge ? (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${product.badge === "SALE" ? "bg-red-500" : product.badge === "NEW" ? "bg-green-500" : "bg-orange-500"}`}>
                        {product.badge}
                      </span>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/products/${product.slug}`} target="_blank" title="View" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Eye className="w-4 h-4" /></Link>
                      <Link href={`/admin/products/${product.id}`} title="Edit" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></Link>
                      <button onClick={() => setDeleteId(product.id)} title="Delete" className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No products found.</div>}
        </div>
      )}

      {/* Grid View */}
      {view === "grid" && (
        filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden group">
                <div className="relative aspect-square bg-gray-100">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 text-4xl">🌱</div>
                  )}
                  {product.badge && (
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold text-white rounded ${product.badge === "SALE" ? "bg-red-500" : product.badge === "NEW" ? "bg-green-500" : "bg-orange-500"}`}>
                      {product.badge}
                    </span>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/products/${product.slug}`} target="_blank" className="p-1.5 bg-white rounded shadow-sm hover:bg-gray-50"><Eye className="w-3.5 h-3.5 text-gray-600" /></Link>
                    <Link href={`/admin/products/${product.id}`} className="p-1.5 bg-white rounded shadow-sm hover:bg-gray-50"><Edit className="w-3.5 h-3.5 text-blue-500" /></Link>
                    <button onClick={() => setDeleteId(product.id)} className="p-1.5 bg-white rounded shadow-sm hover:bg-gray-50"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-[#6FB644]">Rs {(product.salePrice || product.price).toLocaleString()}</span>
                    <StatusBadge status={product.inStock ? "active" : "inactive"} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 capitalize">{product.category} · {product.size}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Delete Confirm */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Product"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this product? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
