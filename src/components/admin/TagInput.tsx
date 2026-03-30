"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products/tags")
      .then((r) => r.json())
      .then((data) => setAllTags(data))
      .catch(() => {});
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) {
      onChange([...tags, t]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input.replace(/,/g, ""));
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  // Filter suggestions: existing tags not already selected, matching input
  const suggestions = allTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(input.toLowerCase())
  );

  // Unused tags (not selected) for the "all tags" section
  const unusedTags = allTags.filter((t) => !tags.includes(t));

  return (
    <div ref={wrapperRef}>
      {/* Input */}
      <div className="relative">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length > 0 ? "Add more tags..." : "Type a tag and press Enter"}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && input && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
            {suggestions.slice(0, 10).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#6FB644]/10 hover:text-[#6FB644] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-[#6FB644] text-white text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-lg"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="hover:bg-white/20 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Existing tags from system */}
      {unusedTags.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] text-gray-400 mb-1.5">Existing tags</p>
          <div className="flex flex-wrap gap-1.5">
            {unusedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-[#6FB644]/10 hover:text-[#6FB644] transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
