"use client";

import { useState } from "react";
import Link from "next/link";
import { Columns3, List, Plus, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { OrderCard } from "@/components/domain/order-card";
import { OrderStageBadge, STAGE_META } from "@/components/domain/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import { ORDER_STAGES, type Order, type OrderStage } from "@/lib/types";
import { cn, newId, nowIso, sameInBoth } from "@/lib/utils";

export default function OrdersPage() {
  const { state, me, dispatch } = useStore();
  const { d, t } = useI18n();
  const toast = useToast();

  const [view, setView] = useState<"board" | "list">("board");
  const [addOpen, setAddOpen] = useState(false);

  function move(order: Order, direction: -1 | 1) {
    const index = ORDER_STAGES.indexOf(order.stage);
    const next = ORDER_STAGES[index + direction];
    if (!next) return;
    dispatch({ type: "orderStage", orderId: order.id, stage: next, actorId: me.id });
    toast(d.orders.movedTo(d.status.order[next]));
  }

  const hasOrders = state.orders.length > 0;

  return (
    <>
      <PageHeader
        title={d.orders.title}
        description={d.orders.subtitle}
        action={
          <>
            <div
              role="group"
              aria-label={d.common.view}
              className="hidden items-center gap-0.5 rounded-[var(--radius-field)] border border-line bg-surface p-0.5 sm:flex"
            >
              {(
                [
                  ["board", Columns3, d.orders.board],
                  ["list", List, d.orders.list],
                ] as const
              ).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setView(value)}
                  aria-pressed={view === value}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-[0.4rem] px-3 text-sm font-medium transition-colors",
                    view === value
                      ? "bg-charcoal text-white"
                      : "text-stone hover:bg-surface-sunk hover:text-charcoal",
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                  {label}
                </button>
              ))}
            </div>
            <Button onClick={() => setAddOpen(true)}>
              <Plus aria-hidden />
              {d.orders.newOrder}
            </Button>
          </>
        }
      />

      {!hasOrders ? (
        <EmptyState
          icon={<ShoppingBag />}
          title={d.orders.emptyTitle}
          body={d.orders.emptyBody}
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus aria-hidden />
              {d.orders.newOrder}
            </Button>
          }
        />
      ) : view === "board" ? (
        <div className="scroll-strip-x -mx-4 px-4 pt-1 pb-4 sm:-mx-6 sm:px-6">
          <div className="flex min-w-max gap-4">
            {ORDER_STAGES.map((stage) => {
              const orders = state.orders.filter((order) => order.stage === stage);
              const { Icon } = STAGE_META[stage];
              return (
                <section
                  key={stage}
                  aria-labelledby={`stage-${stage}`}
                  className="w-[17.5rem] shrink-0"
                >
                  <div className="mb-2.5 flex items-start gap-2">
                    <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-walnut" />
                    <div className="min-w-0">
                      <h2 id={`stage-${stage}`} className="text-sm font-semibold">
                        {d.status.order[stage]}
                        <span className="ms-1.5 font-normal tabular-nums text-stone">
                          {orders.length}
                        </span>
                      </h2>
                      <p className="mt-0.5 text-xs leading-snug text-stone">
                        {d.orders.stageHelp[stage]}
                      </p>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface-sunk/50 px-3 py-6 text-center text-xs text-stone">
                      {d.orders.emptyStage}
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {orders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          assignee={state.members.find((m) => m.id === order.assigneeId)}
                          onMove={(direction) => move(order, direction)}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {state.orders.map((order) => {
              const assignee = state.members.find((m) => m.id === order.assigneeId);
              return (
                <li key={order.id}>
                  <Link
                    href={`/orders/detail?id=${order.id}`}
                    className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-sunk sm:px-5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium">{order.customerName}</span>
                        <span className="font-mono text-xs text-stone">{order.ref}</span>
                      </span>
                      <span className="block truncate text-sm text-stone">
                        {t(order.requestedItem)}
                      </span>
                    </span>
                    {assignee ? <Avatar member={assignee} size="sm" /> : null}
                    <OrderStageBadge stage={order.stage} size="sm" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <AddOrderDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function AddOrderDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, me, dispatch } = useStore();
  const { d } = useI18n();
  const toast = useToast();

  const [customerName, setCustomerName] = useState("");
  const [contact, setContact] = useState("");
  const [productId, setProductId] = useState("");
  const [enquiry, setEnquiry] = useState("");
  const [stage, setStage] = useState<OrderStage>("new_enquiry");
  const [error, setError] = useState<string>();

  function submit() {
    if (!customerName.trim()) {
      setError(d.errors.required);
      return;
    }
    const product = state.products.find((p) => p.id === productId);
    const order: Order = {
      id: newId("order"),
      ref: `NT-${120 + state.orders.length}`,
      customerName: customerName.trim(),
      customerContact: contact.trim(),
      productId: product?.id ?? null,
      requestedItem: product ? product.name : sameInBoth(d.orders.requested),
      quantity: 1,
      createdAt: nowIso(),
      enquiry: sameInBoth(enquiry.trim()),
      dueDate: null,
      stage,
      assigneeId: me.id,
      nextAction: sameInBoth(""),
      source: "in_person",
      agreedPrice: null,
      notes: [],
    };
    dispatch({ type: "orderCreate", order, actorId: me.id });
    toast(d.orders.newOrder);
    setCustomerName("");
    setContact("");
    setProductId("");
    setEnquiry("");
    setError(undefined);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={d.orders.newOrder}
      closeLabel={d.common.close}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {d.common.cancel}
          </Button>
          <Button onClick={submit}>{d.common.save}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={d.orders.customer} required error={error}>
          <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </Field>

        <Field label={d.orders.contact} optionalLabel={d.common.optional}>
          <Input value={contact} onChange={(e) => setContact(e.target.value)} />
        </Field>

        <Field label={d.orders.requested} optionalLabel={d.common.optional}>
          <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">{d.common.none}</option>
            {state.products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name.en}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={d.status.order.new_enquiry}>
          <Select value={stage} onChange={(e) => setStage(e.target.value as OrderStage)}>
            {ORDER_STAGES.map((value) => (
              <option key={value} value={value}>
                {d.status.order[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={d.store.messageLabel} optionalLabel={d.common.optional}>
          <Textarea value={enquiry} onChange={(e) => setEnquiry(e.target.value)} rows={3} />
        </Field>
      </div>
    </Dialog>
  );
}
