import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/layout/PageBanner";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import RequestProductForm from "./RequestProductForm";

export const metadata = {
  title: "Request a Product",
  description:
    "Looking for a plant or product we don't carry yet? Tell us what you need and we'll do our best to source it.",
};

export default function RequestProductPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <PageBanner
          title="Request a Product"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Request a Product" },
          ]}
        />
        <RequestProductForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
