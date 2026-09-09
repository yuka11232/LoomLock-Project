import type { MotifName, PaletteName, ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Placeholder product imagery.
 *
 * LoomLock ships no photographs of real handmade work, so demo products use a
 * drawn woven swatch instead. These are honest placeholders: the product form
 * calls them placeholders, and the label below the picture says so wherever a
 * family member could mistake one for a real photograph.
 *
 * Each swatch is deterministic — the same motif and palette always draw the
 * same picture — so a product looks the same on every screen and after a reload.
 */

interface Palette {
  ground: string;
  thread: string;
  accent: string;
}

const PALETTES: Record<PaletteName, Palette> = {
  pomegranate: { ground: "#8a2233", thread: "#ecdcc4", accent: "#c9a227" },
  indigo: { ground: "#364a6e", thread: "#e4ddd0", accent: "#9fb0c9" },
  clay: { ground: "#a85d43", thread: "#f1e5d5", accent: "#dcb589" },
  gold: { ground: "#b0812c", thread: "#f6efdd", accent: "#6f5119" },
  sage: { ground: "#4f6b52", thread: "#e9e6d5", accent: "#a8bda2" },
};

/** Motif geometry, drawn inside a 40×40 tile. */
function MotifTile({ motif, palette }: { motif: MotifName; palette: Palette }) {
  switch (motif) {
    case "buta":
      // The teardrop with a curled tip, the shape most recognisable from
      // Azerbaijani carpets. Drawn plainly, not stylised.
      return (
        <>
          <path
            d="M20 8c6 0 10 4.5 10 10.5S25 32 20 32s-10-5.5-10-13.5C10 12.5 14 8 20 8Z"
            fill="none"
            stroke={palette.thread}
            strokeWidth="2"
          />
          <path
            d="M20 8c3-3 7-3 8-1"
            fill="none"
            stroke={palette.thread}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="20" cy="20" r="3.5" fill={palette.accent} />
        </>
      );

    case "pomegranate":
      return (
        <>
          <circle cx="20" cy="22" r="9" fill="none" stroke={palette.thread} strokeWidth="2" />
          <path
            d="M20 13v-4M17 10l3-3 3 3"
            fill="none"
            stroke={palette.thread}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="22" r="3" fill={palette.accent} />
        </>
      );

    case "lattice":
      return (
        <>
          <path
            d="M0 20 20 0l20 20-20 20Z"
            fill="none"
            stroke={palette.thread}
            strokeWidth="1.5"
          />
          <path d="M10 20 20 10l10 10-10 10Z" fill={palette.accent} opacity="0.55" />
        </>
      );

    case "medallion":
      // A stepped diamond — the beginner's pattern from the demo story.
      return (
        <>
          <path
            d="M20 6 26 12 32 20 26 28 20 34 14 28 8 20 14 12Z"
            fill="none"
            stroke={palette.thread}
            strokeWidth="2"
          />
          <path d="M20 13 27 20 20 27 13 20Z" fill={palette.accent} opacity="0.7" />
        </>
      );

    case "stripe":
    default:
      return (
        <>
          <rect x="0" y="8" width="40" height="3" fill={palette.thread} opacity="0.85" />
          <rect x="0" y="18" width="40" height="5" fill={palette.accent} opacity="0.8" />
          <rect x="0" y="29" width="40" height="3" fill={palette.thread} opacity="0.85" />
        </>
      );
  }
}

export function TextileSwatch({
  motif = "stripe",
  palette = "pomegranate",
  className,
  title,
}: {
  motif?: MotifName;
  palette?: PaletteName;
  className?: string;
  /** Accessible name. Omit when a caption already describes the image. */
  title?: string;
}) {
  const colors = PALETTES[palette] ?? PALETTES.pomegranate;
  const id = `${motif}-${palette}`;

  return (
    <svg
      viewBox="0 0 240 240"
      preserveAspectRatio="xMidYMid slice"
      className={cn("size-full", className)}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <pattern id={`motif-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <MotifTile motif={motif} palette={colors} />
        </pattern>
        {/* The weft: fine horizontal threads laid over everything. */}
        <pattern id={`weft-${id}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="none" />
          <rect width="4" height="1" fill="#000" opacity="0.06" />
          <rect width="1" height="4" fill="#fff" opacity="0.05" />
        </pattern>
      </defs>

      <rect width="240" height="240" fill={colors.ground} />
      <rect width="240" height="240" fill={`url(#motif-${id})`} />
      {/* Woven border, the way a flat-woven piece is finished at the edges. */}
      <rect
        x="8"
        y="8"
        width="224"
        height="224"
        fill="none"
        stroke={colors.thread}
        strokeWidth="2"
        opacity="0.5"
      />
      <rect width="240" height="240" fill={`url(#weft-${id})`} />
    </svg>
  );
}

/**
 * Renders whichever kind of image a product has: a real uploaded photograph, or
 * a drawn placeholder swatch.
 */
export function ProductImageView({
  image,
  alt,
  className,
}: {
  image: ProductImage | undefined;
  alt: string;
  className?: string;
}) {
  if (!image) {
    return (
      <div
        className={cn(
          "flex size-full items-center justify-center bg-linen weave-ground",
          className,
        )}
        aria-hidden
      />
    );
  }

  if (image.kind === "upload" && image.dataUrl) {
    return (
      // A data URL from the visitor's own file picker; next/image would add a
      // loader for no benefit here.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image.dataUrl} alt={alt} className={cn("size-full object-cover", className)} />
    );
  }

  return (
    <TextileSwatch
      motif={image.motif}
      palette={image.palette}
      title={alt || undefined}
      className={className}
    />
  );
}

export const MOTIF_NAMES: MotifName[] = ["buta", "pomegranate", "lattice", "medallion", "stripe"];
export const PALETTE_NAMES: PaletteName[] = ["pomegranate", "indigo", "clay", "gold", "sage"];
