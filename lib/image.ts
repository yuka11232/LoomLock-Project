/**
 * Client-side photograph handling.
 *
 * Photos never leave the device. A file the family picks is drawn to a canvas,
 * scaled down to something a product card actually needs, and re-encoded as a
 * JPEG data URL so it can live in localStorage alongside the rest of the demo.
 *
 * The size limit matters: browsers give a page roughly 5 MB of localStorage,
 * and an untouched phone photo is several times that on its own.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Long edge in pixels after downscaling. */
const TARGET_EDGE = 900;
const QUALITY = 0.78;

export type ImageError = "type" | "size" | "decode";

export async function fileToDownscaledDataUrl(
  file: File,
): Promise<{ ok: true; dataUrl: string } | { ok: false; error: ImageError }> {
  if (!ACCEPTED_TYPES.includes(file.type)) return { ok: false, error: "type" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "size" };

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, TARGET_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return { ok: false, error: "decode" };

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    return { ok: true, dataUrl: canvas.toDataURL("image/jpeg", QUALITY) };
  } catch {
    return { ok: false, error: "decode" };
  }
}
