"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Hammer,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Package,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/app/logo";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextileSwatch } from "@/components/domain/textile-image";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/data/store";

export default function LandingPage() {
  const { d } = useI18n();
  const { state } = useStore();

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main" className="skip-link">
        {d.nav.skipToContent}
      </a>

      <SiteHeader />

      <main id="main">
        <Hero />
        <Partnership />
        <HowItWorks />
        <Features />
        <DashboardPreview />
        <ArtisanVoice />
        <CallToAction slug={state.business.slug} />
      </main>

      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ header */

function SiteHeader() {
  const { d } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ivory/85 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" aria-label="LoomLock">
          <Wordmark />
        </Link>

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

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher compact />
          <ButtonLink href="/demo" size="sm" className="hidden sm:inline-flex">
            {d.landing.heroPrimary}
          </ButtonLink>
          <ButtonLink href="/demo" size="sm" className="sm:hidden">
            {d.demoEntry.enterAs.replace(":", "")}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------- hero */

function Hero() {
  const { d } = useI18n();
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="weave-ground absolute inset-0 opacity-70" />
      {/* A warm wash from the top-left, the way daylight falls on a loom. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_15%_-10%,rgba(184,134,47,0.13),transparent_60%)]"
      />

      <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium text-walnut">
            <span aria-hidden className="size-1.5 rounded-full bg-pomegranate" />
            {d.landing.heroEyebrow}
          </p>

          <h1 className="mt-5 font-display text-[2.5rem] leading-[1.08] font-semibold sm:text-5xl lg:text-[3.5rem]">
            {d.landing.heroTitle}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone">{d.landing.heroBody}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/demo" size="lg">
              {d.landing.heroPrimary}
              <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href="#how" variant="outline" size="lg">
              {d.landing.heroSecondary}
            </ButtonLink>
          </div>

          <p className="mt-4 text-sm text-stone">{d.landing.heroNote}</p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

/**
 * The hero image is the product itself: a piece of the catalogue with an
 * approval waiting on it. It shows what LoomLock is in one glance, and every
 * word in it is real demo content.
 */
function HeroVisual() {
  const { d, t } = useI18n();
  const { state } = useStore();
  const runner = state.products.find((p) => p.id === "product_runner") ?? state.products[0];
  const wall = state.products.find((p) => p.id === "product_wall");

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <Card className="overflow-hidden">
        <div className="relative aspect-[4/3] w-full">
          <TextileSwatch motif="pomegranate" palette="pomegranate" />
        </div>
        <div className="p-5">
          <p className="font-display text-lg font-semibold">{t(runner?.name)}</p>
          <p className="mt-1 line-clamp-2 text-sm text-stone">{t(runner?.description)}</p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="font-semibold text-charcoal">95 AZN</span>
            <span aria-hidden className="text-line">
              ·
            </span>
            <span className="text-stone">{d.products.productionTime(9)}</span>
          </div>
        </div>
      </Card>

      {/* The approval step, floated over the card — the hinge of the product. */}
      <Card className="absolute -bottom-6 -start-2 w-[min(19rem,88%)] shadow-[var(--shadow-lift)] sm:-start-8">
        <div className="flex items-start gap-3 p-4">
          <span
            aria-hidden
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-100 text-[#8a6316]"
          >
            <ClipboardCheck className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-charcoal">
              {wall ? t(wall.name) : d.approvals.title}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-stone">
              {d.permissions.ownerConfirmNeeded}
            </p>
            <div className="mt-2.5 flex gap-1.5">
              <span className="rounded-full bg-pomegranate px-2.5 py-1 text-[0.6875rem] font-semibold text-white">
                {d.approvals.approve}
              </span>
              <span className="rounded-full border border-line px-2.5 py-1 text-[0.6875rem] font-medium text-stone">
                {d.approvals.sendBack}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------- partnership */

function Partnership() {
  const { d } = useI18n();
  return (
    <section className="border-b border-line bg-parchment/50">
      <div className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {d.landing.partnershipTitle}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone">{d.landing.partnershipBody}</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <ContributionCard
            title={d.landing.ownerCardTitle}
            items={d.landing.ownerCardItems}
            accent="pomegranate"
            Icon={Hammer}
            role={d.roles.owner}
          />

          {/* The join between the two: a woven thread on desktop. */}
          <div aria-hidden className="hidden items-center justify-center lg:flex">
            <div className="flex h-full flex-col items-center">
              <span className="w-px flex-1 bg-[repeating-linear-gradient(180deg,var(--color-line)_0_6px,transparent_6px_12px)]" />
              <span className="my-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-walnut">
                {d.landing.betweenThem}
              </span>
              <span className="w-px flex-1 bg-[repeating-linear-gradient(180deg,var(--color-line)_0_6px,transparent_6px_12px)]" />
            </div>
          </div>

          <ContributionCard
            title={d.landing.collaboratorCardTitle}
            items={d.landing.collaboratorCardItems}
            accent="indigo"
            Icon={Megaphone}
            role={d.roles.collaborator}
          />
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[0.9375rem] leading-relaxed text-stone">
          {d.landing.betweenThemBody}
        </p>
      </div>
    </section>
  );
}

function ContributionCard({
  title,
  items,
  accent,
  Icon,
  role,
}: {
  title: string;
  items: string[];
  accent: "pomegranate" | "indigo";
  Icon: typeof Hammer;
  role: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={
            accent === "pomegranate"
              ? "flex size-10 items-center justify-center rounded-full bg-pomegranate-100 text-pomegranate-600"
              : "flex size-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-ink"
          }
        >
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone">{role}</p>
          <p className="font-display text-xl font-semibold">{title}</p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] leading-snug">
            <Check
              aria-hidden
              className={
                accent === "pomegranate"
                  ? "mt-0.5 size-4 shrink-0 text-pomegranate"
                  : "mt-0.5 size-4 shrink-0 text-indigo-ink"
              }
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------ how it works */

function HowItWorks() {
  const { d } = useI18n();
  return (
    <section id="how" className="scroll-mt-20 border-b border-line">
      <div className="container-page py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{d.landing.howTitle}</h2>
          <p className="mt-3 text-lg text-stone">{d.landing.howBody}</p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {d.landing.steps.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full p-6">
                <span
                  aria-hidden
                  className="flex size-9 items-center justify-center rounded-full bg-charcoal font-display text-sm font-semibold text-ivory"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- features */

function Features() {
  const { d } = useI18n();
  const icons = [LayoutDashboard, Package, Megaphone, ShoppingBag, BookOpen, Store];

  return (
    <section id="features" className="scroll-mt-20 border-b border-line bg-parchment/50">
      <div className="container-page py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {d.landing.featuresTitle}
          </h2>
          <p className="mt-3 text-lg text-stone">{d.landing.featuresBody}</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {d.landing.features.map((feature, index) => {
            const Icon = icons[index] ?? LayoutDashboard;
            return (
              <Card key={feature.title} className="p-6">
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-[var(--radius-field)] bg-linen text-walnut"
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-stone">{feature.body}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- dashboard preview */

function DashboardPreview() {
  const { d } = useI18n();
  const icons = [Package, Megaphone, MessageCircle, BookOpen];

  return (
    <section id="learning" className="scroll-mt-20 border-b border-line">
      <div className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {d.landing.dashboardPreviewTitle}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-stone">
            {d.landing.dashboardPreviewBody}
          </p>
          <ButtonLink href="/demo" variant="outline" className="mt-6">
            {d.landing.ctaPrimary}
            <ArrowRight aria-hidden />
          </ButtonLink>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-surface-sunk px-5 py-3">
            <LayoutDashboard aria-hidden className="size-4 text-stone" />
            <p className="text-sm font-medium text-stone">{d.dashboard.needsDoing}</p>
          </div>
          <ul className="divide-y divide-line">
            {d.landing.dashboardPreviewItems.map((item, index) => {
              const Icon = icons[index] ?? Package;
              return (
                <li key={item} className="flex items-center gap-3 px-5 py-4">
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linen text-walnut"
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[0.9375rem]">{item}</span>
                  <ArrowRight aria-hidden className="ms-auto size-4 shrink-0 text-line" />
                </li>
              );
            })}
          </ul>
          <p className="border-t border-line bg-surface-sunk px-5 py-3 text-xs text-stone">
            {d.landing.dashboardPreviewCaption}
          </p>
        </Card>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- artisan voice */

function ArtisanVoice() {
  const { d } = useI18n();
  return (
    <section className="border-b border-line bg-charcoal text-ivory">
      <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold text-ivory sm:text-4xl">
            {d.landing.voiceTitle}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ivory/80">{d.landing.voiceBody}</p>
        </div>

        <ul className="space-y-3">
          {d.landing.voicePoints.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ivory/10 text-gold"
              >
                <X className="size-3.5" />
              </span>
              <span className="text-[0.9375rem] text-ivory/90">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- cta */

function CallToAction({ slug }: { slug: string }) {
  const { d } = useI18n();
  return (
    <section className="border-b border-line">
      <div className="container-page py-16 sm:py-20">
        <Card className="overflow-hidden">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                {d.landing.ctaTitle}
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-stone">{d.landing.ctaBody}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/demo" size="lg">
                  {d.landing.ctaPrimary}
                  <ArrowRight aria-hidden />
                </ButtonLink>
                <ButtonLink href={`/store/${slug}`} variant="outline" size="lg">
                  <Store aria-hidden />
                  {d.landing.ctaSecondary}
                </ButtonLink>
              </div>
            </div>

            <div aria-hidden className="grid grid-cols-3 gap-2 lg:gap-3">
              {(
                [
                  ["pomegranate", "pomegranate"],
                  ["buta", "indigo"],
                  ["medallion", "clay"],
                ] as const
              ).map(([motif, palette]) => (
                <div
                  key={motif}
                  className="aspect-square overflow-hidden rounded-[var(--radius-field)] border border-line"
                >
                  <TextileSwatch motif={motif} palette={palette} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ footer */

function SiteFooter() {
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
            </ul>
          </div>
        </div>

        <div className="thread-rule my-8" aria-hidden />

        <p className="text-sm text-stone">{d.landing.footerDemoNote}</p>
      </div>
    </footer>
  );
}
