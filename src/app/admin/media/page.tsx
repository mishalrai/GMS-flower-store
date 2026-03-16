"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Trash2,
  Copy,
  Check,
  X,
  ImageIcon,
  File,
  Eye,
  Pencil,
  Crop,
} from "lucide-react";
import Modal from "@/components/admin/Modal";
import ImageCropModal from "@/components/admin/ImageCropModal";
import { useToast } from "@/components/admin/Toast";
import CustomSelect from "@/components/ui/CustomSelect";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  alt: string;
  uploadedAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingAlt, setEditingAlt] = useState(false);
  const [altText, setAltText] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [cropItem, setCropItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchMedia = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter !== "all") params.set("type", typeFilter);
    const res = await fetch(`/api/media?${params}`);
    setMedia(await res.json());
    setLoading(false);
  }, [search, typeFilter]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await fetchMedia();
        toast("Files uploaded successfully");
      } else {
        toast("Upload failed", "error");
      }
    } catch {
      toast("Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleUpload(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/media/${deleteId}`, { method: "DELETE" });
    setMedia(media.filter((m) => m.id !== deleteId));
    if (selected?.id === deleteId) setSelected(null);
    setDeleteId(null);
    toast("File deleted successfully");
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => fetch(`/api/media/${id}`, { method: "DELETE" })));
    setMedia(media.filter((m) => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    if (selected && selectedIds.has(selected.id)) setSelected(null);
    toast(`${ids.length} files deleted successfully`);
  };

  const handleSaveAlt = async () => {
    if (!selected) return;
    const res = await fetch(`/api/media/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt: altText }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMedia(media.map((m) => (m.id === updated.id ? updated : m)));
      setSelected(updated);
      setEditingAlt(false);
      toast("Alt text saved");
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!cropItem) return;
    const formData = new FormData();
    formData.append("file", blob, cropItem.filename);

    const res = await fetch(`/api/media/${cropItem.id}/crop`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const updated = await res.json();
      setMedia(media.map((m) => (m.id === updated.id ? updated : m)));
      if (selected?.id === updated.id) setSelected(updated);
      setCropItem(null);
      toast("Image cropped successfully");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isImage = (type: string) => type.startsWith("image/");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Media Library ({media.length})
          </h1>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload Files"}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 mb-6 text-center transition-colors ${
            dragActive
              ? "border-[#6FB644] bg-green-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Drag and drop files here, or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[#6FB644] font-medium hover:underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supports JPG, PNG, GIF, SVG, WebP
          </p>
          {uploading && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-[#6FB644] border-t-transparent rounded-full" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </div>
          )}
        </div>

        {/* Filters & View Toggle */}
        <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <CustomSelect
            value={typeFilter}
            onChange={(val) => setTypeFilter(val)}
            className="min-w-[150px]"
            options={[
              { value: "all", label: "All Types" },
              { value: "image", label: "Images" },
            ]}
          />
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid view"
              className={`p-2 ${viewMode === "grid" ? "bg-[#6FB644] text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List view"
              className={`p-2 ${viewMode === "list" ? "bg-[#6FB644] text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Grid */}
        {media.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No media files yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Upload images to get started
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelected(item);
                  setEditingAlt(false);
                  setAltText(item.alt);
                }}
                className={`group relative bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  selected?.id === item.id
                    ? "ring-2 ring-[#6FB644] border-[#6FB644]"
                    : "border-gray-100"
                }`}
              >
                {/* Checkbox */}
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id);
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedIds.has(item.id)
                        ? "bg-[#6FB644] border-[#6FB644]"
                        : "border-white bg-white/80 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {selectedIds.has(item.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                {/* Preview / Actions overlay */}
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isImage(item.type) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCropItem(item);
                      }}
                      title="Crop image"
                      className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-100"
                    >
                      <Crop className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewItem(item);
                    }}
                    title="Preview"
                    className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-100"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(item.id);
                    }}
                    title="Delete"
                    className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="aspect-square relative bg-gray-50">
                  {isImage(item.type) ? (
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <File className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {item.originalName}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatFileSize(item.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === media.length && media.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(media.map((m) => m.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    File
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Size
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {media.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelected(item);
                      setEditingAlt(false);
                      setAltText(item.alt);
                    }}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selected?.id === item.id ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative flex-shrink-0">
                          {isImage(item.type) ? (
                            <Image
                              src={item.url}
                              alt={item.alt}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <File className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                          {item.originalName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.type.split("/")[1]?.toUpperCase() || item.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatFileSize(item.size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(item.uploadedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrl(item.url);
                          }}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {isImage(item.type) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCropItem(item);
                            }}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                            title="Crop image"
                          >
                            <Crop className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewItem(item);
                          }}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(item.id);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Sidebar */}
      {selected && (
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl sticky top-6">
            {/* Preview */}
            <div className="aspect-square relative bg-gray-50 rounded-t-xl overflow-hidden">
              {isImage(selected.type) ? (
                <Image
                  src={selected.url}
                  alt={selected.alt}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <File className="w-16 h-16 text-gray-300" />
                </div>
              )}
              <button
                onClick={() => setSelected(null)}
                title="Close details"
                className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Details */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm truncate">
                  {selected.originalName}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(selected.uploadedAt)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Type</span>
                  <span className="text-gray-700 font-medium">
                    {selected.type.split("/")[1]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Size</span>
                  <span className="text-gray-700 font-medium">
                    {formatFileSize(selected.size)}
                  </span>
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Alt Text</span>
                  {!editingAlt && (
                    <button
                      onClick={() => {
                        setEditingAlt(true);
                        setAltText(selected.alt);
                      }}
                      title="Edit alt text"
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Pencil className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
                {editingAlt ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#6FB644] outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveAlt}
                      className="px-2 py-1.5 bg-[#6FB644] text-white rounded-lg text-xs hover:bg-[#5a9636]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingAlt(false)}
                      className="px-2 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">
                    {selected.alt || "No alt text"}
                  </p>
                )}
              </div>

              {/* URL */}
              <div>
                <span className="text-xs text-gray-400 block mb-1">
                  File URL
                </span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[10px] bg-gray-50 px-2 py-1.5 rounded text-gray-600 truncate">
                    {selected.url}
                  </code>
                  <button
                    onClick={() => copyUrl(selected.url)}
                    className="p-1.5 hover:bg-gray-100 rounded flex-shrink-0"
                    title="Copy URL"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                {isImage(selected.type) && (
                  <button
                    onClick={() => setCropItem(selected)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    Crop
                  </button>
                )}
                <button
                  onClick={() => setPreviewItem(selected)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  onClick={() => setDeleteId(selected.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Media"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this file? This action cannot be
          undone.
        </p>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title="Delete Selected Media"
        onConfirm={handleBulkDelete}
        confirmText={`Delete ${selectedIds.size} files`}
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-gray-600">
          Are you sure you want to delete {selectedIds.size} selected files?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Crop Modal */}
      {cropItem && (
        <ImageCropModal
          imageUrl={cropItem.url}
          onCropComplete={handleCropComplete}
          onClose={() => setCropItem(null)}
        />
      )}

      {/* Full Preview Modal */}
      {previewItem && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-50"
            onClick={() => setPreviewItem(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <button
              onClick={() => setPreviewItem(null)}
              title="Close preview"
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
              {isImage(previewItem.type) ? (
                <Image
                  src={previewItem.url}
                  alt={previewItem.alt}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <File className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white text-sm">{previewItem.originalName}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
