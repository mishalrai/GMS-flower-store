import { blockRegistry } from "@/lib/blocks/registry";
import { AnyBlock } from "@/lib/blocks/types";

export default function PageRenderer({ blocks }: { blocks: AnyBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        const Component = blockRegistry[block.type] as React.ComponentType<{
          settings: typeof block.settings;
        }>;
        if (!Component) return null;
        return <Component key={block.id} settings={block.settings} />;
      })}
    </>
  );
}
