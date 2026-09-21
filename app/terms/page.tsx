"use client";

import { LegalPage } from "@/components/app/legal-page";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { d } = useI18n();

  return (
    <LegalPage
      heading={d.legal.termsHeading}
      lead={d.legal.termsLead}
      sections={d.legal.termsSections}
      extraSections={[
        { heading: d.legal.governingLawHeading, body: [d.legal.placeholderLaw] },
        { heading: d.legal.contactHeading, body: [d.legal.placeholderContact] },
      ]}
    />
  );
}
