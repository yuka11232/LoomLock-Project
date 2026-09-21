"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, UserRoundCog } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Switching between the two demo roles.
 *
 * This exists because the whole product is about two people with different
 * permissions sharing one workspace, and a visitor has to be able to feel the
 * difference. In a real deployment this control would not exist; you would be
 * whoever you signed in as.
 */
export function RoleSwitcher({ className }: { className?: string }) {
  const { state, me, dispatch } = useStore();
  const { d, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 w-full items-center gap-2.5 rounded-[var(--radius-field)] border border-line bg-surface px-2.5 py-1.5 text-start transition-colors hover:border-walnut/40 hover:bg-surface-sunk"
      >
        <Avatar member={me} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-charcoal">{me.name}</span>
          <span className="block truncate text-xs text-stone">
            {me.role === "owner" ? d.roles.owner : d.roles.collaborator}
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn("size-4 shrink-0 text-stone transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={d.nav.switchRole}
          className="absolute end-0 z-40 mt-1.5 w-[min(20rem,calc(100vw-2rem))] animate-fade-up overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-lift)]"
        >
          <p className="flex items-start gap-2 border-b border-line bg-surface-sunk px-3.5 py-2.5 text-xs leading-relaxed text-stone">
            <UserRoundCog aria-hidden className="mt-0.5 size-4 shrink-0" />
            {d.nav.switchRoleHelp}
          </p>

          {state.members.map((member) => {
            const active = member.id === me.id;
            return (
              <button
                key={member.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  dispatch({ type: "setActiveMember", memberId: member.id });
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-3 px-3.5 py-3 text-start transition-colors",
                  active ? "bg-pomegranate-100/50" : "hover:bg-surface-sunk",
                )}
              >
                <Avatar member={member} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-charcoal">{member.name}</span>
                  <span className="block text-xs font-medium text-pomegranate-600">
                    {member.role === "owner" ? d.roles.owner : d.roles.collaborator}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-stone">
                    {t(member.focus)}
                  </span>
                </span>
                {active ? (
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-pomegranate" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
