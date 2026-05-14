import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import PageRenderer from "@/components/PageRenderer";
import prisma from "@/lib/db";
import { AnyBlock } from "@/lib/blocks/types";
import ContactForm from "./ContactForm";

export default async function ContactPage() {
  const page = await prisma.page.findUnique({ where: { slug: "contact" } });
  const blocks = (page?.blocks as unknown as AnyBlock[] | undefined) ?? [];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <PageRenderer blocks={blocks} />
        {/* Contact form is interactive and always rendered below the page-builder blocks */}
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
