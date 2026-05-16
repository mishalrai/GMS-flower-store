"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MessageCircle, CheckCircle, XCircle, QrCode, Banknote, MapPin, Navigation, ExternalLink, Package } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";

interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  reviewed: boolean;
  image: string | null;
  slug: string | null;
}

interface Payment {
  method: "cod" | "qr";
  qrLabel?: string;
  screenshotUrl?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  customer: { name: string; phone: string; address: string; note?: string; location?: { lat: number; lng: number } };
  payment?: Payment;
  status: string;
  reviewEnabled: boolean;
  total: number;
  createdAt: string;
  updatedAt: string;
}

const statuses = ["pending", "confirmed", "processing", "out-for-delivery", "delivered", "cancelled"];
const statusLabels: Record<string, string> = { "out-for-delivery": "Out for Delivery" };

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      });
  }, [id]);

  const updateOrder = async (updates: Partial<Order>) => {
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder(updated);
      toast("Order updated successfully");
    } else {
      toast("Failed to update order", "error");
    }
    setUpdating(false);
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
      </div>
    );
  }

  const whatsappMessage = `Hi ${order.customer.name}! Your order ${order.id} status: ${order.status}. Total: Rs ${order.total.toLocaleString()}.`;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/orders"
          title="Back to orders"
          className="p-2 hover:bg-gray-200 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Order {order.id}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Actions */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Order Status</h3>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => updateOrder({ status })}
                  disabled={updating || order.status === status}
                  className={`px-4 py-2 text-sm rounded-lg capitalize transition-colors ${
                    order.status === status
                      ? "bg-[#6FB644] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  } disabled:opacity-50`}
                >
                  {statusLabels[status] || status}
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
            {order.items.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No items (WhatsApp order — items managed offline)
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-3"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.slug ? (
                        <Link
                          href={`/products/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-sm text-gray-800 hover:text-[#6FB644] hover:underline"
                        >
                          {item.name}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <p className="font-medium text-sm">{item.name}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        SKU ID: {item.productId} · Qty {item.quantity} × Rs{" "}
                        {item.price.toLocaleString()}
                      </p>
                      <div className="mt-1">
                        {item.reviewed ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" /> Reviewed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <XCircle className="w-3 h-3" /> Not reviewed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm">
                        Rs {(item.quantity * item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>Rs {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Review Permission */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Review Permission
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {order.reviewEnabled
                    ? "Customer can submit product reviews for this order"
                    : "Reviews are disabled — enable manually for WhatsApp orders or wait for delivery"}
                </p>
              </div>
              <button
                onClick={() =>
                  updateOrder({ reviewEnabled: !order.reviewEnabled })
                }
                disabled={updating}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  order.reviewEnabled ? "bg-[#6FB644]" : "bg-gray-300"
                } disabled:opacity-50`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    order.reviewEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Customer</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium">{order.customer.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Address</p>
                <p className="font-medium">{order.customer.address}</p>
              </div>
              {order.customer.note && (
                <div>
                  <p className="text-gray-500">Note</p>
                  <p className="font-medium">{order.customer.note}</p>
                </div>
              )}
            </div>

            {/* Delivery Location Map */}
            {order.customer.location && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[#6FB644]" />
                  <p className="text-sm font-medium text-gray-700">Delivery Location</p>
                </div>
                <div className="rounded-lg overflow-hidden border border-gray-200 mb-3">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.customer.location.lng - 0.005}%2C${order.customer.location.lat - 0.003}%2C${order.customer.location.lng + 0.005}%2C${order.customer.location.lat + 0.003}&layer=mapnik&marker=${order.customer.location.lat}%2C${order.customer.location.lng}`}
                    className="w-full h-40"
                    style={{ border: 0 }}
                  />
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  {order.customer.location.lat.toFixed(6)}, {order.customer.location.lng.toFixed(6)}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${order.customer.location.lat},${order.customer.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            )}

            <a
              href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-2.5 rounded-lg text-sm font-medium mt-4 hover:bg-[#1da851] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Customer
            </a>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              {order.payment?.method === "qr" ? (
                <QrCode className="w-4 h-4 text-[#6FB644]" />
              ) : (
                <Banknote className="w-4 h-4 text-[#6FB644]" />
              )}
              Payment
            </h3>
            <div className="text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium capitalize">
                  {order.payment?.method === "qr"
                    ? `QR Pay (${order.payment.qrLabel})`
                    : "Cash on Delivery"}
                </span>
              </div>
              {order.payment?.method === "qr" && order.payment.screenshotUrl && (
                <div>
                  <p className="text-gray-500 mb-2">Payment Screenshot</p>
                  <a
                    href={order.payment.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative w-full aspect-[9/16] max-h-72 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={order.payment.screenshotUrl}
                      alt="Payment screenshot"
                      fill
                      className="object-cover"
                    />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Timeline</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
