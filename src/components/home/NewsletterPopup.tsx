"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <section className="bg-[#6FB644] py-16 px-4">
      <div className="max-w-3xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Subscribe to Our Newsletter
        </h2>
        <p className="text-lg opacity-90 mb-8">
          Get updates on new plants, care tips, and special offers
        </p>

        {subscribed ? (
          <div className="bg-white/20 backdrop-blur rounded-xl py-4 px-6 inline-block">
            <p className="text-lg font-semibold">
              🌿 Thank you for subscribing!
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-full text-gray-800 outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-white text-[#6FB644] px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
