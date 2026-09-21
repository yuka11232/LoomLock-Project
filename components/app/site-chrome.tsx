"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { Wordmark } from "./logo";

/**
 * The header and footer shared by the public pages: the landing page and the
 * privacy and terms pages. Keeping them here means the legal pages are part of
 * the site rather than bare documents bolted onto it.
 */

export function SiteHeader({ showSectionNav = false }: { showSectionNav?: boolean }) {
  const { d } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ivory/85 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" aria-label="LoomLock">
          <Wordmark />
        </Link>

        {showSectionNav ? (
          <nav aria-label={d.nav.mainMenu} className="ms-6 hidden items-center gap-1 md:flex">
            {[
              { href: "#how", label: d.landing.navHowItWorks },
              { href: "#features", label: d.landing.navFeatures },
              { href: "#learning", label: d.landing.navLearning },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-[var(--radius-field)] px-3 py-2 text-sm font-medium text-stone transition-colors hover:bg-surface-sunk hover:text-charcoal"
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher compact />
          <ButtonLink href="/demo" size="sm">
            <span className="hidden sm:inline">{d.landing.heroPrimary}</span>
            <span className="sm:hidden">{d.landing.ctaPrimary}</span>
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { d } = useI18n();

  return (
    <footer className="bg-parchment/60">
      <div className="container-page py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone">
              {d.landing.footerTagline}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-charcoal">{d.landing.footerBoundaries}</h2>
            <ul className="mt-3 space-y-2">
              {d.landing.footerBoundaryItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-snug text-stone">
                  <X aria-hidden className="mt-0.5 size-3.5 shrink-0 text-clay" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-charcoal">{d.nav.mainMenu}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/demo" className="text-stone hover:text-charcoal hover:underline">
                  {d.landing.ctaPrimary}
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-stone hover:text-charcoal hover:underline">
                  {d.onboarding.title}
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-stone hover:text-charcoal hover:underline">
                  {d.nav.learn}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-stone hover:text-charcoal hover:underline">
                  {d.legal.privacyTitle}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-stone hover:text-charcoal hover:underline">
                  {d.legal.termsTitle}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="thread-rule my-8" aria-hidden />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone">{d.landing.footerDemoNote}</p>
          <p className="text-sm text-stone">{d.legal.footerLine}</p>
        </div>
      </div>
    </footer>
  );
}
