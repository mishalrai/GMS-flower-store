"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, Upload, Search, Check, ImageIcon } from "lucide-react";

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
  currentImage?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentImage,
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(currentImage || null);
  const [dragOver, setDragOver] = useState(false);
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
      setSelected(currentImage || null);
    }
  }, [isOpen, fetchMedia, currentImage]);

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
        if (uploaded.length === 1) {
          setSelected(uploaded[0].url);
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

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <h3 className="text-lg font-semibold">Select Image</h3>
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item.url)}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all group ${
                      selected === item.url
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
                    {selected === item.url && (
                      <div className="absolute inset-0 bg-[#6FB644]/20 flex items-center justify-center">
                        <div className="w-7 h-7 bg-[#6FB644] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] truncate">
                        {item.originalName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t flex-shrink-0">
            <p className="text-sm text-gray-500">
              {selected ? "1 image selected" : "No image selected"}
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
                disabled={!selected}
                className="px-4 py-2 text-sm text-white bg-[#6FB644] rounded-lg hover:bg-[#5a9636] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
