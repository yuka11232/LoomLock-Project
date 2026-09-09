import { cn } from "@/lib/utils";

/**
 * A progress bar drawn as a woven thread: the filled part is solid, the rest
 * shows the warp it will be woven across. Decorative, but it earns its place —
 * it is the one place the weaving metaphor says something true about progress.
 */
export function Progress({
  value,
  label,
  className,
  tone = "pomegranate",
}: {
  /** 0-100 */
  value: number;
  /** Announced to screen readers; the visible label is rendered by the caller. */
  label: string;
  className?: string;
  tone?: "pomegranate" | "indigo" | "sage";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-linen",
        // The unfilled track carries a faint warp pattern.
        "bg-[repeating-linear-gradient(90deg,rgba(110,78,55,0.14)_0_1px,transparent_1px_6px)]",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500",
          tone === "pomegranate" && "bg-pomegranate",
          tone === "indigo" && "bg-indigo-ink",
          tone === "sage" && "bg-sage",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

/** The step indicator above a guided form. */
export function Stepper({
  steps,
  current,
  stepLabel,
  ofLabel,
}: {
  steps: string[];
  /** Zero-based. */
  current: number;
  stepLabel: string;
  ofLabel: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-stone sm:hidden">
        {stepLabel} {current + 1} {ofLabel} {steps.length} — {steps[current]}
      </p>

      <ol className="hidden items-center gap-1 sm:flex" aria-label={stepLabel}>
        {steps.map((step, index) => {
          const state = index < current ? "done" : index === current ? "current" : "todo";
          return (
            <li key={step} className="flex flex-1 items-center gap-1">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-full rounded-full",
                    state === "done" && "bg-pomegranate",
                    state === "current" && "bg-pomegranate/45",
                    state === "todo" && "bg-linen",
                  )}
                />
                <span
                  aria-current={state === "current" ? "step" : undefined}
                  className={cn(
                    "truncate text-xs",
                    state === "current" ? "font-semibold text-charcoal" : "text-stone",
                  )}
                >
                  {step}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
