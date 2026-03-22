"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    const res = await fetch("/api/faqs");
    const data = await res.json();
    setFaqs(data);
    setLoading(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setQuestion("");
    setAnswer("");
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      toast("Please fill in both question and answer");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await fetch(`/api/faqs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, answer }),
        });
        toast("FAQ updated successfully");
      } else {
        await fetch("/api/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, answer }),
        });
        toast("FAQ added successfully");
      }
      resetForm();
      fetchFaqs();
    } catch {
      toast("Failed to save FAQ");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/faqs/${deleteId}`, { method: "DELETE" });
    setFaqs(faqs.filter((f) => f.id !== deleteId));
    setDeleteId(null);
    toast("FAQ deleted successfully");
  };

  const toggleActive = async (faq: FAQ) => {
    await fetch(`/api/faqs/${faq.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !faq.active }),
    });
    setFaqs(faqs.map((f) => (f.id === faq.id ? { ...f, active: !f.active } : f)));
    toast(faq.active ? "FAQ hidden" : "FAQ visible");
  };

  // Smooth drag reorder
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<number | null>(null);
  const overRef = useRef<number | null>(null);
  const faqsRef = useRef(faqs);
  faqsRef.current = faqs;

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    dragRef.current = idx;
    overRef.current = idx;
    setDragIdx(idx);
    setOverIdx(idx);

    const onMove = (ev: PointerEvent) => {
      if (!listRef.current) return;
      const items = listRef.current.children;
      let target = items.length - 1;
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect();
        if (ev.clientY < rect.top + rect.height / 2) {
          target = i;
          break;
        }
      }
      overRef.current = target;
      setOverIdx(target);
    };

    const onUp = async () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";

      const from = dragRef.current;
      const to = overRef.current;
      dragRef.current = null;
      overRef.current = null;
      setDragIdx(null);
      setOverIdx(null);

      if (from === null || to === null || from === to) return;

      const updated = [...faqsRef.current];
      const [dragged] = updated.splice(from, 1);
      updated.splice(to, 0, dragged);
      updated.forEach((f, i) => (f.order = i + 1));
      setFaqs(updated);

      await Promise.all(
        updated.map((f) =>
          fetch(`/api/faqs/${f.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: f.order }),
          })
        )
      );
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">FAQs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage frequently asked questions
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            {editingId ? "Edit FAQ" : "New FAQ"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter question..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter answer..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm text-white bg-[#6FB644] rounded-lg font-medium hover:bg-[#5a9636] disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="bg-white rounded-xl overflow-hidden">
        {faqs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">No FAQs added yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100" ref={listRef}>
            {faqs.map((faq, idx) => {
              const isDragging = dragIdx === idx;
              const isOver = dragIdx !== null && overIdx === idx && dragIdx !== idx;
              return (
              <div
                key={faq.id}
                className={`px-5 py-4 flex items-start gap-3 transition-all duration-150 ${
                  !faq.active ? "opacity-50" : ""
                } ${isDragging ? "opacity-40 bg-gray-50" : ""} ${
                  isOver ? "border-t-2 border-t-[#6FB644]" : ""
                }`}
              >
                {/* Drag Handle */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, idx)}
                  className="pt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {faq.answer}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(faq)}
                    title={faq.active ? "Hide" : "Show"}
                    className={`p-1.5 rounded ${
                      faq.active
                        ? "text-green-500 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {faq.active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(faq)}
                    title="Edit"
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(faq.id)}
                    title="Delete"
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete FAQ"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this FAQ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
