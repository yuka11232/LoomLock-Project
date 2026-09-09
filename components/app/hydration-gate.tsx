"use client";

import { LoadingBlock } from "@/components/ui/empty-state";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";

/**
 * Saved demo changes live in localStorage, which cannot be read on the server.
 * Rather than render seed data and then visibly replace it with the visitor's
 * real work, workspace screens wait one tick behind this gate.
 */
export function HydrationGate({ children, rows }: { children: React.ReactNode; rows?: number }) {
  const { hydrated } = useStore();
  const { d } = useI18n();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div aria-hidden className="h-8 w-56 animate-pulse rounded bg-surface-sunk" />
        <LoadingBlock label={d.common.loading} rows={rows ?? 3} />
      </div>
    );
  }

  return <>{children}</>;
}
