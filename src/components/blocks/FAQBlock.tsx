"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { BlockSettings } from "@/lib/blocks/types";
import Tooltip from "@/components/admin/Tooltip";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  active: boolean;
}

const PLACEHOLDER_FAQ: FAQ = {
  id: -1,
  question: "Sample question — click + to add a real one",
  answer:
    "This is a placeholder answer. Use the “Add new FAQ” button below to create your first question, or remove this block if you don't need an FAQ.",
  active: true,
};

export default function FAQBlock({
  settings,
  editable,
  onSettingsChange,
}: {
  settings: BlockSettings["faq"];
  editable?: boolean;
  onSettingsChange?: (s: BlockSettings["faq"]) => void;
}) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditable = !!editable && !!onSettingsChange;

  useEffect(() => {
    fetch("/api/faqs")
      .then((r) => r.json())
      .then((data: FAQ[]) => {
        setFaqs(data.filter((f) => f.active));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const ids = settings.faqIds;
  const byId = new Map(faqs.map((f) => [f.id, f]));
  // ids === undefined: legacy blocks fall back to all active FAQs.
  // ids === []: explicit empty — show placeholder in editor, nothing on live.
  // ids has entries: render those in order.
  const isEmpty = Array.isArray(ids) && ids.length === 0;
  const showPlaceholder = isEmpty && isEditable;
  const selected: FAQ[] = ids
    ? ids.map((id) => byId.get(id)).filter((f): f is FAQ => !!f)
    : faqs;
  const visible: FAQ[] = showPlaceholder ? [PLACEHOLDER_FAQ] : selected;

  const removeFaq = (id: number) => {
    if (!onSettingsChange) return;
    if (id === PLACEHOLDER_FAQ.id) return;
    const baseIds = ids ?? selected.map((f) => f.id);
    onSettingsChange({ ...settings, faqIds: baseIds.filter((x) => x !== id) });
  };

  const saveFaq = (id: number, patch: Partial<Pick<FAQ, "question" | "answer">>) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
    fetch(`/api/faqs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {});
  };

  const submitNew = async () => {
    if (!onSettingsChange || !newQ.trim() || !newA.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ.trim(), answer: newA.trim() }),
      });
      if (res.ok) {
        const created: FAQ = await res.json();
        setFaqs((prev) => [...prev, created]);
        const baseIds = ids ?? selected.map((f) => f.id);
        onSettingsChange({ ...settings, faqIds: [...baseIds, created.id] });
        setNewQ("");
        setNewA("");
        setCreating(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {(isEditable || settings.title || settings.subtitle) && (
          <div className="text-center mb-8">
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
                className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 outline-none focus:ring-2 focus:ring-[#6FB644]/40 rounded px-2 pointer-events-auto select-text empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
              >
                {settings.title}
              </h2>
            ) : (
              settings.title && (
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {settings.title}
                </h2>
              )
            )}
            {isEditable ? (
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  onSettingsChange?.({
                    ...settings,
                    subtitle: (e.currentTarget.textContent ?? "").trim(),
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).blur();
                  }
                }}
                data-placeholder="Add a subtitle…"
                className="text-gray-500 outline-none focus:ring-2 focus:ring-[#6FB644]/40 rounded px-2 pointer-events-auto select-text empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
              >
                {settings.subtitle}
              </p>
            ) : (
              settings.subtitle && (
                <p className="text-gray-500">{settings.subtitle}</p>
              )
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
          </div>
        ) : visible.length === 0 && !isEditable ? (
          <p className="text-center text-gray-400 py-12">No FAQs to show yet.</p>
        ) : (
          <div>
            {visible.map((faq) => {
              const isOpen = openId === faq.id;
              const isPlaceholder = faq.id === PLACEHOLDER_FAQ.id;
              return (
                <div
                  key={faq.id}
                  className={`border-b border-gray-200 relative ${
                    isPlaceholder ? "opacity-60" : ""
                  }`}
                >
                  <div
                    className={`w-full flex items-center gap-5 px-5 py-5 text-left ${
                      isEditable ? "" : "hover:bg-green-50/50 transition-colors"
                    }`}
                  >
                    <span
                      className={`text-lg font-bold flex-shrink-0 transition-colors ${
                        isOpen ? "text-[#6FB644]" : "text-gray-300"
                      }`}
                    >
                      Q
                    </span>
                    {isEditable && !isPlaceholder ? (
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const next = (e.currentTarget.textContent ?? "").trim();
                          if (next && next !== faq.question) {
                            saveFaq(faq.id, { question: next });
                          } else if (!next) {
                            e.currentTarget.textContent = faq.question;
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            (e.currentTarget as HTMLElement).blur();
                          }
                        }}
                        className={`flex-1 text-lg font-medium outline-none focus:ring-2 focus:ring-[#6FB644]/40 rounded px-1 pointer-events-auto select-text ${
                          isOpen ? "text-[#6FB644]" : "text-gray-800"
                        }`}
                      >
                        {faq.question}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                        className={`flex-1 text-lg font-medium text-left transition-colors ${
                          isPlaceholder
                            ? "italic text-gray-500"
                            : isOpen
                              ? "text-[#6FB644]"
                              : "text-gray-800"
                        }`}
                      >
                        {faq.question}
                      </button>
                    )}
                    {isEditable && !isPlaceholder && (
                      <Tooltip label="Remove from this block" position="top">
                        <button
                          type="button"
                          onClick={() => removeFaq(faq.id)}
                          aria-label="Remove from this block"
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded pointer-events-auto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      className={`text-xl leading-none flex-shrink-0 transition-all duration-300 ${
                        isOpen ? "rotate-45 text-[#6FB644]" : "text-gray-400"
                      } ${isEditable ? "pointer-events-auto" : ""}`}
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      +
                    </button>
                  </div>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      {isEditable && !isPlaceholder ? (
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const next = (e.currentTarget.textContent ?? "").trim();
                            if (next && next !== faq.answer) {
                              saveFaq(faq.id, { answer: next });
                            } else if (!next) {
                              e.currentTarget.textContent = faq.answer;
                            }
                          }}
                          className="mx-5 mb-5 ml-14 px-2 py-1 text-base text-gray-600 leading-relaxed whitespace-pre-line outline-none focus:ring-2 focus:ring-[#6FB644]/40 rounded pointer-events-auto select-text"
                        >
                          {faq.answer}
                        </div>
                      ) : (
                        <div
                          className={`px-5 pb-5 pl-14 text-base leading-relaxed whitespace-pre-line ${
                            isPlaceholder ? "italic text-gray-500" : "text-gray-600"
                          }`}
                        >
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isEditable && (
              <div className="pt-4 space-y-2 pointer-events-auto">
                {creating ? (
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
                    <input
                      type="text"
                      placeholder="Question"
                      value={newQ}
                      onChange={(e) => setNewQ(e.target.value)}
                      autoFocus
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:border-[#6FB644] bg-white"
                    />
                    <textarea
                      placeholder="Answer"
                      value={newA}
                      onChange={(e) => setNewA(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:border-[#6FB644] resize-y bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={submitNew}
                        disabled={saving || !newQ.trim() || !newA.trim()}
                        className="flex-1 py-2 bg-[#6FB644] text-white text-sm font-medium rounded hover:bg-[#5a9636] disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save FAQ"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCreating(false);
                          setNewQ("");
                          setNewA("");
                        }}
                        className="px-4 py-2 border border-gray-200 text-sm rounded hover:bg-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-[#6FB644] hover:text-[#6FB644]"
                  >
                    <Plus className="w-4 h-4 inline mr-1" /> Add new FAQ
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
