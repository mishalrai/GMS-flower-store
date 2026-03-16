import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import { Leaf, Heart, Truck, Sun } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-r from-green-700 to-green-500 text-white py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About GMS Flower Store
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
              Growing happiness from our garden to your home in Gauradaha, Jhapa
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl h-80 flex items-center justify-center">
              <Leaf className="w-24 h-24 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Our Story
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                GMS Flower Store started as a small passion project in our home
                garden in Gauradaha, Jhapa, Nepal. What began with a few potted
                plants has grown into a thriving collection of indoor and outdoor
                plants that we lovingly nurture and share with our community.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Every plant in our store is grown with care in our own garden. We
                believe in sustainable gardening practices and take pride in
                offering healthy, vibrant plants that are perfectly adapted to
                the local climate of eastern Nepal.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our mission is simple: to make every home and office greener, one
                plant at a time. Whether you&apos;re a seasoned gardener or just
                starting your plant journey, we&apos;re here to help you find
                the perfect green companion.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Why Choose Us
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: Leaf,
                  title: "Home Grown",
                  desc: "All plants are grown in our own garden with love and care",
                },
                {
                  icon: Heart,
                  title: "Passion Driven",
                  desc: "We are passionate about plants and it shows in our quality",
                },
                {
                  icon: Truck,
                  title: "Safe Delivery",
                  desc: "Plants carefully packaged and delivered to your doorstep",
                },
                {
                  icon: Sun,
                  title: "Plant Care Tips",
                  desc: "Free plant care guidance with every purchase",
                },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-[#6FB644]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Visit Us</h2>
            <p className="text-gray-600 mb-2">GMS Flower Store</p>
            <p className="text-gray-600 mb-2">Gauradaha, Jhapa, Nepal</p>
            <p className="text-gray-600 mb-6">Open: 7:00 AM - 6:00 PM (Sun-Fri)</p>
            <a
              href="https://wa.me/9779840036888?text=Hi! I'd like to visit your store."
              className="inline-block bg-[#6FB644] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#5a9636] transition-colors"
            >
              Contact Us on WhatsApp
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
