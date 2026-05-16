"use client";

import { useState } from "react";
import { PackageSearch, CheckCircle2 } from "lucide-react";

export default function RequestProductForm() {
  const [form, setForm] = useState({
    productName: "",
    description: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/product-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({
          productName: "",
          description: "",
          customerName: "",
          customerPhone: "",
          customerEmail: "",
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to submit request. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <CheckCircle2 className="w-14 h-14 text-[#6FB644] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Request received
          </h2>
          <p className="text-gray-600 mb-6">
            Thanks for letting us know what you&apos;re looking for. We&apos;ll get
            in touch as soon as we can source it.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center gap-2 bg-[#6FB644] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#5a9636] transition-colors"
          >
            Submit another request
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageSearch className="w-7 h-7 text-[#6FB644]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Request a Product
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Can&apos;t find what you&apos;re looking for in our shop? Tell us about
            the plant or product you&apos;d like us to stock and we&apos;ll do our
            best to source it.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none"
              placeholder="e.g. Variegated Monstera Albo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none resize-none"
              placeholder="Size, variation, quantity, where you've seen it sold, any reference links — the more detail, the better."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={form.customerPhone}
                onChange={(e) =>
                  setForm({ ...form, customerPhone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none"
                placeholder="+977-XXX-XXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={form.customerEmail}
              onChange={(e) =>
                setForm({ ...form, customerEmail: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-[#6FB644] text-white py-3 rounded-lg font-semibold hover:bg-[#5a9636] transition-colors disabled:opacity-50"
          >
            {sending ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </section>
  );
}
