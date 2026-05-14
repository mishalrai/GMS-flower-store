import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/layout/PageBanner";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import PageRenderer from "@/components/PageRenderer";
import prisma from "@/lib/db";
import { AnyBlock } from "@/lib/blocks/types";
import ContactForm from "./ContactForm";

export default async function ContactPage() {
  const page = await prisma.page.findUnique({ where: { slug: "contact" } });
  const blocks = (page?.blocks as unknown as AnyBlock[] | undefined) ?? [];
  const contentBlocks =
    blocks[0]?.type === "cta" ? blocks.slice(1) : blocks;

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <PageBanner
          title="Contact Us"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Contact" },
          ]}
        />
        <PageRenderer blocks={contentBlocks} />
        {/* Contact form is interactive and always rendered below the page-builder blocks */}
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
