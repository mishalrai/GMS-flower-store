"use client";

import dynamic from "next/dynamic";
import { useRef, useMemo, useEffect, useState } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["link", "image"],
  ["clean"],
];

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
];

export default function RichTextEditor({
  value,
  onChange,
  onImageClick,
  pendingImageUrl,
  onImageInserted,
}: {
  value: string;
  onChange: (value: string) => void;
  onImageClick?: () => void;
  pendingImageUrl?: string | null;
  onImageInserted?: () => void;
}) {
  const quillRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageClickRef = useRef(onImageClick);
  const onChangeRef = useRef(onChange);
  const [sourceMode, setSourceMode] = useState(false);

  useEffect(() => { imageClickRef.current = onImageClick; }, [onImageClick]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: toolbarOptions,
        handlers: {
          image: () => imageClickRef.current?.(),
        },
      },
    }),
    []
  );

  // ─── Image Resize System ───
  // Re-runs whenever sourceMode flips back to visual
  useEffect(() => {
    if (sourceMode) return; // no resize in source mode

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Wait for Quill to mount
    const timeout = setTimeout(() => {
      const editorRoot = wrapper.querySelector(".ql-editor") as HTMLElement | null;
      if (!editorRoot) return;

      let overlay: HTMLDivElement | null = null;
      let activeImg: HTMLImageElement | null = null;

      const removeOverlay = () => {
        overlay?.remove();
        overlay = null;
        activeImg = null;
      };

      const positionOverlay = () => {
        if (!overlay || !activeImg) return;
        const rootRect = editorRoot.getBoundingClientRect();
        const imgRect = activeImg.getBoundingClientRect();
        overlay.style.left = `${imgRect.left - rootRect.left + editorRoot.scrollLeft}px`;
        overlay.style.top = `${imgRect.top - rootRect.top + editorRoot.scrollTop}px`;
        overlay.style.width = `${imgRect.width}px`;
        overlay.style.height = `${imgRect.height}px`;
      };

      const selectImage = (img: HTMLImageElement) => {
        removeOverlay();
        activeImg = img;
        editorRoot.style.position = "relative";

        overlay = document.createElement("div");
        overlay.setAttribute("data-rte-resize", "1");
        overlay.style.cssText =
          "position:absolute;border:2px solid #6FB644;box-sizing:border-box;pointer-events:none;z-index:10;";
        positionOverlay();
        editorRoot.appendChild(overlay);

        // Corner handles
        (["se", "sw", "ne", "nw"] as const).forEach((corner) => {
          const handle = document.createElement("div");
          const right = corner.includes("e");
          const bottom = corner.includes("s");
          handle.style.cssText = `
            position:absolute;width:12px;height:12px;
            background:#6FB644;border:2px solid #fff;
            pointer-events:auto;cursor:${corner}-resize;
            ${right ? "right:-6px" : "left:-6px"};
            ${bottom ? "bottom:-6px" : "top:-6px"};
          `;
          handle.dataset.corner = corner;
          overlay!.appendChild(handle);
        });

        // Width label
        const label = document.createElement("div");
        label.style.cssText =
          "position:absolute;bottom:-26px;left:50%;transform:translateX(-50%);background:#6FB644;color:#fff;font-size:11px;padding:2px 8px;pointer-events:none;white-space:nowrap;";
        label.textContent = `${Math.round(img.getBoundingClientRect().width)}px`;
        overlay.appendChild(label);

        // Drag resize
        let dragging = false;
        let startX = 0;
        let startW = 0;
        let dragCorner = "";

        const onPointerMove = (e: PointerEvent) => {
          if (!dragging || !activeImg) return;
          e.preventDefault();
          const dx = e.clientX - startX;
          const newW = Math.max(40, dragCorner.includes("w") ? startW - dx : startW + dx);
          activeImg.style.width = `${newW}px`;
          activeImg.style.height = "auto";
          activeImg.setAttribute("width", String(Math.round(newW)));
          activeImg.removeAttribute("height");
          positionOverlay();
          label.textContent = `${Math.round(newW)}px`;
        };

        const onPointerUp = () => {
          if (!dragging) return;
          dragging = false;
          document.body.style.userSelect = "";
          document.removeEventListener("pointermove", onPointerMove);
          document.removeEventListener("pointerup", onPointerUp);
          // Sync to parent
          onChangeRef.current(editorRoot.innerHTML);
        };

        overlay.addEventListener("pointerdown", (e) => {
          const target = e.target as HTMLElement;
          if (!target.dataset.corner || !activeImg) return;
          e.preventDefault();
          e.stopPropagation();
          dragging = true;
          dragCorner = target.dataset.corner;
          startX = e.clientX;
          startW = activeImg.getBoundingClientRect().width;
          document.body.style.userSelect = "none";
          document.addEventListener("pointermove", onPointerMove);
          document.addEventListener("pointerup", onPointerUp);
        });
      };

      // Click handler on editor
      const onClick = (e: MouseEvent) => {
        const t = e.target as HTMLElement;
        if (t.tagName === "IMG") {
          selectImage(t as HTMLImageElement);
        } else if (!t.dataset.corner && t.getAttribute("data-rte-resize") !== "1") {
          removeOverlay();
        }
      };

      // Click outside editor
      const onOutside = (e: MouseEvent) => {
        if (!wrapper.contains(e.target as Node)) removeOverlay();
      };

      editorRoot.addEventListener("click", onClick);
      document.addEventListener("mousedown", onOutside);

      // Cleanup stored in ref for the effect return
      return () => {
        editorRoot.removeEventListener("click", onClick);
        document.removeEventListener("mousedown", onOutside);
        removeOverlay();
      };
    }, 300);

    return () => clearTimeout(timeout);
  }, [sourceMode]);

  // Insert image when pendingImageUrl changes
  useEffect(() => {
    if (!pendingImageUrl) return;
    try {
      const quill = quillRef.current;
      const editor = quill?.getEditor?.() ?? quill?.editor;
      if (editor) {
        const range = editor.getSelection() || {
          index: editor.getLength() - 1,
        };
        editor.insertEmbed(range.index, "image", pendingImageUrl);
        editor.setSelection(range.index + 1);
      }
    } catch {
      onChange(value + `<p><img src="${pendingImageUrl}"></p>`);
    }
    onImageInserted?.();
  }, [pendingImageUrl]);

  return (
    <div className="rich-text-editor" ref={wrapperRef}>
      {/* Source toggle */}
      <div className="flex justify-end mb-1">
        <button
          type="button"
          onClick={() => setSourceMode(!sourceMode)}
          className={`text-xs px-2.5 py-1 font-medium transition-colors ${
            sourceMode
              ? "bg-[#6FB644] text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {sourceMode ? "Visual Editor" : "< > Source Code"}
        </button>
      </div>

      {sourceMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[280px] px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono text-gray-700 focus:ring-2 focus:ring-[#6FB644] outline-none resize-y bg-gray-50"
          placeholder="Edit HTML source code..."
        />
      ) : (
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={quillModules}
          formats={formats}
          placeholder="Add detailed product information..."
        />
      )}
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-size: 14px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-editor img {
          cursor: pointer;
          max-width: 100%;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
