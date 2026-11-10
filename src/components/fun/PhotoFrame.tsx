import { Download, ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { departments } from "@/lib/departments";
import { IMAGES } from "@/lib/site";
import { cn } from "@/lib/utils";
import { markPlayed } from "./career";
import { INK, loadImage, SANS, shareImage } from "./cards";
import { useHashTarget } from "./useHashTarget";

const SIZE = 1024;
const RING = 96;

const LABELS = [
  "ESADE MASTER'S FINANCE CLUB",
  ...departments.filter((d) => d.desks.length > 0).map((d) => `EMFC ${d.name.toUpperCase()}`),
];

/** Writes text along the bottom of a circle, left to right, the way profile frames do. */
function arcText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.font = `600 44px ${SANS}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const spacing = 0.025;
  const widths = [...text].map((c) => ctx.measureText(c).width / r + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  // Centred on the bottom of the circle, reading left to right.
  let angle = Math.PI / 2 + total / 2;
  [...text].forEach((c, i) => {
    const w = widths[i] - spacing;
    angle -= w / 2;
    ctx.save();
    ctx.translate(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    ctx.rotate(angle - Math.PI / 2);
    ctx.fillText(c, 0, 0);
    ctx.restore();
    angle -= w / 2 + spacing;
  });
  ctx.restore();
}

async function drawFrame(
  canvas: HTMLCanvasElement,
  photo: HTMLImageElement | null,
  label: string,
  tone: "navy" | "blue",
) {
  await document.fonts.load(`600 44px ${SANS}`).catch(() => {});
  const bull = await loadImage(IMAGES.bullMark).catch(() => null);
  const ctx = canvas.getContext("2d")!;
  const c = SIZE / 2;
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.clip();
  if (photo) {
    // Cover the circle, centred, keeping the photo's proportions.
    const scale = Math.max(SIZE / photo.width, SIZE / photo.height);
    const w = photo.width * scale;
    const h = photo.height * scale;
    ctx.drawImage(photo, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
  } else {
    ctx.fillStyle = INK.mist;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
  ctx.restore();
  // The ring, thick at the bottom where the words sit.
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.arc(c, c - RING * 0.35, c - RING, 0, Math.PI * 2, true);
  ctx.fillStyle = tone === "navy" ? INK.night : INK.bull;
  ctx.fill("evenodd");
  ctx.restore();
  arcText(ctx, label, c, c, c - RING * 0.68);
  if (bull) {
    // The bull on a badge at the top right.
    const r = 92;
    const bx = c + (c - r * 0.9) * Math.cos(-Math.PI / 4);
    const by = c + (c - r * 0.9) * Math.sin(-Math.PI / 4);
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = tone === "navy" ? INK.night : INK.bull;
    ctx.stroke();
    const bw = r * 1.4;
    ctx.drawImage(bull, bx - bw / 2, by - (bw * 510) / 560 / 2, bw, (bw * 510) / 560);
  }
}

/** "Wear the bull" in the Arcade: an EMFC frame for a LinkedIn photo, made on the device. */
export function PhotoFrame() {
  useHashTarget("frame");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [label, setLabel] = useState(LABELS[0]);
  const [tone, setTone] = useState<"navy" | "blue">("navy");

  useEffect(() => {
    if (canvas.current) void drawFrame(canvas.current, photo, label, tone);
  }, [photo, label, tone]);

  const choose = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    loadImage(url)
      .then(setPhoto)
      .finally(() => setTimeout(() => URL.revokeObjectURL(url), 1000));
  };

  const save = () => {
    canvas.current?.toBlob((blob) => {
      if (!blob) return;
      markPlayed("frame");
      void shareImage(blob, "emfc-profile-photo.png", "My new profile photo, with the EMFC bull.");
    }, "image/png");
  };

  return (
    <section id="frame" className="scroll-mt-24">
      <div className="gutter grid items-center gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow>For members</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Wear the <Em>bull</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            An EMFC frame for your LinkedIn photo. Choose a photo, pick your department, download.
            Your photo never leaves your device.
          </p>
          <label className="btn btn-ink cursor-pointer self-start">
            <ImagePlus className="h-4 w-4" strokeWidth={1.75} />
            {photo ? "Choose another photo" : "Choose a photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => choose(e.target.files?.[0])}
            />
          </label>
          <div className="flex flex-col gap-2">
            <label htmlFor="frame-label" className="caps text-[10px] tracking-[0.2em] text-mute">
              Words on the frame
            </label>
            <select
              id="frame-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-12 rounded border border-mute bg-field px-3 text-[15px] text-ink"
            >
              {LABELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2" role="group" aria-label="Frame colour">
            {(["navy", "blue"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tone === t}
                onClick={() => setTone(t)}
                className={cn(
                  "caps rounded-full border px-4 py-2 text-[10px] tracking-[0.16em]",
                  tone === t ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                )}
              >
                {t === "navy" ? "Navy" : "Bull blue"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-5 lg:col-span-6 lg:col-start-7">
          <canvas
            ref={canvas}
            width={SIZE}
            height={SIZE}
            aria-label="Your framed photo"
            className="aspect-square w-full max-w-[420px] rounded-full shadow-[0_20px_50px_rgb(0_0_0/0.18)]"
          />
          <button
            type="button"
            onClick={save}
            disabled={!photo}
            className="btn btn-sm btn-ink disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Download your photo
          </button>
        </div>
      </div>
    </section>
  );
}
