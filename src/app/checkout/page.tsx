"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  Upload,
  X,
  QrCode,
  Banknote,
  ImageIcon,
} from "lucide-react";

interface PaymentQR {
  id: string;
  label: string;
  image: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const screenshotRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<PaymentQR[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "qr">("cod");
  const [selectedQR, setSelectedQR] = useState<PaymentQR | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const codes = data.paymentQRCodes || [];
        setQrCodes(codes);
      });
  }, []);

  const handleScreenshotUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScreenshotPreview(URL.createObjectURL(file));
    setUploadingScreenshot(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setScreenshotUrl(data.url);
      }
    } catch {
      setScreenshotPreview("");
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const removeScreenshot = () => {
    setScreenshotPreview("");
    setScreenshotUrl("");
    if (screenshotRef.current) screenshotRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "qr" && !screenshotUrl) {
      return;
    }

    setSubmitting(true);

    const orderItems = items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.salePrice || item.product.price,
    }));

    const payment =
      paymentMethod === "qr"
        ? {
            method: "qr" as const,
            qrLabel: selectedQR?.label || "",
            screenshotUrl,
          }
        : { method: "cod" as const };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: orderItems,
        customer: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          note: form.note || undefined,
        },
        payment,
        total,
      }),
    });

    if (res.ok) {
      const order = await res.json();
      setOrderId(order.id);
      clearCart();
    }

    setSubmitting(false);
  };

  // Order success screen
  if (orderId) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#6FB644]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-500 mb-1">
              Your order ID is{" "}
              <span className="font-bold text-[#6FB644]">{orderId}</span>
            </p>
            <p className="text-gray-400 text-sm mb-8">
              {paymentMethod === "qr"
                ? "Your payment screenshot has been submitted. We will verify and confirm your order shortly."
                : "We will contact you on WhatsApp to confirm your order and arrange delivery."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shop"
                className="px-6 py-3 bg-[#6FB644] text-white rounded-lg font-medium hover:bg-[#5a9636] transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Your cart is empty
            </h1>
            <p className="text-gray-500 mb-6">
              Add some plants before checking out.
            </p>
            <Link
              href="/shop"
              className="px-6 py-3 bg-[#6FB644] text-white rounded-lg font-medium hover:bg-[#5a9636] transition-colors"
            >
              Browse Plants
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            title="Go back"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} id="checkout-form">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  Delivery Information
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+977-98XXXXXXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="Street, area, city"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Note{" "}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      value={form.note}
                      onChange={(e) =>
                        setForm({ ...form, note: e.target.value })
                      }
                      placeholder="Any special instructions..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] focus:border-transparent outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Payment Method
                </h2>

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {/* COD Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("cod");
                      setSelectedQR(null);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#6FB644] bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        paymentMethod === "cod"
                          ? "bg-[#6FB644] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-gray-500">
                        Pay when you receive
                      </p>
                    </div>
                  </button>

                  {/* QR Pay Option */}
                  {qrCodes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("qr");
                        if (!selectedQR && qrCodes.length > 0) {
                          setSelectedQR(qrCodes[0]);
                        }
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === "qr"
                          ? "border-[#6FB644] bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          paymentMethod === "qr"
                            ? "bg-[#6FB644] text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          Scan QR & Pay
                        </p>
                        <p className="text-xs text-gray-500">
                          eSewa, Khalti, Bank
                        </p>
                      </div>
                    </button>
                  )}
                </div>

                {/* QR Payment Flow */}
                {paymentMethod === "qr" && qrCodes.length > 0 && (
                  <div className="border-t pt-6">
                    {/* Step 1: Select QR */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Step 1: Select payment method & scan QR
                      </p>

                      {/* QR tabs */}
                      {qrCodes.length > 1 && (
                        <div className="flex gap-2 mb-4 overflow-x-auto">
                          {qrCodes.map((qr) => (
                            <button
                              key={qr.id}
                              type="button"
                              onClick={() => setSelectedQR(qr)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                selectedQR?.id === qr.id
                                  ? "bg-[#6FB644] text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {qr.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* QR Image */}
                      {selectedQR && (
                        <div className="flex flex-col items-center">
                          <div className="relative w-64 h-64 bg-white border-2 border-gray-200 rounded-xl overflow-hidden p-2">
                            <Image
                              src={selectedQR.image}
                              alt={selectedQR.label}
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                          <p className="text-sm font-medium text-gray-700 mt-3">
                            {selectedQR.label}
                          </p>
                          <p className="text-lg font-bold text-[#6FB644]">
                            Rs {total.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Scan the QR code and pay the exact amount shown above
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Step 2: Upload Screenshot */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Step 2: Upload payment screenshot *
                      </p>

                      {screenshotPreview || screenshotUrl ? (
                        <div className="relative inline-block">
                          <div className="relative w-48 h-72 rounded-xl overflow-hidden border-2 border-gray-200">
                            <Image
                              src={screenshotPreview || screenshotUrl}
                              alt="Payment screenshot"
                              fill
                              className="object-cover"
                            />
                            {uploadingScreenshot && (
                              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                <div className="animate-spin w-6 h-6 border-2 border-[#6FB644] border-t-transparent rounded-full" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={removeScreenshot}
                            title="Remove screenshot"
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 border"
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </button>
                          {screenshotUrl && !uploadingScreenshot && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Screenshot uploaded
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => screenshotRef.current?.click()}
                          className="flex flex-col items-center justify-center gap-2 w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#6FB644] hover:bg-green-50 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            Upload Screenshot
                          </span>
                          <span className="text-[10px] text-gray-400">
                            JPG, PNG accepted
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* COD info */}
                {paymentMethod === "cod" && (
                  <p className="text-sm text-gray-500">
                    Pay with cash when your order is delivered. Our team will
                    contact you via WhatsApp to confirm.
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  const price = item.product.salePrice || item.product.price;
                  return (
                    <div
                      key={item.product.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {item.product.size} &middot; Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-700 flex-shrink-0">
                        Rs {(price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>Rs {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>
                  <span className="text-[#6FB644]">
                    {total >= 2000 ? "Free" : "Calculated after confirmation"}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Payment</span>
                  <span className="font-medium text-gray-700">
                    {paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : selectedQR?.label || "QR Pay"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#6FB644]">
                    Rs {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={
                  submitting ||
                  uploadingScreenshot ||
                  (paymentMethod === "qr" && !screenshotUrl)
                }
                className="w-full mt-6 bg-[#6FB644] text-white py-3 rounded-lg font-semibold hover:bg-[#5a9636] transition-colors disabled:opacity-50"
              >
                {submitting
                  ? "Placing Order..."
                  : paymentMethod === "qr" && !screenshotUrl
                    ? "Upload Payment Screenshot"
                    : "Place Order"}
              </button>

              {paymentMethod === "qr" && !screenshotUrl && (
                <p className="text-center text-xs text-red-400 mt-2">
                  Please scan QR, pay, and upload your payment screenshot
                </p>
              )}

              <p className="text-center text-xs text-gray-400 mt-3">
                By placing this order, you agree to be contacted via WhatsApp
                for order confirmation.
              </p>
            </div>
          </div>
        </div>
      </main>
      <input
        ref={screenshotRef}
        type="file"
        accept="image/*"
        onChange={handleScreenshotUpload}
        className="hidden"
      />
      <Footer />
    </>
  );
}
