"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import type { ActivityEvent } from "@/lib/types";
import { relativeTime } from "@/lib/utils";
import { History } from "lucide-react";

const ENTITY_HREF: Record<NonNullable<ActivityEvent["entity"]>["type"], (id: string) => string> = {
  product: (id) => `/products/detail?id=${id}`,
  content: (id) => `/content?highlight=${id}`,
  order: (id) => `/orders/detail?id=${id}`,
  lesson: (id) => `/learn/${id}`,
  member: () => "/team",
};

/**
 * The shared record of who did what.
 *
 * Every state change writes one of these, which is what makes the workspace
 * feel like a shared space rather than two people using the same account.
 */
export function ActivityTimeline({
  events,
  emptyTitle,
  limit,
}: {
  events: ActivityEvent[];
  emptyTitle: string;
  limit?: number;
}) {
  const { state } = useStore();
  const { locale, t } = useI18n();

  const shown = limit ? events.slice(0, limit) : events;

  if (shown.length === 0) {
    return <EmptyState compact icon={<History />} title={emptyTitle} />;
  }

  return (
    <ol className="relative space-y-4">
      {/* The warp thread the events hang from. */}
      <span
        aria-hidden
        className="absolute inset-y-2 start-[17px] w-px bg-[repeating-linear-gradient(180deg,var(--color-line)_0_5px,transparent_5px_10px)]"
      />
      {shown.map((event) => {
        const actor = state.members.find((m) => m.id === event.actorId);
        const href = event.entity ? ENTITY_HREF[event.entity.type](event.entity.id) : null;

        return (
          <li key={event.id} className="relative flex gap-3">
            {actor ? (
              <Avatar member={actor} size="sm" className="relative z-10 ring-4 ring-surface" />
            ) : (
              <span
                aria-hidden
                className="relative z-10 size-7 shrink-0 rounded-full bg-linen ring-4 ring-surface"
              />
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm leading-snug text-charcoal">
                {href ? (
                  <Link href={href} className="hover:underline">
                    {t(event.summary)}
                  </Link>
                ) : (
                  t(event.summary)
                )}
              </p>
              <p className="mt-0.5 text-xs text-stone">{relativeTime(event.at, locale)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
