import { LESSONS } from "@/lib/data/lessons";
import LessonView from "./lesson-view";

/**
 * A server wrapper whose only job is to enumerate the lesson slugs at build
 * time — `generateStaticParams` cannot live in a client component, and the
 * lesson itself is wholly client-side. The ten lessons are a fixed set, so
 * `dynamicParams = false` is honest: anything else is a 404, not a miss.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ lesson: lesson.slug }));
}

export default async function LessonPage({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  return <LessonView slug={lesson} />;
}
