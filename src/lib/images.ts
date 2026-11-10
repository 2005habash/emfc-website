import { PHONE_SLICES, SIZED } from "@/data/sized-images";

/**
 * What an <img> needs to download the right copy of a picture: spread it into the tag. `sizes` says
 * how wide the picture is shown, as in the HTML attribute ("100vw", "(min-width: 768px) 220px, 150px").
 * tools/size-images.py makes the copies and lists them; a picture it hasn't seen (an upload from the
 * admin page, a photo added since it last ran) simply shows its original.
 */
export function sized(
  src: string,
  sizes: string,
): { src: string; srcSet?: string; sizes?: string } {
  const widths = SIZED[src];
  if (!widths) return { src };
  const stem = `/images/sized${src.slice("/images".length).replace(/\.\w+$/, "")}`;
  return { src, srcSet: widths.map((w) => `${stem}-${w}.webp ${w}w`).join(", "), sizes };
}

/** The slice of a wide photo made for phones (tools/size-images.py), if it has one. */
export const phoneSlice = (src: string): string | undefined => PHONE_SLICES[src];
