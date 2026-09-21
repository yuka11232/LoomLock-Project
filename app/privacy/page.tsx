"use client";

import { LegalPage } from "@/components/app/legal-page";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const { d } = useI18n();

  return (
    <LegalPage
      heading={d.legal.privacyHeading}
      lead={d.legal.privacyLead}
      sections={d.legal.privacySections}
      extraSections={[
        { heading: d.legal.contactHeading, body: [d.legal.placeholderContact] },
      ]}
    />
  );
}
