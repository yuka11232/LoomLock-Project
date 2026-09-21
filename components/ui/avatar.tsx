import type { Member } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCENT: Record<Member["accent"], string> = {
  pomegranate: "bg-pomegranate-100 text-pomegranate-600 border-pomegranate/25",
  indigo: "bg-indigo-100 text-indigo-ink border-indigo-ink/25",
  clay: "bg-clay-100 text-[#8f4f38] border-clay/30",
  walnut: "bg-[#f0e7db] text-walnut border-walnut/25",
};

/**
 * Initials rather than photographs. LoomLock holds no pictures of people,
 * only of the work.
 */
export function Avatar({
  member,
  size = "md",
  className,
}: {
  member: Pick<Member, "initials" | "accent" | "name">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border font-semibold",
        ACCENT[member.accent],
        size === "sm" && "size-7 text-[0.6875rem]",
        size === "md" && "size-9 text-xs",
        size === "lg" && "size-12 text-sm",
        className,
      )}
      aria-hidden
      title={member.name}
    >
      {member.initials}
    </span>
  );
}

/** Avatar plus name, used on cards where the author matters. */
export function MemberChip({
  member,
  secondary,
  size = "sm",
}: {
  member: Member;
  secondary?: string;
  size?: "sm" | "md";
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar member={member} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-charcoal">{member.name}</span>
        {secondary ? <span className="block truncate text-xs text-stone">{secondary}</span> : null}
      </span>
    </span>
  );
}
