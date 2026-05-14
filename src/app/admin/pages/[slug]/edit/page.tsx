"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  GripVertical,
  Pencil,
  Copy,
  Trash2,
  Plus,
  ChevronUp,
  MousePointerClick,
  X,
  ImageIcon,
  Move,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Modal from "@/components/admin/Modal";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import Tooltip from "@/components/admin/Tooltip";
import { useToast } from "@/components/admin/Toast";
import { AnyBlock, BlockType, BlockSettings } from "@/lib/blocks/types";
import { newBlock } from "@/lib/blocks/defaults";
import { blockMeta, blockMetaList } from "@/components/admin/builder/blockMeta";
import { blockRegistry } from "@/lib/blocks/registry";

const SYSTEM_SLUGS = new Set(["home", "about", "contact"]);
const livePathFor = (slug: string) =>
  slug === "home" ? "/" : SYSTEM_SLUGS.has(slug) ? `/${slug}` : `/p/${slug}`;

const DRAG_TYPE = "application/x-page-block";

export default function PageEditor() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<AnyBlock[]>([]);
  const [initialJSON, setInitialJSON] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // When set, open the media picker for that block (changes background image of slide 0).
  const [imagePickerBlockId, setImagePickerBlockId] = useState<string | null>(null);
  // When set, the editor signals the matching block (Hero) to enter reposition mode.
  const [repositioningBlockId, setRepositioningBlockId] = useState<string | null>(null);
  // Tracks the currently visible slide for each Hero block (reported by HeroBlock).
  const [activeSlideMap, setActiveSlideMap] = useState<Record<string, number>>({});

  // Drag-from-library state
  const [draggingLibType, setDraggingLibType] = useState<BlockType | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  // Drag-reorder (within canvas) state
  const [reorderFrom, setReorderFrom] = useState<number | null>(null);
  const [reorderOver, setReorderOver] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<number | null>(null);
  const overRef = useRef<number | null>(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const isDirty = JSON.stringify(blocks) !== initialJSON;

  // Load page
  useEffect(() => {
    fetch(`/api/pages/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((page) => {
        if (!page) {
          toast("Page not found", "error");
          router.push("/admin/pages");
          return;
        }
        setTitle(page.title);
        const loaded: AnyBlock[] = page.blocks ?? [];
        setBlocks(loaded);
        setInitialJSON(JSON.stringify(loaded));
        setLoading(false);
      })
      .catch(() => {
        toast("Failed to load page", "error");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Warn on unload
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const updateBlock = (id: string, settings: AnyBlock["settings"]) => {
    setBlocks((bs) =>
      bs.map((b) => (b.id === id ? ({ ...b, settings } as AnyBlock) : b))
    );
  };

  const insertBlockAt = (type: BlockType, idx: number) => {
    const block = newBlock(type);
    setBlocks((bs) => {
      const next = [...bs];
      const insertIdx = Math.max(0, Math.min(idx, next.length));
      next.splice(insertIdx, 0, block);
      return next;
    });
    setExpandedId(block.id);
    return block;
  };

  const addBlockToEnd = (type: BlockType) => {
    const block = insertBlockAt(type, blocks.length);
    requestAnimationFrame(() => {
      const node = listRef.current?.querySelector(`[data-block-id="${block.id}"]`);
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const duplicateBlock = (id: string) => {
    setBlocks((bs) => {
      const idx = bs.findIndex((b) => b.id === id);
      if (idx === -1) return bs;
      const original = bs[idx];
      const copy: AnyBlock = {
        ...original,
        id: crypto.randomUUID(),
        settings: JSON.parse(JSON.stringify(original.settings)),
      };
      const next = [...bs];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const removeBlock = (id: string) => {
    setBlocks((bs) => bs.filter((b) => b.id !== id));
    if (expandedId === id) setExpandedId(null);
    setDeleteId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      if (!res.ok) throw new Error();
      setInitialJSON(JSON.stringify(blocks));
      toast("Page saved");
    } catch {
      toast("Failed to save", "error");
    }
    setSaving(false);
  };

  // ── Drag from library → canvas ───────────────────────────────────────────

  const computeDropIdx = (clientY: number): number => {
    if (!listRef.current) return blocksRef.current.length;
    const items = listRef.current.querySelectorAll("[data-block-id]");
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return items.length;
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDropIdx(computeDropIdx(e.clientY));
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the canvas root, not crossing into a child
    if (e.currentTarget === e.target) setDropIdx(null);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    const type = e.dataTransfer.getData(DRAG_TYPE) as BlockType;
    if (!type) return;
    e.preventDefault();
    const targetIdx = dropIdx ?? blocksRef.current.length;
    insertBlockAt(type, targetIdx);
    setDropIdx(null);
    setDraggingLibType(null);
  };

  // ── Drag-reorder within canvas (pointer events) ─────────────────────────

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    dragRef.current = idx;
    overRef.current = idx;
    setReorderFrom(idx);
    setReorderOver(idx);

    const onMove = (ev: PointerEvent) => {
      if (!listRef.current) return;
      const items = listRef.current.querySelectorAll("[data-block-id]");
      let target = items.length - 1;
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect();
        if (ev.clientY < rect.top + rect.height / 2) {
          target = i;
          break;
        }
      }
      overRef.current = target;
      setReorderOver(target);
    };

    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";

      const from = dragRef.current;
      const to = overRef.current;
      dragRef.current = null;
      overRef.current = null;
      setReorderFrom(null);
      setReorderOver(null);

      if (from === null || to === null || from === to) return;

      const updated = [...blocksRef.current];
      const [dragged] = updated.splice(from, 1);
      updated.splice(to, 0, dragged);
      setBlocks(updated);
    };

    document.body.style.userSelect = "none";
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="-m-6 min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky toolbar */}
      <div className="sticky top-[61px] z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <Link
          href="/admin/pages"
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-800 truncate">{title}</h1>
          <p className="text-xs text-gray-500 font-mono">{livePathFor(slug)}</p>
        </div>
        <a
          href={livePathFor(slug)}
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ExternalLink className="w-4 h-4" />
          View Live
        </a>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="px-5 py-2 text-sm text-white bg-[#6FB644] rounded-lg font-medium hover:bg-[#5a9636] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : isDirty ? "Save" : "Saved"}
        </button>
      </div>

      {/* Canvas (full width minus right gutter for the floating library) */}
      <div className="flex-1 relative">
        <div
          className={`p-6 pr-6 lg:pr-80 overflow-x-hidden transition-colors min-h-full ${
            draggingLibType ? "bg-green-50/40" : ""
          }`}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
        >
          <div className="mx-auto">
            {blocks.length === 0 ? (
              <div
                className={`bg-white rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                  draggingLibType ? "border-[#6FB644] bg-green-50" : "border-gray-200"
                }`}
              >
                <p className="text-gray-500 mb-2">
                  {draggingLibType ? "Drop here to add the block" : "This page is empty."}
                </p>
                <p className="text-xs text-gray-400">
                  Drag a block from the right, or click one to add it.
                </p>
              </div>
            ) : (
              <div className="space-y-3 relative" ref={listRef}>
                {blocks.map((block, idx) => {
                  const meta = blockMeta[block.type];
                  const Renderer = blockRegistry[block.type] as React.ComponentType<{
                    settings: typeof block.settings;
                    editable?: boolean;
                    onSettingsChange?: (s: typeof block.settings) => void;
                    repositioningSlideIdx?: number | null;
                    onExitReposition?: () => void;
                    onActiveSlideChange?: (idx: number) => void;
                    activeSlideIdx?: number;
                  }>;
                  const activeSlideIdx = activeSlideMap[block.id] ?? 0;
                  const isReorderDragging = reorderFrom === idx;
                  const isReorderOver =
                    reorderFrom !== null && reorderOver === idx && reorderFrom !== idx;
                  const showLibDropLine = draggingLibType !== null && dropIdx === idx;
                  const expanded = expandedId === block.id;

                  return (
                    <div key={block.id} data-block-id={block.id}>
                      {showLibDropLine && (
                        <div className="h-1 bg-[#6FB644] rounded-full mb-2 animate-pulse" />
                      )}
                      <div
                        className={`group/block relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${
                          isReorderDragging ? "opacity-40" : ""
                        } ${isReorderOver ? "border-t-2 border-t-[#6FB644]" : ""} ${
                          expanded ? "ring-2 ring-[#6FB644]/40" : ""
                        }`}
                      >
                        {/* Hover overlay (controls + label) */}
                        <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 p-2 bg-gradient-to-b from-black/40 to-transparent opacity-0 group-hover/block:opacity-100 transition-opacity pointer-events-none">
                          <div
                            onPointerDown={(e) => handlePointerDown(e, idx)}
                            className="cursor-grab active:cursor-grabbing text-white/80 hover:text-white touch-none bg-black/30 rounded p-1 pointer-events-auto"
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded text-white text-xs pointer-events-auto">
                            <meta.icon className="w-3.5 h-3.5" />
                            <span className="font-medium">{meta.label}</span>
                          </div>
                          <div className="flex-1" />
                          <div className="flex items-center gap-1 pointer-events-auto">
                            {/* Slide navigator (Hero, multi-slide only) */}
                            {block.type === "hero" && (() => {
                              const heroSettings = block.settings as BlockSettings["hero"];
                              const totalSlides = heroSettings.manual?.length ?? 0;
                              if (totalSlides < 2) return null;
                              const currentIdx = activeSlideIdx;
                              return (
                                <div className="flex items-center bg-white/90 rounded shadow-sm">
                                  <Tooltip label="Previous slide" position="bottom">
                                    <button
                                      onClick={() =>
                                        setActiveSlideMap((prev) => ({
                                          ...prev,
                                          [block.id]: Math.max(0, (prev[block.id] ?? 0) - 1),
                                        }))
                                      }
                                      disabled={currentIdx <= 0}
                                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-l disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>
                                  </Tooltip>
                                  <span className="px-2 text-[11px] font-semibold text-gray-700 tabular-nums">
                                    {currentIdx + 1} / {totalSlides}
                                  </span>
                                  <Tooltip label="Next slide" position="bottom">
                                    <button
                                      onClick={() =>
                                        setActiveSlideMap((prev) => ({
                                          ...prev,
                                          [block.id]: Math.min(
                                            totalSlides - 1,
                                            (prev[block.id] ?? 0) + 1,
                                          ),
                                        }))
                                      }
                                      disabled={currentIdx >= totalSlides - 1}
                                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-r disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </Tooltip>
                                </div>
                              );
                            })()}
                            {(block.type === "hero" || block.type === "cta") && (
                              <Tooltip label="Change image" position="bottom">
                                <button
                                  onClick={() => setImagePickerBlockId(block.id)}
                                  className="p-1.5 bg-white/90 hover:bg-white text-gray-600 rounded shadow-sm"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            )}
                            {block.type === "hero" && (
                              <Tooltip label="Reposition image" position="bottom">
                                <button
                                  onClick={() => setRepositioningBlockId(block.id)}
                                  className="p-1.5 bg-white/90 hover:bg-white text-gray-600 rounded shadow-sm"
                                >
                                  <Move className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            )}
                            <Tooltip label={expanded ? "Collapse" : "Edit settings"} position="bottom">
                              <button
                                onClick={() => setExpandedId(expanded ? null : block.id)}
                                className="p-1.5 bg-white/90 hover:bg-white text-blue-500 rounded shadow-sm"
                              >
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                              </button>
                            </Tooltip>
                            <Tooltip label="Duplicate block" position="bottom">
                              <button
                                onClick={() => duplicateBlock(block.id)}
                                className="p-1.5 bg-white/90 hover:bg-white text-gray-600 rounded shadow-sm"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip label="Delete block" position="bottom">
                              <button
                                onClick={() => setDeleteId(block.id)}
                                className="p-1.5 bg-white/90 hover:bg-white text-red-500 rounded shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Live preview — exactly as it renders on the public page */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            // Ignore clicks that originate from interactive
                            // children inside the preview (e.g., editable
                            // text, button toolbars). Only toggle when the
                            // wrapper itself was clicked.
                            if (e.target !== e.currentTarget) return;
                            setExpandedId(expanded ? null : block.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.target !== e.currentTarget) return;
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setExpandedId(expanded ? null : block.id);
                            }
                          }}
                          className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6FB644]/50"
                          aria-label={`Edit ${meta.label}`}
                        >
                          <div className="pointer-events-none select-none">
                            {Renderer ? (
                              <Renderer
                                settings={block.settings}
                                editable
                                onSettingsChange={(s) => updateBlock(block.id, s)}
                                repositioningSlideIdx={
                                  repositioningBlockId === block.id ? activeSlideIdx : null
                                }
                                onExitReposition={() => setRepositioningBlockId(null)}
                                onActiveSlideChange={(idx) =>
                                  setActiveSlideMap((prev) => ({ ...prev, [block.id]: idx }))
                                }
                                activeSlideIdx={activeSlideIdx}
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Drop indicator at the end */}
                {draggingLibType !== null && dropIdx === blocks.length && (
                  <div className="h-1 bg-[#6FB644] rounded-full animate-pulse" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Side panel — switches between block library and block settings */}
        {(() => {
          const editingBlock = blocks.find((b) => b.id === expandedId);
          if (editingBlock) {
            const meta = blockMeta[editingBlock.type];
            type S = AnyBlock["settings"];
            const Form = meta.form as unknown as React.ComponentType<{
              settings: S;
              onChange: (s: S) => void;
            }>;
            return (
              <aside className="hidden lg:flex flex-col fixed top-[130px] right-0 bottom-0 w-72 bg-white border-l border-gray-200 shadow-[-4px_0_12px_rgba(0,0,0,0.04)] z-10">
                <div className="flex items-center gap-2 p-3 border-b border-gray-100 sticky top-0 bg-white">
                  <button
                    onClick={() => setExpandedId(null)}
                    title="Back to block library"
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-7 h-7 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                    <meta.icon className="w-4 h-4 text-[#6FB644]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 leading-tight">Editing</p>
                    <p className="text-sm font-semibold text-gray-800 leading-tight truncate">
                      {meta.label}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedId(null)}
                    title="Close"
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <Form
                    settings={editingBlock.settings}
                    onChange={(s) => updateBlock(editingBlock.id, s)}
                  />
                </div>
              </aside>
            );
          }
          return (
            <aside className="hidden lg:block fixed top-[130px] right-0 bottom-0 w-72 bg-white border-l border-gray-200 shadow-[-4px_0_12px_rgba(0,0,0,0.04)] overflow-y-auto z-10">
              <div className="p-4">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Add a block
                </p>
                <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
                  <MousePointerClick className="w-3 h-3" />
                  Drag or click to add
                </p>
                <div className="space-y-1.5">
                  {blockMetaList.map((meta) => (
                    <div
                      key={meta.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DRAG_TYPE, meta.type);
                        e.dataTransfer.effectAllowed = "copy";
                        setDraggingLibType(meta.type);
                      }}
                      onDragEnd={() => {
                        setDraggingLibType(null);
                        setDropIdx(null);
                      }}
                      onClick={() => addBlockToEnd(meta.type)}
                      className="group flex items-center gap-2.5 p-2 rounded-lg hover:bg-green-50 hover:border-[#6FB644] border border-transparent cursor-grab active:cursor-grabbing transition-colors select-none"
                      title={`${meta.label} — drag onto the canvas or click to append`}
                    >
                      <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#6FB644] transition-colors">
                        <meta.icon className="w-4 h-4 text-[#6FB644] group-hover:text-white transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 leading-tight">{meta.label}</p>
                        <p className="text-[11px] text-gray-500 truncate leading-tight mt-0.5">
                          {meta.description}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-gray-300 group-hover:text-[#6FB644] flex-shrink-0 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          );
        })()}
      </div>

      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Block"
        onConfirm={() => deleteId && removeBlock(deleteId)}
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-sm text-gray-600">
          Remove this block? Click Save afterwards to publish the change.
        </p>
      </Modal>

      {/* Media picker for the block hover overlay's "Change image" action */}
      {imagePickerBlockId && (() => {
        const block = blocks.find((b) => b.id === imagePickerBlockId);
        if (!block) return null;
        const targetIdx = activeSlideMap[block.id] ?? 0;
        const currentImage =
          block.type === "hero"
            ? ((block.settings as BlockSettings["hero"]).manual?.[targetIdx]?.image)
            : block.type === "cta"
            ? ((block.settings as BlockSettings["cta"]).bgImage)
            : undefined;
        return (
          <MediaPickerModal
            isOpen
            onClose={() => setImagePickerBlockId(null)}
            currentImage={currentImage}
            onSelect={(url) => {
              if (block.type === "hero") {
                const s = block.settings as BlockSettings["hero"];
                const slides = s.manual ?? [];
                const nextSlides =
                  slides.length === 0
                    ? [
                        {
                          title: "",
                          subtitle: "",
                          image: url,
                        },
                      ]
                    : slides.map((sl, i) =>
                        i === targetIdx ? { ...sl, image: url } : sl
                      );
                updateBlock(block.id, { ...s, manual: nextSlides });
              } else if (block.type === "cta") {
                const s = block.settings as BlockSettings["cta"];
                updateBlock(block.id, { ...s, bgImage: url });
              }
              setImagePickerBlockId(null);
            }}
          />
        );
      })()}
    </div>
  );
}
