"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  MessageSquareText,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { OrderStageBadge } from "@/components/domain/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { copyText, useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import { buildTemplate, TEMPLATE_COMMITS, TEMPLATE_KEYS, type TemplateKey } from "@/lib/message-templates";
import { ORDER_STAGES, type OrderStage } from "@/lib/types";
import { cn, formatDate, formatDateTime, formatPrice, relativeTime } from "@/lib/utils";

function OrderDetailInner() {
  const id = useSearchParams().get("id") ?? "";
  const { state, me, dispatch } = useStore();
  const { d, t, locale } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const order = state.orders.find((o) => o.id === id);

  const [note, setNote] = useState("");
  const [templateKey, setTemplateKey] = useState<TemplateKey>("price");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!order) {
    return (
      <EmptyState
        icon={<Search />}
        title={d.errors.notFound}
        body={d.errors.notFoundBody}
        action={
          <Button variant="outline" onClick={() => router.push("/orders")}>
            {d.errors.goBack}
          </Button>
        }
      />
    );
  }

  const product = state.products.find((p) => p.id === order.productId);
  const assignee = state.members.find((m) => m.id === order.assigneeId);
  const isOwner = me.role === "owner";
  // A reply that names a price or a date is a commitment, so it goes to the
  // owner first when a collaborator writes it.
  const needsApproval = !isOwner && TEMPLATE_COMMITS[templateKey];

  function useTemplate(key: TemplateKey) {
    setTemplateKey(key);
    setMessage(
      buildTemplate(key, {
        order: order!,
        product,
        business: state.business,
        locale,
      }),
    );
  }

  async function copyMessage() {
    const ok = await copyText(message);
    toast(ok ? d.orders.messageCopied : d.errors.copyFailed, ok ? "success" : "error");
  }

  return (
    <>
      <PageHeader
        title={order.customerName}
        description={`${d.orders.orderRef} ${order.ref} · ${t(order.requestedItem)}`}
        breadcrumb={
          <Button
            variant="quiet"
            size="sm"
            className="-ms-3"
            onClick={() => router.push("/orders")}
          >
            <ArrowLeft aria-hidden />
            {d.orders.title}
          </Button>
        }
        action={<OrderStageBadge stage={order.stage} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          {/* --------------------------------------------- the enquiry itself */}
          <Card as="section">
            <CardHeader>
              <CardTitle as="h2" className="text-base">
                {d.orders.requested}
              </CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              <blockquote className="border-s-2 border-line ps-4 text-[0.9375rem] leading-relaxed text-charcoal">
                {t(order.enquiry) || d.common.notSet}
              </blockquote>
              <p className="mt-3 text-xs text-stone">
                {d.orders.received} {formatDateTime(order.createdAt, locale)} ·{" "}
                {d.orders.sources[order.source]}
              </p>
            </CardBody>
          </Card>

          {/* --------------------------------------------- prepared messages */}
          <Card as="section">
            <CardHeader>
              <CardTitle as="h2" className="text-base">
                {d.orders.templates}
              </CardTitle>
              <p className="mt-1 text-sm text-stone">{d.orders.templatesBody}</p>
            </CardHeader>
            <CardBody className="space-y-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_KEYS.map((key) => (
                  <Button
                    key={key}
                    variant={templateKey === key && message ? "primary" : "outline"}
                    size="sm"
                    onClick={() => useTemplate(key)}
                  >
                    {d.orders.templateNames[key]}
                  </Button>
                ))}
              </div>

              {message ? (
                <>
                  <Field label={d.orders.messageLabel}>
                    <Textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={9}
                    />
                  </Field>

                  {needsApproval ? (
                    <Note tone="approval">{d.orders.replyNeedsApproval}</Note>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={copyMessage}>
                      <Copy aria-hidden />
                      {d.orders.copyMessage}
                    </Button>

                    {needsApproval ? (
                      <Button
                        onClick={() => {
                          dispatch({
                            type: "customerReplySubmit",
                            orderId: order.id,
                            message,
                            actorId: me.id,
                          });
                          toast(d.products.approvalSent);
                          setMessage("");
                        }}
                      >
                        <Send aria-hidden />
                        {d.orders.sendForApproval}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          dispatch({
                            type: "orderNote",
                            orderId: order.id,
                            body: message,
                            kind: "message_sent",
                            actorId: me.id,
                          });
                          toast(d.orders.messageSentNote);
                          setMessage("");
                        }}
                      >
                        <Check aria-hidden />
                        {d.orders.markMessageSent}
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-stone">{d.orders.useTemplate}</p>
              )}
            </CardBody>
          </Card>

          {/* ---------------------------------------------------- the timeline */}
          <Card as="section">
            <CardHeader>
              <CardTitle as="h2" className="text-base">
                {d.orders.timeline}
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4 pt-0">
              {order.notes.length === 0 ? (
                <p className="text-sm text-stone">{d.dashboard.recentActivityEmpty}</p>
              ) : (
                <ol className="space-y-4">
                  {[...order.notes].reverse().map((entry) => {
                    const author = state.members.find((m) => m.id === entry.authorId);
                    return (
                      <li key={entry.id} className="flex gap-3">
                        {author ? <Avatar member={author} size="sm" /> : null}
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                            <span className="font-medium">{author?.name ?? d.common.notSet}</span>
                            <span className="text-xs text-stone">
                              {relativeTime(entry.createdAt, locale)}
                            </span>
                            {entry.kind === "message_sent" ? (
                              <span className="inline-flex items-center gap-1 rounded-[0.3125rem] bg-sage-100 px-2 py-0.5 text-[0.6875rem] font-medium text-[#3d5540]">
                                <MessageSquareText aria-hidden className="size-3" />
                                {d.orders.messageSentNote}
                              </span>
                            ) : null}
                          </p>
                          <p
                            className={cn(
                              "mt-1 whitespace-pre-line text-[0.9375rem] leading-relaxed",
                              entry.kind === "message_sent"
                                ? "rounded-[var(--radius-field)] border border-line bg-surface-sunk p-3 text-charcoal"
                                : "text-charcoal",
                            )}
                          >
                            {entry.body}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="border-t border-line pt-4">
                <Field label={d.common.addNote}>
                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={d.orders.addNotePlaceholder}
                    rows={3}
                  />
                </Field>
                <Button
                  className="mt-2.5"
                  variant="outline"
                  disabled={!note.trim()}
                  onClick={() => {
                    dispatch({
                      type: "orderNote",
                      orderId: order.id,
                      body: note.trim(),
                      kind: "note",
                      actorId: me.id,
                    });
                    setNote("");
                    toast(d.orders.noteAdded);
                  }}
                >
                  {d.common.addNote}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* ------------------------------------------------------------ rail */}
        <div className="space-y-5">
          <Card>
            <CardBody className="space-y-4 pt-5">
              <Field label={d.status.order[order.stage]}>
                <Select
                  value={order.stage}
                  onChange={(event) => {
                    const stage = event.target.value as OrderStage;
                    dispatch({ type: "orderStage", orderId: order.id, stage, actorId: me.id });
                    toast(d.orders.movedTo(d.status.order[stage]));
                  }}
                >
                  {ORDER_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {d.status.order[stage]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label={d.orders.assignLabel}>
                <Select
                  value={order.assigneeId ?? ""}
                  onChange={(event) => {
                    const memberId = event.target.value || null;
                    dispatch({
                      type: "orderAssign",
                      orderId: order.id,
                      memberId,
                      actorId: me.id,
                    });
                    const who = state.members.find((m) => m.id === memberId);
                    if (who) toast(d.orders.assigned(who.name));
                  }}
                >
                  <option value="">{d.common.unassigned}</option>
                  {state.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label={d.orders.nextActionLabel}>
                <Input
                  value={t(order.nextAction)}
                  placeholder={d.orders.nextActionPlaceholder}
                  onChange={(event) =>
                    dispatch({
                      type: "orderPatch",
                      orderId: order.id,
                      patch: {
                        nextAction: { ...order.nextAction, [locale]: event.target.value },
                      },
                      actorId: me.id,
                    })
                  }
                />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h3" className="text-base">
                {d.orders.customer}
              </CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              <dl className="space-y-3 text-sm">
                <Row label={d.orders.customer} value={order.customerName} />
                <Row label={d.orders.contact} value={order.customerContact || d.common.notSet} />
                <Row label={d.orders.quantity} value={String(order.quantity)} />
                <Row
                  label={d.orders.due}
                  value={order.dueDate ? formatDate(order.dueDate, locale) : d.orders.noDueDate}
                />
                <Row
                  label={d.orders.agreedPrice}
                  value={
                    order.agreedPrice === null
                      ? d.orders.notAgreedYet
                      : formatPrice(order.agreedPrice, locale, d.common.priceOnRequest)
                  }
                />
                <Row label={d.orders.source} value={d.orders.sources[order.source]} />
                {assignee ? <Row label={d.common.assignTo} value={assignee.name} /> : null}
              </dl>
            </CardBody>
          </Card>

          <Button variant="danger" block onClick={() => setConfirmDelete(true)}>
            <Trash2 aria-hidden />
            {d.common.delete}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          dispatch({ type: "orderDelete", orderId: order.id, actorId: me.id });
          router.push("/orders");
        }}
        title={d.orders.deleteConfirmTitle}
        body={d.orders.deleteConfirmBody}
        confirmLabel={d.common.delete}
        cancelLabel={d.common.cancel}
        closeLabel={d.common.close}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3">
      <dt className="text-stone">{label}</dt>
      <dd className="break-words font-medium text-charcoal">{value}</dd>
    </div>
  );
}

/** Same reasoning as the product detail route: order ids are runtime-minted. */
export default function OrderDetailPage() {
  return (
    <Suspense fallback={null}>
      <OrderDetailInner />
    </Suspense>
  );
}
