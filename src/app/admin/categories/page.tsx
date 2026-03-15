"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import Modal from "@/components/admin/Modal";

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", image: "" });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories([...categories, newCat]);
      setShowNew(false);
      setForm({ name: "", description: "", image: "" });
    }
  };

  const handleUpdate = async () => {
    if (!editId) return;
    const res = await fetch(`/api/categories/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories(categories.map((c) => (c.id === editId ? updated : c)));
      setEditId(null);
      setForm({ name: "", description: "", image: "" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
    setCategories(categories.filter((c) => c.id !== deleteId));
    setDeleteId(null);
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description, image: cat.image });
    setShowNew(false);
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
        <button
          onClick={() => {
            setShowNew(true);
            setEditId(null);
            setForm({ name: "", description: "", image: "" });
          }}
          className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showNew || editId) && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {editId ? "Edit Category" : "New Category"}
            </h3>
            <button
              onClick={() => {
                setShowNew(false);
                setEditId(null);
              }}
              title="Close form"
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Category Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
            <input
              placeholder="Image path"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none resize-none"
            rows={2}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={editId ? handleUpdate : handleCreate}
              className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a9636]"
            >
              <Save className="w-4 h-4" />
              {editId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border border-gray-100 p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-2">{cat.name}</h3>
            <p className="text-sm text-gray-500 mb-1">Slug: {cat.slug}</p>
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {cat.description}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(cat)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => setDeleteId(cat.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

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
