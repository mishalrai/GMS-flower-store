import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrustBanner from "@/components/home/TrustBanner";
import Testimonials from "@/components/home/Testimonials";
import WhatsAppButton from "@/components/home/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroBanner />
        <CategoryGrid />
        <FeaturedProducts />
        <TrustBanner />
        <Testimonials />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
