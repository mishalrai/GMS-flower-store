"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Bookmark, BookmarkCheck, Star } from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import Modal from "@/components/admin/Modal";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  BlockSettings,
  HeroSlide,
  FeaturedTab,
  ManualTestimonial,
  ProductFilter,
  ProductFilterMode,
  TrustIconKey,
} from "@/lib/blocks/types";
import { FILTER_MODE_OPTIONS, readTabFilter } from "@/lib/blocks/filters";
import { TRUST_ICONS, TRUST_ICON_KEYS, iconForItem } from "@/lib/blocks/trustIcons";
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

  // ─── Block-level presets (entire testimonials block config) ──────────────
  type Preset = {
    id: number;
    name: string;
    title: string | null;
    source: "reviews" | "manual";
    limit: number | null;
    manual: ManualTestimonial[];
  };
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [savingPreset, setSavingPreset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Preset | null>(null);

  useEffect(() => {
    fetch("/api/testimonial-presets")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPresets)
      .catch(() => {});
  }, []);

  const savePreset = async () => {
    if (!presetName.trim()) return;
    setSavingPreset(true);
    try {
      const res = await fetch("/api/testimonial-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: presetName.trim(),
          title: settings.title ?? null,
          source: settings.source,
          limit: settings.limit ?? null,
          manual: settings.manual ?? [],
        }),
      });
      if (res.ok) {
        const created: Preset = await res.json();
        setPresets((prev) => [created, ...prev]);
        setPresetName("");
      }
    } finally {
      setSavingPreset(false);
    }
  };

  const importPreset = (preset: Preset) => {
    onChange({
      ...settings,
      title: preset.title ?? "",
      source: preset.source,
      limit: preset.limit ?? undefined,
      manual: preset.manual ?? [],
    });
  };

  const deletePreset = async (id: number) => {
    const res = await fetch(`/api/testimonial-presets/${id}`, {
      method: "DELETE",
    });
    if (res.ok) setPresets((prev) => prev.filter((p) => p.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Edit the title and quotes directly in the block preview.
      </p>

      {saved.length > 0 && (
        <div>
          <Label>Add from saved quotes</Label>
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

      {items.length > 0 && (
        <div>
          <Label>Save quotes for reuse</Label>
          <div className="space-y-1">
            {items.map((item, i) => {
              const already = isAlreadySaved(item);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => saveTestimonial(item, i)}
                  disabled={savingIdx === i || already || !item.name?.trim() || !item.text?.trim()}
                  className={`w-full flex items-center gap-2 p-2 border border-gray-200 rounded text-left text-xs disabled:opacity-60 ${
                    already ? "bg-green-50/50" : "hover:border-[#6FB644]"
                  }`}
                  title={
                    already
                      ? "Already saved"
                      : !item.name?.trim() || !item.text?.trim()
                        ? "Add a customer name and quote text first"
                        : "Save this quote for reuse"
                  }
                >
                  {already ? (
                    <BookmarkCheck className="w-4 h-4 text-[#6FB644] flex-shrink-0" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate text-gray-700">
                    {item.name || `Quote ${i + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-gray-100">
        <Label>Save as preset</Label>
        <div className="flex gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="e.g. Happy customers"
            className={fieldClass}
          />
          <button
            type="button"
            onClick={savePreset}
            disabled={savingPreset || !presetName.trim()}
            className="px-3 py-2 bg-[#6FB644] text-white text-sm font-medium rounded-lg hover:bg-[#5a9636] disabled:opacity-50 whitespace-nowrap"
          >
            {savingPreset ? "Saving…" : "Save"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          Stores the current title, source, and quotes — reusable on any
          Testimonials block.
        </p>
      </div>

      <div>
        <Label>Saved presets</Label>
        {presets.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No presets yet.</p>
        ) : (
          <div className="space-y-1.5">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {preset.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {preset.source === "reviews"
                      ? `Reviews · top ${preset.limit ?? 6}`
                      : `${preset.manual?.length ?? 0} quote${(preset.manual?.length ?? 0) === 1 ? "" : "s"}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => importPreset(preset)}
                  className="px-2.5 py-1 text-xs font-medium text-[#6FB644] hover:bg-green-100 rounded"
                >
                  Import
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(preset)}
                  title="Delete preset"
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete preset?"
        onConfirm={() => confirmDelete && deletePreset(confirmDelete.id)}
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-sm text-gray-600">
          Delete the preset{" "}
          <span className="font-medium text-gray-800">
            “{confirmDelete?.name}”
          </span>
          ? This won't change any blocks that already imported it.
        </p>
      </Modal>
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
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: { slug: string; name: string }[]) => setCategories(data))
      .catch(() => {});
  }, []);

  const selected = settings.categorySlugs ?? [];
  const showAll = selected.length === 0;

  const toggleSlug = (slug: string) => {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];
    onChange({ ...settings, categorySlugs: next.length > 0 ? next : undefined });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Categories to show</Label>
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => onChange({ ...settings, categorySlugs: undefined })}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              showAll
                ? "bg-[#6FB644] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All categories
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...settings,
                categorySlugs: selected.length > 0 ? selected : [categories[0]?.slug].filter(Boolean) as string[],
              })
            }
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              !showAll
                ? "bg-[#6FB644] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pick specific
          </button>
        </div>

        {!showAll && (
          <div className="space-y-1 max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {categories.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">Loading…</p>
            ) : (
              categories.map((c) => {
                const checked = selected.includes(c.slug);
                return (
                  <label
                    key={c.slug}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSlug(c.slug)}
                      className="accent-[#6FB644]"
                    />
                    <span className="text-gray-700">{c.name}</span>
                  </label>
                );
              })
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2">
          {showAll
            ? "Showing all categories in their default order."
            : `${selected.length} selected · shown in the order you pick.`}
        </p>
      </div>
    </div>
  );
}

// ─── Trust Banner ─────────────────────────────────────────────────────────

function TrustIconPicker({
  value,
  onChange,
  fallbackIndex,
}: {
  value: TrustIconKey | undefined;
  onChange: (key: TrustIconKey) => void;
  fallbackIndex: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const Active = iconForItem(value, fallbackIndex);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Pick an icon"
        className="w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors border border-transparent hover:border-[#6FB644]"
      >
        <Active className="w-5 h-5 text-[#6FB644]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-xl p-2 grid grid-cols-4 gap-1 w-44">
          {TRUST_ICON_KEYS.map((k) => {
            const { Icon, label } = TRUST_ICONS[k];
            const active = (value ?? null) === k;
            return (
              <button
                key={k}
                type="button"
                title={label}
                onClick={() => {
                  onChange(k);
                  setOpen(false);
                }}
                className={`w-9 h-9 rounded flex items-center justify-center transition-colors ${
                  active
                    ? "bg-[#6FB644] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Same fallback that TrustBannerBlock renders when settings.items is empty,
// so the form can show them as starter items on first open.
const TRUST_BANNER_DEFAULTS: {
  icon: TrustIconKey;
  title: string;
  subtitle: string;
}[] = [
  { icon: "truck", title: "Free Delivery", subtitle: "On orders over Rs 2,000" },
  { icon: "shield", title: "Safe Payment", subtitle: "100% secure payment" },
  { icon: "headphones", title: "24/7 Support", subtitle: "Dedicated support" },
  { icon: "refresh", title: "Easy Returns", subtitle: "7-day return policy" },
];

export function TrustBannerForm({
  settings,
  onChange,
}: {
  settings: BlockSettings["trust-banner"];
  onChange: (s: BlockSettings["trust-banner"]) => void;
}) {
  // When the block has never been edited (`items` is undefined), seed the
  // form with the same defaults the public block uses so they're editable.
  // Empty array (`items: []`) is left alone — user intentionally cleared.
  useEffect(() => {
    if (settings.items === undefined) {
      onChange({ ...settings, items: TRUST_BANNER_DEFAULTS });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = settings.items ?? [];
  const update = (
    i: number,
    patch: Partial<{ icon?: TrustIconKey; title: string; subtitle: string }>,
  ) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...settings, items: next });
  };
  const add = () =>
    onChange({
      ...settings,
      items: [
        ...items,
        { icon: "truck", title: "Feature", subtitle: "Description" },
      ],
    });
  const remove = (i: number) =>
    onChange({ ...settings, items: items.filter((_, idx) => idx !== i) });

  return (
    <div>
      <Label>Items (max 4 displayed)</Label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 border border-gray-200 rounded bg-white"
          >
            <TrustIconPicker
              value={item.icon}
              onChange={(icon) => update(i, { icon })}
              fallbackIndex={i}
            />
            <div className="flex-1 space-y-1 min-w-0">
              <input
                type="text"
                placeholder="Title"
                value={item.title}
                onChange={(e) => update(i, { title: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-[#6FB644]"
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={item.subtitle}
                onChange={(e) => update(i, { subtitle: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-[#6FB644]"
              />
            </div>
            <button
              onClick={() => remove(i)}
              title="Remove item"
              className="text-red-500 hover:bg-red-50 p-1 rounded flex-shrink-0"
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

// ─── FAQ ──────────────────────────────────────────────────────────────────

interface FaqPreset {
  id: number;
  name: string;
  title: string | null;
  subtitle: string | null;
  faqIds: number[];
}

export function FAQForm({
  settings,
  onChange,
}: {
  settings: BlockSettings["faq"];
  onChange: (s: BlockSettings["faq"]) => void;
}) {
  const [presets, setPresets] = useState<FaqPreset[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<FaqPreset | null>(null);

  useEffect(() => {
    fetch("/api/faq-presets")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPresets)
      .catch(() => {});
  }, []);

  const savePreset = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/faq-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          title: settings.title ?? null,
          subtitle: settings.subtitle ?? null,
          faqIds: settings.faqIds ?? [],
        }),
      });
      if (res.ok) {
        const created: FaqPreset = await res.json();
        setPresets((prev) => [created, ...prev]);
        setName("");
      }
    } finally {
      setSaving(false);
    }
  };

  const importPreset = (preset: FaqPreset) => {
    onChange({
      ...settings,
      title: preset.title ?? "",
      subtitle: preset.subtitle ?? "",
      faqIds: preset.faqIds.length > 0 ? preset.faqIds : undefined,
    });
  };

  const deletePreset = async (id: number) => {
    const res = await fetch(`/api/faq-presets/${id}`, { method: "DELETE" });
    if (res.ok) setPresets((prev) => prev.filter((p) => p.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Edit the title, subtitle, and questions directly in the block preview.
        Manage the global FAQ list at{" "}
        <a href="/admin/faqs" className="text-[#6FB644] hover:underline">
          /admin/faqs
        </a>
        .
      </p>

      <div className="pt-3 border-t border-gray-100">
        <Label>Save as preset</Label>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Plant care FAQs"
            className={fieldClass}
          />
          <button
            type="button"
            onClick={savePreset}
            disabled={saving || !name.trim()}
            className="px-3 py-2 bg-[#6FB644] text-white text-sm font-medium rounded-lg hover:bg-[#5a9636] disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          Stores the current title, subtitle, and question list — reusable on
          any FAQ block.
        </p>
      </div>

      <div>
        <Label>Saved presets</Label>
        {presets.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No presets yet.</p>
        ) : (
          <div className="space-y-1.5">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {preset.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {preset.faqIds.length === 0
                      ? "All active FAQs"
                      : `${preset.faqIds.length} question${preset.faqIds.length === 1 ? "" : "s"}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => importPreset(preset)}
                  className="px-2.5 py-1 text-xs font-medium text-[#6FB644] hover:bg-green-100 rounded"
                >
                  Import
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(preset)}
                  title="Delete preset"
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete preset?"
        onConfirm={() => confirmDelete && deletePreset(confirmDelete.id)}
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-sm text-gray-600">
          Delete the preset{" "}
          <span className="font-medium text-gray-800">
            “{confirmDelete?.name}”
          </span>
          ? This won't remove any FAQs from the global list or from blocks that
          already imported it.
        </p>
      </Modal>
    </div>
  );
}
