"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarClock, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { daysUntilDue } from "@/lib/data/selectors";
import { ORDER_STAGES, type Member, type Order } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

/**
 * A card on the order board.
 *
 * Moving a card uses two buttons rather than drag-and-drop: a drag target is
 * hard to hit on a phone and impossible on a keyboard, and this board is meant
 * to be updated one-handed, standing at a loom.
 */
export function OrderCard({
  order,
  assignee,
  onMove,
  compact,
}: {
  order: Order;
  assignee: Member | undefined;
  onMove: (direction: -1 | 1) => void;
  compact?: boolean;
}) {
  const { d, t, locale } = useI18n();

  const index = ORDER_STAGES.indexOf(order.stage);
  const days = daysUntilDue(order);
  const overdue = days !== null && days < 0 && order.stage !== "delivered";
  const dueSoon = days !== null && days >= 0 && days <= 3 && order.stage !== "delivered";

  return (
    <li className="rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-soft)]">
      <Link
        href={`/orders/detail?id=${order.id}`}
        className="block rounded-t-[var(--radius-card)] p-3.5 transition-colors hover:bg-surface-sunk"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate font-medium leading-snug">{order.customerName}</p>
          <span className="shrink-0 font-mono text-[0.6875rem] text-stone">{order.ref}</span>
        </div>

        <p className="mt-1 line-clamp-2 text-sm leading-snug text-stone">
          {t(order.requestedItem)}
        </p>

        {!compact && t(order.nextAction) ? (
          <p className="mt-2.5 rounded-[0.5rem] bg-surface-sunk px-2.5 py-1.5 text-xs leading-snug text-walnut">
            <span className="font-medium">{d.orders.nextActionLabel}: </span>
            {t(order.nextAction)}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {assignee ? (
            <span className="inline-flex items-center gap-1.5">
              <Avatar member={assignee} size="sm" />
              <span className="text-xs text-stone">{assignee.name.split(" ")[0]}</span>
            </span>
          ) : (
            <Badge tone="attention" size="sm">
              <UserRound aria-hidden />
              {d.common.unassigned}
            </Badge>
          )}

          {order.dueDate ? (
            <Badge tone={overdue ? "primary" : dueSoon ? "pending" : "neutral"} size="sm">
              <CalendarClock aria-hidden />
              {overdue
                ? d.orders.overdue
                : dueSoon
                  ? d.orders.dueSoon
                  : formatDate(order.dueDate, locale)}
            </Badge>
          ) : null}
        </div>
      </Link>

      <div className="flex items-center justify-between border-t border-line px-1.5 py-1">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index <= 0}
          className={cn(
            "inline-flex min-h-9 items-center gap-1 rounded-[0.5rem] px-2 text-xs font-medium transition-colors",
            "text-stone hover:bg-surface-sunk hover:text-charcoal",
            "disabled:pointer-events-none disabled:opacity-35",
          )}
          aria-label={`${d.orders.moveBack}: ${order.ref}`}
        >
          <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
          <span className="sr-only sm:not-sr-only">{d.orders.moveBack}</span>
        </button>

        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index >= ORDER_STAGES.length - 1}
          className={cn(
            "inline-flex min-h-9 items-center gap-1 rounded-[0.5rem] px-2 text-xs font-medium transition-colors",
            "text-pomegranate hover:bg-pomegranate-100",
            "disabled:pointer-events-none disabled:opacity-35",
          )}
          aria-label={`${d.orders.moveForward}: ${order.ref}`}
        >
          <span className="sr-only sm:not-sr-only">{d.orders.moveForward}</span>
          <ChevronRight aria-hidden className="size-4 rtl:rotate-180" />
        </button>
      </div>
    </li>
  );
}
