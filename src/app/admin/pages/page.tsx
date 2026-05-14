"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Edit, Trash2, Lock } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";

interface PageRow {
  id: number;
  slug: string;
  title: string;
  published: boolean;
  updatedAt: string;
}

const SYSTEM_SLUGS = new Set(["home", "about", "contact"]);

const pagePathFor = (slug: string) =>
  slug === "home" ? "/" : SYSTEM_SLUGS.has(slug) ? `/${slug}` : `/p/${slug}`;

export default function PagesListPage() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // New page modal
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  // Delete confirm
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const res = await fetch("/api/pages");
    const data = await res.json();
    setPages(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast("Title is required", "error");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        slug: newSlug.trim() || newTitle.toLowerCase().replace(/\s+/g, "-"),
      }),
    });
    setCreating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Failed to create page", "error");
      return;
    }
    const created = await res.json();
    toast("Page created");
    setShowNew(false);
    setNewTitle("");
    setNewSlug("");
    window.location.href = `/admin/pages/${created.slug}/edit`;
  };

  const handleDelete = async () => {
    if (!deleteSlug) return;
    const res = await fetch(`/api/pages/${deleteSlug}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Failed to delete", "error");
      setDeleteSlug(null);
      return;
    }
    setPages(pages.filter((p) => p.slug !== deleteSlug));
    setDeleteSlug(null);
    toast("Page deleted");
  };

  const togglePublished = async (page: PageRow) => {
    const res = await fetch(`/api/pages/${page.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !page.published }),
    });
    if (!res.ok) {
      toast("Failed to update", "error");
      return;
    }
    setPages(pages.map((p) => (p.slug === page.slug ? { ...p, published: !p.published } : p)));
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
          <h1 className="text-2xl font-bold text-gray-800">Pages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Build and customize pages with reusable blocks
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {pages.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">No pages yet. Click &ldquo;New Page&rdquo; to create one.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pages.map((p) => {
              const isSystem = SYSTEM_SLUGS.has(p.slug);
              return (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-800">{p.title}</h3>
                      {isSystem && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          <Lock className="w-3 h-3" />
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-mono">{pagePathFor(p.slug)}</p>
                  </div>

                  <button
                    onClick={() => togglePublished(p)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      p.published
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.published ? "Published" : "Draft"}
                  </button>

                  <a
                    href={pagePathFor(p.slug)}
                    target="_blank"
                    title="View live"
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <Link
                    href={`/admin/pages/${p.slug}/edit`}
                    title="Edit"
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteSlug(p.slug)}
                    disabled={isSystem}
                    title={isSystem ? "System pages cannot be deleted" : "Delete"}
                    className="p-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New page modal */}
      <Modal
        isOpen={showNew}
        onClose={() => setShowNew(false)}
        title="New Page"
        onConfirm={creating ? undefined : handleCreate}
        confirmText={creating ? "Creating..." : "Create"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (!newSlug) {
                  setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }
              }}
              placeholder="Spring Sale"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="font-mono">/p/</span>
              <input
                type="text"
                value={newSlug}
                onChange={(e) =>
                  setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
                }
                placeholder="spring-sale"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={deleteSlug !== null}
        onClose={() => setDeleteSlug(null)}
        title="Delete Page"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this page? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
