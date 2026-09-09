import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status is never carried by colour alone: every badge takes an icon and a
 * text label, so the meaning survives greyscale, colour blindness, and a
 * screen reader.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-line bg-surface-sunk text-stone",
        draft: "border-walnut/25 bg-[#f3ece2] text-walnut",
        pending: "border-gold/35 bg-gold-100 text-[#8a6316]",
        success: "border-sage/30 bg-sage-100 text-[#3d5540]",
        info: "border-indigo-ink/25 bg-indigo-100 text-indigo-ink",
        attention: "border-clay/30 bg-clay-100 text-[#8f4f38]",
        primary: "border-pomegranate/25 bg-pomegranate-100 text-pomegranate-600",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.6875rem] [&_svg]:size-3",
        md: "px-2.5 py-1 text-xs [&_svg]:size-3.5",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;
