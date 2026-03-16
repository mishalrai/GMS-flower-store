"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, Upload, Search, Check, ImageIcon, Copy, Pencil, Crop, Eye, Trash2 } from "lucide-react";
import ImageCropModal from "@/components/admin/ImageCropModal";

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

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
  multiple?: boolean;
  currentImage?: string;
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

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  multiple = false,
  currentImage,
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingAlt, setEditingAlt] = useState(false);
  const [altText, setAltText] = useState("");
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [cropItem, setCropItem] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("type", "image");
      const res = await fetch(`/api/media?${params}`);
      const data = await res.json();
      setMedia(data);
    } catch {
      // failed to fetch
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedItem(null);
      setSelectedItems([]);
      setEditingAlt(false);
    }
  }, [isOpen, fetchMedia]);

  useEffect(() => {
    if (isOpen && currentImage && media.length > 0 && !multiple) {
      const match = media.find((m) => m.url === currentImage);
      if (match) setSelectedItem(match);
    }
  }, [isOpen, currentImage, media, multiple]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const uploaded: MediaItem[] = await res.json();
        setMedia((prev) => [...uploaded, ...prev]);
        if (uploaded.length === 1 && !multiple) {
          setSelectedItem(uploaded[0]);
        }
      }
    } catch {
      // upload failed
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const isItemSelected = (item: MediaItem) => {
    if (multiple) {
      return selectedItems.some((s) => s.id === item.id);
    }
    return selectedItem?.id === item.id;
  };

  const handleItemClick = (item: MediaItem) => {
    setEditingAlt(false);
    setAltText(item.alt);

    if (multiple) {
      setSelectedItems((prev) => {
        const exists = prev.some((s) => s.id === item.id);
        if (exists) {
          return prev.filter((s) => s.id !== item.id);
        }
        return [...prev, item];
      });
      // Show details for the last clicked item
      setSelectedItem(item);
    } else {
      setSelectedItem(item);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      if (selectedItems.length > 0 && onSelectMultiple) {
        onSelectMultiple(selectedItems.map((i) => i.url));
        onClose();
      }
    } else if (selectedItem) {
      onSelect(selectedItem.url);
      onClose();
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAlt = async () => {
    if (!selectedItem) return;
    const res = await fetch(`/api/media/${selectedItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt: altText }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMedia(media.map((m) => (m.id === updated.id ? updated : m)));
      setSelectedItem(updated);
      setSelectedItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingAlt(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    await fetch(`/api/media/${selectedItem.id}`, { method: "DELETE" });
    setMedia(media.filter((m) => m.id !== selectedItem.id));
    setSelectedItems((prev) => prev.filter((s) => s.id !== selectedItem.id));
    setSelectedItem(null);
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
      if (selectedItem?.id === updated.id) setSelectedItem(updated);
      setSelectedItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setCropItem(null);
    }
  };

  const selectionCount = multiple ? selectedItems.length : (selectedItem ? 1 : 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
            <h3 className="text-lg font-semibold">
              {multiple ? "Select Images" : "Select Image"}
            </h3>
            <button
              onClick={onClose}
              title="Close"
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />

          {/* Body: Grid + Sidebar */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left: Media Grid */}
            <div className="flex-1 overflow-y-auto p-4 min-w-0">
              {/* Drop Zone */}
              <div
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 mb-4 text-center transition-colors ${
                  dragOver
                    ? "border-[#6FB644] bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Drag and drop files here, or{" "}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
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

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search media..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
                </div>
              ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <p className="text-sm">No images found. Upload one to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {media.map((item) => {
                    const selected = isItemSelected(item);
                    const multiIndex = multiple ? selectedItems.findIndex((s) => s.id === item.id) : -1;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`relative aspect-square rounded-lg overflow-hidden transition-all group ${
                          selected
                            ? "ring-2 ring-[#6FB644] ring-offset-2"
                            : "hover:ring-1 hover:ring-gray-300"
                        }`}
                      >
                        <Image
                          src={item.url}
                          alt={item.alt}
                          fill
                          className="object-cover"
                        />
                        {selected && (
                          <div className="absolute inset-0 bg-[#6FB644]/20 flex items-center justify-center">
                            <div className="w-7 h-7 bg-[#6FB644] rounded-full flex items-center justify-center">
                              {multiple ? (
                                <span className="text-white text-xs font-bold">{multiIndex + 1}</span>
                              ) : (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-[10px] truncate">
                            {item.originalName}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Detail Sidebar */}
            {selectedItem && (
              <div className="w-72 flex-shrink-0 border-l border-gray-100 overflow-y-auto bg-gray-50/50">
                {/* Image Preview */}
                <div className="aspect-square relative bg-gray-50 overflow-hidden">
                  <Image
                    src={selectedItem.url}
                    alt={selectedItem.alt}
                    fill
                    className="object-contain"
                  />
                  <button
                    onClick={() => setSelectedItem(null)}
                    title="Close details"
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm truncate">
                      {selectedItem.originalName}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(selectedItem.uploadedAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block">Type</span>
                      <span className="text-gray-700 font-medium">
                        {selectedItem.type.split("/")[1]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Size</span>
                      <span className="text-gray-700 font-medium">
                        {formatFileSize(selectedItem.size)}
                      </span>
                    </div>
                  </div>

                  {/* Alt Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Alt Text</span>
                      {!editingAlt && (
                        <button
                          onClick={() => { setEditingAlt(true); setAltText(selectedItem.alt); }}
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
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">
                        {selectedItem.alt || "No alt text"}
                      </p>
                    )}
                  </div>

                  {/* URL */}
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">File URL</span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[10px] bg-white px-2 py-1.5 rounded border border-gray-100 text-gray-600 truncate">
                        {selectedItem.url}
                      </code>
                      <button
                        onClick={() => copyUrl(selectedItem.url)}
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
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => setCropItem(selectedItem)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      Crop
                    </button>
                    <button
                      onClick={() => setPreviewItem(selectedItem)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-100 flex-shrink-0">
            <p className="text-sm text-gray-500">
              {selectionCount === 0
                ? "No image selected"
                : selectionCount === 1
                  ? "1 image selected"
                  : `${selectionCount} images selected`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectionCount === 0}
                className="px-4 py-2 text-sm text-white bg-[#6FB644] rounded-lg hover:bg-[#5a9636] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {multiple
                  ? `Select ${selectionCount > 0 ? selectionCount + " " : ""}Image${selectionCount !== 1 ? "s" : ""}`
                  : "Select Image"}
              </button>
            </div>
          </div>
        </div>
      </div>

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
            className="fixed inset-0 bg-black/80 z-[60]"
            onClick={() => setPreviewItem(null)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-8">
            <button
              onClick={() => setPreviewItem(null)}
              title="Close preview"
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
              <Image
                src={previewItem.url}
                alt={previewItem.alt}
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white text-sm">{previewItem.originalName}</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
