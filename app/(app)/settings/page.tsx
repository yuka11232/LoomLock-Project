"use client";

import { useState } from "react";
import Link from "next/link";
import { Database, Globe, Lock, RotateCcw, Save } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { ComingLaterTag, Note } from "@/components/ui/note";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/data/store";
import { useI18n } from "@/lib/i18n";

export default function SettingsPage() {
  const { state, me, dispatch, resetDemo } = useStore();
  const { d, locale } = useI18n();
  const toast = useToast();

  const isOwner = me.role === "owner";
  const business = state.business;

  const [name, setName] = useState(business.name);
  const [tagline, setTagline] = useState(business.tagline[locale]);
  const [craft, setCraft] = useState(business.craft[locale]);
  const [location, setLocation] = useState(business.location[locale]);
  const [story, setStory] = useState(business.story[locale]);
  const [email, setEmail] = useState(business.contactEmail);
  const [confirmReset, setConfirmReset] = useState(false);

  function save() {
    dispatch({
      type: "updateBusiness",
      patch: {
        name: name.trim() || business.name,
        tagline: { ...business.tagline, [locale]: tagline },
        craft: { ...business.craft, [locale]: craft },
        location: { ...business.location, [locale]: location },
        story: { ...business.story, [locale]: story },
        contactEmail: email.trim(),
      },
    });
    toast(d.settings.savedToast);
  }

  return (
    <>
      <PageHeader title={d.settings.title} description={d.settings.subtitle} />

      <div className="mx-auto max-w-3xl space-y-6">
        {/* --------------------------------------------------------- business */}
        <Card as="section" aria-labelledby="business-heading">
          <CardHeader>
            <CardTitle id="business-heading" as="h2">
              {d.settings.businessSection}
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 pt-0">
            <Field label={d.settings.businessName}>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>

            <Field label={d.settings.tagline}>
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </Field>

            <Field label={d.settings.craftLabel}>
              <Input value={craft} onChange={(e) => setCraft(e.target.value)} />
            </Field>

            <Field label={d.settings.locationLabel}>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </Field>

            <Field label={d.settings.storyLabel}>
              <Textarea value={story} onChange={(e) => setStory(e.target.value)} rows={6} />
            </Field>

            <Field label={d.settings.emailLabel}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>

            <Field label={d.settings.slugLabel} help={d.settings.slugHelp}>
              <Input value={`/store/${business.slug}`} readOnly />
            </Field>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={save}>
                <Save aria-hidden />
                {d.common.saveChanges}
              </Button>
              <Link
                href={`/store/${business.slug}`}
                className="text-sm text-indigo-ink hover:underline"
              >
                {d.nav.storefront}
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* --------------------------------------------------------- language */}
        <Card as="section" aria-labelledby="language-heading">
          <CardHeader>
            <CardTitle id="language-heading" as="h2">
              <span className="inline-flex items-center gap-2">
                <Globe aria-hidden className="size-[18px] text-walnut" />
                {d.settings.languageSection}
              </span>
            </CardTitle>
            <p className="mt-1 text-sm text-stone">{d.settings.languageBody}</p>
          </CardHeader>
          <CardBody className="space-y-4 pt-0">
            <div>
              <p className="mb-2 text-sm font-medium">{d.settings.interfaceLanguage}</p>
              <LanguageSwitcher />
            </div>
            <Note tone="later">{d.settings.russianLater}</Note>
          </CardBody>
        </Card>

        {/* ---------------------------------------------------- notifications */}
        <Card as="section" aria-labelledby="notify-heading">
          <CardHeader>
            <CardTitle id="notify-heading" as="h2">
              {d.settings.notificationsSection}
            </CardTitle>
            <p className="mt-1 text-sm text-stone">{d.settings.notificationsBody}</p>
          </CardHeader>
          <CardBody className="space-y-3.5 pt-0">
            <Checkbox
              label={d.settings.notifyEnquiries}
              checked={state.settings.notify.newEnquiries}
              onChange={(e) =>
                dispatch({ type: "setNotify", key: "newEnquiries", value: e.target.checked })
              }
            />
            <Checkbox
              label={d.settings.notifyApprovals}
              checked={state.settings.notify.approvalRequests}
              onChange={(e) =>
                dispatch({ type: "setNotify", key: "approvalRequests", value: e.target.checked })
              }
            />
            <Checkbox
              label={d.settings.notifyLearning}
              checked={state.settings.notify.weeklyLearning}
              onChange={(e) =>
                dispatch({ type: "setNotify", key: "weeklyLearning", value: e.target.checked })
              }
            />
          </CardBody>
        </Card>

        {/* ------------------------------------------------------------ roles */}
        <Card as="section" aria-labelledby="roles-heading">
          <CardHeader>
            <CardTitle id="roles-heading" as="h2">
              {d.settings.rolesSection}
            </CardTitle>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-[0.9375rem] leading-relaxed text-stone">
              {d.permissions.tableIntro}
            </p>
            <Link
              href="/team"
              className="mt-3 inline-block text-sm font-medium text-indigo-ink hover:underline"
            >
              {d.permissions.whoCanDoWhat}
            </Link>
          </CardBody>
        </Card>

        {/* -------------------------------------------------------- financial */}
        <Card as="section" aria-labelledby="financial-heading">
          <CardHeader>
            <CardTitle id="financial-heading" as="h2">
              <span className="inline-flex items-center gap-2">
                <Lock aria-hidden className="size-[18px] text-walnut" />
                {d.settings.financialSection}
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody className="pt-0">
            {isOwner ? (
              <>
                <p className="text-[0.9375rem] leading-relaxed text-stone">
                  {d.settings.financialBody}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <ComingLaterTag label={d.common.comingLater} />
                  <span className="text-sm text-stone">{d.settings.financialComingLater}</span>
                </div>
              </>
            ) : (
              <Note tone="info" title={d.permissions.ownerOnlyArea}>
                {d.permissions.ownerOnlyAreaBody}
              </Note>
            )}
          </CardBody>
        </Card>

        {/* ------------------------------------------------------------- demo */}
        <Card as="section" aria-labelledby="demo-heading">
          <CardHeader>
            <CardTitle id="demo-heading" as="h2">
              <span className="inline-flex items-center gap-2">
                <Database aria-hidden className="size-[18px] text-walnut" />
                {d.settings.demoSection}
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 pt-0">
            <p className="text-[0.9375rem] leading-relaxed text-stone">{d.settings.demoBody}</p>

            <dl className="rounded-[var(--radius-field)] border border-line bg-surface-sunk p-4 text-sm">
              <dt className="font-medium text-charcoal">{d.settings.storageLabel}</dt>
              <dd className="mt-0.5 text-stone">{d.settings.storageBody}</dd>
            </dl>

            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw aria-hidden />
              {d.settings.resetDemo}
            </Button>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemo();
          toast(d.settings.resetDone);
        }}
        title={d.settings.resetConfirmTitle}
        body={d.settings.resetConfirmBody}
        confirmLabel={d.settings.resetDemo}
        cancelLabel={d.common.cancel}
        closeLabel={d.common.close}
      />
    </>
  );
}
