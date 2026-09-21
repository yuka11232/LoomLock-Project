"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Package, Save, Send } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { CaptionEditor } from "@/components/domain/caption-editor";
import { PostPreview } from "@/components/domain/post-preview";
import { ProductImageView } from "@/components/domain/textile-image";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RadioCards } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { Stepper } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { buildCaptionStarter, buildHashtags } from "@/lib/content-starters";
import { coverImage } from "@/lib/data/selectors";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import type { ContentDraft, ContentGoal, ContentPlatform, ContentTone } from "@/lib/types";
import { cn, newId, nowIso } from "@/lib/utils";

/**
 * Preparing a post, in four steps.
 *
 * The caption is only generated once the family has chosen a product, a goal,
 * and a tone, because the starter is assembled from that product's own fields,
 * and there is nothing honest to write before then.
 */
export default function NewContentPage() {
  const { state, me, dispatch } = useStore();
  const { d, t, locale } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState<string | null>(null);
  const [goal, setGoal] = useState<ContentGoal>("introduce");
  const [tone, setTone] = useState<ContentTone>("warm");
  const [platform, setPlatform] = useState<ContentPlatform>("instagram");
  const [draft, setDraft] = useState<ContentDraft | null>(null);

  const isOwner = me.role === "owner";
  const product = state.products.find((p) => p.id === productId);

  const steps = [
    d.content.stepChoose,
    d.content.stepGoal,
    d.content.stepWrite,
    d.content.stepPreview,
  ];

  if (state.products.length === 0) {
    return (
      <>
        <PageHeader title={d.content.newDraft} />
        <EmptyState
          icon={<Package />}
          title={d.content.noProductsTitle}
          body={d.content.noProductsBody}
          action={<ButtonLink href="/products/new">{d.products.newProduct}</ButtonLink>}
        />
      </>
    );
  }

  /** Build the draft when entering the writing step, so the starter is fresh. */
  function beginWriting() {
    if (!product) return;
    setDraft({
      id: newId("content"),
      productId: product.id,
      goal,
      tone,
      platform,
      caption: buildCaptionStarter({ product, goal, tone, locale }),
      hashtags: buildHashtags(product),
      status: "draft",
      createdBy: me.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      language: locale,
    });
    setStep(2);
  }

  function save(then: "draft" | "submit") {
    if (!draft) return;
    dispatch({ type: "contentSave", draft, actorId: me.id, isNew: true });
    if (then === "submit") {
      dispatch({ type: "contentSubmit", draftId: draft.id, actorId: me.id });
      toast(d.products.approvalSent);
    } else {
      toast(d.content.createdDraft);
    }
    router.push("/content");
  }

  return (
    <>
      <PageHeader
        title={d.content.newDraft}
        description={d.content.subtitle}
        breadcrumb={
          <Button
            variant="quiet"
            size="sm"
            className="-ms-3"
            onClick={() => router.push("/content")}
          >
            <ArrowLeft aria-hidden />
            {d.content.title}
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
            {/* ------------------------------------------- 1. choose product */}
            {step === 0 ? (
              <div className="space-y-4">
                <p className="text-[0.9375rem] text-stone">{d.content.chooseProductBody}</p>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {state.products.map((item) => {
                    const cover = coverImage(item);
                    const selected = item.id === productId;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setProductId(item.id)}
                          aria-pressed={selected}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-[var(--radius-field)] border p-2.5 text-start transition-colors",
                            selected
                              ? "border-pomegranate bg-pomegranate-100/60"
                              : "border-line bg-surface hover:border-walnut/40 hover:bg-surface-sunk",
                          )}
                        >
                          <span className="size-12 shrink-0 overflow-hidden rounded-[0.5rem] bg-linen">
                            <ProductImageView image={cover} alt="" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{t(item.name)}</span>
                            <span className="block truncate text-xs text-stone">
                              {d.products.categories[item.category]}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {product && !t(product.story).trim() ? (
                  <Note tone="caution">{d.content.productHasNoStory}</Note>
                ) : null}
              </div>
            ) : null}

            {/* --------------------------------------------- 2. goal and tone */}
            {step === 1 ? (
              <div className="space-y-6">
                <RadioCards
                  legend={d.content.goalLabel}
                  name="goal"
                  value={goal}
                  onChange={setGoal}
                  options={(["introduce", "story", "availability", "process"] as ContentGoal[]).map(
                    (value) => ({
                      value,
                      label: d.content.goals[value],
                      description: d.content.goalHelp[value],
                    }),
                  )}
                />

                <RadioCards
                  legend={d.content.toneLabel}
                  name="tone"
                  value={tone}
                  onChange={setTone}
                  options={(["warm", "informative", "simple", "story"] as ContentTone[]).map(
                    (value) => ({
                      value,
                      label: d.content.tones[value],
                      description: d.content.toneHelp[value],
                    }),
                  )}
                />

                <RadioCards
                  legend={d.content.platformLabel}
                  name="platform"
                  value={platform}
                  onChange={setPlatform}
                  columns={3}
                  options={(["instagram", "facebook", "note"] as ContentPlatform[]).map(
                    (value) => ({ value, label: d.content.platforms[value] }),
                  )}
                />
              </div>
            ) : null}

            {/* ------------------------------------------------- 3. write it */}
            {step === 2 && draft ? (
              <CaptionEditor
                draft={draft}
                product={product}
                onChange={(patch) => setDraft({ ...draft, ...patch })}
              />
            ) : null}

            {/* --------------------------------------------------- 4. review */}
            {step === 3 && draft ? (
              <div className="space-y-4">
                <p className="text-[0.9375rem] text-stone">{d.content.previewNote}</p>
                <PostPreview
                  product={product}
                  caption={draft.caption}
                  hashtags={draft.hashtags}
                  platform={draft.platform}
                  businessName={state.business.name}
                />
                {!isOwner ? <Note tone="approval">{d.permissions.ownerConfirmNeeded}</Note> : null}
              </div>
            ) : null}
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

          {step === 0 ? (
            <Button onClick={() => setStep(1)} disabled={!productId}>
              {d.common.next}
              <ArrowRight aria-hidden />
            </Button>
          ) : null}

          {step === 1 ? (
            <Button onClick={beginWriting}>
              {d.common.next}
              <ArrowRight aria-hidden />
            </Button>
          ) : null}

          {step === 2 ? (
            <Button onClick={() => setStep(3)}>
              {d.common.next}
              <ArrowRight aria-hidden />
            </Button>
          ) : null}

          {step === 3 ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => save("draft")}>
                <Save aria-hidden />
                {d.productForm.saveDraft}
              </Button>
              {isOwner ? null : (
                <Button onClick={() => save("submit")}>
                  <Send aria-hidden />
                  {d.content.submitForApproval}
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
