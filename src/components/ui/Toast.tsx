import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: "border-green-500/50 bg-green-500/10",
  error: "border-red-500/50 bg-red-500/10",
  warning: "border-yellow-500/50 bg-yellow-500/10",
  info: "border-blue-500/50 bg-blue-500/10",
};

const iconStyles = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = icons[toast.type];
  const duration = toast.duration ?? 3000;

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto dismiss
    const timer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 200);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-200",
        styles[toast.type],
        isVisible && !isLeaving
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-4"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconStyles[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-muted-foreground mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={handleRemove}
        className="shrink-0 p-1 hover:bg-accent rounded transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}