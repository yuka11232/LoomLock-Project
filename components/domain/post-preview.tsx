"use client";

import { Bookmark, Heart, MessageCircle, Send, ThumbsUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { coverImage } from "@/lib/data/selectors";
import type { ContentPlatform, Product } from "@/lib/types";
import { ProductImageView } from "./textile-image";

/**
 * An approximation of the post.
 *
 * It is a preview, not a publisher: LoomLock cannot post to Instagram or
 * Facebook and the Studio says so plainly. The mock chrome exists so the family
 * can judge where a caption gets cut off and whether the photograph works as a
 * square, which is the practical reason to preview at all.
 */
export function PostPreview({
  product,
  caption,
  hashtags,
  platform,
  businessName,
}: {
  product: Product | undefined;
  caption: string;
  hashtags: string[];
  platform: ContentPlatform;
  businessName: string;
}) {
  const { d, t } = useI18n();
  const cover = product ? coverImage(product) : undefined;
  const handle = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const tagLine = hashtags.length > 0 ? hashtags.map((h) => `#${h}`).join(" ") : "";

  if (platform === "note") {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-charcoal">
          {caption || "—"}
        </p>
        {tagLine ? <p className="mt-3 text-sm text-indigo-ink">{tagLine}</p> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
      <div className="flex items-center gap-2.5 p-3">
        <span
          aria-hidden
          className="size-8 shrink-0 rounded-full bg-gradient-to-br from-pomegranate to-gold p-px"
        >
          <span className="flex size-full items-center justify-center rounded-full bg-white text-[0.625rem] font-bold text-charcoal">
            NT
          </span>
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-charcoal">{handle}</p>
          {platform === "facebook" ? (
            <p className="text-[0.6875rem] text-stone">{businessName}</p>
          ) : null}
        </div>
      </div>

      <div className="aspect-square w-full bg-linen">
        {cover ? (
          <ProductImageView image={cover} alt={t(cover.alt)} />
        ) : (
          <div className="weave-ground flex size-full items-center justify-center text-sm text-walnut">
            {d.products.noPhotos}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 px-3 pt-3 text-charcoal" aria-hidden>
        {platform === "instagram" ? (
          <>
            <Heart className="size-5" />
            <MessageCircle className="size-5" />
            <Send className="size-5" />
            <Bookmark className="ms-auto size-5" />
          </>
        ) : (
          <>
            <ThumbsUp className="size-5" />
            <MessageCircle className="size-5" />
            <Send className="size-5" />
          </>
        )}
      </div>

      <div className="px-3 pb-4 pt-2">
        <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal">
          <span className="font-semibold">{handle}</span>{" "}
          {caption || <span className="text-stone">{d.content.captionLabel}…</span>}
        </p>
        {tagLine ? <p className="mt-2 text-sm text-indigo-ink">{tagLine}</p> : null}
      </div>
    </div>
  );
}
