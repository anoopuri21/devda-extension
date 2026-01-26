import { useState, useCallback } from "react";
import type { ToastData, ToastType } from "../components/ui/Toast";

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = `toast-${++toastId}`;
      const newToast: ToastData = {
        id,
        type,
        title,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => addToast("success", title, message),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => addToast("error", title, message, 5000),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => addToast("warning", title, message),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => addToast("info", title, message),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}