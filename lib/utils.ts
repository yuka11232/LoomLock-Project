import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale, Localized } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Read a bilingual content string, falling back to English if AZ is missing. */
export function loc(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale]?.trim() ? value[locale] : value.en;
}

/** Build a Localized pair from a single string typed by the user. */
export function sameInBoth(value: string): Localized {
  return { en: value, az: value };
}

let idCounter = 0;
/** Stable-ish unique id. Not cryptographic; this is demo data. */
export function newId(prefix = "id"): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

const LOCALE_TAG: Record<Locale, string> = { en: "en-GB", az: "az-Latn-AZ" };

export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function formatDateTime(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 16).replace("T", " ");
  }
}

/**
 * "3 days ago" / "3 gün əvvəl". Kept deliberately coarse: the demo data is
 * seeded relative to today, and exact timestamps add noise to the activity feed.
 */
export function relativeTime(iso: string, locale: Locale): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3600000);
  const days = Math.round(diffMs / 86400000);

  try {
    const rtf = new Intl.RelativeTimeFormat(LOCALE_TAG[locale], { numeric: "auto" });
    if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
    if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
    if (Math.abs(days) < 30) return rtf.format(-days, "day");
    return formatDate(iso, locale);
  } catch {
    return formatDate(iso, locale);
  }
}

/**
 * Prices are shown in manat, written the way the family writes them: "95 AZN".
 *
 * Intl's currency style puts the code first in English ("AZN 95"), which is
 * not how anyone in Baku writes a price, and it would disagree with every
 * price typed into the lessons and message templates. So the number is
 * localised and the code appended.
 *
 * The MVP never processes a payment.
 */
export function formatPrice(
  amount: number | null,
  locale: Locale,
  onRequestLabel: string,
): string {
  if (amount === null) return onRequestLabel;
  try {
    const number = new Intl.NumberFormat(LOCALE_TAG[locale], {
      maximumFractionDigits: 0,
    }).format(amount);
    return `${number} AZN`;
  } catch {
    return `${amount} AZN`;
  }
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Percentage clamped to 0-100 and rounded, for progress bars. */
export function percent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

/** Case- and diacritic-insensitive contains, so searching "Nergiz" finds "Nərgiz". */
export function matches(haystack: string, needle: string): boolean {
  if (!needle.trim()) return true;
  const norm = (s: string) =>
    s
      .toLocaleLowerCase("az")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ə/g, "e")
      .replace(/ı/g, "i");
  return norm(haystack).includes(norm(needle));
}
