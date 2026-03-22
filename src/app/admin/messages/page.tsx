"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  MailOpen,
  Trash2,
  Phone,
  Clock,
  X,
  MessageSquare,
  Search,
} from "lucide-react";
import Modal from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      });
  }, []);

  const markAsRead = async (msg: Message) => {
    if (msg.read) return;
    const res = await fetch(`/api/messages/${msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMessages(messages.map((m) => (m.id === updated.id ? updated : m)));
      if (selected?.id === updated.id) setSelected(updated);
    }
  };

  const markAsUnread = async (msg: Message) => {
    const res = await fetch(`/api/messages/${msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: false }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMessages(messages.map((m) => (m.id === updated.id ? updated : m)));
      if (selected?.id === updated.id) setSelected(updated);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/messages/${deleteId}`, { method: "DELETE" });
    setMessages(messages.filter((m) => m.id !== deleteId));
    if (selected?.id === deleteId) setSelected(null);
    setDeleteId(null);
    toast("Message deleted successfully");
  };

  const openMessage = (msg: Message) => {
    setSelected(msg);
    markAsRead(msg);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  const filtered = messages.filter((m) => {
    if (filter === "unread" && m.read) return false;
    if (filter === "read" && !m.read) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6FB644] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">
          Messages
          {unreadCount > 0 && (
            <span className="ml-2 text-sm font-medium text-[#6FB644]">
              {unreadCount} unread
            </span>
          )}
        </h1>
        {/* Filter Tabs */}
        <div className="flex gap-1">
          {(["all", "unread", "read"] as const).map((tab) => {
            const count =
              tab === "all"
                ? messages.length
                : tab === "unread"
                  ? unreadCount
                  : messages.length - unreadCount;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  filter === tab
                    ? "bg-[#6FB644] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Gmail-style Split View */}
      <div className="flex flex-1 min-h-0 bg-white rounded-xl overflow-hidden">
        {/* Left: Message List */}
        <div
          className="w-[380px] flex-shrink-0 border-r border-gray-100 flex flex-col"
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6FB644] focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No messages</p>
              <p className="text-gray-400 text-xs mt-1">
                Messages from the contact form will appear here
              </p>
            </div>
          ) : (
            <div>
              {filtered.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`group flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
                    selected?.id === msg.id
                      ? "bg-[#6FB644]/5 border-l-2 border-l-[#6FB644]"
                      : "hover:bg-gray-50"
                  } ${!msg.read ? "bg-green-50/40" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                      !msg.read
                        ? "bg-[#6FB644] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {msg.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm truncate ${
                          !msg.read
                            ? "font-semibold text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {msg.name}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${!msg.read ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                      {msg.message}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {msg.email}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!msg.read && (
                    <div className="w-2 h-2 rounded-full bg-[#6FB644] flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Right: Message Detail */}
        {selected ? (
          <div className="flex-1 overflow-y-auto">
            {/* Detail Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6FB644] flex items-center justify-center">
                  <span className="text-base font-bold text-white">
                    {selected.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selected.name}</p>
                  <p className="text-xs text-gray-400">{selected.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {formatDate(selected.createdAt)}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  title="Close"
                  className="p-1.5 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Detail Body */}
            <div className="px-6 py-6">
              {/* Contact Info */}
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 hover:text-[#6FB644]">
                  <Mail className="w-4 h-4" />
                  {selected.email}
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 hover:text-[#6FB644]">
                    <Phone className="w-4 h-4" />
                    {selected.phone}
                  </a>
                )}
              </div>

              {/* Message Content */}
              <div className="bg-gray-50 rounded-lg p-5">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() =>
                    selected.read
                      ? markAsUnread(selected)
                      : markAsRead(selected)
                  }
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                >
                  {selected.read ? (
                    <>
                      <Mail className="w-4 h-4" />
                      Mark Unread
                    </>
                  ) : (
                    <>
                      <MailOpen className="w-4 h-4" />
                      Mark Read
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDeleteId(selected.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <Mail className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Select a message to read</p>
              <p className="text-gray-300 text-sm mt-1">
                Choose from the list on the left
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Message"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this message? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
