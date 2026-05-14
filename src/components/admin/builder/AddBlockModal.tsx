"use client";

import { X } from "lucide-react";
import { BlockType } from "@/lib/blocks/types";
import { blockMetaList } from "./blockMeta";

export default function AddBlockModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: BlockType) => void;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Add a block</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {blockMetaList.map((meta) => (
              <button
                key={meta.type}
                onClick={() => onPick(meta.type)}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#6FB644] hover:bg-green-50/50 text-left transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                  <meta.icon className="w-5 h-5 text-[#6FB644]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">{meta.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
