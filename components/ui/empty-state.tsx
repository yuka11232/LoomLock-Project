import { cn } from "@/lib/utils";

/**
 * The empty state.
 *
 * Two rules: never leave a blank area, and never blame the user for it. Every
 * empty state says what would go here and offers the action that fills it.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
  compact,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line bg-surface-sunk/60 text-center",
        compact ? "px-4 py-6" : "px-6 py-12",
        className,
      )}
    >
      {icon ? (
        <div
          aria-hidden
          className="mb-3 flex size-11 items-center justify-center rounded-full bg-linen text-walnut [&_svg]:size-5"
        >
          {icon}
        </div>
      ) : null}
      <p className="font-medium text-charcoal">{title}</p>
      {body ? <p className="mt-1.5 max-w-sm text-sm text-stone">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** Placeholder shown while the saved demo state is being read from the browser. */
export function LoadingBlock({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          aria-hidden
          className="h-20 animate-pulse rounded-[var(--radius-card)] border border-line bg-surface-sunk"
        />
      ))}
    </div>
  );
}
