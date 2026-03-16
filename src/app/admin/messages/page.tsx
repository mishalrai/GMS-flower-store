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
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Messages ({messages.length})
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[#6FB644] font-medium mt-1">
              {unreadCount} unread
            </p>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
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
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === tab
                  ? "bg-[#6FB644] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex gap-6">
        {/* Message List */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Customer messages from the contact form will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                    selected?.id === msg.id
                      ? "ring-2 ring-[#6FB644] border-[#6FB644]"
                      : "border-gray-100"
                  } ${!msg.read ? "border-l-4 border-l-[#6FB644]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.read ? "bg-gray-100" : "bg-green-100"
                        }`}
                      >
                        {msg.read ? (
                          <MailOpen className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Mail className="w-4 h-4 text-[#6FB644]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm truncate ${
                              msg.read
                                ? "text-gray-700"
                                : "text-gray-900 font-semibold"
                            }`}
                          >
                            {msg.name}
                          </p>
                          {!msg.read && (
                            <span className="w-2 h-2 rounded-full bg-[#6FB644] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {msg.email}
                        </p>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatDate(msg.createdAt)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(msg.id);
                        }}
                        title="Delete message"
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        {selected && (
          <div className="w-96 flex-shrink-0">
            <div className="bg-white rounded-xl sticky top-6">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-gray-800 text-sm">
                  Message Details
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  title="Close"
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Sender Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-[#6FB644]">
                      {selected.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {selected.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(selected.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${selected.email}`}
                      className="hover:text-[#6FB644]"
                    >
                      {selected.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${selected.phone}`}
                      className="hover:text-[#6FB644]"
                    >
                      {selected.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(selected.createdAt)}
                  </div>
                </div>

                {/* Message */}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-400 mb-2 font-medium uppercase">
                    Message
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() =>
                      selected.read
                        ? markAsUnread(selected)
                        : markAsRead(selected)
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                  >
                    {selected.read ? (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        Mark Unread
                      </>
                    ) : (
                      <>
                        <MailOpen className="w-3.5 h-3.5" />
                        Mark Read
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteId(selected.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
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
