"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Move } from "lucide-react";

interface ImagePositionerProps {
  image: string;
  position: number; // 0-100, vertical percentage
  onPositionChange: (position: number) => void;
  onClickSelect: () => void;
  height?: number;
}

export default function ImagePositioner({
  image,
  position,
  onPositionChange,
  onClickSelect,
  height = 192,
}: ImagePositionerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!image) return;
    e.preventDefault();
    setDragging(true);

    const startY = e.clientY;
    const startPos = position;

    const onMove = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      // Map pixel movement to position change (inverted: drag down = show higher part)
      const sensitivity = 0.3;
      const newPos = Math.max(0, Math.min(100, startPos + dy * sensitivity));
      onPositionChange(Math.round(newPos));
    };

    const onUp = () => {
      setDragging(false);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
    };

    document.body.style.userSelect = "none";
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  if (!image) {
    return (
      <button
        type="button"
        onClick={onClickSelect}
        style={{ height }}
        className="w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-[#6FB644] transition-colors flex flex-col items-center justify-center overflow-hidden group"
      >
        <ImageIcon className="w-10 h-10 text-gray-400 group-hover:text-[#6FB644] transition-colors mb-2" />
        <span className="text-sm text-gray-400 group-hover:text-[#6FB644] transition-colors">
          Click to select image
        </span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className={`relative w-full rounded-lg border-2 border-dashed overflow-hidden group ${
        dragging ? "border-[#6FB644] cursor-grabbing" : "border-gray-300 hover:border-[#6FB644]"
      }`}
    >
      <Image
        src={image}
        alt="Category"
        fill
        className="object-cover pointer-events-none select-none"
        style={{ objectPosition: `center ${position}%` }}
        draggable={false}
      />

      {/* Drag overlay */}
      <div
        onPointerDown={handlePointerDown}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      {/* Drag hint */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity ${
        dragging ? "opacity-0" : "opacity-0 group-hover:opacity-100"
      }`}>
        <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5" />
          Drag to reposition
        </div>
      </div>

      {/* Change button */}
      <button
        type="button"
        onClick={onClickSelect}
        className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
      >
        Change Image
      </button>

      {/* Position indicator */}
      {dragging && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#6FB644] text-white text-[11px] font-medium px-2 py-0.5 rounded">
          {position}%
        </div>
      )}
    </div>
  );
}
