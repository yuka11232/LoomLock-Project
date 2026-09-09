"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock3,
  Hammer,
  Mail,
  MapPin,
  Package,
  Ruler,
  Send,
  Truck,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { Wordmark } from "@/components/app/logo";
import { StockBadge } from "@/components/domain/status-badge";
import { ProductImageView, TextileSwatch } from "@/components/domain/textile-image";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { coverImage, publicProducts } from "@/lib/data/selectors";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import type { Order, Product } from "@/lib/types";
import { formatPrice, newId, nowIso, sameInBoth } from "@/lib/utils";

/**
 * The public mini-storefront.
 *
 * This is what a customer sees: the artisan's story, the pieces the family
 * chose to publish, and one way to start a conversation. No prices are taken,
 * no account is created, and an enquiry sent here lands on the family's order
 * board as a New enquiry — which is how the demo's inbox fills up.
 */
export default function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { state, hydrated } = useStore();
  const { d, t } = useI18n();

  const business = state.business;
  const products = publicProducts(state);
  const [enquiryFor, setEnquiryFor] = useState<string>("");

  if (hydrated && slug !== business.slug) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={<Package />}
          title={d.errors.notFound}
          body={d.errors.notFoundBody}
          action={
            <Link href="/" className="text-sm text-indigo-ink hover:underline">
              {d.nav.backToSite}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main" className="skip-link">
        {d.nav.skipToContent}
      </a>

      {/* --------------------------------------------------------- demo bar */}
      <div className="border-b border-line bg-charcoal text-ivory">
        <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5 text-xs">
          <p>
            <span className="font-semibold">{d.store.demoBannerTitle}.</span>{" "}
            <span className="text-ivory/75">{d.store.demoBannerBody}</span>
          </p>
          <Link
            href="/dashboard"
            className="ms-auto inline-flex items-center gap-1.5 font-medium text-ivory underline underline-offset-4 hover:text-gold"
          >
            <ArrowLeft aria-hidden className="size-3.5 rtl:rotate-180" />
            {d.store.backToWorkspace}
          </Link>
        </div>
      </div>

      <header className="border-b border-line bg-ivory">
        <div className="container-page flex h-16 items-center gap-4">
          <p className="font-display text-lg font-semibold tracking-tight">{business.name}</p>
          <div className="ms-auto">
            <LanguageSwitcher compact />
          </div>
        </div>
      </header>

      <main id="main">
        {/* ------------------------------------------------------------ hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div aria-hidden className="weave-ground absolute inset-0 opacity-60" />
          <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm text-walnut">
                <MapPin aria-hidden className="size-3.5" />
                {t(business.location)}
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
                {business.name}
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone">
                {t(business.tagline)}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#enquiry"
                  className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-field)] bg-pomegranate px-5 font-medium text-white transition-colors hover:bg-pomegranate-600"
                >
                  <Send aria-hidden className="size-[18px]" />
                  {d.store.enquireGeneral}
                </a>
                <a
                  href="#work"
                  className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-field)] border border-line bg-surface px-5 font-medium transition-colors hover:bg-surface-sunk"
                >
                  {d.store.ourWork}
                </a>
              </div>
            </div>

            <div aria-hidden className="grid grid-cols-2 gap-3">
              <div className="aspect-square overflow-hidden rounded-[var(--radius-card)] border border-line">
                <TextileSwatch motif="pomegranate" palette="pomegranate" />
              </div>
              <div className="mt-8 aspect-square overflow-hidden rounded-[var(--radius-card)] border border-line">
                <TextileSwatch motif="buta" palette="indigo" />
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- the story */}
        <section aria-labelledby="artisan-heading" className="border-b border-line bg-parchment/50">
          <div className="container-page py-14">
            <div className="mx-auto max-w-2xl">
              <h2 id="artisan-heading" className="font-display text-3xl font-semibold">
                {d.store.aboutArtisan}
              </h2>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-walnut">
                <Hammer aria-hidden className="size-4" />
                {t(business.craft)}
              </p>
              <p className="mt-5 whitespace-pre-line text-[1.0625rem] leading-relaxed text-charcoal">
                {t(business.story)}
              </p>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- work */}
        <section id="work" aria-labelledby="work-heading" className="scroll-mt-4 border-b border-line">
          <div className="container-page py-14">
            <h2 id="work-heading" className="font-display text-3xl font-semibold">
              {d.store.ourWork}
            </h2>

            {products.length === 0 ? (
              <EmptyState className="mt-6" icon={<Package />} title={d.store.noProducts} />
            ) : (
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <StoreProductCard
                    key={product.id}
                    product={product}
                    onEnquire={() => {
                      setEnquiryFor(product.id);
                      document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* -------------------------------------------------------- enquiry */}
        <EnquirySection
          products={products}
          selectedId={enquiryFor}
          onSelect={setEnquiryFor}
        />
      </main>

      <footer className="bg-parchment/60">
        <div className="container-page grid gap-8 py-12 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-semibold">{d.store.contactTitle}</h2>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-stone">
              <Mail aria-hidden className="size-4" />
              {business.contactEmail}
            </p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm text-stone">
              <MapPin aria-hidden className="size-4" />
              {t(business.location)}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">{d.store.deliveryTitle}</h2>
            <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-stone">
              <Truck aria-hidden className="mt-0.5 size-4 shrink-0" />
              {t(business.deliveryNote)}
            </p>
          </div>

          <div>
            <Wordmark />
            <p className="mt-2 text-sm text-stone">{d.store.noPayments}</p>
          </div>
        </div>
        <div className="container-page pb-8">
          <div className="thread-rule mb-6" aria-hidden />
          <p className="text-xs text-stone">{d.landing.footerDemoNote}</p>
        </div>
      </footer>
    </div>
  );
}

function StoreProductCard({
  product,
  onEnquire,
}: {
  product: Product;
  onEnquire: () => void;
}) {
  const { d, t, locale } = useI18n();
  const cover = coverImage(product);

  return (
    <Card as="li" className="flex flex-col overflow-hidden">
      <div className="aspect-[4/3] w-full bg-linen">
        <ProductImageView image={cover} alt={cover ? t(cover.alt) : t(product.name)} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold leading-snug">{t(product.name)}</h3>
          <p className="shrink-0 font-semibold tabular-nums">
            {formatPrice(product.price, locale, d.common.priceOnRequest)}
          </p>
        </div>

        <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">{t(product.description)}</p>

        {t(product.story) ? (
          <p className="mt-3 border-s-2 border-line ps-3 text-sm italic leading-relaxed text-stone">
            {t(product.story)}
          </p>
        ) : null}

        <dl className="mt-4 space-y-1.5 text-sm text-stone">
          {product.materials.length > 0 ? (
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-charcoal">{d.store.materials}:</dt>
              <dd>{product.materials.map((m) => t(m)).join(", ")}</dd>
            </div>
          ) : null}
          {product.dimensions ? (
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-charcoal">
                <Ruler aria-hidden className="me-1 inline size-3.5" />
                {d.store.size}:
              </dt>
              <dd>{product.dimensions}</dd>
            </div>
          ) : null}
          {product.productionDays !== null ? (
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-charcoal">
                <Clock3 aria-hidden className="me-1 inline size-3.5" />
                {d.store.productionTime}:
              </dt>
              <dd>{d.products.days(product.productionDays)}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StockBadge status={product.stockStatus} size="sm" />
          {product.madeToOrder && product.stockStatus !== "made_to_order" ? (
            <span className="text-xs text-stone">{d.store.madeToOrderNote}</span>
          ) : null}
        </div>

        {product.stockStatus === "sold_out" ? (
          <p className="mt-2 text-sm text-stone">{d.store.soldOutNote}</p>
        ) : null}

        <Button className="mt-4" variant="outline" block onClick={onEnquire}>
          <Send aria-hidden />
          {d.store.enquire}
        </Button>
      </div>
    </Card>
  );
}

function EnquirySection({
  products,
  selectedId,
  onSelect,
}: {
  products: Product[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { state, dispatch } = useStore();
  const { d, t } = useI18n();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; contact?: string; message?: string }>({});
  const [sent, setSent] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = d.errors.required;
    if (!contact.trim()) next.contact = d.errors.invalidContact;
    if (message.trim().length < 10) next.message = d.errors.tooShort(10);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const product = products.find((p) => p.id === selectedId);
    const order: Order = {
      id: newId("order"),
      ref: `NT-${120 + state.orders.length}`,
      customerName: name.trim(),
      customerContact: contact.trim(),
      productId: product?.id ?? null,
      requestedItem: product ? product.name : sameInBoth(d.store.aboutGeneral),
      quantity: 1,
      createdAt: nowIso(),
      enquiry: sameInBoth(message.trim()),
      dueDate: null,
      stage: "new_enquiry",
      assigneeId: null,
      nextAction: {
        en: "Reply to this enquiry",
        az: "Bu sorğuya cavab ver",
      },
      source: "storefront",
      agreedPrice: null,
      notes: [],
    };

    // The owner of record for a storefront enquiry is the business itself.
    dispatch({ type: "orderCreate", order, actorId: state.members[0]?.id ?? "" });
    setSent(true);
    setName("");
    setContact("");
    setMessage("");
  }

  return (
    <section id="enquiry" aria-labelledby="enquiry-heading" className="scroll-mt-4">
      <div className="container-page py-14">
        <div className="mx-auto max-w-xl">
          <h2 id="enquiry-heading" className="font-display text-3xl font-semibold">
            {d.store.enquiryTitle}
          </h2>
          <p className="mt-2 text-[1.0625rem] leading-relaxed text-stone">{d.store.enquiryBody}</p>

          {sent ? (
            <Card className="mt-6 border-sage/30 bg-sage-100/50">
              <CardBody className="pt-5">
                <p className="flex items-center gap-2 font-display text-xl font-semibold">
                  <Check aria-hidden className="size-5 text-sage" />
                  {d.store.sentTitle}
                </p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-charcoal">
                  {d.store.sentBody}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setSent(false)}>
                    {d.store.sendAnother}
                  </Button>
                  <Link
                    href="/orders"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-indigo-ink hover:underline"
                  >
                    {d.store.backToWorkspace}
                  </Link>
                </div>
              </CardBody>
            </Card>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <Field label={d.store.nameLabel} required error={errors.name}>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                />
              </Field>

              <Field label={d.store.contactLabel} required error={errors.contact}>
                <Input
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  autoComplete="email"
                />
              </Field>

              <Field label={d.store.aboutLabel}>
                <Select value={selectedId} onChange={(event) => onSelect(event.target.value)}>
                  <option value="">{d.store.aboutGeneral}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {t(product.name)}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label={d.store.messageLabel} required error={errors.message}>
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={d.store.messagePlaceholder}
                  rows={5}
                />
              </Field>

              <Note tone="info">{d.store.noPayments}</Note>

              <Button type="submit" size="lg">
                <Send aria-hidden />
                {d.store.send}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
