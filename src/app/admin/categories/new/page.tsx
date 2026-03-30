"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import ImagePositioner from "@/components/admin/ImagePositioner";

export default function NewCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", image: "", imagePosition: 50 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast("Category name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast("Category created successfully");
        router.push("/admin/categories");
      } else {
        toast("Failed to create category", "error");
      }
    } catch {
      toast("Failed to create category", "error");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/categories" title="Back" className="p-2 hover:bg-gray-200 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">New Category</h1>
      </div>

      <form id="category-form" onSubmit={handleSubmit} className="bg-white rounded-xl p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
          <ImagePositioner
            image={form.image}
            position={form.imagePosition}
            onPositionChange={(pos) => setForm({ ...form, imagePosition: pos })}
            onClickSelect={() => setMediaPickerOpen(true)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Category name"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Category description"
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none resize-none"
          />
        </div>
      </form>

      <div className="sticky bottom-0 bg-white py-4 mt-6 rounded-b-xl flex justify-end gap-3 px-6 z-10">
        <Link href="/admin/categories" className="px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
          Cancel
        </Link>
        <button
          type="submit"
          form="category-form"
          disabled={saving}
          className="flex items-center gap-2 bg-[#6FB644] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Create Category"}
        </button>
      </div>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => { setForm({ ...form, image: url }); setMediaPickerOpen(false); }}
      />
    </div>
  );
}
