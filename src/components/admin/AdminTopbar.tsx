"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminTopbar() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [storeName, setStoreName] = useState("GMS Flower Store");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.storeName) setStoreName(data.storeName);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button title="Toggle menu" className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {storeName} — Admin
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Admin</span>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? "..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
