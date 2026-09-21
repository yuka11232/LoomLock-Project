"use client";

import { cn } from "@/lib/utils";

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * The filter row above a catalogue or board.
 *
 * Real buttons in a tablist, so the whole row is one tab stop and the arrow
 * keys move between filters, the pattern a keyboard user expects.
 */
export function FilterTabs<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = options.findIndex((option) => option.value === value);
    if (index < 0) return;
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else return;

    event.preventDefault();
    const wrapped = (next + options.length) % options.length;
    onChange(options[wrapped].value);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons[wrapped]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("scroll-strip-x -mx-1 flex gap-1.5 px-1 py-1", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-[0.4rem] border px-3.5 text-sm font-medium transition-colors",
              selected
                ? "border-pomegranate bg-pomegranate text-white"
                : "border-line bg-surface text-stone hover:border-walnut/40 hover:text-charcoal",
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span
                className={cn(
                  "rounded-[0.25rem] px-1.5 py-px text-xs tabular-nums",
                  selected ? "bg-white/20" : "bg-surface-sunk text-stone",
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
