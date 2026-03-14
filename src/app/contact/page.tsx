"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/home/WhatsAppButton";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-r from-green-700 to-green-500 text-white py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
              We&apos;d love to hear from you! Reach out for orders, questions,
              or plant care advice.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-8 text-gray-800">
                Get in Touch
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: MapPin,
                    title: "Address",
                    text: "Gauradaha, Jhapa, Nepal",
                  },
                  {
                    icon: Phone,
                    title: "Phone",
                    text: "+977-XXX-XXXXXXX",
                  },
                  {
                    icon: Mail,
                    title: "Email",
                    text: "gmsflowerstore@gmail.com",
                  },
                  {
                    icon: Clock,
                    title: "Hours",
                    text: "Sun-Fri: 7:00 AM - 6:00 PM",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#6FB644]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <a
                  href="https://wa.me/977XXXXXXXXXX?text=Hi! I'd like to place an order."
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1da851] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Order via WhatsApp
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Send us a Message
              </h2>
              {submitted && (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
                  Thank you! We&apos;ll get back to you soon.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none"
                    placeholder="+977-XXX-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none resize-none"
                    placeholder="Tell us what you're looking for..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#6FB644] text-white py-3 rounded-lg font-semibold hover:bg-[#5a9636] transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
