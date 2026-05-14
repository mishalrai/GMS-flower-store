"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SidebarCtx {
  collapsed: boolean;
  toggle: () => void;
}

const Context = createContext<SidebarCtx>({ collapsed: false, toggle: () => {} });

const STORAGE_KEY = "gms-admin-sidebar-collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Read persisted state after mount to avoid SSR/hydration mismatch
  useEffect(() => {
    if (typeof window === "undefined") return;
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore storage errors (private mode, etc.)
      }
      return next;
    });
  };

  return <Context.Provider value={{ collapsed, toggle }}>{children}</Context.Provider>;
}

export function useSidebar() {
  return useContext(Context);
}
