"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Info, Mail, Minus, ShieldCheck, UserPlus, X } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle, SectionHeading } from "@/components/ui/card";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Field, Input, RadioCards } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { useToast } from "@/components/ui/toast";
import { lessonsCompletedBy, ordersFor } from "@/lib/data/selectors";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";
import { PERMISSION_TABLE, permission, type PermissionLevel } from "@/lib/permissions";
import type { Role } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/**
 * The family page.
 *
 * The permission table at the bottom is rendered from lib/permissions.ts — the
 * same module the rest of the app enforces — so what the family reads here is
 * always what the app actually does.
 */
export default function TeamPage() {
  const { state, me, dispatch } = useStore();
  const { d, t, locale } = useI18n();
  const toast = useToast();

  const isOwner = me.role === "owner";
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title={d.team.title}
        description={d.team.subtitle}
        action={
          isOwner ? (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus aria-hidden />
              {d.team.invite}
            </Button>
          ) : null
        }
      />

      {!isOwner ? (
        <Note tone="info" className="mb-5">
          {d.team.ownerOnlyInvite}
        </Note>
      ) : null}

      {/* --------------------------------------------------------- members */}
      <ul className="mb-8 grid gap-5 lg:grid-cols-2">
        {state.members.map((member) => {
          const assigned = ordersFor(state, member.id);
          const lessons = lessonsCompletedBy(state, member.id).length;

          return (
            <Card as="li" key={member.id}>
              <CardBody className="pt-5">
                <div className="flex items-start gap-4">
                  <Avatar member={member} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-semibold">{member.name}</h2>
                      <Badge tone={member.role === "owner" ? "primary" : "info"} size="sm">
                        <ShieldCheck aria-hidden />
                        {member.role === "owner" ? d.roles.owner : d.roles.collaborator}
                      </Badge>
                      {member.id === me.id ? (
                        <span className="text-xs text-stone">({d.nav.youAre.split(" ")[0]})</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-stone">
                      {t(member.focus)}
                    </p>
                    <p className="mt-1 text-xs text-stone">
                      {d.team.memberSince(formatDate(member.joinedAt, locale))} ·{" "}
                      {d.team.lessonsDone(lessons)}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="text-sm font-semibold">{d.team.responsibilities}</h3>
                  <ul className="mt-2 space-y-1.5">
                    {member.responsibilities.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-sage" />
                        <span>{t(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <h3 className="text-sm font-semibold">{d.team.currentTasks}</h3>
                  {assigned.length === 0 ? (
                    <p className="mt-1.5 text-sm text-stone">{d.team.noTasks}</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {assigned.slice(0, 4).map((order) => (
                        <li key={order.id} className="text-sm">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-indigo-ink hover:underline"
                          >
                            {order.ref} — {t(order.requestedItem)}
                          </Link>
                          {t(order.nextAction) ? (
                            <span className="block text-xs text-stone">{t(order.nextAction)}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {isOwner && member.role !== "owner" ? (
                  <div className="mt-5 border-t border-line pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-pomegranate"
                      onClick={() => setRemoveId(member.id)}
                    >
                      <Minus aria-hidden />
                      {d.team.removeMember}
                    </Button>
                  </div>
                ) : null}
              </CardBody>
            </Card>
          );
        })}
      </ul>

      {/* ----------------------------------------------------- invitations */}
      {state.invitations.length > 0 ? (
        <section aria-labelledby="invites-heading" className="mb-8">
          <SectionHeading id="invites-heading" title={d.team.pendingInvites} />
          <Card>
            <ul className="divide-y divide-line">
              {state.invitations.map((invitation) => {
                const inviter = state.members.find((m) => m.id === invitation.invitedBy);
                return (
                  <li
                    key={invitation.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-4"
                  >
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linen text-walnut"
                    >
                      <Mail className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{invitation.name}</span>
                      <span className="block text-xs text-stone">
                        {invitation.contact} · {d.team.invitedBy(inviter?.name ?? "—")}
                      </span>
                    </span>
                    <Badge tone="pending" size="sm">
                      {d.status.approval.pending}
                    </Badge>
                    {isOwner ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          dispatch({ type: "inviteRemove", invitationId: invitation.id })
                        }
                        aria-label={`${d.common.remove}: ${invitation.name}`}
                      >
                        <X aria-hidden />
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      ) : null}

      {/* ------------------------------------------------- permission table */}
      <PermissionTable />

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <ConfirmDialog
        open={Boolean(removeId)}
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          if (!removeId) return;
          dispatch({ type: "memberRemove", memberId: removeId, actorId: me.id });
          toast(d.team.removeMember);
        }}
        title={d.team.removeConfirmTitle}
        body={d.team.removeConfirmBody}
        confirmLabel={d.common.remove}
        cancelLabel={d.common.cancel}
        closeLabel={d.common.close}
      />
    </>
  );
}

function PermissionTable() {
  const { d } = useI18n();

  const cell = (level: PermissionLevel) => {
    const map: Record<PermissionLevel, { label: string; tone: "success" | "pending" | "info" | "neutral"; Icon: typeof Check }> = {
      allowed: { label: d.permissions.allowed, tone: "success", Icon: Check },
      needs_approval: { label: d.permissions.needs_approval, tone: "pending", Icon: ShieldCheck },
      suggest_only: { label: d.permissions.suggest_only, tone: "info", Icon: Info },
      unavailable: { label: d.permissions.unavailable, tone: "neutral", Icon: X },
    };
    const { label, tone, Icon } = map[level];
    return (
      <Badge tone={tone} size="sm">
        <Icon aria-hidden />
        {label}
      </Badge>
    );
  };

  return (
    <Card as="section" aria-labelledby="permissions-heading">
      <CardHeader>
        <CardTitle id="permissions-heading" as="h2">
          {d.permissions.whoCanDoWhat}
        </CardTitle>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone">
          {d.permissions.tableIntro}
        </p>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="thin-scrollbar overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">{d.permissions.whoCanDoWhat}</caption>
            <thead>
              <tr className="border-b border-line text-start">
                <th scope="col" className="py-2.5 pe-4 text-start font-semibold">
                  {d.common.view}
                </th>
                <th scope="col" className="py-2.5 pe-4 text-start font-semibold">
                  {d.roles.owner}
                </th>
                <th scope="col" className="py-2.5 text-start font-semibold">
                  {d.roles.collaborator}
                </th>
              </tr>
            </thead>
            <tbody>
              {PERMISSION_TABLE.map((action) => (
                <tr key={action} className="border-b border-line last:border-0">
                  <th scope="row" className="py-3 pe-4 text-start font-normal">
                    {d.permissions.actions[action]}
                  </th>
                  <td className="py-3 pe-4">{cell(permission("owner", action))}</td>
                  <td className="py-3">{cell(permission("collaborator", action))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me, dispatch } = useStore();
  const { d } = useI18n();
  const toast = useToast();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState<Role>("collaborator");
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});

  function submit() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = d.errors.required;
    if (!contact.trim()) next.contact = d.errors.invalidContact;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    dispatch({
      type: "inviteCreate",
      name: name.trim(),
      contact: contact.trim(),
      role,
      actorId: me.id,
    });
    toast(d.team.inviteSent);
    setName("");
    setContact("");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={d.team.invite}
      description={d.team.inviteBody}
      closeLabel={d.common.close}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {d.common.cancel}
          </Button>
          <Button onClick={submit}>
            <UserPlus aria-hidden />
            {d.team.sendInvite}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={d.team.inviteNameLabel} required error={errors.name}>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </Field>

        <Field label={d.team.inviteContactLabel} required error={errors.contact}>
          <Input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            inputMode="email"
          />
        </Field>

        <RadioCards
          legend={d.team.inviteRoleLabel}
          name="invite-role"
          value={role}
          onChange={setRole}
          options={[
            {
              value: "collaborator",
              label: d.roles.collaborator,
              description: d.roles.collaboratorBlurb,
            },
            { value: "owner", label: d.roles.owner, description: d.roles.ownerBlurb },
          ]}
        />

        <Note tone="later">{d.team.inviteSentBody}</Note>
      </div>
    </Dialog>
  );
}
