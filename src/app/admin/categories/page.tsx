"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Edit, Trash2, ImageIcon, LayoutGrid, List, Eye, ExternalLink } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  imagePosition?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "grid">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("admin-categories-view") as "list" | "grid") || "grid";
    }
    return "grid";
  });
  const { toast } = useToast();

  const toggleView = (v: "list" | "grid") => {
    setView(v);
    localStorage.setItem("admin-categories-view", v);
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
    setCategories(categories.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    toast("Category deleted successfully");
  };

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
          Categories ({categories.length})
        </h1>
        <div className="flex items-center gap-3">
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
          <Link
            href="/admin/categories/new"
            className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl overflow-hidden">
              {cat.image && (
                <div className="relative h-36">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" style={{ objectPosition: `center ${cat.imagePosition ?? 50}%` }} />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{cat.name}</h3>
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-xs text-gray-400">/{cat.slug}</p>
                  <Link href={`/shop?category=${cat.slug}`} target="_blank" className="text-[#6FB644] hover:text-[#5a9636]">
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{cat.description}</p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/categories/${cat.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-white rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {cat.image ? (
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
                        <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-sm text-gray-800">{cat.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">/{cat.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[300px] truncate">{cat.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/shop?category=${cat.slug}`} target="_blank" title="View" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Eye className="w-4 h-4" /></Link>
                      <Link href={`/admin/categories/${cat.id}`} title="Edit" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></Link>
                      <button onClick={() => setDeleteId(cat.id)} title="Delete" className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <div className="p-8 text-center text-gray-500">No categories found.</div>}
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Category"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-gray-600">
          Are you sure? This will remove the category permanently.
        </p>
      </Modal>
    </div>
  );
}
