"use client";

import { useRef, useState } from "react";
import { HelpCircle, ImagePlus, Palette, Plus, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, RadioCards, Select, Textarea } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { useToast } from "@/components/ui/toast";
import { MOTIF_NAMES, PALETTE_NAMES, ProductImageView, TextileSwatch } from "./textile-image";
import { useI18n } from "@/lib/i18n";
import type {
  Locale,
  MotifName,
  PaletteName,
  Product,
  ProductCategory,
  ProductImage,
  Role,
  StockStatus,
} from "@/lib/types";
import { fileToDownscaledDataUrl } from "@/lib/image";
import { newId } from "@/lib/utils";

/**
 * The editable shape of a product.
 *
 * The guided wizard (/products/new) and the edit screen (/products/[id]) both
 * render these same sections, so the questions a family answers are worded
 * identically whether they are adding a piece or fixing one.
 *
 * Bilingual content is written in whichever language the family is using; the
 * other language keeps whatever was there. That is honest: LoomLock does not
 * pretend to translate an artisan's story on their behalf.
 */
export interface ProductDraftValue {
  name: string;
  category: ProductCategory;
  description: string;
  story: string;
  price: string;
  priceOnRequest: boolean;
  productionDays: string;
  materials: string[];
  dimensions: string;
  stockStatus: StockStatus;
  madeToOrder: boolean;
  images: ProductImage[];
}

export function productToDraft(product: Product, locale: Locale): ProductDraftValue {
  return {
    name: product.name[locale] || product.name.en,
    category: product.category,
    description: product.description[locale] || product.description.en,
    story: product.story[locale] || product.story.en,
    price: product.price === null ? "" : String(product.price),
    priceOnRequest: product.priceOnRequest,
    productionDays: product.productionDays === null ? "" : String(product.productionDays),
    materials: product.materials.map((m) => m[locale] || m.en),
    dimensions: product.dimensions,
    stockStatus: product.stockStatus,
    madeToOrder: product.madeToOrder,
    images: product.images,
  };
}

export function emptyDraft(): ProductDraftValue {
  return {
    name: "",
    category: "home_textiles",
    description: "",
    story: "",
    price: "",
    priceOnRequest: false,
    productionDays: "",
    materials: [],
    dimensions: "",
    stockStatus: "available",
    madeToOrder: true,
    images: [],
  };
}

/** Merge edits back onto a product, keeping the untouched language intact. */
export function applyDraft(
  base: Product,
  draft: ProductDraftValue,
  locale: Locale,
): Product {
  const other: Locale = locale === "en" ? "az" : "en";
  const pair = (existing: { en: string; az: string }, value: string) => ({
    ...existing,
    [locale]: value,
    // A brand-new record has nothing in the other language yet; mirror it so the
    // storefront is never blank in one language.
    [other]: existing[other]?.trim() ? existing[other] : value,
  });

  const price = draft.priceOnRequest ? null : draft.price.trim() === "" ? null : Number(draft.price);
  const days = draft.productionDays.trim() === "" ? null : Number(draft.productionDays);

  return {
    ...base,
    name: pair(base.name, draft.name.trim()),
    category: draft.category,
    description: pair(base.description, draft.description.trim()),
    story: pair(base.story, draft.story.trim()),
    price: Number.isFinite(price as number) ? (price as number | null) : null,
    priceOnRequest: draft.priceOnRequest,
    productionDays: Number.isFinite(days as number) ? (days as number | null) : null,
    materials: draft.materials
      .map((m) => m.trim())
      .filter(Boolean)
      .map((value, index) => {
        const existing = base.materials[index];
        return existing
          ? { ...existing, [locale]: value, [other]: existing[other] || value }
          : { en: value, az: value };
      }),
    dimensions: draft.dimensions.trim(),
    stockStatus: draft.stockStatus,
    madeToOrder: draft.madeToOrder,
    images: draft.images,
  };
}

type SectionProps = {
  value: ProductDraftValue;
  onChange: (patch: Partial<ProductDraftValue>) => void;
  errors?: Partial<Record<keyof ProductDraftValue, string>>;
};

/* ------------------------------------------------------------------ basics */

export function BasicsSection({ value, onChange, errors }: SectionProps) {
  const { d } = useI18n();
  const categories: ProductCategory[] = [
    "home_textiles",
    "cushions",
    "wall_pieces",
    "small_gifts",
    "accessories",
  ];

  return (
    <div className="space-y-5">
      <Field
        label={d.productForm.nameLabel}
        help={d.productForm.nameHelp}
        required
        error={errors?.name}
      >
        <Input
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={d.productForm.namePlaceholder}
          autoComplete="off"
        />
      </Field>

      <Field label={d.productForm.categoryLabel}>
        <Select
          value={value.category}
          onChange={(e) => onChange({ category: e.target.value as ProductCategory })}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {d.products.categories[category]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={d.productForm.descriptionLabel} help={d.productForm.descriptionHelp}>
        <Textarea
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={d.productForm.descriptionPlaceholder}
          rows={3}
        />
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------- story */

export function StorySection({ value, onChange }: SectionProps) {
  const { d } = useI18n();
  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-field)] border border-line bg-surface-sunk p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-charcoal">
          <HelpCircle aria-hidden className="size-4 text-walnut" />
          {d.productForm.storyIntro}
        </p>
        <ul className="mt-3 space-y-1.5">
          {d.productForm.storyPrompts.map((prompt) => (
            <li key={prompt} className="flex items-start gap-2 text-sm text-stone">
              <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-walnut/50" />
              <span>{prompt}</span>
            </li>
          ))}
        </ul>
      </div>

      <Field label={d.productForm.storyLabel} help={d.productForm.storyHelp}>
        <Textarea
          value={value.story}
          onChange={(e) => onChange({ story: e.target.value })}
          placeholder={d.productForm.storyPlaceholder}
          rows={7}
        />
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ making */

export function MakingSection({ value, onChange }: SectionProps) {
  const { d } = useI18n();
  const [entry, setEntry] = useState("");

  function addMaterial() {
    const trimmed = entry.trim();
    if (!trimmed) return;
    onChange({ materials: [...value.materials, trimmed] });
    setEntry("");
  }

  return (
    <div className="space-y-5">
      <div>
        <Field label={d.productForm.materialsLabel} help={d.productForm.materialsHelp}>
          <div className="flex gap-2">
            <Input
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMaterial();
                }
              }}
              placeholder={d.productForm.materialsPlaceholder}
            />
            <Button variant="outline" onClick={addMaterial} className="shrink-0">
              <Plus aria-hidden />
              <span className="sr-only sm:not-sr-only">{d.productForm.addMaterial}</span>
            </Button>
          </div>
        </Field>

        {value.materials.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {value.materials.map((material, index) => (
              <li
                key={`${material}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-[0.3125rem] border border-line bg-surface px-3 py-1 text-sm"
              >
                {material}
                <button
                  type="button"
                  onClick={() =>
                    onChange({ materials: value.materials.filter((_, i) => i !== index) })
                  }
                  className="-me-1 rounded-[0.25rem] p-0.5 text-stone hover:bg-surface-sunk hover:text-pomegranate"
                  aria-label={`${d.common.remove}: ${material}`}
                >
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Field label={d.productForm.productionLabel} help={d.productForm.productionHelp}>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            value={value.productionDays}
            onChange={(e) => onChange({ productionDays: e.target.value })}
            className="max-w-32"
          />
          <span className="text-sm text-stone">{d.products.fields.productionDays}</span>
        </div>
      </Field>

      <Field label={d.productForm.dimensionsLabel}>
        <Input
          value={value.dimensions}
          onChange={(e) => onChange({ dimensions: e.target.value })}
          placeholder={d.productForm.dimensionsPlaceholder}
          className="max-w-64"
        />
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------- price */

export function PriceSection({
  value,
  onChange,
  role,
}: SectionProps & { role: Role }) {
  const { d } = useI18n();
  const isOwner = role === "owner";

  return (
    <div className="space-y-5">
      <Note tone={isOwner ? "info" : "approval"}>
        {isOwner ? d.productForm.priceOwnerNote : d.productForm.priceCollabNote}
      </Note>

      <Field label={d.productForm.priceLabel}>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step={1}
          value={value.price}
          disabled={value.priceOnRequest}
          onChange={(e) => onChange({ price: e.target.value })}
          className="max-w-40"
        />
      </Field>

      <Checkbox
        label={d.productForm.priceOnRequestLabel}
        description={d.productForm.priceOnRequestHelp}
        checked={value.priceOnRequest}
        onChange={(e) => onChange({ priceOnRequest: e.target.checked })}
      />

      <RadioCards
        legend={d.productForm.stockLabel}
        name="stock"
        value={value.stockStatus}
        onChange={(stockStatus) => onChange({ stockStatus })}
        columns={3}
        options={[
          { value: "available", label: d.status.stock.available },
          { value: "made_to_order", label: d.status.stock.made_to_order },
          { value: "sold_out", label: d.status.stock.sold_out },
        ]}
      />

      <Checkbox
        label={d.productForm.madeToOrderLabel}
        checked={value.madeToOrder}
        onChange={(e) => onChange({ madeToOrder: e.target.checked })}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ photos */

export function PhotosSection({ value, onChange }: SectionProps) {
  const { d, locale } = useI18n();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [busy, setBusy] = useState(false);

  function setImages(images: ProductImage[]) {
    // Something must always be the cover.
    const hasCover = images.some((image) => image.isCover);
    onChange({
      images: hasCover ? images : images.map((image, i) => ({ ...image, isCover: i === 0 })),
    });
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    const added: ProductImage[] = [];

    for (const file of Array.from(files).slice(0, 4)) {
      const result = await fileToDownscaledDataUrl(file);
      if (!result.ok) {
        toast(
          result.error === "size" ? d.errors.imageTooLarge : d.errors.imageWrongType,
          "error",
        );
        continue;
      }
      added.push({
        id: newId("image"),
        kind: "upload",
        dataUrl: result.dataUrl,
        alt: { en: "", az: "" },
        isCover: false,
      });
    }

    setBusy(false);
    if (added.length > 0) setImages([...value.images, ...added]);
    if (fileInput.current) fileInput.current.value = "";
  }

  function addPlaceholder(motif: MotifName, palette: PaletteName) {
    setImages([
      ...value.images,
      {
        id: newId("image"),
        kind: "motif",
        motif,
        palette,
        alt: { en: "", az: "" },
        isCover: false,
      },
    ]);
    setShowPicker(false);
  }

  return (
    <div className="space-y-5">
      <p className="text-[0.9375rem] text-stone">{d.productForm.photosIntro}</p>

      <Note tone="info" title={d.productForm.photoTip}>
        {d.productForm.photoTipBody}
      </Note>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => void onFiles(e.target.files)}
          id="product-photo-input"
        />
        <Button variant="outline" onClick={() => fileInput.current?.click()} disabled={busy}>
          <Upload aria-hidden />
          {busy ? d.common.loading : d.productForm.uploadPhoto}
        </Button>
        <Button variant="ghost" onClick={() => setShowPicker((v) => !v)} aria-expanded={showPicker}>
          <Palette aria-hidden />
          {d.productForm.addPlaceholder}
        </Button>
      </div>
      <p className="text-sm text-stone">{d.productForm.uploadHelp}</p>

      {showPicker ? (
        <fieldset className="rounded-[var(--radius-field)] border border-line bg-surface-sunk p-4">
          <legend className="px-1 text-sm font-medium">{d.productForm.addPlaceholder}</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {MOTIF_NAMES.map((motif, index) => {
              const palette = PALETTE_NAMES[index % PALETTE_NAMES.length];
              return (
                <button
                  key={motif}
                  type="button"
                  onClick={() => addPlaceholder(motif, palette)}
                  className="aspect-square overflow-hidden rounded-[var(--radius-field)] border-2 border-transparent transition-colors hover:border-pomegranate"
                >
                  <TextileSwatch motif={motif} palette={palette} />
                  <span className="sr-only">{motif}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {value.images.length === 0 ? (
        <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line bg-surface-sunk/60 px-6 py-10 text-center">
          <ImagePlus aria-hidden className="size-6 text-walnut" />
          <p className="mt-2 font-medium">{d.products.noPhotos}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {value.images.map((image) => (
            <li
              key={image.id}
              className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface"
            >
              <div className="relative aspect-[4/3]">
                <ProductImageView image={image} alt="" />
                {image.isCover ? (
                  <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-[0.3125rem] bg-charcoal/85 px-2 py-1 text-[0.6875rem] font-medium text-ivory">
                    <Star aria-hidden className="size-3" />
                    {d.productForm.coverPhoto}
                  </span>
                ) : null}
              </div>

              <div className="space-y-3 p-3">
                {image.kind === "motif" ? (
                  <p className="text-xs text-stone">{d.productForm.placeholderNote}</p>
                ) : null}

                <Field label={d.productForm.altLabel} help={d.productForm.altHelp}>
                  <Input
                    value={image.alt[locale] || ""}
                    onChange={(e) =>
                      setImages(
                        value.images.map((i) =>
                          i.id === image.id
                            ? { ...i, alt: { ...i.alt, [locale]: e.target.value } }
                            : i,
                        ),
                      )
                    }
                  />
                </Field>

                <div className="flex flex-wrap gap-2">
                  {!image.isCover ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setImages(
                          value.images.map((i) => ({ ...i, isCover: i.id === image.id })),
                        )
                      }
                    >
                      <Star aria-hidden />
                      {d.productForm.setCover}
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-pomegranate"
                    onClick={() => setImages(value.images.filter((i) => i.id !== image.id))}
                  >
                    <Trash2 aria-hidden />
                    {d.common.remove}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
