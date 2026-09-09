"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * A modal dialog with the behaviour keyboard and screen-reader users expect:
 * focus moves in on open, is trapped while open, Escape closes, the page behind
 * cannot be scrolled or reached by Tab, and focus returns to whatever opened it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeLabel,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel: string;
  size?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = description ? `${baseId}-description` : undefined;

  useEffect(() => {
    if (!open) return;
    returnFocusTo.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first control inside, or the panel itself if there is none.
    const focusTimer = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      (first ?? panelRef.current)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      returnFocusTo.current?.focus?.();
    };
  }, [open]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-charcoal/40 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={cn(
          "relative w-full animate-fade-up overflow-hidden bg-surface shadow-[var(--shadow-lift)]",
          "max-h-[90vh] rounded-t-2xl sm:rounded-[var(--radius-card)]",
          "flex flex-col",
          size === "sm" && "sm:max-w-md",
          size === "md" && "sm:max-w-lg",
          size === "lg" && "sm:max-w-2xl",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-stone">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="quiet"
            size="icon"
            onClick={onClose}
            aria-label={closeLabel}
            className="-me-2 -mt-1 shrink-0"
          >
            <X aria-hidden />
          </Button>
        </div>

        {children ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
        ) : null}

        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface-sunk px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/**
 * The confirmation used before anything irreversible: deleting a product,
 * resetting the demo, leaving a form with unsaved work.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  cancelLabel,
  closeLabel,
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  tone?: "danger" | "primary";
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      closeLabel={closeLabel}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[0.9375rem] leading-relaxed text-stone">{body}</p>
    </Dialog>
  );
}
