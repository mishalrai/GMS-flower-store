"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

let toastId = 0;

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const titles = {
  success: "Success",
  error: "Error",
  info: "Information",
  warning: "Warning",
};

const gradients = {
  success: "from-green-50/80 via-white to-white",
  error: "from-red-50/80 via-white to-white",
  info: "from-blue-50/80 via-white to-white",
  warning: "from-yellow-50/80 via-white to-white",
};

const iconBg = {
  success: "bg-green-100",
  error: "bg-red-100",
  info: "bg-blue-100",
  warning: "bg-yellow-100",
};

const iconColors = {
  success: "text-green-600",
  error: "text-red-500",
  info: "text-blue-500",
  warning: "text-yellow-600",
};

const titleColors = {
  success: "text-green-700",
  error: "text-red-700",
  info: "text-blue-700",
  warning: "text-yellow-700",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl animate-slide-in min-w-[360px] max-w-[440px] bg-gradient-to-r ${gradients[t.type]} border border-gray-100/60 backdrop-blur-sm`}
            >
              <div className={`w-9 h-9 rounded-full ${iconBg[t.type]} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4.5 h-4.5 ${iconColors[t.type]}`} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-sm font-semibold ${titleColors[t.type]}`}>{titles[t.type]}</p>
                <p className="text-sm text-gray-500 mt-0.5">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0 mt-0.5"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
