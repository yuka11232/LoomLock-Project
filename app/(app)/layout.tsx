"use client";

import { AppShell } from "@/components/app/app-shell";
import { HydrationGate } from "@/components/app/hydration-gate";

/**
 * Every workspace screen shares the shell and waits for the saved demo state.
 * The public landing, demo entry, onboarding, and storefront sit outside this
 * group because they have their own chrome.
 */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <HydrationGate>{children}</HydrationGate>
    </AppShell>
  );
}
