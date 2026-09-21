import type { ContentGoal, ContentTone, Locale, Product } from "./types";

/**
 * Caption starters.
 *
 * This is deliberately NOT a writing assistant. It assembles sentences out of
 * what the family has already entered about the product: the name, the
 * materials, the production time, the story the artisan wrote. It leaves a
 * clearly marked [square bracket] wherever it has nothing to say.
 *
 * Rules it follows:
 *   - never invent a cultural claim, a origin, or a meaning
 *   - never use evaluative marketing words (luxury, exclusive, masterpiece,
 *     stunning, unique). If the artisan used one in their own story, it stays,
 *     because that is their voice.
 *   - prefer the artisan's own sentences verbatim over anything generated
 *
 * The result is a starting point the family edits. The Studio says so on screen.
 */

interface StarterInput {
  product: Product;
  goal: ContentGoal;
  tone: ContentTone;
  locale: Locale;
}

/** The artisan's story, trimmed to the first couple of sentences. */
function storyOpening(text: string, sentences: number): string {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  if (!parts || parts.length === 0) return text.trim();
  return parts.slice(0, sentences).join(" ").trim();
}

function materialsLine(product: Product, locale: Locale): string | null {
  if (product.materials.length === 0) return null;
  const list = product.materials.map((m) => (locale === "az" ? m.az || m.en : m.en));
  if (locale === "az") {
    return list.length === 1 ? list[0] : `${list.slice(0, -1).join(", ")} və ${list.at(-1)}`;
  }
  return list.length === 1 ? list[0] : `${list.slice(0, -1).join(", ")} and ${list.at(-1)}`;
}

function detailLine(product: Product, locale: Locale): string | null {
  const bits: string[] = [];
  const materials = materialsLine(product, locale);
  if (materials) bits.push(materials);
  if (product.dimensions.trim()) bits.push(product.dimensions.trim());
  if (bits.length === 0) return null;
  return bits.join(locale === "az" ? ". " : ". ") + ".";
}

function timeLine(product: Product, locale: Locale): string | null {
  if (product.productionDays === null) return null;
  const d = product.productionDays;
  if (locale === "az") {
    return d === 1 ? "Bir günə toxunur." : `Toxunması təxminən ${d} gün çəkir.`;
  }
  return d === 1 ? "It takes a day to weave." : `It takes about ${d} days to weave.`;
}

function availabilityLine(product: Product, locale: Locale): string {
  if (product.stockStatus === "sold_out") {
    return locale === "az"
      ? product.madeToOrder
        ? "Bu dənə satılıb, amma bənzərini sifarişlə toxuya bilərik."
        : "Bu dənə satılıb."
      : product.madeToOrder
        ? "This one has sold, but we can weave another like it to order."
        : "This one has sold.";
  }
  if (product.stockStatus === "made_to_order" || product.madeToOrder) {
    return locale === "az"
      ? "Sifarişlə hazırlanır. Yazın, tarixi razılaşdıraq."
      : "Made to order. Send a message and we will agree a date.";
  }
  return locale === "az" ? "Hazırdır və göndərilə bilər." : "Ready now.";
}

function priceLine(product: Product, locale: Locale): string {
  if (product.priceOnRequest || product.price === null) {
    return locale === "az"
      ? "Qiymət üçün yazın."
      : "Send a message for the price.";
  }
  return locale === "az" ? `${product.price} AZN.` : `${product.price} AZN.`;
}

/** A clearly marked gap for the family to fill in themselves. */
function gap(text: { en: string; az: string }, locale: Locale): string {
  return `[${locale === "az" ? text.az : text.en}]`;
}

export function buildCaptionStarter({ product, goal, tone, locale }: StarterInput): string {
  const az = locale === "az";
  const name = az ? product.name.az || product.name.en : product.name.en;
  const story = az ? product.story.az || product.story.en : product.story.en;
  const description = az
    ? product.description.az || product.description.en
    : product.description.en;

  const lines: string[] = [];

  /* ---------------------------------------------------------- opening */
  switch (goal) {
    case "introduce":
      lines.push(
        tone === "simple"
          ? az
            ? `${name}.`
            : `${name}.`
          : tone === "informative"
            ? az
              ? `${name}, dəzgahdan təzə çıxıb.`
              : `${name}, new off the loom.`
            : az
              ? `Bu həftə dəzgahdan çıxan iş: ${name}.`
              : `Off the loom this week: ${name}.`,
      );
      break;

    case "story":
      if (story.trim()) {
        lines.push(storyOpening(story, tone === "simple" ? 1 : 3));
      } else {
        lines.push(
          gap(
            {
              en: "Add the story behind this piece: who taught you, or what the pattern means",
              az: "Bu işin arxasındakı hekayəni əlavə edin: sizə kim öyrədib və ya naxış nə deməkdir",
            },
            locale,
          ),
        );
      }
      break;

    case "availability":
      lines.push(
        product.stockStatus === "sold_out"
          ? az
            ? `${name} satılıb.`
            : `${name} has sold.`
          : az
            ? `${name} indi mövcuddur.`
            : `${name} is available now.`,
      );
      break;

    case "process":
      lines.push(
        az
          ? `Dəzgahda: ${name}.`
          : `On the loom: ${name}.`,
      );
      lines.push(
        gap(
          {
            en: "Say what stage it is at, or what is difficult about this part",
            az: "Hansı mərhələdə olduğunu və ya bu hissənin nəyi çətin olduğunu yazın",
          },
          locale,
        ),
      );
      break;
  }

  /* ------------------------------------------------------------ middle */
  if (goal !== "story" && story.trim() && tone !== "simple") {
    // The artisan's own words, never paraphrased.
    lines.push(storyOpening(story, tone === "story" ? 3 : 2));
  } else if (goal !== "story" && !story.trim() && description.trim()) {
    lines.push(description.trim());
  }

  if (goal === "story" && description.trim() && tone !== "simple") {
    lines.push(description.trim());
  }

  /* ------------------------------------------------------------ details */
  const details = detailLine(product, locale);
  const time = timeLine(product, locale);

  if (tone === "informative") {
    const factual = [details, time].filter(Boolean).join(" ");
    if (factual) lines.push(factual);
    lines.push(priceLine(product, locale));
  } else if (tone === "simple") {
    if (details) lines.push(details);
    lines.push(priceLine(product, locale));
  } else {
    const factual = [details, time].filter(Boolean).join(" ");
    if (factual) lines.push(factual);
  }

  /* ------------------------------------------------------------ closing */
  if (goal === "availability" || tone === "warm") {
    lines.push(availabilityLine(product, locale));
  }

  if (goal === "process") {
    lines.push(
      az
        ? "Hazır olanda burada paylaşacağıq."
        : "We will show it here when it is finished.",
    );
  }

  return lines.filter(Boolean).join("\n\n");
}

/**
 * Hashtags built from the product's own category and materials, not from a
 * trending list, and never more than the family would write themselves.
 */
export function buildHashtags(product: Product): string[] {
  const tags = new Set<string>(["handwoven"]);

  const byCategory: Record<Product["category"], string> = {
    home_textiles: "hometextiles",
    cushions: "cushioncover",
    wall_pieces: "wallhanging",
    small_gifts: "handmadegift",
    accessories: "handmadeaccessory",
  };
  tags.add(byCategory[product.category]);

  for (const material of product.materials.slice(0, 2)) {
    const slug = material.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 20);
    if (slug.length > 3) tags.add(slug);
  }

  return Array.from(tags).slice(0, 6);
}

/** True when the caption still has unfilled [prompts] in it. */
export function hasUnfilledPrompts(caption: string): boolean {
  return /\[[^\]]+\]/.test(caption);
}

/**
 * Words LoomLock will not put in a caption on the family's behalf. Shown as a
 * gentle reminder in the Studio, never as a block. If the artisan genuinely
 * talks that way, that is their call.
 */
export const OVERCLAIM_WORDS = [
  "luxury",
  "luxurious",
  "exclusive",
  "masterpiece",
  "priceless",
  "world-class",
  "authentic ancient",
  "lüks",
  "eksklüziv",
  "şah əsər",
];

export function findOverclaims(caption: string): string[] {
  const lower = caption.toLowerCase();
  return OVERCLAIM_WORDS.filter((word) => lower.includes(word));
}
