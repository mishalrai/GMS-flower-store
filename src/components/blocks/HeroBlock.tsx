"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link as LinkIcon, Plus, X, ChevronDown, Move, Check } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { BlockSettings, HeroSlide, HeroButton, ButtonVariant, ButtonSize } from "@/lib/blocks/types";

// Read button list, preferring block-level (shared across slides), falling
// back to slide-level (legacy), then legacy text-fields. Used for both render
// and as the source array when mutating.
function readButtons(
  settings: BlockSettings["hero"],
  slide: HeroSlide | undefined,
): HeroButton[] {
  if (Array.isArray(settings.buttons)) return settings.buttons;
  if (slide && Array.isArray(slide.buttons)) return slide.buttons;
  const out: HeroButton[] = [];
  if (slide?.buttonText) out.push({ text: slide.buttonText, link: slide.buttonLink });
  if (slide?.button2Text) out.push({ text: slide.button2Text, link: slide.button2Link });
  return out;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-[#6FB644] text-white hover:bg-[#5a9636]",
  secondary: "bg-white/15 backdrop-blur-sm text-white border border-white/50 hover:bg-white/25",
  outline: "bg-transparent text-white border-2 border-white hover:bg-white/10",
  dark: "bg-gray-900 text-white hover:bg-gray-800",
  white: "bg-white text-gray-900 hover:bg-gray-100",
};

const VARIANT_SWATCH: Record<ButtonVariant, string> = {
  primary: "bg-[#6FB644]",
  secondary: "bg-white/30 backdrop-blur border border-white/50",
  outline: "bg-transparent border-2 border-white",
  dark: "bg-gray-900 border border-gray-700",
  white: "bg-white border border-gray-300",
};

const VARIANT_ORDER: ButtonVariant[] = ["primary", "secondary", "outline", "dark", "white"];

const VARIANT_LABEL: Record<ButtonVariant, string> = {
  primary: "Primary",
  secondary: "Secondary",
  outline: "Outline",
  dark: "Dark",
  white: "White",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "px-5 py-2 text-sm",
  md: "px-8 py-3 text-lg",
  lg: "px-10 py-4 text-xl",
};

const SIZE_ORDER: ButtonSize[] = ["sm", "md", "lg"];

function buttonVariantFor(btn: HeroButton, idx: number): ButtonVariant {
  return btn.variant ?? (idx === 0 ? "primary" : "secondary");
}

function buttonSizeFor(btn: HeroButton): ButtonSize {
  return btn.size ?? "md";
}

const heightClass = { sm: "h-[280px] md:h-[380px]", md: "h-[350px] md:h-[500px]", lg: "h-[450px] md:h-[620px]" };

// A button with inline-editable text + floating toolbar (link picker, variant
// swatches, remove). Used only in admin preview.
function EditableButton({
  text,
  link,
  variant,
  size,
  bgColor,
  textColor,
  borderColor,
  onTextChange,
  onLinkChange,
  onVariantChange,
  onSizeChange,
  onBgColorChange,
  onTextColorChange,
  onBorderColorChange,
  onResetColors,
  onRemove,
  className,
  style,
}: {
  text: string;
  link: string;
  variant: ButtonVariant;
  size: ButtonSize;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  onTextChange: (v: string) => void;
  onLinkChange: (v: string) => void;
  onVariantChange: (v: ButtonVariant) => void;
  onSizeChange: (v: ButtonSize) => void;
  onBgColorChange: (v: string) => void;
  onTextColorChange: (v: string) => void;
  onBorderColorChange: (v: string) => void;
  onResetColors: () => void;
  onRemove?: () => void;
  className: string;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  const [editingLink, setEditingLink] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [linkDraft, setLinkDraft] = useState(link);
  const blurTimer = useRef<number | null>(null);
  const styleBtnRef = useRef<HTMLButtonElement>(null);
  const styleMenuRef = useRef<HTMLDivElement>(null);
  const [stylePos, setStylePos] = useState<{ top: number; left: number; placement: "below" | "above" } | null>(null);

  useEffect(() => setLinkDraft(link), [link]);

  // Position the style menu via portal so it isn't clipped by the block's overflow:hidden.
  useEffect(() => {
    if (!showStyleMenu) {
      setStylePos(null);
      return;
    }
    const update = () => {
      const el = styleBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const MENU_HEIGHT = 360;
      const GAP = 8;
      // Prefer above the trigger; fall back to below only if there isn't room above.
      const placement: "below" | "above" =
        r.top >= MENU_HEIGHT + GAP ? "above" : "below";
      setStylePos({
        top: placement === "above" ? r.top - GAP : r.bottom + GAP,
        left: r.left + r.width / 2,
        placement,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [showStyleMenu]);

  // Close style menu on outside click.
  useEffect(() => {
    if (!showStyleMenu) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (styleMenuRef.current?.contains(target)) return;
      if (styleBtnRef.current?.contains(target)) return;
      setShowStyleMenu(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [showStyleMenu]);

  // Hide-on-blur is delayed so clicks on the toolbar register before we hide it.
  const handleFocus = () => {
    if (blurTimer.current) window.clearTimeout(blurTimer.current);
    setFocused(true);
  };
  const handleBlur = () => {
    blurTimer.current = window.setTimeout(() => setFocused(false), 120);
  };

  const showToolbar = focused || editingLink || showStyleMenu;
  const hasCustomColors = !!(bgColor || textColor || borderColor);

  const saveLink = () => {
    onLinkChange(linkDraft.trim());
    setEditingLink(false);
  };

  return (
    <span
      className="relative inline-block"
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Toolbar shown above button when active */}
      {showToolbar && !editingLink && (
        <div
          className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-gray-900 text-white rounded-lg shadow-xl p-1 z-30 pointer-events-auto whitespace-nowrap"
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={() => {
              setShowStyleMenu(false);
              setLinkDraft(link);
              setEditingLink(true);
            }}
            className="flex items-center gap-1.5 px-2 py-1 text-xs hover:bg-white/15 rounded transition-colors"
            title={link ? `Edit link: ${link}` : "Set link"}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span className="max-w-[120px] truncate font-mono">{link || "Add link"}</span>
          </button>

          <span className="w-px h-4 bg-white/20" />

          {/* Style dropdown trigger */}
          <button
            ref={styleBtnRef}
            type="button"
            onClick={() => setShowStyleMenu((v) => !v)}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
              showStyleMenu ? "bg-white/15" : "hover:bg-white/15"
            }`}
            title="Style"
          >
            {/* Visual hints: current size + variant swatch */}
            <span className="text-[10px] font-bold w-4 text-center">
              {size.toUpperCase()}
            </span>
            <span
              className={`w-3.5 h-3.5 rounded-full ${VARIANT_SWATCH[variant]}`}
              style={hasCustomColors ? { backgroundColor: bgColor ?? undefined } : undefined}
            />
            <span className="text-white/60">Style</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showStyleMenu ? "rotate-180" : ""}`} />
          </button>

          {onRemove && (
            <>
              <span className="w-px h-4 bg-white/20" />
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 hover:bg-white/15 rounded text-red-300 hover:text-red-200 transition-colors"
                title="Remove button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Style dropdown panel — portaled to body to escape overflow:hidden ancestors */}
      {showStyleMenu && !editingLink && stylePos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={styleMenuRef}
            style={{
              position: "fixed",
              top: stylePos.top,
              left: stylePos.left,
              transform:
                stylePos.placement === "above"
                  ? "translate(-50%, -100%)"
                  : "translateX(-50%)",
            }}
            className="bg-white rounded-lg shadow-2xl border border-gray-200 p-3 z-[100] w-64 pointer-events-auto text-gray-900"
            onMouseDown={(e) => {
              const t = e.target as HTMLElement;
              if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") {
                e.preventDefault();
              }
            }}
          >
          {/* Size */}
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Size
            </p>
            <div className="flex items-center gap-1">
              {SIZE_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSizeChange(s)}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                    size === s
                      ? "bg-[#6FB644] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Variant */}
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Variant
            </p>
            <div className="flex items-center gap-2">
              {VARIANT_ORDER.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onVariantChange(v)}
                  title={VARIANT_LABEL[v]}
                  className={`w-7 h-7 rounded-full transition-all ${VARIANT_SWATCH[v]} ${
                    variant === v && !hasCustomColors
                      ? "ring-2 ring-[#6FB644] ring-offset-2"
                      : "hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Custom colors
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-20">Background</span>
                <input
                  type="color"
                  value={bgColor || "#6FB644"}
                  onChange={(e) => onBgColorChange(e.target.value)}
                  className="w-8 h-7 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor || ""}
                  onChange={(e) => onBgColorChange(e.target.value)}
                  placeholder="auto"
                  className="flex-1 min-w-0 px-2 py-1 text-xs font-mono border border-gray-300 rounded outline-none focus:border-[#6FB644]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-20">Text</span>
                <input
                  type="color"
                  value={textColor || "#ffffff"}
                  onChange={(e) => onTextColorChange(e.target.value)}
                  className="w-8 h-7 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor || ""}
                  onChange={(e) => onTextColorChange(e.target.value)}
                  placeholder="auto"
                  className="flex-1 min-w-0 px-2 py-1 text-xs font-mono border border-gray-300 rounded outline-none focus:border-[#6FB644]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-20">Border</span>
                <input
                  type="color"
                  value={borderColor || "#000000"}
                  onChange={(e) => onBorderColorChange(e.target.value)}
                  className="w-8 h-7 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={borderColor || ""}
                  onChange={(e) => onBorderColorChange(e.target.value)}
                  placeholder="none"
                  className="flex-1 min-w-0 px-2 py-1 text-xs font-mono border border-gray-300 rounded outline-none focus:border-[#6FB644]"
                />
              </div>
              {hasCustomColors && (
                <button
                  type="button"
                  onClick={onResetColors}
                  className="w-full px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Reset to variant colors
                </button>
              )}
            </div>
          </div>
        </div>,
          document.body,
        )}

      {/* Inline link input popover */}
      {editingLink && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center bg-white rounded-lg shadow-2xl border border-gray-200 p-1 z-40 pointer-events-auto text-gray-900"
          onMouseDown={(e) => {
            const t = e.target as HTMLElement;
            if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
        >
          <LinkIcon className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveLink();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setEditingLink(false);
                setLinkDraft(link);
              }
            }}
            placeholder="https:// or /path"
            className="px-2 py-1.5 text-sm outline-none w-60 font-mono text-gray-900 placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={saveLink}
            className="px-3 py-1.5 bg-[#6FB644] hover:bg-[#5a9636] text-white text-xs font-semibold rounded transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingLink(false);
              setLinkDraft(link);
            }}
            title="Cancel"
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <span
        className={`${className} pointer-events-auto cursor-text`}
        style={style}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          e.stopPropagation();
          // Allow clicking anywhere on the button's padding to focus the text.
          const editable = (e.currentTarget.querySelector(
            '[contenteditable="true"]',
          ) as HTMLElement | null);
          if (!editable) return;
          if (document.activeElement !== editable) {
            // Defer focus until after the default mousedown so the caret lands at click.
            requestAnimationFrame(() => editable.focus());
          }
        }}
      >
        <EditableText value={text} onChange={onTextChange} className="block min-w-[3ch]" />
      </span>
    </span>
  );
}

// Click-to-edit text element used only in admin preview.
function EditableText({
  value,
  onChange,
  className,
  asTag: Tag = "span",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  asTag?: "span" | "div" | "h2" | "p";
}) {
  const ref = useRef<HTMLElement | null>(null);

  // Sync DOM when value changes externally (e.g. side-panel form edit).
  // Skip while focused so user typing isn't clobbered.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.textContent !== value) el.textContent = value;
  }, [value]);

  const props = {
    ref: ref as React.RefObject<HTMLElement>,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    // Prevent the surrounding block-card's keyDown handler (which intercepts
    // Enter/Space) from firing while the user types into the contenteditable.
    onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation(),
    onBlur: (e: React.FocusEvent<HTMLElement>) =>
      onChange(e.currentTarget.textContent ?? ""),
    className: `outline-none focus:ring-2 focus:ring-[#6FB644]/60 focus:bg-black/10 rounded px-1 -mx-1 transition-shadow cursor-text pointer-events-auto select-text ${className ?? ""}`,
  };
  return React.createElement(Tag, props);
}

export default function HeroBlock({
  settings,
  editable,
  onSettingsChange,
  repositioningSlideIdx,
  onExitReposition,
  onActiveSlideChange,
  activeSlideIdx,
}: {
  settings: BlockSettings["hero"];
  editable?: boolean;
  onSettingsChange?: (s: BlockSettings["hero"]) => void;
  repositioningSlideIdx?: number | null;
  onExitReposition?: () => void;
  onActiveSlideChange?: (idx: number) => void;
  activeSlideIdx?: number;
}) {
  const isManualEditable = editable && !!onSettingsChange;

  const slides: HeroSlide[] = settings.manual ?? [];

  const swiperRef = useRef<SwiperClass | null>(null);

  // When the editor sets `activeSlideIdx`, navigate Swiper to that slide.
  useEffect(() => {
    if (typeof activeSlideIdx !== "number") return;
    const sw = swiperRef.current;
    if (!sw) return;
    if (sw.realIndex === activeSlideIdx) return;
    sw.slideTo(activeSlideIdx);
  }, [activeSlideIdx]);

  // Reposition mode (per slide). Stores the slide index being repositioned and
  // the original position so Cancel can restore it. Driven externally by the
  // editor via the `repositioningSlideIdx` prop.
  const [reposSlide, setReposSlide] = useState<{
    idx: number;
    original: { x: number; y: number };
  } | null>(null);

  // Sync external prop → internal state. When the editor sets a slide to
  // reposition, capture its current position so Cancel can revert.
  useEffect(() => {
    if (repositioningSlideIdx == null) {
      setReposSlide(null);
      return;
    }
    const slide = (settings.manual ?? [])[repositioningSlideIdx];
    if (!slide) return;
    const cur = slide.imagePosition ?? { x: 50, y: 50 };
    setReposSlide({ idx: repositioningSlideIdx, original: { x: cur.x, y: cur.y } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositioningSlideIdx]);

  const exitReposition = (cancel: boolean) => {
    if (cancel && reposSlide) {
      // Restore original position
      const manual = settings.manual ?? [];
      const next = manual.map((s, i) =>
        i === reposSlide.idx ? { ...s, imagePosition: reposSlide.original } : s
      );
      onSettingsChange?.({ ...settings, manual: next });
    }
    setReposSlide(null);
    onExitReposition?.();
  };

  if (slides.length === 0) {
    if (isManualEditable) {
      return (
        <div className={`relative ${heightClass[settings.height ?? "md"]} bg-gray-200 flex items-center justify-center`}>
          <p className="text-gray-500 text-sm">Add a slide from the side panel →</p>
        </div>
      );
    }
    return null;
  }

  const h = heightClass[settings.height ?? "md"];
  const contentAlign = settings.contentAlign ?? "center";
  const slideJustify =
    contentAlign === "left"
      ? "justify-start"
      : contentAlign === "right"
      ? "justify-end"
      : "justify-center";
  const textAlign =
    contentAlign === "left"
      ? "text-left"
      : contentAlign === "right"
      ? "text-right"
      : "text-center";
  const buttonsJustify =
    contentAlign === "left"
      ? "justify-start"
      : contentAlign === "right"
      ? "justify-end"
      : "justify-center";

  const updateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    if (!isManualEditable) return;
    const manual = settings.manual ?? [];
    const next = manual.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onSettingsChange!({ ...settings, manual: next });
  };

  // Mutate the shared buttons array. Writes to block-level settings.buttons
  // and clears legacy slide-level button fields so data converges.
  const updateButtons = (mutator: (prev: HeroButton[]) => HeroButton[]) => {
    if (!isManualEditable) return;
    const firstSlide = (settings.manual ?? [])[0];
    const current = readButtons(settings, firstSlide);
    const nextButtons = mutator(current);
    const cleanedManual = (settings.manual ?? []).map((s) => ({
      ...s,
      buttons: undefined,
      buttonText: undefined,
      buttonLink: undefined,
      button2Text: undefined,
      button2Link: undefined,
    }));
    onSettingsChange!({ ...settings, buttons: nextButtons, manual: cleanedManual });
  };

  const buttonClassFor = (v: ButtonVariant, s: ButtonSize) =>
    `inline-block ${SIZE_CLASS[s]} font-semibold shadow-lg transition-colors ${VARIANT_CLASS[v]}`;

  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={isManualEditable ? false : { delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={!isManualEditable && slides.length > 1}
        // In edit mode, disable Swiper's swipe detection so it doesn't
        // intercept clicks/pointer events on contentEditable text.
        allowTouchMove={!isManualEditable}
        simulateTouch={!isManualEditable}
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        onSlideChange={(swiper) => onActiveSlideChange?.(swiper.realIndex)}
        className="w-full"
      >
        {slides.map((slide, index) => {
          const pos = slide.imagePosition ?? { x: 50, y: 50 };
          const isRepositioning = reposSlide?.idx === index;
          return (
          <SwiperSlide key={index}>
            <div className={`relative ${h} flex items-center ${slideJustify} px-8 md:px-16 overflow-hidden`}>
              {slide.image ? (
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  style={{ objectPosition: `${pos.x}% ${pos.y}%` }}
                  priority={index === 0}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-300" />
              )}

              {/* Reposition drag layer (replaces overlay during repositioning) */}
              {isRepositioning ? (
                <RepositionLayer
                  initial={pos}
                  containerSelector={`[data-slide-idx="${index}"]`}
                  onChange={(p) => updateSlide(index, { imagePosition: p })}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor:
                      settings.overlayColor ?? slide.overlayColor ?? "#000000",
                    opacity:
                      (settings.overlayOpacity ?? slide.overlayOpacity ?? 40) / 100,
                  }}
                />
              )}

              {/* Done / Cancel banner during repositioning */}
              {isRepositioning && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-lg pointer-events-auto">
                  <span className="text-xs text-gray-700 mr-2 flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    Drag image to reposition
                  </span>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      exitReposition(false);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#6FB644] hover:bg-[#5a9636] text-white text-xs font-semibold rounded transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Done
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      exitReposition(true);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Marker so RepositionLayer can find this slide's container */}
              <div data-slide-idx={index} className="absolute inset-0 pointer-events-none" />
              <div
                className={`relative max-w-3xl ${textAlign} z-10`}
                style={{ color: settings.textColor ?? slide.textColor ?? "#ffffff" }}
              >
                {isManualEditable ? (
                  <EditableText
                    asTag="h2"
                    value={slide.title}
                    onChange={(v) => updateSlide(index, { title: v })}
                    className="text-3xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg block"
                  />
                ) : (
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
                    {slide.title}
                  </h2>
                )}

                {isManualEditable ? (
                  <EditableText
                    asTag="p"
                    value={slide.subtitle}
                    onChange={(v) => updateSlide(index, { subtitle: v })}
                    className="text-lg md:text-xl mb-8 opacity-90 drop-shadow block"
                  />
                ) : (
                  <p className="text-lg md:text-xl mb-8 opacity-90 drop-shadow">
                    {slide.subtitle}
                  </p>
                )}

                {(() => {
                  const buttons = readButtons(settings, slide);
                  if (isManualEditable) {
                    return (
                      <div className={`flex items-center gap-3 flex-wrap ${buttonsJustify}`}>
                        {buttons.map((btn, btnIdx) => {
                          const v = buttonVariantFor(btn, btnIdx);
                          const s = buttonSizeFor(btn);
                          const customStyle: React.CSSProperties = {};
                          if (btn.bgColor) customStyle.backgroundColor = btn.bgColor;
                          if (btn.textColor) customStyle.color = btn.textColor;
                          if (btn.borderColor) {
                            customStyle.borderColor = btn.borderColor;
                            customStyle.borderWidth = "2px";
                            customStyle.borderStyle = "solid";
                          }
                          return (
                            <EditableButton
                              key={btnIdx}
                              text={btn.text}
                              link={btn.link ?? ""}
                              variant={v}
                              size={s}
                              bgColor={btn.bgColor}
                              textColor={btn.textColor}
                              borderColor={btn.borderColor}
                              onTextChange={(val) =>
                                updateButtons((prev) =>
                                  prev.map((b, i) => (i === btnIdx ? { ...b, text: val } : b))
                                )
                              }
                              onLinkChange={(val) =>
                                updateButtons((prev) =>
                                  prev.map((b, i) => (i === btnIdx ? { ...b, link: val || undefined } : b))
                                )
                              }
                              onVariantChange={(val) =>
                                updateButtons((prev) =>
                                  prev.map((b, i) => (i === btnIdx ? { ...b, variant: val } : b))
                                )
                              }
                              onSizeChange={(val) =>
                                updateButtons((prev) =>
                                  prev.map((b, i) => (i === btnIdx ? { ...b, size: val } : b))
                                )
                              }
                              onBgColorChange={(val) =>
                                updateButtons((prev) =>
                                  prev.map((b, i) => (i === btnIdx ? { ...b, bgColor: val } : b))
                                )
                              }
                              onTextColorChange={(val) =>
                                updateButtons((prev) =>
                                  prev.map((b, i) => (i === btnIdx ? { ...b, textColor: val } : b))
                                )
                              }
                              onBorderColorChange={(val) =>
                                updateButtons((prev) =>
                                  prev.map((b, i) =>
                                    i === btnIdx ? { ...b, borderColor: val } : b
                                  )
                                )
                              }
                              onResetColors={() =>
                                updateButtons((prev) =>
                                  prev.map((b, i) =>
                                    i === btnIdx
                                      ? {
                                          ...b,
                                          bgColor: undefined,
                                          textColor: undefined,
                                          borderColor: undefined,
                                        }
                                      : b
                                  )
                                )
                              }
                              onRemove={() =>
                                updateButtons((prev) => prev.filter((_, i) => i !== btnIdx))
                              }
                              className={buttonClassFor(v, s)}
                              style={customStyle}
                            />
                          );
                        })}
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateButtons((prev) => [...prev, { text: "New button", link: "" }]);
                          }}
                          title="Add another button"
                          className="inline-flex items-center gap-1.5 px-4 py-3 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white text-sm border-2 border-dashed border-white/40 transition-colors pointer-events-auto"
                        >
                          <Plus className="w-4 h-4" />
                          {buttons.length === 0 ? "Add button" : "Add another"}
                        </button>
                      </div>
                    );
                  }
                  // Public render
                  if (buttons.length === 0) return null;
                  return (
                    <div className={`flex items-center gap-3 flex-wrap ${buttonsJustify}`}>
                      {buttons.map((btn, btnIdx) => {
                        const v = buttonVariantFor(btn, btnIdx);
                        const s = buttonSizeFor(btn);
                        const cls = buttonClassFor(v, s);
                        const style: React.CSSProperties = {};
                        if (btn.bgColor) style.backgroundColor = btn.bgColor;
                        if (btn.textColor) style.color = btn.textColor;
                        if (btn.borderColor) {
                          style.borderColor = btn.borderColor;
                          style.borderWidth = "2px";
                          style.borderStyle = "solid";
                        }
                        if (btn.link) {
                          return (
                            <Link key={btnIdx} href={btn.link} className={cls} style={style}>
                              {btn.text}
                            </Link>
                          );
                        }
                        return (
                          <span key={btnIdx} className={cls} style={style}>
                            {btn.text}
                          </span>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}

// Drag layer that updates objectPosition while the user drags inside the slide.
function RepositionLayer({
  initial,
  containerSelector,
  onChange,
}: {
  initial: { x: number; y: number };
  containerSelector: string;
  onChange: (p: { x: number; y: number }) => void;
}) {
  const layerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Use the SwiperSlide container to compute relative drag deltas.
    const container =
      (layerRef.current?.closest(containerSelector) as HTMLElement | null) ??
      layerRef.current?.parentElement ?? null;
    if (!container) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...initial };
    let lastPos = { ...initial };
    const rect = container.getBoundingClientRect();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      // Inverse: cursor moves down → image moves down → focal point Y decreases.
      const dxPct = ((ev.clientX - startX) / rect.width) * 100;
      const dyPct = ((ev.clientY - startY) / rect.height) * 100;
      const x = Math.max(0, Math.min(100, startPos.x - dxPct));
      const y = Math.max(0, Math.min(100, startPos.y - dyPct));
      lastPos = { x, y };
      onChange({ x, y });
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      onChange(lastPos);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={layerRef}
      onPointerDown={handlePointerDown}
      className="absolute inset-0 z-20 cursor-move bg-black/20 pointer-events-auto"
      title="Drag to reposition"
    />
  );
}
