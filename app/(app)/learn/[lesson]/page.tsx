"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Lightbulb, PenLine } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Textarea } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { useToast } from "@/components/ui/toast";
import { findLesson, LESSONS } from "@/lib/data/lessons";
import { progressFor } from "@/lib/data/selectors";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

/**
 * One lesson.
 *
 * The completion state is deliberately tied to writing the action down: a
 * lesson counts as finished when the learner has actually applied it to their
 * own business, not when they scrolled to the bottom.
 */
export default function LessonPage({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson: slug } = use(params);
  const { state, me, dispatch } = useStore();
  const { d, t, locale } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const lesson = findLesson(slug);
  const progress = progressFor(state, me.id, slug);

  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    setAnswer(progress?.actionNote ?? "");
  }, [progress?.actionNote, slug]);

  if (!lesson) {
    return (
      <EmptyState
        icon={<BookOpen />}
        title={d.learn.notFound}
        body={d.learn.notFoundBody}
        action={
          <Button variant="outline" onClick={() => router.push("/learn")}>
            {d.learn.backToLessons}
          </Button>
        }
      />
    );
  }

  const index = LESSONS.findIndex((item) => item.slug === slug);
  const next = LESSONS[index + 1];
  const done = Boolean(progress);

  function complete() {
    if (!answer.trim()) {
      setError(d.learn.actionRequired);
      return;
    }
    setError(undefined);
    dispatch({
      type: "lessonComplete",
      slug: lesson!.slug,
      title: lesson!.title,
      memberId: me.id,
      note: answer.trim(),
    });
    toast(d.learn.markedComplete);
  }

  return (
    <>
      <PageHeader
        title={t(lesson.title)}
        description={t(lesson.summary)}
        breadcrumb={
          <Button variant="quiet" size="sm" className="-ms-3" onClick={() => router.push("/learn")}>
            <ArrowLeft aria-hidden />
            {d.learn.backToLessons}
          </Button>
        }
      />

      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge tone="info">
            <BookOpen aria-hidden />
            {d.learn.categories[lesson.category]}
          </Badge>
          <Badge tone="neutral">
            <Clock3 aria-hidden />
            {d.learn.minutes(lesson.minutes)}
          </Badge>
          {done ? (
            <Badge tone="success">
              <Check aria-hidden />
              {d.learn.completed}
            </Badge>
          ) : null}
        </div>

        {/* ------------------------------------------------------ explanation */}
        <section aria-labelledby="explanation-heading" className="mb-8">
          <h2 id="explanation-heading" className="font-display text-xl font-semibold">
            {d.learn.explanation}
          </h2>
          <div className="mt-3 space-y-4">
            {lesson.explanation.map((paragraph, i) => (
              <p key={i} className="text-[1.0625rem] leading-relaxed text-charcoal">
                {t(paragraph)}
              </p>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------- example */}
        <Card className="mb-8 border-indigo-ink/20 bg-indigo-100/40">
          <CardBody className="pt-5">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-indigo-ink">
              <Lightbulb aria-hidden className="size-4" />
              {d.learn.exampleTitle}
            </p>
            <h2 className="mt-2 font-display text-lg font-semibold">{t(lesson.example.title)}</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-charcoal">
              {t(lesson.example.body)}
            </p>
          </CardBody>
        </Card>

        {/* ----------------------------------------------------------- action */}
        <Card className="mb-6">
          <CardBody className="pt-5">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-pomegranate-600">
              <PenLine aria-hidden className="size-4" />
              {d.learn.actionTitle}
            </p>
            <p className="mt-2 text-[1.0625rem] font-medium leading-relaxed">
              {t(lesson.action.prompt)}
            </p>

            <div className="mt-4">
              <Field label={d.learn.yourAnswer} help={d.learn.actionHelp} error={error}>
                <Textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={t(lesson.action.placeholder)}
                  rows={5}
                />
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={complete}>
                <Check aria-hidden />
                {done ? d.common.saveChanges : d.learn.markComplete}
              </Button>
              {done && progress ? (
                <p className="inline-flex items-center gap-2 text-sm text-stone">
                  <Avatar member={me} size="sm" />
                  {d.learn.completedBy(me.name.split(" ")[0])} ·{" "}
                  {formatDate(progress.completedAt, locale)}
                </p>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Note tone="info" title={d.learn.takeaway} className="mb-8">
          {t(lesson.takeaway)}
        </Note>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <Link
            href="/learn"
            className="text-sm font-medium text-stone hover:text-charcoal hover:underline"
          >
            {d.learn.backToLessons}
          </Link>
          {next ? (
            <ButtonLink href={`/learn/${next.slug}`} variant="outline">
              {d.learn.nextLesson}: {t(next.title)}
              <ArrowRight aria-hidden />
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </>
  );
}
