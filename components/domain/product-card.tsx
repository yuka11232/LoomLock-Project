"use client";

import Link from "next/link";
import { Camera, Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { completeness, coverImage } from "@/lib/data/selectors";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ProductImageView } from "./textile-image";
import { IncompleteBadge, ProductStatusBadge, StockBadge } from "./status-badge";

export function ProductCard({ product }: { product: Product }) {
  const { d, t, locale } = useI18n();
  const cover = coverImage(product);
  const state = completeness(product);

  return (
    <Card as="li" className="group overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]">
      <Link href={`/products/detail?id=${product.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-linen">
          {cover ? (
            <ProductImageView image={cover} alt={t(cover.alt)} />
          ) : (
            <div className="weave-ground flex size-full flex-col items-center justify-center gap-2 text-walnut">
              <Camera aria-hidden className="size-6" />
              <span className="text-xs font-medium">{d.products.noPhotos}</span>
            </div>
          )}
          <div className="absolute end-2 top-2 flex flex-col items-end gap-1.5">
            <ProductStatusBadge status={product.status} size="sm" />
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 font-display text-lg font-semibold leading-snug">
              {t(product.name) || d.products.fields.name}
            </h3>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-charcoal">
              {formatPrice(product.price, locale, d.common.priceOnRequest)}
            </p>
          </div>

          <p className="mt-1 line-clamp-2 text-sm leading-snug text-stone">
            {t(product.description)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <StockBadge status={product.stockStatus} size="sm" />
            {!state.isComplete ? <IncompleteBadge label={d.products.incomplete} /> : null}
          </div>

          {product.dimensions ? (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-stone">
              <Ruler aria-hidden className="size-3.5" />
              {product.dimensions}
            </p>
          ) : null}

          {!state.isComplete ? (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between text-xs text-stone">
                <span>{d.products.completeness}</span>
                <span className="tabular-nums">{state.percent}%</span>
              </div>
              <Progress
                value={state.percent}
                label={`${d.products.completeness}: ${state.percent}%`}
                tone={state.percent > 70 ? "sage" : "pomegranate"}
              />
            </div>
          ) : null}
        </div>
      </Link>
    </Card>
  );
}
