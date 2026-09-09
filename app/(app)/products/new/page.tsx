"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Save, Send } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import {
  BasicsSection,
  MakingSection,
  PhotosSection,
  PriceSection,
  StorySection,
  applyDraft,
  emptyDraft,
  type ProductDraftValue,
} from "@/components/domain/product-fields";
import { ProductImageView } from "@/components/domain/textile-image";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Note } from "@/components/ui/note";
import { Stepper } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { coverImage } from "@/lib/data/selectors";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import { formatPrice, newId, nowIso } from "@/lib/utils";

/**
 * Adding a product, as a conversation rather than a form.
 *
 * Six short steps, each one question at a time, and nothing required except a
 * name — an artisan can save a half-finished piece and come back to it, which
 * is how the demo's unfinished drafts got there.
 */
export default function NewProductPage() {
  const { dispatch, me } = useStore();
  const { d, locale } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProductDraftValue>(emptyDraft);
  const [nameError, setNameError] = useState<string>();
  const [confirmLeave, setConfirmLeave] = useState(false);

  const steps = [
    d.productForm.stepBasics,
    d.productForm.stepStory,
    d.productForm.stepMaking,
    d.productForm.stepPrice,
    d.productForm.stepPhotos,
    d.productForm.stepReview,
  ];

  const isOwner = me.role === "owner";
  const patch = (value: Partial<ProductDraftValue>) => setDraft((current) => ({ ...current, ...value }));

  function buildProduct(): Product {
    const base: Product = {
      id: newId("product"),
      name: { en: "", az: "" },
      category: "home_textiles",
      description: { en: "", az: "" },
      story: { en: "", az: "" },
      price: null,
      priceOnRequest: false,
      productionDays: null,
      materials: [],
      dimensions: "",
      stockStatus: "available",
      madeToOrder: true,
      status: "draft",
      images: [],
      createdBy: me.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      history: [],
    };
    return applyDraft(base, draft, locale);
  }

  function requireName(): boolean {
    if (draft.name.trim()) {
      setNameError(undefined);
      return true;
    }
    setNameError(d.productForm.requiredName);
    setStep(0);
    return false;
  }

  function save(then: "draft" | "submit" | "publish") {
    if (!requireName()) return;
    const product = buildProduct();
    dispatch({ type: "productSave", product, actorId: me.id, isNew: true });

    if (then === "submit") {
      dispatch({ type: "productSubmit", productId: product.id, actorId: me.id });
      toast(d.products.approvalSent);
    } else if (then === "publish") {
      dispatch({ type: "productPublish", productId: product.id, actorId: me.id });
      toast(d.status.product.public);
    } else {
      toast(d.productForm.savedDraft);
    }

    router.push(`/products/${product.id}`);
  }

  const dirty =
    draft.name.trim() !== "" ||
    draft.description.trim() !== "" ||
    draft.story.trim() !== "" ||
    draft.images.length > 0;

  return (
    <>
      <PageHeader
        title={d.productForm.newTitle}
        description={d.productForm.newSubtitle}
        breadcrumb={
          <Button
            variant="quiet"
            size="sm"
            className="-ms-3"
            onClick={() => (dirty ? setConfirmLeave(true) : router.push("/products"))}
          >
            <ArrowLeft aria-hidden />
            {d.products.title}
          </Button>
        }
      />

      <div className="mx-auto max-w-2xl">
        <Stepper
          steps={steps}
          current={step}
          stepLabel={d.onboarding.stepLabel}
          ofLabel={d.common.of}
        />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{steps[step]}</CardTitle>
          </CardHeader>
          <CardBody>
            {step === 0 ? (
              <BasicsSection value={draft} onChange={patch} errors={{ name: nameError }} />
            ) : null}
            {step === 1 ? <StorySection value={draft} onChange={patch} /> : null}
            {step === 2 ? <MakingSection value={draft} onChange={patch} /> : null}
            {step === 3 ? <PriceSection value={draft} onChange={patch} role={me.role} /> : null}
            {step === 4 ? <PhotosSection value={draft} onChange={patch} /> : null}
            {step === 5 ? <ReviewStep draft={draft} /> : null}
          </CardBody>
        </Card>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft aria-hidden />
            {d.common.back}
          </Button>

          {step < steps.length - 1 ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => save("draft")}>
                <Save aria-hidden />
                {d.productForm.saveDraft}
              </Button>
              <Button
                onClick={() => {
                  if (step === 0 && !requireName()) return;
                  setStep((s) => Math.min(steps.length - 1, s + 1));
                }}
              >
                {d.common.next}
                <ArrowRight aria-hidden />
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => save("draft")}>
                <Save aria-hidden />
                {d.productForm.saveDraft}
              </Button>
              {isOwner ? (
                <Button onClick={() => save("publish")}>
                  <Check aria-hidden />
                  {d.productForm.saveAndPublish}
                </Button>
              ) : (
                <Button onClick={() => save("submit")}>
                  <Send aria-hidden />
                  {d.productForm.saveAndSubmit}
                </Button>
              )}
            </div>
          )}
        </div>

        {step === steps.length - 1 && !isOwner ? (
          <Note tone="approval" className="mt-4">
            {d.permissions.ownerConfirmNeeded}
          </Note>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={() => router.push("/products")}
        title={d.productForm.unsavedTitle}
        body={d.productForm.unsavedBody}
        confirmLabel={d.productForm.leave}
        cancelLabel={d.productForm.stayHere}
        closeLabel={d.common.close}
      />
    </>
  );
}

function ReviewStep({ draft }: { draft: ProductDraftValue }) {
  const { d, locale } = useI18n();
  const cover = draft.images.find((i) => i.isCover) ?? draft.images[0];

  const rows: { label: string; value: string }[] = [
    { label: d.products.fields.name, value: draft.name || "—" },
    { label: d.products.fields.category, value: d.products.categories[draft.category] },
    { label: d.products.fields.description, value: draft.description || "—" },
    { label: d.products.fields.story, value: draft.story || "—" },
    {
      label: d.products.fields.price,
      value: draft.priceOnRequest
        ? d.common.priceOnRequest
        : draft.price
          ? formatPrice(Number(draft.price), locale, d.common.priceOnRequest)
          : "—",
    },
    {
      label: d.products.fields.productionDays,
      value: draft.productionDays ? d.products.days(Number(draft.productionDays)) : "—",
    },
    {
      label: d.products.fields.materials,
      value: draft.materials.length > 0 ? draft.materials.join(", ") : "—",
    },
    { label: d.products.fields.dimensions, value: draft.dimensions || "—" },
  ];

  return (
    <div className="space-y-5">
      <p className="text-[0.9375rem] text-stone">{d.productForm.reviewBody}</p>

      {cover ? (
        <div className="aspect-[4/3] max-w-sm overflow-hidden rounded-[var(--radius-field)] border border-line">
          <ProductImageView image={cover} alt="" />
        </div>
      ) : null}

      <dl className="divide-y divide-line rounded-[var(--radius-field)] border border-line">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-sm font-medium text-stone">{row.label}</dt>
            <dd className="whitespace-pre-line text-[0.9375rem] text-charcoal">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
