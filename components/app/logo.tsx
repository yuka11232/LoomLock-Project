import { cn } from "@/lib/utils";

/**
 * The LoomLock mark: two threads crossing on a loom.
 *
 * Deliberately not a padlock. The name comes from the lock of a loom, the
 * point where warp and weft hold, and the mark says weaving, not security.
 */
export function LoomMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden focusable="false">
      {/* warp: the fixed threads */}
      <path
        d="M9 4v24M16 4v24M23 4v24"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* weft: the thread passing over and under */}
      <path
        d="M4 11c4 0 4 3 8 3s4-3 8-3 4 3 8 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M4 20c4 0 4 3 8 3s4-3 8-3 4 3 8 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LoomMark className={cn("text-pomegranate", markClassName)} />
      <span className="font-display text-lg font-semibold tracking-tight text-charcoal">
        LoomLock
      </span>
    </span>
  );
}
