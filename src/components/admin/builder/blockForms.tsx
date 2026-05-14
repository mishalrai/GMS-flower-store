"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Bookmark, BookmarkCheck, Star } from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  BlockSettings,
  HeroSlide,
  FeaturedTab,
  ManualTestimonial,
  ProductFilter,
  ProductFilterMode,
} from "@/lib/blocks/types";
import { FILTER_MODE_OPTIONS, readTabFilter } from "@/lib/blocks/filters";
import ProductPicker from "./ProductPicker";
import MultiProductPicker from "./MultiProductPicker";

// ─── shared field UI ───────────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-medium text-gray-700 mb-1">{children}</label>
);

const fieldClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none";

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; title?: string }[];
}) {
  return (
    <div className="inline-flex w-full rounded-lg border border-gray-300 overflow-hidden bg-white">
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.title}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-[#6FB644] text-white"
                : "text-gray-700 hover:bg-gray-50"
            } ${i > 0 ? "border-l border-gray-300" : ""}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ImageField({ value, onChange }: { value?: string; onChange: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {value ? (
            <Image src={value} alt="" width={64} height={64} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-300" />
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
        >
          {value ? "Change" : "Pick image"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-500 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      <MediaPickerModal
        isOpen={open}
        onClose={() => setOpen(false)}
        currentImage={value}
        onSelect={(url) => {
          onChange(url);
          setOpen(false);
        }}
      />
    </>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

export function HeroForm({
  settings,
  onChange,
}: {
  settings: BlockSettings["hero"];
  onChange: (s: BlockSettings["hero"]) => void;
}) {
  const slides = settings.manual ?? [];
  const addSlide = () =>
    onChange({
      ...settings,
      manual: [
        ...slides,
        {
          title: "Your headline here",
          subtitle: "A short, compelling subtitle that tells visitors what you offer.",
          image: "/images/banner-placeholder.svg",
        },
      ],
    });
  const removeSlide = (i: number) =>
    onChange({ ...settings, manual: slides.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <div>
        <Label>Height</Label>
        <SegmentedControl<"sm" | "md" | "lg">
          value={settings.height ?? "md"}
          onChange={(v) => onChange({ ...settings, height: v })}
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />
      </div>

      <div>
        <Label>Content alignment</Label>
        <SegmentedControl<"left" | "center" | "right">
          value={settings.contentAlign ?? "center"}
          onChange={(v) => onChange({ ...settings, contentAlign: v })}
          options={[
            { value: "left", title: "Align left", label: <AlignLeft className="w-4 h-4" /> },
            { value: "center", title: "Align center", label: <AlignCenter className="w-4 h-4" /> },
            { value: "right", title: "Align right", label: <AlignRight className="w-4 h-4" /> },
          ]}
        />
      </div>

      {/* Shared style (applies to every slide) */}
      <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50/50">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          Shared style (all slides)
        </p>

        <div>
          <Label>Overlay color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.overlayColor ?? "#000000"}
              onChange={(e) => onChange({ ...settings, overlayColor: e.target.value })}
              className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={settings.overlayColor ?? "#000000"}
              onChange={(e) => onChange({ ...settings, overlayColor: e.target.value })}
              className={fieldClass + " font-mono"}
            />
          </div>
        </div>

        <div>
          <Label>Overlay opacity ({settings.overlayOpacity ?? 40}%)</Label>
          {(() => {
            const opacity = settings.overlayOpacity ?? 40;
            return (
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) =>
                  onChange({ ...settings, overlayOpacity: Number(e.target.value) })
                }
                style={{
                  background: `linear-gradient(to right, #6FB644 0%, #6FB644 ${opacity}%, #e5e7eb ${opacity}%, #e5e7eb 100%)`,
                }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#6FB644] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6FB644] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#6FB644] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
              />
            );
          })()}
        </div>

        <div>
          <Label>Text color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.textColor ?? "#ffffff"}
              onChange={(e) => onChange({ ...settings, textColor: e.target.value })}
              className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={settings.textColor ?? "#ffffff"}
              onChange={(e) => onChange({ ...settings, textColor: e.target.value })}
              className={fieldClass + " font-mono"}
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Slides</Label>
        <p className="text-[11px] text-gray-400 mb-2">
          Click the title, subtitle, or button text in the preview to edit them directly.
        </p>
        <div className="space-y-1.5">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative flex items-center justify-end h-14 px-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 bg-cover bg-center"
              style={slide.image ? { backgroundImage: `url(${slide.image})` } : undefined}
            >
              <div className="absolute inset-0 bg-black/15" />
              <button
                onClick={() => removeSlide(i)}
                disabled={slides.length <= 1}
                title={slides.length <= 1 ? "Hero needs at least one slide" : "Remove slide"}
                className="relative z-10 bg-white/90 hover:bg-white text-red-500 p-1.5 rounded shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addSlide}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#6FB644] hover:text-[#6FB644] transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-1" /> Add slide
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Featured Products ─────────────────────────────────────────────────────

export function FeaturedProductsForm({
  settings,
  onChange,
}: {
  settings: BlockSettings["featured-products"];
  onChange: (s: BlockSettings["featured-products"]) => void;
}) {
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: { slug: string; name: string }[]) => setCategories(data))
      .catch(() => {});
  }, []);

  const updateTab = (i: number, patch: Partial<FeaturedTab>) => {
    const next = [...settings.tabs];
    next[i] = { ...next[i], ...patch };
    onChange({ ...settings, tabs: next });
  };
  const updateTabFilter = (i: number, patch: Partial<ProductFilter>) => {
    const current = readTabFilter(settings.tabs[i]);
    updateTab(i, {
      filter: { ...current, ...patch } as ProductFilter,
      // Clear legacy fields once a tab is touched through the new UI
      tag: undefined,
      productIds: undefined,
    });
  };
  const addTab = () =>
    onChange({
      ...settings,
      tabs: [
        ...settings.tabs,
        { label: "New Tab", filter: { mode: "newest" } },
      ],
    });
  const removeTab = (i: number) =>
    onChange({ ...settings, tabs: settings.tabs.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <div>
        <Label>Section title</Label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => onChange({ ...settings, title: e.target.value })}
          className={fieldClass}
        />
      </div>
      <div>
        <Label>Tabs</Label>
        <div className="space-y-3">
          {settings.tabs.map((tab, i) => {
            const filter = readTabFilter(tab);
            return (
              <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tab label"
                    value={tab.label}
                    onChange={(e) => updateTab(i, { label: e.target.value })}
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-[#6FB644]"
                  />
                  <button
                    onClick={() => removeTab(i)}
                    title="Remove tab"
                    className="text-red-500 hover:bg-red-50 p-1 rounded flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Show
                  </label>
                  <select
                    value={filter.mode}
                    onChange={(e) =>
                      updateTabFilter(i, {
                        mode: e.target.value as ProductFilterMode,
                      })
                    }
                    className={fieldClass}
                  >
                    {FILTER_MODE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {filter.mode === "tag" && (
                  <input
                    type="text"
                    placeholder="Tag (e.g. indoor, gift, new)"
                    value={filter.tag ?? ""}
                    onChange={(e) =>
                      updateTabFilter(i, { tag: e.target.value || undefined })
                    }
                    className={fieldClass}
                  />
                )}

                {filter.mode === "category" && (
                  <select
                    value={filter.category ?? ""}
                    onChange={(e) =>
                      updateTabFilter(i, {
                        category: e.target.value || undefined,
                      })
                    }
                    className={fieldClass}
                  >
                    <option value="">Pick a category…</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}

                {filter.mode === "badge" && (
                  <select
                    value={filter.badge ?? ""}
                    onChange={(e) =>
                      updateTabFilter(i, {
                        badge:
                          (e.target.value as "NEW" | "HOT" | "SALE") || undefined,
                      })
                    }
                    className={fieldClass}
                  >
                    <option value="">Pick a badge…</option>
                    <option value="NEW">NEW</option>
                    <option value="HOT">HOT</option>
                    <option value="SALE">SALE</option>
                  </select>
                )}

                {filter.mode === "manual" && (
                  <MultiProductPicker
                    value={filter.productIds ?? []}
                    onChange={(ids) =>
                      updateTabFilter(i, { productIds: ids })
                    }
                  />
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Max products
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={tab.limit ?? 16}
                      onChange={(e) =>
                        updateTab(i, {
                          limit: Math.max(1, Number(e.target.value) || 16),
                        })
                      }
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={addTab}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-[#6FB644] hover:text-[#6FB644]"
          >
            <Plus className="w-4 h-4 inline mr-1" /> Add tab
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Single Product ────────────────────────────────────────────────────────

export function SingleProductForm({
  settings,
  onChange,
}: {
  settings: BlockSettings["single-product"];
  onChange: (s: BlockSettings["single-product"]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Product</Label>
        <ProductPicker
          value={settings.productId}
          onChange={(id) => onChange({ ...settings, productId: id })}
        />
      </div>
      <div>
        <Label>Layout</Label>
        <select
          value={settings.layout}
          onChange={(e) => onChange({ ...settings, layout: e.target.value as "left-image" | "right-image" })}
          className={fieldClass}
        >
          <option value="left-image">Image on left</option>
          <option value="right-image">Image on right</option>
        </select>
      </div>
      <div>
        <Label>Button label</Label>
        <input
          type="text"
          value={settings.ctaLabel ?? ""}
          onChange={(e) => onChange({ ...settings, ctaLabel: e.target.value })}
          placeholder="Shop Now"
          className={fieldClass}
        />
      </div>
    </div>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────

export function CTAForm({
  settings,
  onChange,
}: {
  settings: BlockSettings["cta"];
  onChange: (s: BlockSettings["cta"]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => onChange({ ...settings, title: e.target.value })}
          className={fieldClass}
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <input
          type="text"
          value={settings.subtitle ?? ""}
          onChange={(e) => onChange({ ...settings, subtitle: e.target.value })}
          className={fieldClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Button text</Label>
          <input
            type="text"
            value={settings.buttonText}
            onChange={(e) => onChange({ ...settings, buttonText: e.target.value })}
            placeholder="Shop Now"
            className={fieldClass}
          />
        </div>
        <div>
          <Label>Button link</Label>
          <input
            type="text"
            value={settings.buttonLink}
            onChange={(e) => onChange({ ...settings, buttonLink: e.target.value })}
            placeholder="/shop"
            className={fieldClass}
          />
        </div>
      </div>
      <div>
        <Label>Background image (optional, overrides color)</Label>
        <ImageField
          value={settings.bgImage}
          onChange={(url) => onChange({ ...settings, bgImage: url || undefined })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Background color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.bgColor ?? "#6FB644"}
              onChange={(e) => onChange({ ...settings, bgColor: e.target.value })}
              className="w-10 h-9 rounded border border-gray-300"
            />
            <input
              type="text"
              value={settings.bgColor ?? "#6FB644"}
              onChange={(e) => onChange({ ...settings, bgColor: e.target.value })}
              className={fieldClass}
            />
          </div>
        </div>
        <div>
          <Label>Alignment</Label>
          <select
            value={settings.align ?? "center"}
            onChange={(e) => onChange({ ...settings, align: e.target.value as "left" | "center" })}
            className={fieldClass}
          >
            <option value="center">Center</option>
            <option value="left">Left</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────

export function TestimonialsForm({
  settings,
  onChange,
}: {
  settings: BlockSettings["testimonials"];
  onChange: (s: BlockSettings["testimonials"]) => void;
}) {
  const items = settings.manual ?? [];
  const updateItem = (i: number, patch: Partial<ManualTestimonial>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...settings, manual: next });
  };
  const addItem = (preset?: Partial<ManualTestimonial>) =>
    onChange({
      ...settings,
      manual: [
        ...items,
        {
          name: preset?.name ?? "Customer",
          text: preset?.text ?? "",
          rating: preset?.rating ?? 5,
          location: preset?.location,
          image: preset?.image,
        },
      ],
    });
  const removeItem = (i: number) =>
    onChange({ ...settings, manual: items.filter((_, idx) => idx !== i) });

  // ─── Saved testimonials registry (cross-block reuse) ─────────────────────
  type Saved = {
    id: number;
    name: string;
    location: string | null;
    text: string;
    rating: number;
    image: string | null;
  };
  const [saved, setSaved] = useState<Saved[]>([]);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/saved-testimonials")
      .then((r) => (r.ok ? r.json() : []))
      .then(setSaved)
      .catch(() => {});
  }, []);

  const saveTestimonial = async (item: ManualTestimonial, idx: number) => {
    if (!item.name?.trim() || !item.text?.trim()) {
      // eslint-disable-next-line no-alert
      alert("Add a customer name and quote text before saving.");
      return;
    }
    setSavingIdx(idx);
    try {
      const res = await fetch("/api/saved-testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          location: item.location,
          text: item.text,
          rating: item.rating,
          image: item.image,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setSaved((prev) => [created, ...prev]);
      }
    } finally {
      setSavingIdx(null);
    }
  };

  const deleteSaved = async (id: number) => {
    await fetch(`/api/saved-testimonials/${id}`, { method: "DELETE" });
    setSaved((prev) => prev.filter((s) => s.id !== id));
  };

  const isAlreadySaved = (item: ManualTestimonial) =>
    saved.some(
      (s) => s.name === item.name && s.text === item.text,
    );

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <input
          type="text"
          value={settings.title ?? ""}
          onChange={(e) => onChange({ ...settings, title: e.target.value })}
          className={fieldClass}
        />
      </div>
      <div>
        <Label>Source</Label>
        <select
          value={settings.source}
          onChange={(e) => onChange({ ...settings, source: e.target.value as "reviews" | "manual" })}
          className={fieldClass}
        >
          <option value="reviews">Real customer reviews (latest)</option>
          <option value="manual">Custom quotes (configure here)</option>
        </select>
      </div>
      {settings.source === "reviews" && (
        <div>
          <Label>Limit</Label>
          <input
            type="number"
            min={1}
            max={20}
            value={settings.limit ?? 6}
            onChange={(e) => onChange({ ...settings, limit: Number(e.target.value) })}
            className={fieldClass}
          />
        </div>
      )}
      {settings.source === "manual" && (
        <div>
          <Label>Quotes</Label>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Quote {i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => saveTestimonial(item, i)}
                      disabled={savingIdx === i || isAlreadySaved(item)}
                      title={
                        isAlreadySaved(item)
                          ? "Already saved"
                          : "Save this quote for reuse"
                      }
                      className={`p-1 rounded transition-colors ${
                        isAlreadySaved(item)
                          ? "text-[#6FB644] cursor-default"
                          : "text-gray-400 hover:text-[#6FB644] hover:bg-green-50"
                      } disabled:opacity-60`}
                    >
                      {isAlreadySaved(item) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeItem(i)}
                      title="Remove quote"
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Customer photo (optional)</Label>
                  <ImageField
                    value={item.image}
                    onChange={(url) => updateItem(i, { image: url || undefined })}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Customer name"
                  value={item.name}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  className={fieldClass}
                />
                <input
                  type="text"
                  placeholder="Location (optional)"
                  value={item.location ?? ""}
                  onChange={(e) => updateItem(i, { location: e.target.value })}
                  className={fieldClass}
                />
                <textarea
                  placeholder="Quote text"
                  value={item.text}
                  onChange={(e) => updateItem(i, { text: e.target.value })}
                  rows={3}
                  className={fieldClass + " resize-none"}
                />
                <div>
                  <Label>Rating</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateItem(i, { rating: n })}
                        title={`${n} star${n > 1 ? "s" : ""}`}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            n <= item.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem()}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-[#6FB644] hover:text-[#6FB644]"
            >
              <Plus className="w-4 h-4 inline mr-1" /> Add blank quote
            </button>

            {saved.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Add from saved
                </p>
                <div className="space-y-1.5">
                  {saved.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white hover:border-[#6FB644] transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          addItem({
                            name: s.name,
                            location: s.location ?? undefined,
                            text: s.text,
                            rating: s.rating,
                            image: s.image ?? undefined,
                          })
                        }
                        className="flex-1 flex items-center gap-2 min-w-0 text-left"
                        title="Add as new quote"
                      >
                        {s.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <BookmarkCheck className="w-3.5 h-3.5 text-[#6FB644]" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {s.name}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">{s.text}</p>
                        </div>
                        <Plus className="w-4 h-4 text-gray-300 group-hover:text-[#6FB644] flex-shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSaved(s.id)}
                        title="Remove from saved"
                        className="text-gray-300 hover:text-red-500 p-1 rounded flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rich Text ─────────────────────────────────────────────────────────────

export function RichTextForm({
  settings,
  onChange,
}: {
  settings: BlockSettings["rich-text"];
  onChange: (s: BlockSettings["rich-text"]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Content</Label>
        <RichTextEditor
          value={settings.content}
          onChange={(content) => onChange({ ...settings, content })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Alignment</Label>
          <select
            value={settings.align ?? "left"}
            onChange={(e) => onChange({ ...settings, align: e.target.value as "left" | "center" | "right" })}
            className={fieldClass}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <Label>Max width</Label>
          <select
            value={settings.maxWidth ?? "md"}
            onChange={(e) => onChange({ ...settings, maxWidth: e.target.value as "sm" | "md" | "lg" | "full" })}
            className={fieldClass}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Category Grid ────────────────────────────────────────────────────────

export function CategoryGridForm({
  settings,
  onChange,
}: {
  settings: BlockSettings["category-grid"];
  onChange: (s: BlockSettings["category-grid"]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <input
          type="text"
          value={settings.title ?? ""}
          onChange={(e) => onChange({ ...settings, title: e.target.value })}
          placeholder="Shop by Category"
          className={fieldClass}
        />
        <p className="text-xs text-gray-400 mt-1">Categories are managed in the Categories admin.</p>
      </div>
    </div>
  );
}

// ─── Trust Banner ─────────────────────────────────────────────────────────

export function TrustBannerForm({
  settings,
  onChange,
}: {
  settings: BlockSettings["trust-banner"];
  onChange: (s: BlockSettings["trust-banner"]) => void;
}) {
  const items = settings.items ?? [];
  const update = (i: number, patch: Partial<{ title: string; subtitle: string }>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...settings, items: next });
  };
  const add = () =>
    onChange({ ...settings, items: [...items, { title: "Feature", subtitle: "Description" }] });
  const remove = (i: number) =>
    onChange({ ...settings, items: items.filter((_, idx) => idx !== i) });

  return (
    <div>
      <Label>Items (max 4 displayed)</Label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
            <input
              type="text"
              placeholder="Title"
              value={item.title}
              onChange={(e) => update(i, { title: e.target.value })}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-[#6FB644]"
            />
            <input
              type="text"
              placeholder="Subtitle"
              value={item.subtitle}
              onChange={(e) => update(i, { subtitle: e.target.value })}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-[#6FB644]"
            />
            <button
              onClick={() => remove(i)}
              className="text-red-500 hover:bg-red-50 p-1 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={add}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-[#6FB644] hover:text-[#6FB644]"
        >
          <Plus className="w-4 h-4 inline mr-1" /> Add item
        </button>
      </div>
    </div>
  );
}
