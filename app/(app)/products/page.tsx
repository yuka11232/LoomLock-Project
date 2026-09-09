"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { ProductCard } from "@/components/domain/product-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import { matches } from "@/lib/utils";

type Filter = "all" | "draft" | "in_review" | "public" | "made_to_order" | "sold_out";

function predicate(filter: Filter): (product: Product) => boolean {
  switch (filter) {
    case "draft":
      return (p) => p.status === "draft";
    case "in_review":
      return (p) => p.status === "in_review";
    case "public":
      return (p) => p.status === "public";
    case "made_to_order":
      return (p) => p.madeToOrder || p.stockStatus === "made_to_order";
    case "sold_out":
      return (p) => p.stockStatus === "sold_out";
    default:
      return () => true;
  }
}

/**
 * useSearchParams needs a Suspense boundary so the route can still be
 * prerendered; the ?filter= value is read on the client.
 */
export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsCatalogue />
    </Suspense>
  );
}

function ProductsCatalogue() {
  const { state } = useStore();
  const { d, t } = useI18n();
  const params = useSearchParams();

  const initial = (params.get("filter") as Filter | null) ?? "all";
  const [filter, setFilter] = useState<Filter>(initial);
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const by = (f: Filter) => state.products.filter(predicate(f)).length;
    return {
      all: state.products.length,
      draft: by("draft"),
      in_review: by("in_review"),
      public: by("public"),
      made_to_order: by("made_to_order"),
      sold_out: by("sold_out"),
    };
  }, [state.products]);

  const visible = useMemo(() => {
    return state.products.filter((product) => {
      if (!predicate(filter)(product)) return false;
      if (!query.trim()) return true;
      const haystack = [
        t(product.name),
        t(product.description),
        ...product.materials.map((m) => t(m)),
      ].join(" ");
      return matches(haystack, query);
    });
  }, [state.products, filter, query, t]);

  const filtering = filter !== "all" || query.trim().length > 0;

  return (
    <>
      <PageHeader
        title={d.products.title}
        description={d.products.subtitle}
        action={
          <ButtonLink href="/products/new">
            <Plus aria-hidden />
            {d.products.newProduct}
          </ButtonLink>
        }
      />

      <div className="mb-5 space-y-3">
        <FilterTabs<Filter>
          label={d.common.filter}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: d.products.filterAll, count: counts.all },
            { value: "draft", label: d.products.filterDraft, count: counts.draft },
            { value: "in_review", label: d.products.filterInReview, count: counts.in_review },
            { value: "public", label: d.products.filterPublic, count: counts.public },
            {
              value: "made_to_order",
              label: d.products.filterMadeToOrder,
              count: counts.made_to_order,
            },
            { value: "sold_out", label: d.products.filterSoldOut, count: counts.sold_out },
          ]}
        />

        <div className="relative max-w-md">
          <Search
            aria-hidden
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-stone"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={d.products.searchPlaceholder}
            aria-label={d.products.searchPlaceholder}
            className="min-h-11 w-full rounded-[var(--radius-field)] border border-line bg-surface ps-9 pe-3 text-[0.9375rem] placeholder:text-stone/60 focus:border-pomegranate focus:outline-none focus:ring-2 focus:ring-pomegranate/25"
          />
        </div>

        <p className="text-sm text-stone" aria-live="polite">
          {d.products.count(visible.length)}
        </p>
      </div>

      {visible.length === 0 ? (
        filtering ? (
          <EmptyState
            icon={<Search />}
            title={d.products.emptyFilteredTitle}
            body={d.products.emptyFilteredBody}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setFilter("all");
                  setQuery("");
                }}
              >
                {d.products.clearFilters}
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<Package />}
            title={d.products.emptyTitle}
            body={d.products.emptyBody}
            action={
              <ButtonLink href="/products/new">
                <Plus aria-hidden />
                {d.products.newProduct}
              </ButtonLink>
            }
          />
        )
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </>
  );
}
