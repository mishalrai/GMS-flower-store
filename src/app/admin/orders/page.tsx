"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Order {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  customer: { name: string; phone: string; address: string };
  status: string;
  reviewEnabled: boolean;
  total: number;
  createdAt: string;
}

const statusTabs = ["all", "pending", "confirmed", "processing", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    note: "",
    total: "",
  });

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [],
        customer: {
          name: newOrder.customerName,
          phone: newOrder.customerPhone,
          address: newOrder.customerAddress,
          note: newOrder.note,
        },
        total: Number(newOrder.total) || 0,
      }),
    });
    if (res.ok) {
      const order = await res.json();
      setOrders([...orders, order]);
      setShowNewOrder(false);
      setNewOrder({ customerName: "", customerPhone: "", customerAddress: "", note: "", total: "" });
    }
  };

  const filtered =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Orders ({orders.length})
        </h1>
        <button
          onClick={() => setShowNewOrder(!showNewOrder)}
          className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New WhatsApp Order
        </button>
      </div>

      {/* New Order Form (for WhatsApp orders) */}
      {showNewOrder && (
        <form
          onSubmit={handleCreateOrder}
          className="bg-white rounded-xl border border-gray-100 p-6 mb-6"
        >
          <h3 className="font-semibold mb-4">Create Order (WhatsApp Purchase)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Customer Name"
              value={newOrder.customerName}
              onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
            <input
              required
              placeholder="Phone (e.g. +977-98XXXXXXXX)"
              value={newOrder.customerPhone}
              onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
            <input
              required
              placeholder="Address"
              value={newOrder.customerAddress}
              onChange={(e) => setNewOrder({ ...newOrder, customerAddress: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
            <input
              placeholder="Total (Rs)"
              type="number"
              value={newOrder.total}
              onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
            />
          </div>
          <textarea
            placeholder="Notes"
            value={newOrder.note}
            onChange={(e) => setNewOrder({ ...newOrder, note: e.target.value })}
            className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none resize-none"
            rows={2}
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowNewOrder(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#6FB644] text-white rounded-lg hover:bg-[#5a9636]"
            >
              Create Order
            </button>
          </div>
        </form>
      )}

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {statusTabs.map((tab) => {
          const count =
            tab === "all"
              ? orders.length
              : orders.filter((o) => o.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-[#6FB644] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Order ID
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Items
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{order.id}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{order.customer.name}</p>
                  <p className="text-xs text-gray-500">{order.customer.phone}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {order.items.length} items
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  Rs {order.total.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    title="View order details"
                    className="p-1.5 text-[#6FB644] hover:bg-green-50 rounded inline-flex"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">No orders found.</div>
        )}
      </div>
    </div>
  );
}
