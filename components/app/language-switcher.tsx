"use client";

import { Languages } from "lucide-react";
import { LOCALES, LOCALE_CODES, LOCALE_NAMES, useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The language switcher.
 *
 * A two-button group rather than a dropdown: with two languages a menu is one
 * click too many, and the current language stays visible at all times. It is a
 * radiogroup so a screen reader announces which language is active.
 *
 * Switching changes both the interface and the demo business content, because
 * every product and note is stored as an en/az pair.
 */
export function LanguageSwitcher({
  className,
  compact,
  locales = LOCALES,
  value,
  onChange,
}: {
  className?: string;
  /** Codes only (EN / AZ) — for tight headers. */
  compact?: boolean;
  locales?: Locale[];
  /** Uncontrolled by default: reads and writes the workspace locale. */
  value?: Locale;
  onChange?: (locale: Locale) => void;
}) {
  const { locale, setLocale, d } = useI18n();
  const current = value ?? locale;
  const change = onChange ?? setLocale;

  return (
    <div
      role="radiogroup"
      aria-label={d.meta.switchTo}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5",
        className,
      )}
    >
      <Languages aria-hidden className="ms-2 me-0.5 size-4 shrink-0 text-stone" />
      {locales.map((item) => {
        const active = item === current;
        return (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => change(item)}
            className={cn(
              "min-h-8 rounded-full px-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-charcoal text-white"
                : "text-stone hover:bg-surface-sunk hover:text-charcoal",
            )}
          >
            <span className={compact ? "" : "sr-only sm:not-sr-only"}>
              {compact ? LOCALE_CODES[item] : LOCALE_NAMES[item]}
            </span>
            {!compact ? <span className="sm:hidden">{LOCALE_CODES[item]}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
