"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, Save, X, ImageIcon } from "lucide-react";
import Modal from "@/components/admin/Modal";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import { useToast } from "@/components/admin/Toast";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    image: "",
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => {
        setBanners(data);
        setLoading(false);
      });
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newBanner = await res.json();
      setBanners([...banners, newBanner]);
      setShowNew(false);
      setForm({ title: "", subtitle: "", buttonText: "Shop Now", buttonLink: "/shop", image: "" });
      toast("Banner created successfully");
    } else {
      toast("Failed to create banner", "error");
    }
  };

  const handleUpdate = async () => {
    if (!editId) return;
    const res = await fetch(`/api/banners/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setBanners(banners.map((b) => (b.id === editId ? updated : b)));
      setEditId(null);
      toast("Banner updated successfully");
    } else {
      toast("Failed to update banner", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/banners/${deleteId}`, { method: "DELETE" });
    setBanners(banners.filter((b) => b.id !== deleteId));
    setDeleteId(null);
    toast("Banner deleted successfully");
  };

  const startEdit = (banner: Banner) => {
    setEditId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      image: banner.image,
    });
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
          Banners ({banners.length})
        </h1>
        <button
          onClick={() => {
            setShowNew(true);
            setEditId(null);
            setForm({ title: "", subtitle: "", buttonText: "Shop Now", buttonLink: "/shop", image: "" });
          }}
          className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Form */}
      {(showNew || editId) && (
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {editId ? "Edit Banner" : "New Banner"}
            </h3>
            <button onClick={() => { setShowNew(false); setEditId(null); }} title="Close form" className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Image Picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
            {form.image ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group">
                <Image src={form.image} alt="Banner preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#6FB644] hover:text-[#6FB644] transition-colors"
              >
                <ImageIcon className="w-10 h-10 mb-2" />
                <span className="text-sm font-medium">Click to select an image</span>
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none" />
            <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none" />
            <input placeholder="Button Text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none" />
            <input placeholder="Button Link" value={form.buttonLink} onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none" />
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={editId ? handleUpdate : handleCreate} className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a9636]">
              <Save className="w-4 h-4" />
              {editId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Banner Cards */}
      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl p-6">
            <div className="flex items-start gap-4">
              {banner.image ? (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                  <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-32 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{banner.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{banner.subtitle}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>Button: {banner.buttonText}</span>
                  <span>Link: {banner.buttonLink}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(banner)} title="Edit banner" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(banner.id)} title="Delete banner" className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Banner" onConfirm={handleDelete} confirmText="Delete" confirmColor="bg-red-500 hover:bg-red-600">
        <p className="text-gray-600">Delete this banner?</p>
      </Modal>

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => setForm({ ...form, image: url })}
        currentImage={form.image}
      />
    </div>
  );
}
