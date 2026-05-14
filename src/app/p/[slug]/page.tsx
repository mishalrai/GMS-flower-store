import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import PageRenderer from "@/components/PageRenderer";
import prisma from "@/lib/db";
import { AnyBlock } from "@/lib/blocks/types";

const RESERVED = new Set(["home", "about", "contact"]);

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (RESERVED.has(slug)) notFound();

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.published) notFound();

  const blocks = (page.blocks as unknown as AnyBlock[] | undefined) ?? [];

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  return { title: page?.title ?? "Page" };
}
