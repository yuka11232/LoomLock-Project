"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { Wordmark } from "@/components/app/logo";
import { HydrationGate } from "@/components/app/hydration-gate";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox, Field, Input, RadioCards, Textarea } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { Stepper } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { LOCALES, LOCALE_NAMES, useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/data/store";
import type { Locale, Product, Role } from "@/lib/types";
import { newId, nowIso, sameInBoth } from "@/lib/utils";

type HelpKey = "photos" | "captions" | "pricing" | "customers" | "orders" | "story";

/**
 * Setting up a business.
 *
 * The demo already contains a running studio, so this flow writes into that
 * same workspace rather than creating an empty one — a visitor who walks
 * through it renames the business, adds a product, and lands on a dashboard
 * that already has work in it. Every step can be skipped.
 */
export default function OnboardingPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <OnboardingHeader />
      <main id="main" className="container-page py-10 sm:py-14">
        <HydrationGate rows={2}>
          <OnboardingFlow />
        </HydrationGate>
      </main>
    </div>
  );
}

function OnboardingHeader() {
  const { d } = useI18n();
  return (
    <header className="border-b border-line bg-ivory">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" aria-label="LoomLock">
          <Wordmark />
        </Link>
        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher compact />
          <Link
            href="/demo"
            className="text-sm font-medium text-stone hover:text-charcoal hover:underline"
          >
            {d.common.skip}
          </Link>
        </div>
      </div>
    </header>
  );
}

function OnboardingFlow() {
  const { state, me, dispatch } = useStore();
  const { d, locale, setLocale } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [craft, setCraft] = useState(state.business.craft[locale]);
  const [craftStory, setCraftStory] = useState("");
  const [name, setName] = useState(state.business.name);
  const [location, setLocation] = useState(state.business.location[locale]);
  const [email, setEmail] = useState(state.business.contactEmail);
  const [help, setHelp] = useState<HelpKey[]>(["photos", "captions"]);
  const [inviteName, setInviteName] = useState("");
  const [inviteContact, setInviteContact] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("collaborator");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");

  const steps = [
    d.onboarding.steps.language,
    d.onboarding.steps.craft,
    d.onboarding.steps.profile,
    d.onboarding.steps.help,
    d.onboarding.steps.invite,
    d.onboarding.steps.product,
  ];

  const helpKeys: HelpKey[] = ["photos", "captions", "pricing", "customers", "orders", "story"];

  function finish() {
    dispatch({
      type: "updateBusiness",
      patch: {
        name: name.trim() || state.business.name,
        craft: { ...state.business.craft, [locale]: craft.trim() || state.business.craft[locale] },
        location: {
          ...state.business.location,
          [locale]: location.trim() || state.business.location[locale],
        },
        contactEmail: email.trim() || state.business.contactEmail,
        story: craftStory.trim()
          ? { ...state.business.story, [locale]: craftStory.trim() }
          : state.business.story,
      },
    });

    if (inviteName.trim()) {
      dispatch({
        type: "inviteCreate",
        name: inviteName.trim(),
        contact: inviteContact.trim(),
        role: inviteRole,
        actorId: me.id,
      });
    }

    if (productName.trim()) {
      const product: Product = {
        id: newId("product"),
        name: sameInBoth(productName.trim()),
        category: "home_textiles",
        description: sameInBoth(productDescription.trim()),
        story: sameInBoth(""),
        price: null,
        priceOnRequest: false,
        productionDays: null,
        materials: [],
        dimensions: "",
        stockStatus: "available",
        madeToOrder: true,
        status: "draft",
        images: [],
        createdBy: me.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        history: [],
      };
      dispatch({ type: "productSave", product, actorId: me.id, isNew: true });
    }

    dispatch({ type: "completeOnboarding" });
    toast(d.onboarding.doneTitle);
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{d.onboarding.title}</h1>
        <p className="mt-2 text-[1.0625rem] text-stone">{d.onboarding.subtitle}</p>
      </div>

      <Stepper steps={steps} current={step} stepLabel={d.onboarding.stepLabel} ofLabel={d.common.of} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          {/* ------------------------------------------------------ 1. language */}
          {step === 0 ? (
            <>
              <h2 className="font-display text-xl font-semibold">{d.onboarding.languageTitle}</h2>
              <p className="text-[0.9375rem] text-stone">{d.onboarding.languageBody}</p>
              <RadioCards
                legend={d.settings.interfaceLanguage}
                name="locale"
                value={locale}
                onChange={(value) => setLocale(value as Locale)}
                options={LOCALES.map((item) => ({ value: item, label: LOCALE_NAMES[item] }))}
              />
            </>
          ) : null}

          {/* --------------------------------------------------------- 2. craft */}
          {step === 1 ? (
            <>
              <h2 className="font-display text-xl font-semibold">{d.onboarding.craftTitle}</h2>
              <p className="text-[0.9375rem] text-stone">{d.onboarding.craftBody}</p>
              <Field label={d.onboarding.craftLabel}>
                <Input
                  value={craft}
                  onChange={(event) => setCraft(event.target.value)}
                  placeholder={d.onboarding.craftPlaceholder}
                />
              </Field>
              <Field label={d.onboarding.craftStoryLabel}>
                <Textarea
                  value={craftStory}
                  onChange={(event) => setCraftStory(event.target.value)}
                  placeholder={d.onboarding.craftStoryPlaceholder}
                  rows={4}
                />
              </Field>
            </>
          ) : null}

          {/* ------------------------------------------------------- 3. profile */}
          {step === 2 ? (
            <>
              <h2 className="font-display text-xl font-semibold">{d.onboarding.profileTitle}</h2>
              <p className="text-[0.9375rem] text-stone">{d.onboarding.profileBody}</p>
              <Field label={d.onboarding.businessNameLabel}>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={d.onboarding.businessNamePlaceholder}
                />
              </Field>
              <Field label={d.onboarding.locationLabel}>
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder={d.onboarding.locationPlaceholder}
                />
              </Field>
              <Field label={d.onboarding.emailLabel}>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
            </>
          ) : null}

          {/* ---------------------------------------------------------- 4. help */}
          {step === 3 ? (
            <>
              <h2 className="font-display text-xl font-semibold">{d.onboarding.helpTitle}</h2>
              <p className="text-[0.9375rem] text-stone">{d.onboarding.helpBody}</p>
              <div className="space-y-3">
                {helpKeys.map((key) => (
                  <Checkbox
                    key={key}
                    label={d.onboarding.helpOptions[key]}
                    checked={help.includes(key)}
                    onChange={(event) =>
                      setHelp((current) =>
                        event.target.checked
                          ? [...current, key]
                          : current.filter((item) => item !== key),
                      )
                    }
                  />
                ))}
              </div>
              <Note tone="info">
                <Link href="/learn" className="font-medium underline underline-offset-4">
                  {d.learn.title}
                </Link>{" "}
                — {d.learn.subtitle}
              </Note>
            </>
          ) : null}

          {/* -------------------------------------------------------- 5. invite */}
          {step === 4 ? (
            <>
              <h2 className="font-display text-xl font-semibold">{d.onboarding.inviteTitle}</h2>
              <p className="text-[0.9375rem] text-stone">{d.onboarding.inviteBody}</p>
              <Field label={d.onboarding.inviteNameLabel} optionalLabel={d.common.optional}>
                <Input
                  value={inviteName}
                  onChange={(event) => setInviteName(event.target.value)}
                />
              </Field>
              <Field label={d.onboarding.inviteContactLabel} optionalLabel={d.common.optional}>
                <Input
                  value={inviteContact}
                  onChange={(event) => setInviteContact(event.target.value)}
                />
              </Field>
              <RadioCards
                legend={d.onboarding.inviteRoleLabel}
                name="onboarding-role"
                value={inviteRole}
                onChange={setInviteRole}
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
            </>
          ) : null}

          {/* ------------------------------------------------------- 6. product */}
          {step === 5 ? (
            <>
              <h2 className="font-display text-xl font-semibold">{d.onboarding.productTitle}</h2>
              <p className="text-[0.9375rem] text-stone">{d.onboarding.productBody}</p>
              <Field label={d.productForm.nameLabel} optionalLabel={d.common.optional}>
                <Input
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder={d.productForm.namePlaceholder}
                />
              </Field>
              <Field label={d.productForm.descriptionLabel} optionalLabel={d.common.optional}>
                <Textarea
                  value={productDescription}
                  onChange={(event) => setProductDescription(event.target.value)}
                  placeholder={d.productForm.descriptionPlaceholder}
                  rows={3}
                />
              </Field>
              <Note tone="info" title={d.onboarding.doneTitle}>
                {d.onboarding.doneBody}
              </Note>
            </>
          ) : null}
        </CardBody>
      </Card>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft aria-hidden />
          {d.common.back}
        </Button>

        {step < steps.length - 1 ? (
          <div className="flex gap-2">
            <Button variant="quiet" onClick={() => setStep((s) => s + 1)}>
              {d.common.skip}
            </Button>
            <Button onClick={() => setStep((s) => s + 1)}>
              {d.common.next}
              <ArrowRight aria-hidden />
            </Button>
          </div>
        ) : (
          <Button size="lg" onClick={finish}>
            <Check aria-hidden />
            {d.onboarding.goToDashboard}
          </Button>
        )}
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-stone">
        <Sparkles aria-hidden className="size-4" />
        {d.onboarding.doneBody}
      </p>
    </div>
  );
}
