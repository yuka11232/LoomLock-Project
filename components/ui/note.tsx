import { Clock3, Info, ShieldCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type NoteTone = "info" | "approval" | "caution" | "later";

const TONE_STYLES: Record<NoteTone, string> = {
  info: "border-indigo-ink/20 bg-indigo-100/70 text-indigo-ink",
  // Approval notices are supportive, never alarming — soft gold, not red.
  approval: "border-gold/30 bg-gold-100/70 text-[#7a5714]",
  caution: "border-clay/30 bg-clay-100/70 text-[#82452f]",
  later: "border-line bg-surface-sunk text-stone",
};

const TONE_ICON: Record<NoteTone, typeof Info> = {
  info: Info,
  approval: ShieldCheck,
  caution: TriangleAlert,
  later: Clock3,
};

/**
 * An inline notice.
 *
 * Used for "this needs the owner's confirmation", "this is a demo", and
 * "coming later". Deliberately quiet: LoomLock never shows a frightening
 * security warning to a family running a small business.
 */
export function Note({
  tone = "info",
  title,
  children,
  className,
  icon,
}: {
  tone?: NoteTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  const Icon = TONE_ICON[tone];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-field)] border p-3.5 text-sm leading-relaxed",
        TONE_STYLES[tone],
        className,
      )}
    >
      <span aria-hidden className="mt-0.5 shrink-0 [&_svg]:size-[18px]">
        {icon ?? <Icon />}
      </span>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && "mt-1")}>{children}</div> : null}
      </div>
    </div>
  );
}

/**
 * The label for a feature that is on the roadmap. Any control that would need
 * a backend LoomLock does not have carries this instead of doing nothing.
 */
export function ComingLaterTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-sunk px-2 py-0.5 text-[0.6875rem] font-medium text-stone">
      <Clock3 aria-hidden className="size-3" />
      {label}
    </span>
  );
}
