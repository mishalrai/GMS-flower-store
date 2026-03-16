"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, Save, X, ImageIcon } from "lucide-react";
import Modal from "@/components/admin/Modal";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import { useToast } from "@/components/admin/Toast";

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
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const { toast } = useToast();

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
      toast("Category created successfully");
    } else {
      toast("Failed to create category", "error");
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
      toast("Category updated successfully");
    } else {
      toast("Failed to update category", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
    setCategories(categories.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    toast("Category deleted successfully");
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
        <div className="bg-white rounded-xl p-6 mb-6">
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

          <div className="flex gap-6">
            {/* Image Picker */}
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="w-36 h-36 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#6FB644] transition-colors flex flex-col items-center justify-center overflow-hidden group relative"
              >
                {form.image ? (
                  <>
                    <Image
                      src={form.image}
                      alt="Category"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-[#6FB644] transition-colors mb-1" />
                    <span className="text-xs text-gray-400 group-hover:text-[#6FB644] transition-colors">
                      Select Image
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-4">
              <input
                placeholder="Category Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  onClick={editId ? handleUpdate : handleCreate}
                  className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a9636]"
                >
                  <Save className="w-4 h-4" />
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl overflow-hidden"
          >
            {cat.image && (
              <div className="relative h-36">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-400 mb-1">/{cat.slug}</p>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
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
          </div>
        ))}
      </div>

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

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => setForm({ ...form, image: url })}
        currentImage={form.image}
      />
    </div>
  );
}
