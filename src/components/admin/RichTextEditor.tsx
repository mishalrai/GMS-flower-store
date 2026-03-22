"use client";

import dynamic from "next/dynamic";
import { useRef, useMemo, useEffect, useCallback } from "react";
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

  useEffect(() => {
    imageClickRef.current = onImageClick;
  }, [onImageClick]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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

  // Image resize: attach to wrapper div via event delegation
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let overlay: HTMLDivElement | null = null;
    let activeImg: HTMLImageElement | null = null;
    let editorRoot: HTMLElement | null = null;

    const getEditorRoot = () => {
      if (editorRoot) return editorRoot;
      editorRoot = wrapper.querySelector(".ql-editor") as HTMLElement | null;
      return editorRoot;
    };

    const removeOverlay = () => {
      if (overlay) {
        overlay.remove();
        overlay = null;
      }
      activeImg = null;
    };

    const updateOverlayPosition = () => {
      const root = getEditorRoot();
      if (!overlay || !activeImg || !root) return;
      const rootRect = root.getBoundingClientRect();
      const imgRect = activeImg.getBoundingClientRect();
      overlay.style.left = `${imgRect.left - rootRect.left + root.scrollLeft}px`;
      overlay.style.top = `${imgRect.top - rootRect.top + root.scrollTop}px`;
      overlay.style.width = `${imgRect.width}px`;
      overlay.style.height = `${imgRect.height}px`;
    };

    const showOverlay = (img: HTMLImageElement) => {
      const root = getEditorRoot();
      if (!root) return;
      removeOverlay();
      activeImg = img;
      root.style.position = "relative";

      overlay = document.createElement("div");
      overlay.setAttribute("data-resize-overlay", "true");
      overlay.style.cssText =
        "position:absolute;border:2px solid #6FB644;box-sizing:border-box;pointer-events:none;z-index:10;";
      updateOverlayPosition();
      root.appendChild(overlay);

      // Four corner handles
      const corners = ["nw", "ne", "sw", "se"];
      corners.forEach((pos) => {
        const h = document.createElement("div");
        const isLeft = pos.includes("w");
        const isTop = pos.includes("n");
        h.style.cssText = `
          position:absolute;width:10px;height:10px;
          background:#6FB644;border:1px solid #fff;border-radius:2px;
          pointer-events:auto;cursor:${pos}-resize;
          ${isLeft ? "left:-5px" : "right:-5px"};
          ${isTop ? "top:-5px" : "bottom:-5px"};
        `;
        h.setAttribute("data-handle", pos);
        overlay!.appendChild(h);
      });

      // Size label
      const label = document.createElement("div");
      label.style.cssText =
        "position:absolute;bottom:-24px;left:50%;transform:translateX(-50%);background:#6FB644;color:#fff;font-size:11px;padding:1px 6px;border-radius:3px;pointer-events:none;white-space:nowrap;";
      label.textContent = `${Math.round(img.getBoundingClientRect().width)}px`;
      overlay.appendChild(label);

      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let handlePos = "";

      const onMouseMove = (e: MouseEvent) => {
        if (!activeImg) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        let newWidth: number;

        if (handlePos.includes("w")) {
          newWidth = Math.max(50, startWidth - dx);
        } else {
          newWidth = Math.max(50, startWidth + dx);
        }

        activeImg.style.width = `${newWidth}px`;
        activeImg.style.height = "auto";
        activeImg.setAttribute("width", String(newWidth));
        activeImg.removeAttribute("height");
        updateOverlayPosition();
        label.textContent = `${Math.round(newWidth)}px`;
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.userSelect = "";
        // Sync HTML back to parent
        const root = getEditorRoot();
        if (root) {
          onChangeRef.current(root.innerHTML);
        }
      };

      overlay.addEventListener("mousedown", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const pos = target.getAttribute("data-handle");
        if (!pos || !activeImg) return;
        e.preventDefault();
        e.stopPropagation();
        handlePos = pos;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = activeImg.getBoundingClientRect().width;
        startHeight = activeImg.getBoundingClientRect().height;
        document.body.style.userSelect = "none";
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });
    };

    const onEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" && getEditorRoot()?.contains(target)) {
        showOverlay(target as HTMLImageElement);
      } else if (
        !target.hasAttribute("data-handle") &&
        !target.hasAttribute("data-resize-overlay")
      ) {
        removeOverlay();
      }
    };

    const onDocClick = (e: MouseEvent) => {
      if (!wrapper.contains(e.target as Node)) {
        removeOverlay();
      }
    };

    // Use MutationObserver to wait for .ql-editor to appear, then attach
    wrapper.addEventListener("click", onEditorClick);
    document.addEventListener("mousedown", onDocClick);

    return () => {
      wrapper.removeEventListener("click", onEditorClick);
      document.removeEventListener("mousedown", onDocClick);
      removeOverlay();
    };
  }, []);

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
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={quillModules}
        formats={formats}
        placeholder="Add detailed product information..."
      />
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
