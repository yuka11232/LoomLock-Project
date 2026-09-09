"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Success and error feedback.
 *
 * Rendered into an aria-live region so a screen reader announces the outcome of
 * an action without moving focus. Errors use role="alert" (assertive) because
 * the user needs to know immediately; successes are polite.
 */

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastRow key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastRow({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, DURATION);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  const Icon = toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? TriangleAlert : Info;

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-[var(--radius-card)] border p-3.5 shadow-[var(--shadow-lift)]",
        toast.tone === "success" && "border-sage/30 bg-sage-100 text-[#33482f]",
        toast.tone === "error" && "border-pomegranate/30 bg-pomegranate-100 text-pomegranate-600",
        toast.tone === "info" && "border-indigo-ink/25 bg-indigo-100 text-indigo-ink",
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p className="min-w-0 flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="-m-1 shrink-0 rounded p-1 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside a ToastProvider");
  return ctx.toast;
}

/**
 * Copy text to the clipboard, falling back to a hidden textarea where the
 * async clipboard API is unavailable or blocked (older Safari, insecure origin).
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the manual path
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
