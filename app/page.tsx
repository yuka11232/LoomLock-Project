"use client";

import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Hammer,
  LayoutDashboard,
  Megaphone,
  Store,
  X,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/app/site-chrome";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextileSwatch } from "@/components/domain/textile-image";
import { LESSON_COUNT } from "@/lib/data/lessons";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/data/store";
import type { Product } from "@/lib/types";

/**
 * The public landing page.
 *
 * Two rules hold the layout together. Sections are separated by the colour of
 * the ground they sit on, not by a rule stacked on top of that colour change.
 * And a card is used only where the content is a discrete object you could
 * pick up (a product, a role, a panel of the app) — a list of six things is
 * set as a list, not as six boxes.
 */
export default function LandingPage() {
  const { d } = useI18n();

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main" className="skip-link">
        {d.nav.skipToContent}
      </a>

      <SiteHeader showSectionNav />

      <main id="main">
        <Hero />
        <Partnership />
        <HowItWorks />
        <Features />
        <DashboardPreview />
        <ArtisanVoice />
        <CallToAction />
      </main>

      <SiteFooter />
    </div>
  );
}

/* -------------------------------------------------------------------- hero */

function Hero() {
  const { d } = useI18n();
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/*
       * One decorative layer, and it means something: the warp and weft of a
       * loom. The warm radial wash that used to sit on top of it was doing
       * nothing this texture does not already do.
       */}
      <div aria-hidden className="weave-ground absolute inset-0 opacity-60" />

      <div className="container-page relative grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div className="animate-fade-up">
          <p className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.12em] text-walnut">
            {/* A short warp thread instead of a badge. */}
            <span aria-hidden className="h-px w-8 bg-pomegranate" />
            {d.landing.heroEyebrow}
          </p>

          <h1 className="mt-5 font-display text-[2.5rem] leading-[1.08] font-semibold sm:text-5xl lg:text-[3.5rem]">
            {d.landing.heroTitle}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone">{d.landing.heroBody}</p>

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
    <div className="relative mx-auto w-full max-w-md pb-4 lg:max-w-none">
      <Card className="overflow-hidden">
        {/*
         * The approval card is anchored inside the photograph rather than
         * below it, so it breaks the card edge without ever covering the
         * product's own name and description.
         */}
        <div className="relative aspect-[4/3] w-full">
          <TextileSwatch motif="pomegranate" palette="pomegranate" />
          <ApprovalOverlay product={wall} />
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
    </div>
  );
}

/** The approval step: the hinge of the whole product, shown in the hero. */
function ApprovalOverlay({ product }: { product: Product | undefined }) {
  const { d, t } = useI18n();

  return (
    <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
      <Card className="shadow-[var(--shadow-lift)]">
        <div className="flex items-start gap-3 p-4">
          <span
            aria-hidden
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-100 text-[#8a6316]"
          >
            <ClipboardCheck className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-charcoal">
              {product ? t(product.name) : d.approvals.title}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-stone">
              {d.permissions.ownerConfirmNeeded}
            </p>
            <div className="mt-2.5 flex gap-1.5">
              <span className="rounded-[0.375rem] bg-pomegranate px-2.5 py-1 text-[0.6875rem] font-semibold text-white">
                {d.approvals.approve}
              </span>
              <span className="rounded-[0.375rem] border border-line px-2.5 py-1 text-[0.6875rem] font-medium text-stone">
                {d.approvals.sendBack}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------- section heading */

/** Every section opens the same way, so the layout underneath is free to differ. */
function SectionIntro({ title, body }: { title: string; body: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
      <p className="mt-4 text-lg leading-relaxed text-stone">{body}</p>
    </div>
  );
}

/* ------------------------------------------------------------- partnership */

function Partnership() {
  const { d } = useI18n();
  return (
    <section className="bg-parchment/50">
      <div className="container-page py-20 sm:py-28">
        <SectionIntro title={d.landing.partnershipTitle} body={d.landing.partnershipBody} />

        {/*
         * Two people, two cards. This is the one place on the page where a card
         * is the right container: each is a discrete party to the same business,
         * and the pair is meant to be compared side by side.
         */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <ContributionCard
            title={d.landing.ownerCardTitle}
            items={d.landing.ownerCardItems}
            accent="pomegranate"
            Icon={Hammer}
            role={d.roles.owner}
          />
          <ContributionCard
            title={d.landing.collaboratorCardTitle}
            items={d.landing.collaboratorCardItems}
            accent="indigo"
            Icon={Megaphone}
            role={d.roles.collaborator}
          />
        </div>

        {/*
         * What sits between the two columns, said once and in plain words,
         * rather than drawn as a dotted connector too faint to read.
         */}
        <div className="mt-10 flex flex-col items-center gap-5 text-center">
          <span aria-hidden className="thread-rule w-24" />
          <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-stone">
            <span className="font-semibold text-charcoal">{d.landing.betweenThem}: </span>
            {d.landing.betweenThemBody}
          </p>
        </div>
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
    <Card className="p-6 sm:p-7">
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

      <ul className="mt-6 space-y-3">
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

/**
 * A sequence, so it is set as one: a large numeral under a rule, the way a
 * printed instruction reads. Boxing each step added three borders and said
 * nothing about the order the steps happen in.
 */
function HowItWorks() {
  const { d } = useI18n();
  return (
    <section id="how" className="scroll-mt-20">
      <div className="container-page py-20 sm:py-28">
        <SectionIntro title={d.landing.howTitle} body={d.landing.howBody} />

        <ol className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {d.landing.steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-charcoal/20 pt-6">
              <span
                aria-hidden
                className="block font-display text-4xl font-semibold leading-none tabular-nums text-pomegranate/75"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-stone">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- features */

/**
 * This was six cards with an icon each, and the icons were assigned by array
 * position — decoration standing in for meaning. It is an index now: a number,
 * the name, and one concrete fact about the part (how many stages, how many
 * lessons), so the summary line alone teaches the reader something.
 */
function Features() {
  const { d } = useI18n();

  return (
    <section id="features" className="scroll-mt-20 bg-parchment/50">
      <div className="container-page py-20 sm:py-28">
        <SectionIntro title={d.landing.featuresTitle} body={d.landing.featuresBody} />

        <ol className="mt-12 grid sm:grid-cols-2 sm:gap-x-14">
          {d.landing.features.map((feature, index) => (
            <li
              key={feature.title}
              className="grid grid-cols-[2rem_1fr] gap-x-3 border-t border-line py-6"
            >
              <span
                aria-hidden
                className="pt-1.5 font-display text-sm font-semibold tabular-nums text-walnut/60"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm font-medium text-clay">{feature.detail}</p>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-stone">{feature.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- dashboard preview */

function DashboardPreview() {
  const { d } = useI18n();

  return (
    <section id="learning" className="scroll-mt-20">
      <div className="container-page grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {d.landing.dashboardPreviewTitle}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone">
            {d.landing.dashboardPreviewBody}
          </p>
          <ButtonLink href="/demo" variant="outline" className="mt-8">
            {d.landing.ctaPrimary}
            <ArrowRight aria-hidden />
          </ButtonLink>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-surface-sunk px-5 py-3">
            <LayoutDashboard aria-hidden className="size-4 text-stone" />
            <p className="text-sm font-medium text-stone">{d.dashboard.needsDoing}</p>
          </div>
          {/*
           * These rows are things to do, so they carry an empty tick box. The
           * decorative icon disc that used to sit here said nothing, and the
           * trailing arrow implied a link that is not there.
           */}
          <ul className="divide-y divide-line">
            {d.landing.dashboardPreviewItems.map((item) => (
              <li key={item} className="flex items-start gap-3 px-5 py-4">
                <span
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 rounded-[0.25rem] border border-line bg-canvas"
                />
                <span className="text-[0.9375rem] leading-snug">{item}</span>
              </li>
            ))}
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
    <section className="bg-charcoal text-ivory">
      <div className="container-page grid gap-10 py-20 sm:py-28 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold text-ivory sm:text-4xl">
            {d.landing.voiceTitle}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ivory/80">{d.landing.voiceBody}</p>
        </div>

        <ul className="space-y-4">
          {d.landing.voicePoints.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <X aria-hidden className="mt-1 size-4 shrink-0 text-gold" />
              <span className="text-[0.9375rem] leading-relaxed text-ivory/90">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- cta */

/**
 * The closing panel used to be three woven swatches: pretty, and evidence of
 * nothing. It now shows what the demo actually contains, counted from the seed
 * at render time so the numbers cannot drift away from the workspace the
 * button opens.
 */
function CallToAction() {
  const { d, t } = useI18n();
  const { state } = useStore();
  const { business } = state;

  const facts = [
    { value: state.products.length, label: d.landing.ctaFactProducts },
    { value: state.orders.length, label: d.landing.ctaFactOrders },
    { value: LESSON_COUNT, label: d.landing.ctaFactLessons },
  ];

  return (
    <section>
      <div className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{d.landing.ctaTitle}</h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone">{d.landing.ctaBody}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/demo" size="lg">
              {d.landing.ctaPrimary}
              <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href={`/store/${business.slug}`} variant="outline" size="lg">
              <Store aria-hidden />
              {d.landing.ctaSecondary}
            </ButtonLink>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <p className="font-display text-xl font-semibold">{business.name}</p>
          <p className="mt-1 text-sm text-stone">
            {t(business.location)} · {d.landing.ctaSince(business.foundedYear)}
          </p>

          <ul className="mt-6">
            {facts.map((fact) => (
              <li key={fact.label} className="flex items-baseline gap-4 border-t border-line py-3.5">
                <span className="min-w-[2ch] font-display text-2xl font-semibold tabular-nums text-pomegranate">
                  {fact.value}
                </span>
                <span className="text-[0.9375rem] text-stone">{fact.label}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
