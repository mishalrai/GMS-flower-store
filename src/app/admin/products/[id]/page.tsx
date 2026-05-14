"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, X, Plus, Star as StarIcon, ExternalLink, Youtube } from "lucide-react";
import { isYouTubeUrl, parseVideoSource, isVideoFileUrl } from "@/lib/video";
import { useToast } from "@/components/admin/Toast";
import CustomSelect from "@/components/ui/CustomSelect";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import RichTextEditor from "@/components/admin/RichTextEditor";
import TagInput from "@/components/admin/TagInput";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [rteMediaPickerOpen, setRteMediaPickerOpen] = useState(false);
  const [rteImageUrl, setRteImageUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "indoor",
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
    tags: [] as string[],
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([data, cats]: [Record<string, unknown>, Category[]]) => {
      setSlug((data.slug as string) || "");
      setForm({
        name: data.name as string,
        sku: (data.sku as string) || "",
        category: data.category as string,
        costPrice: data.costPrice ? String(data.costPrice) : "",
        price: String(data.price),
        salePrice: data.salePrice ? String(data.salePrice) : "",
        size: data.size as string,
        badge: (data.badge as string) || "",
        description: data.description as string,
        rating: String(data.rating),
        inStock: data.inStock as boolean,
        inventory: data.inventory != null ? String(data.inventory) : "",
        richText: (data.richText as string) || "",
        tags: (data.tags as string[]) || [],
      });

      // Load images - support both images array and legacy single image
      const productImages = data.images as string[] | undefined;
      const singleImage = data.image as string | undefined;
      if (productImages && productImages.length > 0) {
        setImages(productImages);
        // Set featured index based on which image matches the main image
        if (singleImage) {
          const idx = productImages.indexOf(singleImage);
          if (idx >= 0) setFeaturedIndex(idx);
        }
      } else if (singleImage) {
        setImages([singleImage]);
      }

      // Load videos
      const productVideos = data.videos as string[] | undefined;
      if (productVideos && productVideos.length > 0) setVideos(productVideos);

      setCategories(cats);
      setLoading(false);
    });
  }, [id]);

  // Route a picked URL to the right list based on whether it's a video file or image.
  const handleMediaSelect = (url: string) => {
    if (isVideoFileUrl(url)) {
      if (!videos.includes(url)) setVideos((prev) => [...prev, url]);
    } else {
      if (!images.includes(url)) setImages((prev) => [...prev, url]);
    }
  };

  const handleMediaSelectMultiple = (urls: string[]) => {
    const newImages: string[] = [];
    const newVideos: string[] = [];
    for (const u of urls) {
      if (isVideoFileUrl(u)) newVideos.push(u);
      else newImages.push(u);
    }
    if (newImages.length) {
      setImages((prev) => [...prev, ...newImages.filter((u) => !prev.includes(u))]);
    }
    if (newVideos.length) {
      setVideos((prev) => [...prev, ...newVideos.filter((u) => !prev.includes(u))]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (featuredIndex === index) {
      setFeaturedIndex(0);
    } else if (featuredIndex > index) {
      setFeaturedIndex(featuredIndex - 1);
    }
  };

  const removeVideo = (index: number) =>
    setVideos((prev) => prev.filter((_, i) => i !== index));

  const addYoutubeLink = () => {
    const url = youtubeUrl.trim();
    if (!url) return;
    if (!isYouTubeUrl(url)) {
      toast("That doesn't look like a YouTube link", "error");
      return;
    }
    if (videos.includes(url)) {
      toast("This video is already added", "error");
      return;
    }
    setVideos((prev) => [...prev, url]);
    setYoutubeUrl("");
    setShowYoutubeInput(false);
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
      videos,
      slug: form.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    };

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      toast("Product updated successfully");
      router.push("/admin/products");
    } else {
      toast("Failed to update product", "error");
    }
    setSaving(false);
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
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/products"
          title="Back to products"
          className="p-2 hover:bg-gray-200 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
        {slug && (
          <Link
            href={`/products/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open the customer-facing product page in a new tab"
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on site
          </Link>
        )}
      </div>

      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6"
      >
        {/* Product Media (images + videos) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Media
          </label>
          <div className="flex flex-wrap gap-3">
            {images.map((url, index) => (
              <div
                key={`img-${url}`}
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
            {videos.map((url, i) => {
              const v = parseVideoSource(url);
              return (
                <div
                  key={`vid-${url}-${i}`}
                  className="relative w-28 h-28 rounded-lg border-2 border-gray-200 overflow-hidden bg-black group"
                >
                  {v.kind === "youtube" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.thumbnail}
                      alt="YouTube video"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-7 h-7 rounded-full bg-black/55 flex items-center justify-center">
                      <span className="block w-0 h-0 ml-0.5 border-y-[5px] border-y-transparent border-l-[8px] border-l-white" />
                    </div>
                  </div>
                  {v.kind === "youtube" && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded flex items-center gap-1">
                      <Youtube className="w-3 h-3" />
                      YT
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeVideo(i)}
                    title="Remove video"
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#6FB644] hover:bg-green-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] text-gray-500">Add Media</span>
            </button>
            <button
              type="button"
              onClick={() => setShowYoutubeInput(true)}
              className="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 hover:border-red-500 hover:text-red-500 text-gray-400 flex flex-col items-center justify-center transition-colors"
            >
              <Youtube className="w-5 h-5" />
              <span className="text-[10px] text-gray-500 mt-1">YouTube link</span>
            </button>
          </div>

          {/* Inline YouTube link input */}
          {showYoutubeInput && (
            <div className="mt-3 flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addYoutubeLink();
                  }
                  if (e.key === "Escape") {
                    setShowYoutubeInput(false);
                    setYoutubeUrl("");
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=…"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#6FB644]"
              />
              <button
                type="button"
                onClick={addYoutubeLink}
                className="px-3 py-2 bg-[#6FB644] hover:bg-[#5a9636] text-white text-sm font-semibold rounded"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowYoutubeInput(false);
                  setYoutubeUrl("");
                }}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">
            Click an image to set it as the featured image (shown with star). Videos: max 50 MB · MP4 / WebM, or paste a YouTube link.
          </p>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              value={form.sku}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
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
          />
        </div>

        {/* Tags */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <TagInput tags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
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

      </form>

      <div className="sticky bottom-0 bg-white py-4 mt-6 rounded-b-xl flex justify-end gap-3 px-6 z-10">
        <Link
          href="/admin/products"
          className="px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </Link>
        <button
          type="submit"
          form="product-form"
          disabled={saving}
          className="flex items-center gap-2 bg-[#6FB644] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Update Product"}
        </button>
      </div>

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
