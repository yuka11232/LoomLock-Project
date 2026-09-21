"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Clock3,
  Globe,
  Image as ImageIcon,
  MessageCircle,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { ActivityTimeline } from "@/components/domain/activity-timeline";
import { OrderStageBadge } from "@/components/domain/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { LESSONS } from "@/lib/data/lessons";
import {
  activeOrders,
  lessonsCompletedBy,
  newEnquiries,
  nextLesson,
  pendingApprovals,
  publicProducts,
  suggestedTasks,
  type SuggestedTask,
} from "@/lib/data/selectors";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import { percent, relativeTime } from "@/lib/utils";

const TASK_ICON: Record<SuggestedTask["kind"], typeof Package> = {
  photos: ImageIcon,
  approval: ClipboardCheck,
  enquiry: MessageCircle,
  order: ShoppingBag,
  lesson: BookOpen,
  product: Package,
  waiting: Clock3,
};

export default function DashboardPage() {
  const { state, me } = useStore();
  const { d, t, locale } = useI18n();

  const isOwner = me.role === "owner";
  const approvals = pendingApprovals(state);
  const enquiries = newEnquiries(state);
  const orders = activeOrders(state);
  const published = publicProducts(state);

  const tasks = suggestedTasks(state, me, (slug) => {
    const lesson = LESSONS.find((l) => l.slug === slug);
    return lesson?.title ?? { en: "", az: "" };
  });
  const [firstTask, ...restTasks] = tasks;

  const done = lessonsCompletedBy(state, me.id);
  const upcoming = nextLesson(state, me);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? d.dashboard.greetingMorning
      : hour < 18
        ? d.dashboard.greetingAfternoon
        : d.dashboard.greetingEvening;

  return (
    <>
      <PageHeader
        title={`${greeting}, ${me.name.split(" ")[0]}`}
        description={isOwner ? d.dashboard.subtitleOwner : d.dashboard.subtitleCollaborator}
      />

      {/* --------------------------------------------- suggested next step */}
      {firstTask ? (
        <Card className="mb-6 overflow-hidden border-pomegranate/25 bg-pomegranate-100/40">
          <Link
            href={firstTask.href}
            className="flex items-center gap-4 p-5 transition-colors hover:bg-pomegranate-100/70"
          >
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pomegranate text-white"
            >
              <Sparkles className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium uppercase tracking-wide text-pomegranate-600">
                {d.dashboard.suggestedNext}
              </span>
              <span className="mt-0.5 block font-display text-lg font-semibold text-charcoal">
                {t(firstTask.label)}
              </span>
            </span>
            <ArrowRight aria-hidden className="size-5 shrink-0 text-pomegranate" />
          </Link>
        </Card>
      ) : null}

      {/* ------------------------------------------------------------ stats */}
      <section aria-labelledby="overview-heading" className="mb-6">
        <h2 id="overview-heading" className="sr-only">
          {d.dashboard.overview}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            Icon={Package}
            value={state.products.length}
            label={d.dashboard.statProducts}
            sub={`${published.length} ${d.dashboard.statPublic}`}
            href="/products"
          />
          <StatTile
            Icon={ShoppingBag}
            value={orders.length}
            label={d.dashboard.statOrders}
            sub={d.dashboard.statOrdersSub}
            href="/orders"
          />
          <StatTile
            Icon={MessageCircle}
            value={enquiries.length}
            label={d.dashboard.statEnquiries}
            sub={d.dashboard.statEnquiriesSub}
            href="/orders"
            highlight={enquiries.length > 0}
          />
          <StatTile
            Icon={ClipboardCheck}
            value={approvals.length}
            label={d.dashboard.statApprovals}
            sub={d.dashboard.statApprovalsSub}
            href="/approvals"
            highlight={isOwner && approvals.length > 0}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          {/* ------------------------------------------------ what needs doing */}
          <Card as="section" aria-labelledby="tasks-heading">
            <CardHeader>
              <CardTitle id="tasks-heading">{d.dashboard.needsDoing}</CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              {restTasks.length === 0 && !firstTask ? (
                <EmptyState
                  compact
                  icon={<Sparkles />}
                  title={d.dashboard.needsDoingEmpty}
                  body={d.dashboard.suggestedNextEmpty}
                  action={
                    <ButtonLink href="/products/new" size="sm">
                      {d.products.newProduct}
                    </ButtonLink>
                  }
                />
              ) : (
                <ul className="divide-y divide-line">
                  {(restTasks.length > 0 ? restTasks : []).map((task) => {
                    const Icon = TASK_ICON[task.kind];
                    return (
                      <li key={task.id}>
                        <Link
                          href={task.href}
                          className="-mx-2 flex items-center gap-3 rounded-[var(--radius-field)] px-2 py-3 transition-colors hover:bg-surface-sunk"
                        >
                          <span
                            aria-hidden
                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linen text-walnut"
                          >
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1 text-[0.9375rem]">{t(task.label)}</span>
                          <ArrowRight aria-hidden className="size-4 shrink-0 text-line" />
                        </Link>
                      </li>
                    );
                  })}
                  {restTasks.length === 0 ? (
                    <li className="py-3 text-sm text-stone">{d.dashboard.needsDoingEmpty}</li>
                  ) : null}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* ------------------------------------------------------ approvals */}
          <Card as="section" aria-labelledby="approvals-heading">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle id="approvals-heading">
                  {isOwner ? d.dashboard.pendingApprovals : d.dashboard.pendingApprovalsCollab}
                </CardTitle>
                {approvals.length > 0 ? (
                  <Link
                    href="/approvals"
                    className="text-sm font-medium text-pomegranate hover:underline"
                  >
                    {d.common.seeAll}
                  </Link>
                ) : null}
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              {approvals.length === 0 ? (
                <EmptyState
                  compact
                  icon={<ClipboardCheck />}
                  title={
                    isOwner
                      ? d.dashboard.pendingApprovalsEmpty
                      : d.dashboard.pendingApprovalsEmptyCollab
                  }
                />
              ) : (
                <ul className="divide-y divide-line">
                  {approvals.slice(0, 3).map((approval) => {
                    const requester = state.members.find((m) => m.id === approval.requestedBy);
                    return (
                      <li key={approval.id}>
                        <Link
                          href="/approvals"
                          className="-mx-2 flex items-start gap-3 rounded-[var(--radius-field)] px-2 py-3 transition-colors hover:bg-surface-sunk"
                        >
                          {requester ? <Avatar member={requester} size="sm" /> : null}
                          <span className="min-w-0 flex-1">
                            <span className="block text-[0.9375rem] font-medium leading-snug">
                              {t(approval.title)}
                            </span>
                            <span className="mt-0.5 block text-xs text-stone">
                              {d.approvals.types[approval.type]} ·{" "}
                              {relativeTime(approval.requestedAt, locale)}
                            </span>
                          </span>
                          <ArrowRight aria-hidden className="mt-1 size-4 shrink-0 text-line" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* --------------------------------------------------------- orders */}
          <Card as="section" aria-labelledby="orders-heading">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle id="orders-heading">{d.dashboard.ordersSummary}</CardTitle>
                <Link
                  href="/orders"
                  className="text-sm font-medium text-pomegranate hover:underline"
                >
                  {d.dashboard.viewBoard}
                </Link>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              {orders.length === 0 ? (
                <EmptyState compact icon={<ShoppingBag />} title={d.dashboard.ordersSummaryEmpty} />
              ) : (
                <ul className="divide-y divide-line">
                  {orders.slice(0, 4).map((order) => {
                    const assignee = state.members.find((m) => m.id === order.assigneeId);
                    return (
                      <li key={order.id}>
                        <Link
                          href={`/orders/detail?id=${order.id}`}
                          className="-mx-2 flex items-center gap-3 rounded-[var(--radius-field)] px-2 py-3 transition-colors hover:bg-surface-sunk"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.9375rem] font-medium">
                              {order.customerName}
                            </span>
                            <span className="block truncate text-xs text-stone">
                              {order.ref} · {t(order.requestedItem)}
                            </span>
                          </span>
                          {assignee ? <Avatar member={assignee} size="sm" /> : null}
                          <OrderStageBadge stage={order.stage} size="sm" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ------------------------------------------------------ right rail */}
        <div className="space-y-6">
          <Card as="section" aria-labelledby="learning-heading">
            <CardHeader>
              <CardTitle id="learning-heading">{d.dashboard.learningProgress}</CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-display text-2xl font-semibold">
                  {done.length}
                  <span className="text-base font-normal text-stone">/{LESSONS.length}</span>
                </p>
                <p className="text-sm text-stone">{d.dashboard.learningDone}</p>
              </div>
              <Progress
                className="mt-3"
                value={percent(done.length, LESSONS.length)}
                label={d.learn.progress(done.length, LESSONS.length)}
                tone="indigo"
              />

              {upcoming ? (
                <div className="mt-5 rounded-[var(--radius-field)] border border-line bg-surface-sunk p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone">
                    {d.dashboard.learningSuggestion}
                  </p>
                  <p className="mt-1 font-medium leading-snug">{t(upcoming.title)}</p>
                  <p className="mt-1 text-sm text-stone">{t(upcoming.summary)}</p>
                  <ButtonLink
                    href={`/learn/${upcoming.slug}`}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    <BookOpen aria-hidden />
                    {d.dashboard.continueLesson}
                  </ButtonLink>
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card as="section" aria-labelledby="activity-heading">
            <CardHeader>
              <CardTitle id="activity-heading">{d.dashboard.recentActivity}</CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              <ActivityTimeline
                events={state.activity}
                emptyTitle={d.dashboard.recentActivityEmpty}
                limit={7}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatTile({
  Icon,
  value,
  label,
  sub,
  href,
  highlight,
}: {
  Icon: typeof Package;
  value: number;
  label: string;
  sub: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-3 rounded-[var(--radius-card)] border p-4 transition-colors ${
        highlight
          ? "border-pomegranate/30 bg-pomegranate-100/40 hover:bg-pomegranate-100/70"
          : "border-line bg-surface hover:bg-surface-sunk"
      }`}
    >
      <span
        aria-hidden
        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
          highlight ? "bg-pomegranate text-white" : "bg-linen text-walnut"
        }`}
      >
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-2xl font-semibold leading-none tabular-nums">
          {value}
        </span>
        <span className="mt-1 block text-sm font-medium text-charcoal">{label}</span>
        <span className="block text-xs text-stone">{sub}</span>
      </span>
    </Link>
  );
}
