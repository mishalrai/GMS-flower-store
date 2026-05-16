"use client";

import { createContext, useContext } from "react";
import { StoreSettings, DEFAULT_SETTINGS } from "@/lib/settings-types";

const SettingsContext = createContext<StoreSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({
  value,
  children,
}: {
  value: StoreSettings;
  children: React.ReactNode;
}) {
  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useStoreSettings(): StoreSettings {
  return useContext(SettingsContext);
}
