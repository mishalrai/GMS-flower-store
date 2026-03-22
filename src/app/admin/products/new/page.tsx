"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, X, Plus, Star as StarIcon } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import CustomSelect from "@/components/ui/CustomSelect";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [rteMediaPickerOpen, setRteMediaPickerOpen] = useState(false);
  const [rteImageUrl, setRteImageUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    costPrice: "",
    price: "",
    salePrice: "",
    size: "small",
    badge: "",
    description: "",
    rating: "4.5",
    inStock: true,
    inventory: "",
    richText: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, category: data[0].slug }));
        }
      });
  }, []);

  const handleMediaSelect = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  const handleMediaSelectMultiple = (urls: string[]) => {
    setImages((prev) => {
      const newUrls = urls.filter((u) => !prev.includes(u));
      return [...prev, ...newUrls];
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (featuredIndex === index) {
      setFeaturedIndex(0);
    } else if (featuredIndex > index) {
      setFeaturedIndex(featuredIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const product = {
      ...form,
      costPrice: form.costPrice ? Number(form.costPrice) : undefined,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      rating: Number(form.rating),
      badge: form.badge || null,
      inventory: form.inventory ? Number(form.inventory) : undefined,
      richText: form.richText || undefined,
      image: images[featuredIndex] || "",
      images,
      slug: form.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      toast("Product created successfully");
      router.push("/admin/products");
    } else {
      toast("Failed to create product", "error");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/products"
          title="Back to products"
          className="p-2 hover:bg-gray-200 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6"
      >
        {/* Images */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>
          <div className="flex flex-wrap gap-3">
            {images.map((url, index) => (
              <div
                key={url}
                className={`relative w-28 h-28 rounded-lg overflow-hidden border-2 group cursor-pointer ${
                  index === featuredIndex
                    ? "border-[#6FB644]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setFeaturedIndex(index)}
              >
                <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
                {index === featuredIndex && (
                  <div className="absolute top-1 left-1 bg-[#6FB644] text-white rounded-full p-0.5">
                    <StarIcon className="w-3 h-3 fill-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  title="Remove image"
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#6FB644] hover:bg-green-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] text-gray-500">Add Image</span>
            </button>
          </div>
          {images.length > 1 && (
            <p className="text-xs text-gray-400 mt-2">
              Click an image to set it as the featured image (shown with star).
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              placeholder="e.g. Money Plant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <CustomSelect
              value={form.category}
              onChange={(val) => setForm({ ...form, category: val })}
              options={categories.map((cat) => ({ value: cat.slug, label: cat.name }))}
              placeholder="Select category"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Price (Rs)
            </label>
            <input
              type="number"
              min="0"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              placeholder="Actual cost price"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price (Rs) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              placeholder="350"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Price (Rs)
            </label>
            <input
              type="number"
              min="0"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              placeholder="Leave empty for no sale"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inventory (Stock Qty)
            </label>
            <input
              type="number"
              min="0"
              value={form.inventory}
              onChange={(e) => setForm({ ...form, inventory: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              placeholder="e.g. 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size *
            </label>
            <CustomSelect
              value={form.size}
              onChange={(val) => setForm({ ...form, size: val })}
              options={[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge
            </label>
            <CustomSelect
              value={form.badge}
              onChange={(val) => setForm({ ...form, badge: val })}
              options={[
                { value: "", label: "None" },
                { value: "NEW", label: "NEW" },
                { value: "HOT", label: "HOT" },
                { value: "SALE", label: "SALE" },
              ]}
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="inStock"
              checked={form.inStock}
              onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
              className="w-4 h-4 text-[#6FB644] rounded"
            />
            <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
              In Stock
            </label>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none resize-none"
            placeholder="Describe the plant..."
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Detailed Description (Rich Text)
          </label>
          <RichTextEditor
            value={form.richText}
            onChange={(val) => setForm({ ...form, richText: val })}
            onImageClick={() => setRteMediaPickerOpen(true)}
            pendingImageUrl={rteImageUrl}
            onImageInserted={() => setRteImageUrl(null)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#6FB644] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        onSelectMultiple={handleMediaSelectMultiple}
        multiple
      />

      <MediaPickerModal
        isOpen={rteMediaPickerOpen}
        onClose={() => setRteMediaPickerOpen(false)}
        onSelect={(url) => {
          setRteImageUrl(url);
          setRteMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
