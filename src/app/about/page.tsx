import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/layout/PageBanner";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import PageRenderer from "@/components/PageRenderer";
import prisma from "@/lib/db";
import { AnyBlock } from "@/lib/blocks/types";

export default async function AboutPage() {
  const page = await prisma.page.findUnique({ where: { slug: "about" } });
  const blocks = (page?.blocks as unknown as AnyBlock[] | undefined) ?? [];
  const contentBlocks =
    blocks[0]?.type === "cta" ? blocks.slice(1) : blocks;

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <PageBanner
          title="About Us"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "About" },
          ]}
        />
        <PageRenderer blocks={contentBlocks} />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
