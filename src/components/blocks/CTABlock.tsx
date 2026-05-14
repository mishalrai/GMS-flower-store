"use client";

import Link from "next/link";
import Image from "next/image";
import { BlockSettings } from "@/lib/blocks/types";

export default function CTABlock({ settings }: { settings: BlockSettings["cta"] }) {
  const align = settings.align ?? "center";
  const hasBgImage = !!settings.bgImage;
  const bgColor = settings.bgColor || "#6FB644";

  return (
    <section
      className="relative py-16 md:py-20 px-4 overflow-hidden"
      style={!hasBgImage ? { backgroundColor: bgColor } : undefined}
    >
      {hasBgImage && (
        <>
          <Image src={settings.bgImage!} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/45" />
        </>
      )}
      <div
        className={`relative max-w-3xl mx-auto z-10 ${align === "center" ? "text-center" : "text-left"}`}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow">
          {settings.title}
        </h2>
        {settings.subtitle && (
          <p className="text-lg text-white/90 mb-8 drop-shadow">{settings.subtitle}</p>
        )}
        {settings.buttonText && (
          <Link
            href={settings.buttonLink || "#"}
            className="inline-block bg-white text-gray-800 px-8 py-3 font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            {settings.buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}
