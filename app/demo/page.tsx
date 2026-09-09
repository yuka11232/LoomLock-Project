"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Hammer, Megaphone, RotateCcw } from "lucide-react";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { Wordmark } from "@/components/app/logo";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Note } from "@/components/ui/note";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import type { Member } from "@/lib/types";

/**
 * The demo entry.
 *
 * Choosing a role is the whole point of the screen: LoomLock is about two
 * people with different authority sharing one workspace, and a visitor should
 * pick a side before they see it. Either choice lands in the same seeded
 * business — no registration, no empty state.
 */
export default function DemoEntryPage() {
  const { state, dispatch, resetDemo } = useStore();
  const { d, t } = useI18n();
  const router = useRouter();

  const owner = state.members.find((m) => m.role === "owner");
  const collaborator = state.members.find((m) => m.role === "collaborator");

  function enterAs(member: Member | undefined) {
    if (!member) return;
    dispatch({ type: "setActiveMember", memberId: member.id });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main" className="skip-link">
        {d.nav.skipToContent}
      </a>

      <header className="border-b border-line bg-ivory">
        <div className="container-page flex h-16 items-center gap-4">
          <Link href="/" aria-label="LoomLock">
            <Wordmark />
          </Link>
          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher compact />
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft aria-hidden />
              <span className="hidden sm:inline">{d.nav.backToSite}</span>
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{d.demoEntry.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-stone">{d.demoEntry.body}</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          <RoleCard
            member={owner}
            roleLabel={d.demoEntry.ownerRole}
            description={d.demoEntry.ownerDesc}
            abilities={d.demoEntry.ownerCan}
            Icon={Hammer}
            accent="pomegranate"
            onEnter={() => enterAs(owner)}
            enterLabel={`${d.demoEntry.enterAs} ${owner?.name ?? ""}`}
            focus={owner ? t(owner.focus) : ""}
          />
          <RoleCard
            member={collaborator}
            roleLabel={d.demoEntry.collaboratorRole}
            description={d.demoEntry.collaboratorDesc}
            abilities={d.demoEntry.collaboratorCan}
            Icon={Megaphone}
            accent="indigo"
            onEnter={() => enterAs(collaborator)}
            enterLabel={`${d.demoEntry.enterAs} ${collaborator?.name ?? ""}`}
            focus={collaborator ? t(collaborator.focus) : ""}
          />
        </div>

        <div className="mx-auto mt-8 max-w-4xl space-y-4">
          <Note tone="info" title={d.demoEntry.aboutTitle}>
            <p>{d.demoEntry.aboutBody}</p>
          </Note>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={resetDemo}>
              <RotateCcw aria-hidden />
              {d.demoEntry.resetFirst}
            </Button>
            <Link
              href="/onboarding"
              className="text-sm text-stone underline underline-offset-4 hover:text-charcoal"
            >
              {d.onboarding.title}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function RoleCard({
  member,
  roleLabel,
  description,
  abilities,
  Icon,
  accent,
  onEnter,
  enterLabel,
  focus,
}: {
  member: Member | undefined;
  roleLabel: string;
  description: string;
  abilities: string[];
  Icon: typeof Hammer;
  accent: "pomegranate" | "indigo";
  onEnter: () => void;
  enterLabel: string;
  focus: string;
}) {
  const { d } = useI18n();
  if (!member) return null;

  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-center gap-3">
        <Avatar member={member} size="lg" />
        <div className="min-w-0">
          <p className="font-display text-xl font-semibold">{member.name}</p>
          <p
            className={
              accent === "pomegranate"
                ? "flex items-center gap-1.5 text-sm font-medium text-pomegranate-600"
                : "flex items-center gap-1.5 text-sm font-medium text-indigo-ink"
            }
          >
            <Icon aria-hidden className="size-4" />
            {roleLabel}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[0.9375rem] leading-relaxed text-charcoal">{description}</p>
      <p className="mt-2 text-sm text-stone">{focus}</p>

      <ul className="mt-5 space-y-2">
        {abilities.map((ability) => (
          <li key={ability} className="flex items-start gap-2.5 text-sm">
            <Check
              aria-hidden
              className={
                accent === "pomegranate"
                  ? "mt-0.5 size-4 shrink-0 text-pomegranate"
                  : "mt-0.5 size-4 shrink-0 text-indigo-ink"
              }
            />
            <span>{ability}</span>
          </li>
        ))}
      </ul>

      <Button
        className="mt-6"
        block
        size="lg"
        variant={accent === "pomegranate" ? "primary" : "secondary"}
        onClick={onEnter}
      >
        {d.demoEntry.enterAs} {member.name.split(" ")[0]}
        <ArrowRight aria-hidden />
        <span className="sr-only">{enterLabel}</span>
      </Button>
    </Card>
  );
}
