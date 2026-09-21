"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Note } from "@/components/ui/note";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { SiteFooter, SiteHeader } from "./site-chrome";

/**
 * The shared shell for the privacy and terms pages.
 *
 * Both are ordinary prose: one column, generous measure, no cards. The
 * `operatorTodo` notice stays visible until whoever runs the site fills in the
 * two details that cannot be written for them.
 */
export function LegalPage({
  heading,
  lead,
  sections,
  extraSections,
}: {
  heading: string;
  lead: string;
  sections: { heading: string; body: string[] }[];
  /** Governing law and contact, which carry operator placeholders. */
  extraSections?: { heading: string; body: string[] }[];
}) {
  const { d, locale } = useI18n();
  const all = [...sections, ...(extraSections ?? [])];

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main" className="skip-link">
        {d.nav.skipToContent}
      </a>

      <SiteHeader />

      <main id="main" className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone hover:text-charcoal hover:underline"
          >
            <ArrowLeft aria-hidden className="size-4 rtl:rotate-180" />
            {d.legal.backHome}
          </Link>

          <h1 className="mt-6 font-display text-4xl font-semibold">{heading}</h1>
          <p className="mt-2 text-sm text-stone">
            {d.legal.lastUpdated(formatDate(LAST_UPDATED, locale))}
          </p>
          <p className="mt-5 text-lg leading-relaxed text-stone">{lead}</p>

          <Note tone="caution" title={d.legal.operatorTodoTitle} className="mt-8">
            {d.legal.operatorTodoBody}
          </Note>

          <div className="mt-10 space-y-9">
            {all.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-xl font-semibold">{section.heading}</h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph, i) => (
                    <p key={i} className="text-[1.0625rem] leading-relaxed text-charcoal">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Bumped by hand whenever the wording of either document changes. */
export const LAST_UPDATED = "2026-09-09";
