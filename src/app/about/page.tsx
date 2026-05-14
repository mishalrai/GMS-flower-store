import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import PageRenderer from "@/components/PageRenderer";
import prisma from "@/lib/db";
import { AnyBlock } from "@/lib/blocks/types";

export default async function AboutPage() {
  const page = await prisma.page.findUnique({ where: { slug: "about" } });
  const blocks = (page?.blocks as unknown as AnyBlock[] | undefined) ?? [];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <PageRenderer blocks={blocks} />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
