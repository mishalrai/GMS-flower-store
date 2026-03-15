"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check, RotateCcw, RectangleHorizontal, Square, Smartphone } from "lucide-react";

interface ImageCropModalProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onClose: () => void;
}

const ASPECT_RATIOS = [
  { label: "Free", value: undefined, icon: RectangleHorizontal },
  { label: "1:1", value: 1, icon: Square },
  { label: "4:3", value: 4 / 3, icon: RectangleHorizontal },
  { label: "16:9", value: 16 / 9, icon: RectangleHorizontal },
  { label: "9:16", value: 9 / 16, icon: Smartphone },
];

function getCenterCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect?: number
): Crop {
  if (!aspect) {
    return {
      unit: "%",
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    };
  }
  return centerCrop(
    makeAspectCrop(
      { unit: "%", width: 80 },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function cropImageToCanvas(
  image: HTMLImageElement,
  crop: PixelCrop
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}

export default function ImageCropModal({
  imageUrl,
  onCropComplete,
  onClose,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const newCrop = getCenterCrop(width, height, aspect);
      setCrop(newCrop);
    },
    [aspect]
  );

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop = getCenterCrop(width, height, newAspect);
      setCrop(newCrop);
    }
  };

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;

    setSaving(true);
    const canvas = cropImageToCanvas(imgRef.current, completedCrop);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
        setSaving(false);
      },
      "image/jpeg",
      0.95
    );
  };

  const handleReset = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(getCenterCrop(width, height, aspect));
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Crop Image</h3>
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Aspect Ratio Toolbar */}
          <div className="flex items-center gap-2 px-6 py-3 border-b bg-gray-50">
            <span className="text-xs text-gray-500 font-medium mr-2">
              Aspect:
            </span>
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.label}
                onClick={() => handleAspectChange(ratio.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  (aspect === ratio.value) || (!aspect && !ratio.value)
                    ? "bg-[#6FB644] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <ratio.icon className="w-3.5 h-3.5" />
                {ratio.label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={handleReset}
              title="Reset crop"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Crop Area */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-100 min-h-0">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-h-[60vh]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxHeight: "60vh", maxWidth: "100%" }}
              />
            </ReactCrop>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-xs text-gray-400">
              Drag to adjust the crop area
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!completedCrop || saving}
                className="flex items-center gap-2 px-5 py-2 bg-[#6FB644] text-white text-sm font-medium rounded-lg hover:bg-[#5a9636] transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {saving ? "Saving..." : "Save Crop"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
