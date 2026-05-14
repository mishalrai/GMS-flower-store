import sanitizeHtml from "sanitize-html";
import { BlockSettings } from "@/lib/blocks/types";

const widthClass = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  full: "max-w-none",
};

const sanitizeOpts: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "u",
    "s",
    "del",
    "ins",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["style", "class"],
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
};

export default function RichTextBlock({ settings }: { settings: BlockSettings["rich-text"] }) {
  const safe = sanitizeHtml(settings.content || "", sanitizeOpts);
  const align = settings.align ?? "left";
  const max = widthClass[settings.maxWidth ?? "md"];

  return (
    <section className="py-12 px-4">
      <div
        className={`${max} mx-auto prose prose-gray text-${align}`}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    </section>
  );
}
