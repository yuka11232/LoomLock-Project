import { createSeedState } from "@/lib/data/seed";
import StorefrontView from "./storefront-view";

/**
 * The storefront slug is fixed: settings renders it as a read-only field, so
 * the only slug a visitor can reach is the one the seed ships with. Taking it
 * from `createSeedState()` rather than hardcoding the string keeps this route
 * correct if the seed's business is ever renamed.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: createSeedState().business.slug }];
}

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StorefrontView slug={slug} />;
}
