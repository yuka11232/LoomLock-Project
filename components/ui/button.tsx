"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)]",
    "font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    // Icons never shrink; labels wrap instead.
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-pomegranate text-white hover:bg-pomegranate-600 shadow-[0_1px_2px_rgba(42,37,34,0.12)]",
        secondary:
          "bg-indigo-ink text-white hover:bg-[#2b3c5b]",
        outline:
          "border border-line bg-surface text-charcoal hover:bg-surface-sunk hover:border-walnut/40",
        ghost: "text-charcoal hover:bg-surface-sunk",
        quiet: "text-stone hover:text-charcoal hover:bg-surface-sunk",
        danger:
          "border border-pomegranate/30 bg-surface text-pomegranate hover:bg-pomegranate-100",
      },
      size: {
        sm: "min-h-9 px-3 text-sm [&_svg]:size-4",
        md: "min-h-11 px-4 text-[0.9375rem] [&_svg]:size-[18px]",
        lg: "min-h-12 px-6 text-base [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-5",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
});

export interface ButtonLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link>,
    VariantProps<typeof buttonVariants> {}

/** Same visual treatment as Button, but a real link so it can be opened in a tab. */
export function ButtonLink({ className, variant, size, block, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size, block }), className)} {...props} />
  );
}

export { buttonVariants };
