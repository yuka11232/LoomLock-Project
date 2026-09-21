"use client";

import Link from "next/link";
import { BookOpen, Check, Clock3, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, SectionHeading } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LESSONS } from "@/lib/data/lessons";
import { lessonsCompletedBy, progressFor, suggestedLessons } from "@/lib/data/selectors";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import type { Lesson } from "@/lib/types";
import { cn, percent } from "@/lib/utils";

export default function LearnPage() {
  const { state, me } = useStore();
  const { d, t } = useI18n();

  const isOwner = me.role === "owner";
  const doneSlugs = new Set(lessonsCompletedBy(state, me.id));
  const suggested = suggestedLessons(me.role).filter((lesson) => !doneSlugs.has(lesson.slug));
  const otherRoleLabel = isOwner ? d.roles.collaborator : d.roles.owner;
  const forOtherRole = suggestedLessons(isOwner ? "collaborator" : "owner").filter(
    (lesson) => !lesson.suggestedFor.includes(me.role),
  );

  return (
    <>
      <PageHeader
        title={d.learn.title}
        description={isOwner ? d.learn.subtitleOwner : d.learn.subtitleCollab}
      />

      {/* ------------------------------------------------------- progress */}
      <Card className="mb-8">
        <CardBody className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold">{d.learn.weeklyTitle}</h2>
              <p className="mt-1 max-w-md text-sm text-stone">{d.learn.weeklyBody}</p>
            </div>
            <div className="flex items-center gap-4">
              {state.members.map((member) => {
                const done = lessonsCompletedBy(state, member.id).length;
                return (
                  <div key={member.id} className="flex items-center gap-2.5">
                    <Avatar member={member} size="md" />
                    <div>
                      <p className="text-sm font-medium">{member.name.split(" ")[0]}</p>
                      <p className="text-xs tabular-nums text-stone">
                        {d.learn.progress(done, LESSONS.length)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Progress
            className="mt-4"
            value={percent(doneSlugs.size, LESSONS.length)}
            label={d.learn.progress(doneSlugs.size, LESSONS.length)}
            tone="indigo"
          />
        </CardBody>
      </Card>

      {/* ------------------------------------------------------ suggested */}
      {suggested.length > 0 ? (
        <section aria-labelledby="suggested-heading" className="mb-8">
          <SectionHeading id="suggested-heading" title={d.learn.suggestedForYou} />
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {suggested.slice(0, 3).map((lesson) => (
              <LessonCard key={lesson.slug} lesson={lesson} done={false} highlight />
            ))}
          </ul>
        </section>
      ) : null}

      {/* ------------------------------------------------------ all lessons */}
      <section aria-labelledby="all-heading" className="mb-8">
        <SectionHeading
          id="all-heading"
          title={d.learn.allLessons}
          description={d.learn.subtitle}
        />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LESSONS.map((lesson) => (
            <LessonCard
              key={lesson.slug}
              lesson={lesson}
              done={doneSlugs.has(lesson.slug)}
              note={progressFor(state, me.id, lesson.slug)?.actionNote}
            />
          ))}
        </ul>
      </section>

      {/* --------------------------------------------- the other role's list */}
      {forOtherRole.length > 0 ? (
        <section aria-labelledby="other-heading">
          <SectionHeading
            id="other-heading"
            title={d.learn.suggestedForOther(otherRoleLabel)}
            description={t({
              en: "Reading these helps you understand the part of the business the other person handles.",
              az: "Bunları oxumaq digər şəxsin baxdığı hissəni anlamağa kömək edir.",
            })}
          />
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {forOtherRole.map((lesson) => (
              <LessonCard key={lesson.slug} lesson={lesson} done={doneSlugs.has(lesson.slug)} muted />
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function LessonCard({
  lesson,
  done,
  highlight,
  muted,
  note,
}: {
  lesson: Lesson;
  done: boolean;
  highlight?: boolean;
  muted?: boolean;
  note?: string;
}) {
  const { d, t } = useI18n();

  return (
    <li>
      <Link
        href={`/learn/${lesson.slug}`}
        className={cn(
          "flex h-full flex-col rounded-[var(--radius-card)] border bg-surface p-5 transition-shadow hover:shadow-[var(--shadow-lift)]",
          highlight ? "border-pomegranate/30 bg-pomegranate-100/25" : "border-line",
          muted && "opacity-90",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <Badge tone={done ? "success" : "neutral"} size="sm">
            {done ? <Check aria-hidden /> : <BookOpen aria-hidden />}
            {d.learn.categories[lesson.category]}
          </Badge>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-stone">
            <Clock3 aria-hidden className="size-3.5" />
            {d.learn.minutes(lesson.minutes)}
          </span>
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{t(lesson.title)}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-stone">{t(lesson.summary)}</p>

        {note ? (
          <p className="mt-3 line-clamp-2 border-s-2 border-sage/40 ps-3 text-sm italic text-stone">
            {note}
          </p>
        ) : null}

        <p
          className={cn(
            "mt-auto pt-4 text-sm font-medium",
            done ? "text-sage" : "text-pomegranate",
          )}
        >
          {done ? (
            <span className="inline-flex items-center gap-1.5">
              <Check aria-hidden className="size-4" />
              {d.learn.completed} · {d.learn.reviewLesson}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Sparkles aria-hidden className="size-4" />
              {d.learn.startLesson}
            </span>
          )}
        </p>
      </Link>
    </li>
  );
}
