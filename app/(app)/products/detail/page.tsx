"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  Check,
  EyeOff,
  History,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import {
  BasicsSection,
  MakingSection,
  PhotosSection,
  PriceSection,
  StorySection,
  applyDraft,
  productToDraft,
  type ProductDraftValue,
} from "@/components/domain/product-fields";
import { ProductStatusBadge, StockBadge } from "@/components/domain/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { completeness, type ProductField } from "@/lib/data/selectors";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import { formatPrice, relativeTime } from "@/lib/utils";

function ProductDetailInner() {
  const id = useSearchParams().get("id") ?? "";
  const { state, me, dispatch } = useStore();
  const { d, t, locale } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const product = state.products.find((p) => p.id === id);

  const [draft, setDraft] = useState<ProductDraftValue | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  // Reset the editable copy whenever the record or the writing language changes.
  useEffect(() => {
    if (product) setDraft(productToDraft(product, locale));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, locale, product?.updatedAt]);

  const state_ = useMemo(() => (product ? completeness(product) : null), [product]);

  if (!product || !draft) {
    return (
      <EmptyState
        icon={<History />}
        title={d.errors.notFound}
        body={d.errors.notFoundBody}
        action={
          <Button variant="outline" onClick={() => router.push("/products")}>
            {d.errors.goBack}
          </Button>
        }
      />
    );
  }

  const isOwner = me.role === "owner";
  const patch = (value: Partial<ProductDraftValue>) =>
    setDraft((current) => (current ? { ...current, ...value } : current));

  function saveChanges(silent = false) {
    if (!product || !draft) return;
    dispatch({
      type: "productSave",
      product: applyDraft(product, draft, locale),
      actorId: me.id,
      isNew: false,
    });
    if (!silent) toast(d.settings.savedToast);
  }

  function submitForApproval() {
    saveChanges(true);
    dispatch({ type: "productSubmit", productId: product!.id, actorId: me.id });
    toast(d.products.approvalSent);
  }

  function publish() {
    saveChanges(true);
    dispatch({ type: "productPublish", productId: product!.id, actorId: me.id });
    toast(d.status.product.public);
  }

  const missingLabels: Record<ProductField, string> = {
    name: d.products.fields.name,
    description: d.products.fields.description,
    story: d.products.fields.story,
    price: d.products.fields.price,
    productionDays: d.products.fields.productionDays,
    materials: d.products.fields.materials,
    dimensions: d.products.fields.dimensions,
    photos: d.products.fields.photos,
  };

  return (
    <>
      <PageHeader
        title={t(product.name) || d.products.fields.name}
        description={t(product.description)}
        breadcrumb={
          <Button
            variant="quiet"
            size="sm"
            className="-ms-3"
            onClick={() => router.push("/products")}
          >
            <ArrowLeft aria-hidden />
            {d.products.title}
          </Button>
        }
        action={
          <>
            <Button variant="outline" onClick={() => saveChanges()}>
              <Save aria-hidden />
              {d.common.saveChanges}
            </Button>
            {product.status === "public" ? (
              isOwner ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    dispatch({
                      type: "productUnpublish",
                      productId: product.id,
                      actorId: me.id,
                    });
                    toast(d.products.unpublish);
                  }}
                >
                  <EyeOff aria-hidden />
                  {d.products.unpublish}
                </Button>
              ) : null
            ) : product.status === "in_review" ? null : isOwner ? (
              <Button onClick={publish}>
                <Check aria-hidden />
                {d.products.publish}
              </Button>
            ) : (
              <Button onClick={submitForApproval}>
                <Send aria-hidden />
                {d.products.submitForApprovalShort}
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* ------------------------------------------------------ edit panel */}
        <div className="space-y-5">
          {product.status === "in_review" ? (
            <Note tone="approval">{d.products.waitingForApproval}</Note>
          ) : null}

          <EditCard title={d.productForm.stepBasics}>
            <BasicsSection value={draft} onChange={patch} />
          </EditCard>

          <EditCard title={d.productForm.stepStory}>
            <StorySection value={draft} onChange={patch} />
          </EditCard>

          <EditCard title={d.productForm.stepMaking}>
            <MakingSection value={draft} onChange={patch} />
          </EditCard>

          <EditCard title={d.productForm.stepPrice}>
            {isOwner ? (
              <PriceSection value={draft} onChange={patch} role={me.role} />
            ) : (
              <div className="space-y-4">
                <Note tone="approval">{d.permissions.suggestInstead}</Note>
                <dl className="flex items-baseline gap-3">
                  <dt className="text-sm text-stone">{d.products.currentPrice}</dt>
                  <dd className="font-display text-2xl font-semibold">
                    {formatPrice(product.price, locale, d.common.priceOnRequest)}
                  </dd>
                </dl>
                <Button variant="outline" onClick={() => setPriceOpen(true)}>
                  <BadgeDollarSign aria-hidden />
                  {d.products.suggestPrice}
                </Button>
              </div>
            )}
          </EditCard>

          <EditCard title={d.productForm.stepPhotos}>
            <PhotosSection value={draft} onChange={patch} />
          </EditCard>

          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden />
              {d.common.delete}
            </Button>
            <Button onClick={() => saveChanges()}>
              <Save aria-hidden />
              {d.common.saveChanges}
            </Button>
          </div>
        </div>

        {/* ----------------------------------------------------- status rail */}
        <div className="space-y-5">
          <Card>
            <CardBody className="space-y-4 pt-5">
              <div className="flex flex-wrap gap-2">
                <ProductStatusBadge status={product.status} />
                <StockBadge status={product.stockStatus} />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-stone">{d.products.completeness}</span>
                  <span className="font-medium tabular-nums">{state_?.percent}%</span>
                </div>
                <Progress
                  value={state_?.percent ?? 0}
                  label={d.products.completeness}
                  tone={state_?.isComplete ? "sage" : "pomegranate"}
                />
              </div>

              {state_ && state_.missing.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-charcoal">{d.products.missingLabel}</p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {state_.missing.map((field) => (
                      <li
                        key={field}
                        className="rounded-[0.3125rem] border border-line bg-surface-sunk px-2.5 py-1 text-xs text-stone"
                      >
                        {missingLabels[field]}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h3" className="text-base">
                {d.products.history}
              </CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              {product.history.length === 0 ? (
                <p className="text-sm text-stone">{d.products.historyEmpty}</p>
              ) : (
                <ol className="space-y-3">
                  {[...product.history].reverse().map((entry) => {
                    const actor = state.members.find((m) => m.id === entry.actorId);
                    return (
                      <li key={entry.id} className="flex gap-2.5">
                        {actor ? <Avatar member={actor} size="sm" /> : null}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">
                            <span className="font-medium">{actor?.name ?? d.common.notSet}</span>{" "}
                            <span className="text-stone">
                              {d.products.historyKinds[entry.kind]}
                            </span>
                          </p>
                          {entry.note ? (
                            <p className="mt-0.5 text-sm italic text-stone">{entry.note}</p>
                          ) : null}
                          <p className="mt-0.5 text-xs text-stone">
                            {relativeTime(entry.at, locale)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <SuggestPriceDialog
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        currentPrice={product.price}
        onSubmit={(price, reason) => {
          dispatch({
            type: "priceSuggest",
            productId: product.id,
            price,
            reason,
            actorId: me.id,
          });
          toast(d.products.approvalSent);
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          dispatch({ type: "productDelete", productId: product.id, actorId: me.id });
          router.push("/products");
        }}
        title={d.products.deleteConfirmTitle}
        body={d.products.deleteConfirmBody}
        confirmLabel={d.common.delete}
        cancelLabel={d.common.cancel}
        closeLabel={d.common.close}
      />
    </>
  );
}

function EditCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card as="section">
      <CardHeader>
        <CardTitle as="h2" className="text-base">
          {title}
        </CardTitle>
      </CardHeader>
      <CardBody className="pt-0">{children}</CardBody>
    </Card>
  );
}

function SuggestPriceDialog({
  open,
  onClose,
  currentPrice,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  currentPrice: number | null;
  onSubmit: (price: number | null, reason: string) => void;
}) {
  const { d, locale } = useI18n();
  const [price, setPrice] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={d.products.suggestPrice}
      description={d.products.suggestPriceBody}
      closeLabel={d.common.close}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {d.common.cancel}
          </Button>
          <Button
            onClick={() => {
              const value = Number(price);
              if (!price.trim() || Number.isNaN(value) || value <= 0) {
                setError(d.errors.positiveNumber);
                return;
              }
              onSubmit(value, reason.trim());
              setPrice("");
              setReason("");
              setError(undefined);
              onClose();
            }}
          >
            <Send aria-hidden />
            {d.products.sendSuggestion}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-stone">
          {d.products.currentPrice}:{" "}
          <span className="font-medium text-charcoal">
            {formatPrice(currentPrice, locale, d.common.priceOnRequest)}
          </span>
        </p>

        <Field label={d.products.suggestedPriceLabel} required error={error}>
          <Input
            type="number"
            inputMode="decimal"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="max-w-40"
          />
        </Field>

        <Field label={d.products.suggestReasonLabel}>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={d.products.suggestReasonPlaceholder}
            rows={3}
          />
        </Field>
      </div>
    </Dialog>
  );
}

/**
 * The id arrives as a query parameter rather than a path segment. Product ids
 * are minted at runtime (lib/utils.ts), so a static export can never have
 * pre-rendered /products/<id> — but one /products/detail/ page serves every
 * id, whenever it was created. `useSearchParams` suspends, so the boundary
 * below is required for the export to build.
 */
export default function ProductDetailPage() {
  return (
    <Suspense fallback={null}>
      <ProductDetailInner />
    </Suspense>
  );
}
