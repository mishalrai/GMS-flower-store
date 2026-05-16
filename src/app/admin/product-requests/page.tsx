"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PackageSearch,
  Trash2,
  Phone,
  Mail,
  Search,
  TrendingUp,
  ChevronRight,
  X,
} from "lucide-react";
import Modal from "@/components/admin/Modal";
import CustomSelect from "@/components/ui/CustomSelect";
import { useToast } from "@/components/admin/Toast";

type Status = "pending" | "reviewing" | "available" | "rejected";

interface ProductRequest {
  id: number;
  productName: string;
  productSlug: string;
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: Status;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  requestCount: number;
}

interface StatsRow {
  productSlug: string;
  productName: string;
  latestStatus: Status;
  latestRequestAt: string | null;
  count: number;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "available", label: "Now Available" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewing: "bg-blue-50 text-blue-700 border-blue-200",
  available: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-gray-100 text-gray-600 border-gray-200",
};

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProductRequestsAdminPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [stats, setStats] = useState<StatsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "top">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProductRequest | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const [reqs, stat] = await Promise.all([
      fetch("/api/product-requests").then((r) => r.json()),
      fetch("/api/product-requests/stats").then((r) => r.json()),
    ]);
    setRequests(reqs);
    setStats(stat);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.productName.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.customerPhone.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requests, statusFilter, search]);

  const counts = useMemo(() => {
    const out = {
      total: requests.length,
      pending: 0,
      reviewing: 0,
      available: 0,
      rejected: 0,
    };
    for (const r of requests) out[r.status]++;
    return out;
  }, [requests]);

  const openRequest = (r: ProductRequest) => {
    setSelected(r);
    setNotesDraft(r.adminNotes || "");
  };

  const updateRequest = async (
    id: number,
    patch: { status?: Status; adminNotes?: string },
  ) => {
    const res = await fetch(`/api/product-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast("Failed to update request", "error");
      return null;
    }
    const updated = await res.json();
    setRequests((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
    );
    if (selected?.id === updated.id) setSelected({ ...selected, ...updated });
    return updated;
  };

  const handleStatusChange = async (status: Status) => {
    if (!selected) return;
    await updateRequest(selected.id, { status });
    toast("Status updated");
  };

  const saveNotes = async () => {
    if (!selected) return;
    await updateRequest(selected.id, { adminNotes: notesDraft });
    toast("Notes saved");
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const res = await fetch(`/api/product-requests/${deleteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== deleteId));
      if (selected?.id === deleteId) setSelected(null);
      toast("Request deleted");
      // Demand counts shift on delete — reload stats
      fetch("/api/product-requests/stats")
        .then((r) => r.json())
        .then(setStats);
    } else {
      toast("Failed to delete request", "error");
    }
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customer requests for products we don&apos;t currently stock.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 bg-gray-100 rounded-full text-gray-600">
            Total: <b className="text-gray-800">{counts.total}</b>
          </span>
          <span className="px-3 py-1.5 bg-yellow-50 rounded-full text-yellow-700">
            Pending: <b>{counts.pending}</b>
          </span>
          <span className="px-3 py-1.5 bg-blue-50 rounded-full text-blue-700">
            Reviewing: <b>{counts.reviewing}</b>
          </span>
          <span className="px-3 py-1.5 bg-green-50 rounded-full text-green-700">
            Available: <b>{counts.available}</b>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === "all"
              ? "border-[#6FB644] text-[#6FB644]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <PackageSearch className="w-4 h-4" /> All Requests
        </button>
        <button
          onClick={() => setTab("top")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === "top"
              ? "border-[#6FB644] text-[#6FB644]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Top Requested
        </button>
      </div>

      {tab === "all" ? (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product, customer, phone..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none"
              />
            </div>
            <div className="flex gap-1.5">
              {(["all", ...STATUS_OPTIONS.map((s) => s.value)] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${
                      statusFilter === s
                        ? "bg-[#6FB644] border-[#6FB644] text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {s === "all"
                      ? "All"
                      : STATUS_OPTIONS.find((o) => o.value === s)?.label}
                  </button>
                ),
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center text-gray-400">
              <PackageSearch className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">No requests match the current filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Demand</th>
                    <th className="px-4 py-3 text-left">Requested</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => openRequest(r)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {r.productName}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {r.description}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800">{r.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {r.customerPhone}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLE[r.status]}`}
                        >
                          {STATUS_OPTIONS.find((o) => o.value === r.status)
                            ?.label || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.requestCount > 1 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6FB644]/10 text-[#6FB644] text-xs font-semibold">
                            <TrendingUp className="w-3 h-3" />
                            {r.requestCount}× requested
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">1×</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-300 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        // Top Requested tab
        <>
          {stats.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">No requests yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Times Requested</th>
                    <th className="px-4 py-3 text-left">Latest Status</th>
                    <th className="px-4 py-3 text-left">Last Requested</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.map((s) => (
                    <tr
                      key={s.productSlug}
                      onClick={() => {
                        setTab("all");
                        setSearch(s.productName);
                        setStatusFilter("all");
                      }}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {s.productName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6FB644]/10 text-[#6FB644] text-xs font-semibold">
                          <TrendingUp className="w-3 h-3" />
                          {s.count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLE[s.latestStatus]}`}
                        >
                          {STATUS_OPTIONS.find(
                            (o) => o.value === s.latestStatus,
                          )?.label || s.latestStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {s.latestRequestAt ? formatDate(s.latestRequestAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-[#6FB644] font-medium">
                        View →
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Detail panel */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelected(null)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Request Detail</h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <p className="text-xs text-gray-400 mb-1">Product</p>
                <p className="font-semibold text-gray-800 text-lg">
                  {selected.productName}
                </p>
                {selected.requestCount > 1 && (
                  <p className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6FB644]/10 text-[#6FB644] text-xs font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    Requested {selected.requestCount} times in total
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selected.description}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Customer</p>
                <p className="text-sm text-gray-800">{selected.customerName}</p>
                <a
                  href={`tel:${selected.customerPhone}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#6FB644]"
                >
                  <Phone className="w-3.5 h-3.5" /> {selected.customerPhone}
                </a>
                {selected.customerEmail && (
                  <a
                    href={`mailto:${selected.customerEmail}`}
                    className="mt-1 ml-3 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#6FB644]"
                  >
                    <Mail className="w-3.5 h-3.5" /> {selected.customerEmail}
                  </a>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Submitted</p>
                <p className="text-sm text-gray-700">
                  {formatDate(selected.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <CustomSelect
                  value={selected.status}
                  onChange={(v) => handleStatusChange(v as Status)}
                  options={STATUS_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Internal notes
                </label>
                <textarea
                  rows={4}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] outline-none resize-none"
                  placeholder="Sourcing notes, supplier contacts, ETA..."
                />
                <button
                  onClick={saveNotes}
                  className="mt-2 px-3 py-1.5 bg-[#6FB644] text-white text-xs font-medium rounded-lg hover:bg-[#5a9636]"
                >
                  Save notes
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setDeleteId(selected.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" /> Delete request
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete request"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this product request? This cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
