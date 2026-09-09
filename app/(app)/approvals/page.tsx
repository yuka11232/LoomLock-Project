"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  Check,
  ClipboardCheck,
  Megaphone,
  MessageSquareText,
  Package,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { ApprovalStatusBadge } from "@/components/domain/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody, SectionHeading } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Textarea } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { useToast } from "@/components/ui/toast";
import { decidedApprovals, pendingApprovals } from "@/lib/data/selectors";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import type { Approval, ApprovalType } from "@/lib/types";
import { formatPrice, relativeTime } from "@/lib/utils";

const TYPE_ICON: Record<ApprovalType, typeof Package> = {
  product_publish: Package,
  content_publish: Megaphone,
  price_change: BadgeDollarSign,
  customer_reply: MessageSquareText,
};

/**
 * The approval queue.
 *
 * For the owner this is a short list of decisions. For a collaborator it is a
 * record of what they sent and what came back — deliberately visible, because
 * "waiting on somebody" is only frustrating when you cannot see it.
 */
export default function ApprovalsPage() {
  const { state, me, dispatch } = useStore();
  const { d, t, locale } = useI18n();
  const toast = useToast();

  const isOwner = me.role === "owner";
  const pending = pendingApprovals(state);
  const decided = decidedApprovals(state);

  const [decision, setDecision] = useState<{ approval: Approval; kind: "approve" | "return" } | null>(
    null,
  );
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string>();

  function commit() {
    if (!decision) return;
    if (decision.kind === "return" && !note.trim()) {
      setNoteError(d.approvals.sendBackNoteRequired);
      return;
    }
    dispatch({
      type: "approvalDecide",
      approvalId: decision.approval.id,
      decision: decision.kind,
      note,
      actorId: me.id,
    });
    toast(decision.kind === "approve" ? d.approvals.approvedToast : d.approvals.returnedToast);
    setDecision(null);
    setNote("");
    setNoteError(undefined);
  }

  /** Where to look at the thing being approved. */
  function targetHref(approval: Approval): string | null {
    switch (approval.type) {
      case "product_publish":
      case "price_change":
        return `/products/${approval.targetId}`;
      case "content_publish":
        return `/content?highlight=${approval.targetId}`;
      case "customer_reply":
        return approval.payload?.orderId ? `/orders/${approval.payload.orderId}` : null;
    }
  }

  return (
    <>
      <PageHeader
        title={d.approvals.title}
        description={isOwner ? d.approvals.subtitleOwner : d.approvals.subtitleCollab}
      />

      {!isOwner ? (
        <Note tone="info" title={d.approvals.notYourApproval} className="mb-5">
          {d.approvals.notYourApprovalBody}
        </Note>
      ) : null}

      <section aria-labelledby="pending-heading" className="mb-8">
        <SectionHeading
          id="pending-heading"
          title={isOwner ? d.approvals.pending : d.approvals.pendingCollab}
        />

        {pending.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck />}
            title={d.approvals.emptyTitle}
            body={isOwner ? d.approvals.emptyBody : d.approvals.emptyBodyCollab}
          />
        ) : (
          <ul className="space-y-4">
            {pending.map((approval) => {
              const Icon = TYPE_ICON[approval.type];
              const requester = state.members.find((m) => m.id === approval.requestedBy);
              const href = targetHref(approval);

              return (
                <Card as="li" key={approval.id}>
                  <CardBody className="pt-5">
                    <div className="flex flex-wrap items-start gap-3">
                      <span
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-[#8a6316]"
                      >
                        <Icon className="size-[18px]" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-stone">
                          {d.approvals.types[approval.type]}
                        </p>
                        <h3 className="mt-0.5 font-display text-lg font-semibold leading-snug">
                          {t(approval.title)}
                        </h3>
                        <p className="mt-1 text-[0.9375rem] leading-relaxed text-stone">
                          {t(approval.summary)}
                        </p>

                        {approval.type === "price_change" ? (
                          <PriceComparison approval={approval} />
                        ) : null}

                        {approval.payload?.message ? (
                          <p className="mt-3 whitespace-pre-line rounded-[var(--radius-field)] border border-line bg-surface-sunk p-3 text-sm leading-relaxed">
                            {approval.payload.message}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone">
                          {requester ? <Avatar member={requester} size="sm" /> : null}
                          <span>
                            {d.approvals.requestedBy(requester?.name ?? "—")} ·{" "}
                            {relativeTime(approval.requestedAt, locale)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                      {href ? (
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-ink hover:underline"
                        >
                          {d.approvals.openItem}
                          <ArrowRight aria-hidden className="size-4" />
                        </Link>
                      ) : null}

                      {isOwner ? (
                        <div className="ms-auto flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDecision({ approval, kind: "return" });
                              setNote("");
                              setNoteError(undefined);
                            }}
                          >
                            <RotateCcw aria-hidden />
                            {d.approvals.sendBack}
                          </Button>
                          <Button
                            onClick={() => {
                              setDecision({ approval, kind: "approve" });
                              setNote("");
                              setNoteError(undefined);
                            }}
                          >
                            <Check aria-hidden />
                            {d.approvals.approve}
                          </Button>
                        </div>
                      ) : (
                        <span className="ms-auto">
                          <ApprovalStatusBadge status="pending" />
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </ul>
        )}
      </section>

      {decided.length > 0 ? (
        <section aria-labelledby="decided-heading">
          <SectionHeading id="decided-heading" title={d.approvals.decided} />
          <Card>
            <ul className="divide-y divide-line">
              {decided.slice(0, 10).map((approval) => {
                const decider = state.members.find((m) => m.id === approval.decidedBy);
                return (
                  <li key={approval.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{t(approval.title)}</p>
                        <p className="mt-0.5 text-xs text-stone">
                          {decider?.name ?? "—"} ·{" "}
                          {approval.decidedAt ? relativeTime(approval.decidedAt, locale) : ""}
                        </p>
                      </div>
                      <ApprovalStatusBadge status={approval.status} size="sm" />
                    </div>
                    {approval.reviewNote ? (
                      <p className="mt-2 border-s-2 border-line ps-3 text-sm italic leading-relaxed text-stone">
                        {approval.reviewNote}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      ) : null}

      <Dialog
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        title={
          decision?.kind === "approve" ? d.approvals.approveConfirmTitle : d.approvals.sendBack
        }
        description={decision ? t(decision.approval.title) : undefined}
        closeLabel={d.common.close}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDecision(null)}>
              {d.common.cancel}
            </Button>
            <Button variant={decision?.kind === "approve" ? "primary" : "danger"} onClick={commit}>
              {decision?.kind === "approve" ? (
                <>
                  <Check aria-hidden />
                  {d.approvals.approve}
                </>
              ) : (
                <>
                  <RotateCcw aria-hidden />
                  {d.approvals.sendBack}
                </>
              )}
            </Button>
          </>
        }
      >
        <Field
          label={
            decision?.kind === "approve" ? d.approvals.reviewNoteLabel : d.approvals.sendBackNoteLabel
          }
          required={decision?.kind === "return"}
          error={noteError}
        >
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              decision?.kind === "return" ? d.content.reviewNotePlaceholder : undefined
            }
            rows={4}
          />
        </Field>
      </Dialog>
    </>
  );
}

function PriceComparison({ approval }: { approval: Approval }) {
  const { d, locale } = useI18n();
  const { fromPrice, toPrice, reason } = approval.payload ?? {};

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-[var(--radius-field)] border border-line bg-surface-sunk px-3 py-2">
          <span className="block text-xs text-stone">{d.approvals.priceFrom}</span>
          <span className="block font-semibold tabular-nums">
            {formatPrice(fromPrice ?? null, locale, d.common.priceOnRequest)}
          </span>
        </span>
        <ArrowRight aria-hidden className="size-4 text-stone rtl:rotate-180" />
        <span className="rounded-[var(--radius-field)] border border-pomegranate/30 bg-pomegranate-100/60 px-3 py-2">
          <span className="block text-xs text-pomegranate-600">{d.approvals.priceTo}</span>
          <span className="block font-semibold tabular-nums text-pomegranate-600">
            {formatPrice(toPrice ?? null, locale, d.common.priceOnRequest)}
          </span>
        </span>
      </div>
      {reason ? (
        <p className="border-s-2 border-line ps-3 text-sm italic leading-relaxed text-stone">
          {reason}
        </p>
      ) : null}
    </div>
  );
}
