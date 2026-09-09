"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale, Localized } from "../types";
import { en, type Dictionary } from "./en";
import { az } from "./az";

/**
 * Adding a third language (Russian is the planned next one) means:
 *   1. create lib/i18n/ru.ts typed as `Dictionary`
 *   2. add it to DICTIONARIES and LOCALES below
 *   3. add a `ru` key to every `Localized` pair in lib/data/seed.ts
 * Nothing else in the app reads a locale string directly.
 */
export const DICTIONARIES: Record<Locale, Dictionary> = { en, az };

export const LOCALES: Locale[] = ["en", "az"];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  az: "Azərbaycanca",
};

/** Short code shown in the compact switcher. */
export const LOCALE_CODES: Record<Locale, string> = { en: "EN", az: "AZ" };

interface I18nValue {
  locale: Locale;
  d: Dictionary;
  /** Read a bilingual content pair in the active language. */
  t: (value: Localized | undefined) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  setLocale,
  children,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nValue>(() => {
    const d = DICTIONARIES[locale] ?? en;
    return {
      locale,
      d,
      t: (v) => (v ? (v[locale]?.trim() ? v[locale] : v.en) : ""),
      setLocale,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside an I18nProvider");
  }
  return ctx;
}

export type { Dictionary };
