// Shareable images made in the browser (a quiz result's desk card, a Superday letter, a framed
// photo): drawn on a canvas in the site's fonts and colours, then shared or downloaded. Nothing is
// uploaded anywhere.

import { toast } from "@/lib/toast";

export const INK = {
  night: "#000b3d",
  deep: "#02082a",
  paper: "#faf8f4",
  ink: "#141b34",
  mute: "#555c72",
  bull: "#5a67a2",
  bullLight: "#9ca8d4",
  mist: "#c9cedd",
  line: "#ddd6c9",
};

export const SERIF = '"Cormorant Garamond", Georgia, serif';
export const SANS = "Geist, system-ui, sans-serif";

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draws on a fresh canvas once the site's fonts are ready, and returns it as a PNG. */
export async function drawCard(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void | Promise<void>,
) {
  await Promise.all([
    document.fonts.load(`500 96px ${SERIF}`),
    document.fonts.load(`italic 400 96px ${SERIF}`),
    document.fonts.load(`500 32px ${SANS}`),
  ]).catch(() => {});
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  await draw(ctx);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No image"))), "image/png"),
  );
}

/** Text with letter spacing, the way the site sets its small capitals. */
export function spaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
) {
  const chars = [...text];
  const total =
    chars.reduce((w, c) => w + ctx.measureText(c).width, 0) +
    spacing * Math.max(0, chars.length - 1);
  let at = ctx.textAlign === "center" ? x - total / 2 : ctx.textAlign === "right" ? x - total : x;
  const align = ctx.textAlign;
  ctx.textAlign = "left";
  for (const c of chars) {
    ctx.fillText(c, at, y);
    at += ctx.measureText(c).width + spacing;
  }
  ctx.textAlign = align;
}

/** Wraps text into lines that fit; returns the y below the last line. */
export function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else line = test;
  }
  if (line) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

/** The phone's share sheet with the image where it can take files, a download everywhere else. */
export async function shareImage(blob: Blob, filename: string, text: string) {
  const file = new File([blob], filename, { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return;
    }
  } catch {
    // Closed the share sheet: fall through to nothing.
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast("Saved", { description: `${filename} is in your downloads.` });
}
