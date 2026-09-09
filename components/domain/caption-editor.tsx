"use client";

import { useState } from "react";
import { Copy, Download, Plus, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { copyText, useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import {
  buildCaptionStarter,
  findOverclaims,
  hasUnfilledPrompts,
} from "@/lib/content-starters";
import type { ContentDraft, Product } from "@/lib/types";

/**
 * Writing the caption.
 *
 * The starter is built from the family's own product fields and is always
 * editable. The two reminders below it — unfilled [prompts] and over-claiming
 * words — are advisory only. Nothing here blocks the family from writing what
 * they want in their own voice.
 */
export function CaptionEditor({
  draft,
  product,
  onChange,
}: {
  draft: ContentDraft;
  product: Product | undefined;
  onChange: (patch: Partial<ContentDraft>) => void;
}) {
  const { d, locale } = useI18n();
  const toast = useToast();
  const [hashtagEntry, setHashtagEntry] = useState("");
  const [confirmRebuild, setConfirmRebuild] = useState(false);

  const unfilled = hasUnfilledPrompts(draft.caption);
  const overclaims = findOverclaims(draft.caption);

  function rebuild() {
    if (!product) return;
    onChange({
      caption: buildCaptionStarter({
        product,
        goal: draft.goal,
        tone: draft.tone,
        locale,
      }),
      language: locale,
    });
  }

  function addHashtag() {
    const clean = hashtagEntry.trim().replace(/^#/, "").replace(/\s+/g, "");
    if (!clean || draft.hashtags.includes(clean)) {
      setHashtagEntry("");
      return;
    }
    onChange({ hashtags: [...draft.hashtags, clean] });
    setHashtagEntry("");
  }

  return (
    <div className="space-y-4">
      <Note tone="info" title={d.content.starterTitle}>
        <p>{d.content.starterBody}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2.5 bg-surface"
          onClick={() => (draft.caption.trim() ? setConfirmRebuild(true) : rebuild())}
        >
          <RefreshCw aria-hidden />
          {d.content.rebuildStarter}
        </Button>
      </Note>

      <Field label={d.content.captionLabel} help={d.content.captionHelp}>
        <Textarea
          value={draft.caption}
          onChange={(event) => onChange({ caption: event.target.value })}
          rows={10}
        />
      </Field>

      {unfilled ? <Note tone="caution">{d.content.fillPromptsNotice}</Note> : null}

      {overclaims.length > 0 ? (
        <Note tone="caution" title={d.content.voiceReminderTitle} icon={<TriangleAlert />}>
          <p>{d.content.voiceReminderBody}</p>
          <p className="mt-1.5 font-medium">{overclaims.join(", ")}</p>
        </Note>
      ) : null}

      <div>
        <Field label={d.content.hashtagsLabel} help={d.content.hashtagsHelp}>
          <div className="flex gap-2">
            <Input
              value={hashtagEntry}
              onChange={(event) => setHashtagEntry(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addHashtag();
                }
              }}
              placeholder="handwoven"
            />
            <Button variant="outline" onClick={addHashtag} className="shrink-0">
              <Plus aria-hidden />
              <span className="sr-only">{d.content.addHashtag}</span>
            </Button>
          </div>
        </Field>

        {draft.hashtags.length > 0 ? (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {draft.hashtags.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-sm text-indigo-ink"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => onChange({ hashtags: draft.hashtags.filter((h) => h !== tag) })}
                  className="-me-0.5 rounded-full p-0.5 text-stone hover:text-pomegranate"
                  aria-label={`${d.common.remove}: ${tag}`}
                >
                  <Trash2 aria-hidden className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmRebuild}
        onClose={() => setConfirmRebuild(false)}
        onConfirm={rebuild}
        title={d.content.rebuildConfirmTitle}
        body={d.content.rebuildConfirmBody}
        confirmLabel={d.content.rebuildStarter}
        cancelLabel={d.common.cancel}
        closeLabel={d.common.close}
      />

      <CopyActions draft={draft} product={product} toast={toast} />
    </div>
  );
}

/**
 * Copy and export. This is how a post actually reaches Instagram: a person
 * pastes it. The export writes a plain text file with the caption, the tags,
 * and the photograph description, so it can be moved to another device.
 */
function CopyActions({
  draft,
  product,
  toast,
}: {
  draft: ContentDraft;
  product: Product | undefined;
  toast: (message: string, tone?: "success" | "error" | "info") => void;
}) {
  const { d, t, locale } = useI18n();

  const fullCaption = [draft.caption, draft.hashtags.map((h) => `#${h}`).join(" ")]
    .filter((part) => part.trim())
    .join("\n\n");

  async function copy() {
    const ok = await copyText(fullCaption);
    toast(ok ? d.content.captionCopied : d.errors.copyFailed, ok ? "success" : "error");
  }

  function exportPackage() {
    const cover = product?.images.find((i) => i.isCover) ?? product?.images[0];
    const lines = [
      `LoomLock — ${d.content.exportPackage}`,
      "",
      `${d.content.forProduct}: ${product ? t(product.name) : "—"}`,
      `${d.content.platformLabel} ${d.content.platforms[draft.platform]}`,
      `${d.content.goalLabel}: ${d.content.goals[draft.goal]}`,
      `${d.content.toneLabel}: ${d.content.tones[draft.tone]}`,
      "",
      "--- " + d.content.captionLabel + " ---",
      draft.caption,
      "",
      "--- " + d.content.hashtagsLabel + " ---",
      draft.hashtags.map((h) => `#${h}`).join(" "),
      "",
      "--- " + d.productForm.altLabel + " ---",
      cover ? t(cover.alt) || "—" : "—",
      "",
      d.content.notPublishedNotice,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `loomlock-post-${product ? t(product.name).toLowerCase().replace(/\s+/g, "-") : "draft"}-${locale}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast(d.content.exportedTitle);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={copy}>
        <Copy aria-hidden />
        {d.content.copyCaption}
      </Button>
      <Button variant="ghost" onClick={exportPackage}>
        <Download aria-hidden />
        {d.content.exportPackage}
      </Button>
    </div>
  );
}
