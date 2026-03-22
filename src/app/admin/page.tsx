"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  Plus,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  reviewed: boolean;
}

interface Order {
  id: string;
  items: OrderItem[];
  customer: { name: string; phone: string; address: string };
  status: string;
  total: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  inStock: boolean;
  price: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([ordersData, productsData]) => {
      setOrders(ordersData);
      setProducts(productsData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const outOfStock = products.filter((p) => !p.inStock);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-[#6FB644] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5a9636] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Orders
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={Package}
          color="#6FB644"
          href="/admin/products"
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingCart}
          color="#3B82F6"
          href="/admin/orders"
        />
        <StatCard
          title="Revenue"
          value={`Rs ${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="#10B981"
          href="/admin/orders"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={Clock}
          color={pendingOrders > 0 ? "#F59E0B" : "#10B981"}
          href="/admin/orders"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-sm text-[#6FB644] hover:underline"
            >
              View All
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No orders yet
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.customer.name}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      Rs {order.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#6FB644] hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Stock Alerts</h3>
            <Link
              href="/admin/products"
              className="text-sm text-[#6FB644] hover:underline"
            >
              Manage
            </Link>
          </div>
          {outOfStock.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              All products are in stock!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {outOfStock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-red-500">Out of Stock</p>
                  </div>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-xs text-[#6FB644] hover:underline"
                  >
                    Update
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
