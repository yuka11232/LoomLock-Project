"use client";

import { StoreProvider, useStore } from "@/lib/data/store";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/toast";

/**
 * The locale lives in the workspace state so that switching language is itself
 * a saved change — reload the page and you are still reading Azerbaijani. This
 * bridge hands the store's locale to the i18n context.
 */
function LocaleBridge({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useStore();
  return (
    <I18nProvider locale={locale} setLocale={setLocale}>
      {children}
    </I18nProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <LocaleBridge>
        <ToastProvider>{children}</ToastProvider>
      </LocaleBridge>
    </StoreProvider>
  );
}
