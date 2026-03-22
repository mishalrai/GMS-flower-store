"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/home/WhatsAppButton";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/faqs")
      .then((r) => r.json())
      .then((data: FAQ[]) => {
        setFaqs(data.filter((f) => f.active));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-500 text-center mb-10">
              Find answers to common questions about our plants and services.
            </p>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
              </div>
            ) : faqs.length === 0 ? (
              <p className="text-center text-gray-400 py-12">
                No FAQs available yet.
              </p>
            ) : (
              <div>
                {faqs.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div key={faq.id} className="border-b border-gray-200">
                      <button
                        onClick={() =>
                          setOpenId(isOpen ? null : faq.id)
                        }
                        className="w-full flex items-center gap-5 px-5 py-5 text-left hover:bg-green-50/50 transition-colors"
                      >
                        <span className={`text-lg font-bold flex-shrink-0 transition-colors ${isOpen ? "text-[#6FB644]" : "text-gray-300"}`}>
                          Q
                        </span>
                        <span className={`flex-1 text-lg font-medium transition-colors ${isOpen ? "text-[#6FB644]" : "text-gray-800"}`}>
                          {faq.question}
                        </span>
                        <span
                          className={`text-xl leading-none flex-shrink-0 transition-all duration-300 ${
                            isOpen ? "rotate-45 text-[#6FB644]" : "text-gray-400"
                          }`}
                        >
                          +
                        </span>
                      </button>
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 pb-5 pl-14 text-base text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
