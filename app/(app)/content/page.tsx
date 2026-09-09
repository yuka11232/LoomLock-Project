"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Megaphone, Pencil, Plus, RotateCcw, Send } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { CaptionEditor } from "@/components/domain/caption-editor";
import { PostPreview } from "@/components/domain/post-preview";
import { ContentStatusBadge } from "@/components/domain/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Textarea } from "@/components/ui/field";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { Note } from "@/components/ui/note";
import { useToast } from "@/components/ui/toast";
import { coverImage } from "@/lib/data/selectors";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import type { ContentDraft, ContentStatus } from "@/lib/types";
import { relativeTime } from "@/lib/utils";
import { ProductImageView } from "@/components/domain/textile-image";

type Filter = "all" | ContentStatus;

export default function ContentPage() {
  return (
    <Suspense>
      <ContentStudio />
    </Suspense>
  );
}

function ContentStudio() {
  const { state, me, dispatch } = useStore();
  const { d, t, locale } = useI18n();
  const toast = useToast();
  const params = useSearchParams();

  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(params.get("highlight"));
  const [returnNote, setReturnNote] = useState("");
  const [returnFor, setReturnFor] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string>();

  const isOwner = me.role === "owner";

  const counts = useMemo(() => {
    const by = (status: ContentStatus) =>
      state.contentDrafts.filter((c) => c.status === status).length;
    return {
      all: state.contentDrafts.length,
      draft: by("draft"),
      in_review: by("in_review"),
      approved: by("approved"),
      changes_requested: by("changes_requested"),
    };
  }, [state.contentDrafts]);

  const visible = state.contentDrafts.filter((c) => filter === "all" || c.status === filter);
  const openDraft = state.contentDrafts.find((c) => c.id === openId) ?? null;
  const openProduct = openDraft
    ? state.products.find((p) => p.id === openDraft.productId)
    : undefined;

  function patchDraft(draft: ContentDraft, patch: Partial<ContentDraft>) {
    dispatch({
      type: "contentSave",
      draft: { ...draft, ...patch },
      actorId: me.id,
      isNew: false,
    });
  }

  /** The pending approval that belongs to this draft, if any. */
  function approvalFor(draftId: string) {
    return state.approvals.find((a) => a.targetId === draftId && a.status === "pending");
  }

  return (
    <>
      <PageHeader
        title={d.content.title}
        description={d.content.subtitle}
        action={
          <ButtonLink href="/content/new">
            <Plus aria-hidden />
            {d.content.newDraft}
          </ButtonLink>
        }
      />

      <Note tone="info" title={d.content.notPublishedNotice} className="mb-5">
        {d.content.notPublishedBody}
      </Note>

      <FilterTabs<Filter>
        className="mb-5"
        label={d.common.filter}
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: d.content.filterAll, count: counts.all },
          { value: "draft", label: d.content.filterDraft, count: counts.draft },
          { value: "in_review", label: d.content.filterInReview, count: counts.in_review },
          { value: "approved", label: d.content.filterApproved, count: counts.approved },
          {
            value: "changes_requested",
            label: d.content.filterChanges,
            count: counts.changes_requested,
          },
        ]}
      />

      {visible.length === 0 ? (
        filter === "all" ? (
          <EmptyState
            icon={<Megaphone />}
            title={d.content.emptyTitle}
            body={d.content.emptyBody}
            action={
              <ButtonLink href="/content/new">
                <Plus aria-hidden />
                {d.content.newDraft}
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            icon={<Megaphone />}
            title={d.content.emptyFilteredTitle}
            body={d.content.emptyFilteredBody}
          />
        )
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((draft) => {
            const product = state.products.find((p) => p.id === draft.productId);
            const author = state.members.find((m) => m.id === draft.createdBy);
            const cover = product ? coverImage(product) : undefined;

            return (
              <Card as="li" key={draft.id} className="flex flex-col overflow-hidden">
                <div className="flex gap-3 p-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-[var(--radius-field)] bg-linen">
                    <ProductImageView image={cover} alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <ContentStatusBadge status={draft.status} size="sm" />
                    <p className="mt-1.5 truncate font-medium">
                      {product ? t(product.name) : d.content.forProduct}
                    </p>
                    <p className="text-xs text-stone">
                      {d.content.goals[draft.goal]} · {d.content.platforms[draft.platform]}
                    </p>
                  </div>
                </div>

                <div className="px-4">
                  <p className="line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-stone">
                    {draft.caption}
                  </p>
                </div>

                {draft.status === "changes_requested" && draft.reviewNote ? (
                  <div className="mx-4 mt-3 rounded-[var(--radius-field)] border border-clay/30 bg-clay-100/60 p-3">
                    <p className="text-xs font-semibold text-[#82452f]">
                      {d.content.changesRequested}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-[#6f3d2a]">{draft.reviewNote}</p>
                  </div>
                ) : null}

                <div className="mt-auto flex items-center gap-2 border-t border-line px-4 py-3">
                  {author ? <Avatar member={author} size="sm" /> : null}
                  <span className="min-w-0 flex-1 truncate text-xs text-stone">
                    {relativeTime(draft.updatedAt, locale)}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setOpenId(draft.id)}>
                    <Pencil aria-hidden />
                    {d.common.open}
                  </Button>
                </div>
              </Card>
            );
          })}
        </ul>
      )}

      {/* ---------------------------------------------------------- editor */}
      <Dialog
        open={Boolean(openDraft)}
        onClose={() => setOpenId(null)}
        title={openProduct ? t(openProduct.name) : d.content.title}
        description={
          openDraft
            ? `${d.content.goals[openDraft.goal]} · ${d.content.tones[openDraft.tone]}`
            : undefined
        }
        closeLabel={d.common.close}
        size="lg"
        footer={
          openDraft ? (
            <ContentActions
              draft={openDraft}
              isOwner={isOwner}
              onSubmit={() => {
                dispatch({ type: "contentSubmit", draftId: openDraft.id, actorId: me.id });
                toast(d.products.approvalSent);
                setOpenId(null);
              }}
              onApprove={() => {
                const approval = approvalFor(openDraft.id);
                if (approval) {
                  dispatch({
                    type: "approvalDecide",
                    approvalId: approval.id,
                    decision: "approve",
                    note: "",
                    actorId: me.id,
                  });
                } else {
                  // Approving a draft the owner wrote themselves needs no queue.
                  patchDraft(openDraft, { status: "approved", reviewNote: undefined });
                }
                toast(d.approvals.approvedToast);
                setOpenId(null);
              }}
              onRequestChanges={() => {
                setReturnFor(openDraft.id);
                setReturnNote("");
                setNoteError(undefined);
              }}
            />
          ) : null
        }
      >
        {openDraft ? (
          <div className="space-y-6">
            {openDraft.status === "in_review" && !isOwner ? (
              <Note tone="approval">{d.content.waitingForOwner}</Note>
            ) : null}
            {openDraft.status === "approved" ? (
              <Note tone="info" title={d.content.approved}>
                {d.content.approvedBody}
              </Note>
            ) : null}
            {openDraft.status === "changes_requested" && openDraft.reviewNote ? (
              <Note tone="caution" title={d.content.changesRequested}>
                {openDraft.reviewNote}
              </Note>
            ) : null}

            <CaptionEditor
              draft={openDraft}
              product={openProduct}
              onChange={(patch) => patchDraft(openDraft, patch)}
            />

            <div>
              <h3 className="text-sm font-semibold">{d.content.previewTitle}</h3>
              <p className="mb-3 text-sm text-stone">{d.content.previewNote}</p>
              <PostPreview
                product={openProduct}
                caption={openDraft.caption}
                hashtags={openDraft.hashtags}
                platform={openDraft.platform}
                businessName={state.business.name}
              />
            </div>
          </div>
        ) : null}
      </Dialog>

      {/* ------------------------------------------------- send back dialog */}
      <Dialog
        open={Boolean(returnFor)}
        onClose={() => setReturnFor(null)}
        title={d.content.requestChanges}
        closeLabel={d.common.close}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setReturnFor(null)}>
              {d.common.cancel}
            </Button>
            <Button
              onClick={() => {
                if (!returnNote.trim()) {
                  setNoteError(d.approvals.sendBackNoteRequired);
                  return;
                }
                const draft = state.contentDrafts.find((c) => c.id === returnFor);
                if (!draft) return;
                const approval = approvalFor(draft.id);
                if (approval) {
                  dispatch({
                    type: "approvalDecide",
                    approvalId: approval.id,
                    decision: "return",
                    note: returnNote,
                    actorId: me.id,
                  });
                } else {
                  patchDraft(draft, {
                    status: "changes_requested",
                    reviewNote: returnNote.trim(),
                  });
                }
                toast(d.approvals.returnedToast);
                setReturnFor(null);
                setOpenId(null);
              }}
            >
              <RotateCcw aria-hidden />
              {d.approvals.sendBack}
            </Button>
          </>
        }
      >
        <Field label={d.content.reviewNoteLabel} required error={noteError}>
          <Textarea
            value={returnNote}
            onChange={(event) => setReturnNote(event.target.value)}
            placeholder={d.content.reviewNotePlaceholder}
            rows={4}
          />
        </Field>
      </Dialog>
    </>
  );
}

function ContentActions({
  draft,
  isOwner,
  onSubmit,
  onApprove,
  onRequestChanges,
}: {
  draft: ContentDraft;
  isOwner: boolean;
  onSubmit: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
}) {
  const { d } = useI18n();

  if (draft.status === "approved") {
    return (
      <Link href="/content" className="text-sm text-stone hover:text-charcoal hover:underline">
        {d.common.done}
      </Link>
    );
  }

  if (isOwner) {
    return (
      <>
        <Button variant="outline" onClick={onRequestChanges}>
          <RotateCcw aria-hidden />
          {d.content.requestChanges}
        </Button>
        <Button onClick={onApprove}>
          <Check aria-hidden />
          {d.content.approve}
        </Button>
      </>
    );
  }

  if (draft.status === "in_review") {
    return <p className="text-sm text-stone">{d.content.waitingForOwner}</p>;
  }

  return (
    <Button onClick={onSubmit}>
      <Send aria-hidden />
      {d.content.submitForApproval}
    </Button>
  );
}
