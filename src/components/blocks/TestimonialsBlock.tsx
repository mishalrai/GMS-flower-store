"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Star, Quote, User, X, Plus, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import { BlockSettings, ManualTestimonial } from "@/lib/blocks/types";
import Tooltip from "@/components/admin/Tooltip";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface ReviewRow {
  id: string;
  customerName: string;
  text: string;
  rating: number;
}

export default function TestimonialsBlock({
  settings,
  editable,
  onSettingsChange,
}: {
  settings: BlockSettings["testimonials"];
  editable?: boolean;
  onSettingsChange?: (s: BlockSettings["testimonials"]) => void;
}) {
  const [reviewItems, setReviewItems] = useState<ManualTestimonial[]>([]);
  const [pickerForIdx, setPickerForIdx] = useState<number | null>(null);

  const isEditable = !!editable && !!onSettingsChange;

  useEffect(() => {
    if (settings.source !== "reviews") return;
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data: ReviewRow[]) => {
        const limit = settings.limit ?? 6;
        setReviewItems(
          data.slice(0, limit).map((r) => ({
            name: r.customerName,
            text: r.text,
            rating: r.rating,
          }))
        );
      })
      .catch(() => {});
  }, [settings.source, settings.limit]);

  const items: ManualTestimonial[] = isEditable
    ? settings.manual ?? []
    : settings.source === "manual"
      ? settings.manual ?? []
      : reviewItems;

  const updateItem = (idx: number, patch: Partial<ManualTestimonial>) => {
    if (!onSettingsChange) return;
    const next = [...(settings.manual ?? [])];
    next[idx] = { ...next[idx], ...patch };
    onSettingsChange({ ...settings, source: "manual", manual: next });
  };

  const removeItem = (idx: number) => {
    if (!onSettingsChange) return;
    const next = (settings.manual ?? []).filter((_, i) => i !== idx);
    onSettingsChange({ ...settings, source: "manual", manual: next });
  };

  const addItem = () => {
    if (!onSettingsChange) return;
    onSettingsChange({
      ...settings,
      source: "manual",
      manual: [
        ...(settings.manual ?? []),
        { name: "Customer name", text: "", rating: 5 },
      ],
    });
  };

  if (items.length === 0 && !isEditable) return null;

  const renderCard = (t: ManualTestimonial, i: number) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full relative">
      {isEditable && (
        <div className="absolute top-3 right-3 z-10">
          <Tooltip label="Remove quote" position="left">
            <button
              type="button"
              onClick={() => removeItem(i)}
              aria-label="Remove quote"
              className="p-1.5 text-gray-300 hover:text-red-500 bg-white rounded pointer-events-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      )}
      <Quote className="w-8 h-8 text-[#6FB644] opacity-30 mb-3" />
      {isEditable ? (
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const next = (e.currentTarget.textContent ?? "").trim();
            updateItem(i, { text: next });
          }}
          data-placeholder="Type a quote…"
          className="text-gray-600 text-sm leading-relaxed mb-4 outline-none focus:ring-2 focus:ring-[#6FB644]/40 rounded px-1 pointer-events-auto select-text empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
        >
          {t.text}
        </p>
      ) : (
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          &ldquo;{t.text}&rdquo;
        </p>
      )}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => isEditable && updateItem(i, { rating: n })}
            disabled={!isEditable}
            title={isEditable ? `${n} star${n > 1 ? "s" : ""}` : undefined}
            className={`${isEditable ? "pointer-events-auto cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          >
            <Star
              className={`w-4 h-4 ${
                n <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {isEditable ? (
          <button
            type="button"
            onClick={() => setPickerForIdx(i)}
            title="Change customer photo"
            className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-[#6FB644]/40 pointer-events-auto"
          >
            {t.image ? (
              <Image
                src={t.image}
                alt={t.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <ImageIcon className="w-4 h-4 text-[#6FB644]" />
            )}
          </button>
        ) : t.image ? (
          <Image
            src={t.image}
            alt={t.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[#6FB644]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {isEditable ? (
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                updateItem(i, { name: (e.currentTarget.textContent ?? "").trim() })
              }
              data-placeholder="Customer name"
              className="font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-[#6FB644]/40 rounded px-1 pointer-events-auto select-text empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
            >
              {t.name}
            </p>
          ) : (
            <p className="font-semibold text-gray-800 truncate">{t.name}</p>
          )}
          {isEditable ? (
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                updateItem(i, {
                  location: (e.currentTarget.textContent ?? "").trim() || undefined,
                })
              }
              data-placeholder="Location (optional)"
              className="text-xs text-gray-500 outline-none focus:ring-2 focus:ring-[#6FB644]/40 rounded px-1 pointer-events-auto select-text empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
            >
              {t.location ?? ""}
            </p>
          ) : (
            t.location && (
              <p className="text-xs text-gray-500 truncate">{t.location}</p>
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {(isEditable || (settings.title && settings.title.trim())) && (
          <div className="text-center mb-10">
            {isEditable ? (
              <h2
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  onSettingsChange?.({
                    ...settings,
                    title: (e.currentTarget.textContent ?? "").trim(),
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).blur();
                  }
                }}
                data-placeholder="Add a title…"
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 outline-none focus:ring-2 focus:ring-[#6FB644]/40 rounded px-2 pointer-events-auto select-text empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
              >
                {settings.title}
              </h2>
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                {settings.title}
              </h2>
            )}
            <div className="w-16 h-1 bg-[#6FB644] mx-auto mt-4 rounded-full" />
          </div>
        )}

        {isEditable ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t, i) => (
              <div key={i}>{renderCard(t, i)}</div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="border-2 border-dashed border-gray-300 rounded-2xl min-h-[12rem] flex items-center justify-center text-gray-500 hover:border-[#6FB644] hover:text-[#6FB644] pointer-events-auto"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Plus className="w-5 h-5" /> Add quote
              </span>
            </button>
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            className="pb-12"
          >
            {items.map((t, i) => (
              <SwiperSlide key={i}>{renderCard(t, i)}</SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {isEditable && pickerForIdx !== null && (
        <MediaPickerModal
          isOpen
          onClose={() => setPickerForIdx(null)}
          currentImage={items[pickerForIdx]?.image}
          onSelect={(url) => {
            updateItem(pickerForIdx, { image: url || undefined });
            setPickerForIdx(null);
          }}
        />
      )}
    </section>
  );
}
