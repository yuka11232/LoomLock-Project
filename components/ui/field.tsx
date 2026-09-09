"use client";

import { createContext, useContext, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Every form control in LoomLock is wrapped in a Field.
 *
 * The Field owns the ids and wires label -> control -> help text -> error via
 * aria-describedby and aria-invalid, so a screen reader reads the question, the
 * hint, and the problem in that order. Nothing here is optional: a control
 * without a visible label is a bug.
 */

interface FieldContextValue {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldControl() {
  const ctx = useContext(FieldContext);
  if (!ctx) {
    throw new Error("Form controls must be rendered inside a <Field>");
  }
  return {
    id: ctx.controlId,
    "aria-describedby": ctx.describedBy,
    "aria-invalid": ctx.invalid || undefined,
  } as const;
}

export function Field({
  label,
  help,
  error,
  required,
  optionalLabel,
  children,
  className,
}: {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  /** Shown next to the label when the field is not required, e.g. "optional". */
  optionalLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const base = useId();
  const controlId = `${base}-control`;
  const helpId = help ? `${base}-help` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ controlId, describedBy, invalid: Boolean(error) }}>
      <div className={cn("space-y-1.5", className)}>
        <label htmlFor={controlId} className="block text-sm font-medium text-charcoal">
          {label}
          {!required && optionalLabel ? (
            <span className="ms-1.5 font-normal text-stone">({optionalLabel})</span>
          ) : null}
        </label>
        {help ? (
          <p id={helpId} className="text-sm text-stone">
            {help}
          </p>
        ) : null}
        {children}
        {error ? (
          <p id={errorId} role="alert" className="flex items-start gap-1.5 text-sm text-pomegranate">
            <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

const controlClasses = [
  "w-full rounded-[var(--radius-field)] border border-line bg-surface",
  "px-3 py-2.5 text-[0.9375rem] text-charcoal",
  "placeholder:text-stone/60",
  "focus:border-pomegranate focus:outline-none focus:ring-2 focus:ring-pomegranate/25",
  "aria-[invalid=true]:border-pomegranate aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-pomegranate/20",
  "disabled:bg-surface-sunk disabled:text-stone",
].join(" ");

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldControl();
  return <input {...field} className={cn(controlClasses, "min-h-11", className)} {...props} />;
}

export function Textarea({
  className,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const field = useFieldControl();
  return (
    <textarea
      {...field}
      rows={rows}
      className={cn(controlClasses, "resize-y leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const field = useFieldControl();
  return (
    <select
      {...field}
      className={cn(
        controlClasses,
        "min-h-11 appearance-none bg-[length:1.25rem] bg-[right_0.625rem_center] bg-no-repeat pe-10",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236f655c%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/** A labelled checkbox with a large touch target. */
export function Checkbox({
  label,
  description,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        className={cn(
          "mt-0.5 size-5 shrink-0 cursor-pointer rounded border-2 border-line accent-pomegranate",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pomegranate",
        )}
        {...props}
      />
      <label htmlFor={id} className="cursor-pointer select-none text-[0.9375rem] leading-snug">
        <span className="font-medium text-charcoal">{label}</span>
        {description ? <span className="mt-0.5 block text-sm text-stone">{description}</span> : null}
      </label>
    </div>
  );
}

/**
 * A group of large selectable cards used for goal, tone, and role choices.
 * Rendered as real radio inputs so arrow keys work and the group is announced.
 */
export function RadioCards<T extends string>({
  legend,
  help,
  name,
  value,
  onChange,
  options,
  columns = 2,
}: {
  legend: string;
  help?: string;
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; description?: string; icon?: React.ReactNode }[];
  columns?: 1 | 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-charcoal">{legend}</legend>
      {help ? <p className="mt-1 text-sm text-stone">{help}</p> : null}
      <div
        className={cn(
          "mt-2.5 grid gap-2.5",
          columns === 1 && "grid-cols-1",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
        )}
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-[var(--radius-field)] border p-3.5 transition-colors",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pomegranate",
                checked
                  ? "border-pomegranate bg-pomegranate-100/60"
                  : "border-line bg-surface hover:border-walnut/40 hover:bg-surface-sunk",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-0.5 size-4.5 shrink-0 accent-pomegranate"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-medium text-charcoal">
                  {option.icon}
                  {option.label}
                </span>
                {option.description ? (
                  <span className="mt-0.5 block text-sm text-stone">{option.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
