import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// The toys on emfc.es/zaid: a rain of little Zaid faces, a hype meter that goes to 11, and typing
// Z A I D anywhere (the Miata game is in MiataRun.tsx). People who ask for reduced motion get the words
// without the shaking and falling.

const PORTRAIT = "/images/zaid/portrait.webp";
/** Where his face sits in the portrait (813 x 884), for the round stickers. */
const FACE = { x: 205, y: 75, size: 345 };

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Starts a shower of Zaids. `from` is where they burst out of, in page pixels (default: the bottom). */
export function rain(count = 30, from?: { x: number; y: number }) {
  window.dispatchEvent(new CustomEvent("zaid-rain", { detail: { count, from } }));
}

type Drop = { x: number; y: number; vx: number; vy: number; gravity: number; maxFall: number; spin: number; angle: number; size: number };

/** A full-screen layer that draws the falling faces. Mount it once on the page. */
export function ZaidRain() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const sticker = document.createElement("canvas");
    const img = new Image();
    let ready = false;
    img.onload = () => {
      sticker.width = sticker.height = 128;
      const s = sticker.getContext("2d")!;
      s.beginPath();
      s.arc(64, 64, 60, 0, Math.PI * 2);
      s.closePath();
      s.fillStyle = "#ffffff";
      s.fill();
      s.save();
      s.clip();
      s.drawImage(img, FACE.x, FACE.y, FACE.size, FACE.size, 4, 4, 120, 120);
      s.restore();
      s.lineWidth = 5;
      s.strokeStyle = "#9ca8d4";
      s.stroke();
      ready = true;
    };
    img.src = PORTRAIT;

    let drops: Drop[] = [];
    let frame = 0;
    const resize = () => {
      c.width = window.innerWidth * devicePixelRatio;
      c.height = window.innerHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const d of drops) {
        d.vy = Math.min(d.vy + d.gravity, d.maxFall);
        d.vx *= 0.995;
        d.x += d.vx;
        d.y += d.vy;
        d.angle += d.spin;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle);
        ctx.drawImage(sticker, -d.size / 2, -d.size / 2, d.size, d.size);
        ctx.restore();
      }
      drops = drops.filter((d) => d.y < window.innerHeight + 120);
      frame = drops.length ? requestAnimationFrame(tick) : 0;
    };

    const onRain = (e: Event) => {
      if (!ready || reducedMotion()) return;
      const { count, from } = (e as CustomEvent<{ count: number; from?: { x: number; y: number } }>).detail;
      const w = window.innerWidth;
      for (let i = 0; i < count; i++) {
        const burst = Boolean(from);
        drops.push({
          x: from ? from.x : Math.random() * w,
          y: from ? from.y : -80 - Math.random() * 400,
          vx: burst ? (Math.random() - 0.5) * 16 : (Math.random() - 0.5) * 2,
          vy: burst ? -8 - Math.random() * 12 : 1 + Math.random() * 2,
          // A burst flies up and drops fast; a storm drifts down over a few seconds.
          gravity: burst ? 0.32 : 0.06,
          maxFall: burst ? 30 : 3 + Math.random() * 4,
          spin: (Math.random() - 0.5) * 0.25,
          angle: Math.random() * Math.PI,
          size: 44 + Math.random() * 46,
        });
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener("zaid-rain", onRain);
    return () => {
      window.removeEventListener("zaid-rain", onRain);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />;
}

/** Typing Z, A, I, D anywhere on the page (outside a text field) starts a storm. */
export function useZaidKeys(onZaid: () => void) {
  useEffect(() => {
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea, [contenteditable]")) return;
      typed = (typed + e.key.toLowerCase()).slice(-4);
      if (typed === "zaid") {
        typed = "";
        onZaid();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onZaid]);
}

const HYPE = [
  "",
  "1. Mild appreciation. A polite nod.",
  "2. A firm handshake.",
  "3. Warm applause.",
  "4. Standing ovation.",
  "5. The headings have started glowing. That's normal.",
  "6. Strangers are hugging.",
  "7. The words are wobbling with emotion.",
  "8. Barcelona has declared a public holiday.",
  "9. The background can't contain itself.",
  "10. Scientists advise against going further.",
  "11. MAXIMUM ZAID.",
];

/** A slider from 1 to 11. Each level makes the page more intense; 11 is a full Zaid event. */
export function HypeMeter({ level, onChange }: { level: number; onChange: (n: number) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-6">
      <label htmlFor="hype" className="sr-only">
        Hype level, from 1 to 11
      </label>
      <input
        id="hype"
        type="range"
        min={1}
        max={11}
        step={1}
        value={level}
        onChange={(e) => onChange(Number(e.target.value))}
        className="hype-range w-full"
        style={{ ["--fill" as string]: `${((level - 1) / 10) * 100}%` }}
      />
      <div className="flex w-full justify-between font-serif text-[18px] italic text-mute">
        <span>Calm</span>
        <span className={cn(level === 11 && "text-bull")}>11</span>
      </div>
      <p className="min-h-[2.6em] text-center font-serif text-[28px]/[1.25] italic text-bull md:text-[36px]/[1.2]" aria-live="polite">
        {HYPE[level]}
      </p>
    </div>
  );
}

/** The styles the toys need, kept with them. */
export const FUN_CSS = `
@keyframes respect { 0% { transform: scale(1) } 40% { transform: scale(1.12) rotate(-2deg) } 100% { transform: scale(1) } }
.hype-range { -webkit-appearance: none; appearance: none; height: 14px; border-radius: 9999px;
  background: linear-gradient(90deg, var(--c-bull) var(--fill), var(--c-line) var(--fill)); cursor: pointer; }
.hype-range::-webkit-slider-thumb { -webkit-appearance: none; width: 34px; height: 34px; border-radius: 9999px; background: var(--c-night);
  border: 4px solid var(--c-bull-light); box-shadow: 0 6px 18px rgb(0 0 0 / 0.25); }
.hype-range::-moz-range-thumb { width: 28px; height: 28px; border-radius: 9999px; background: var(--c-night); border: 4px solid var(--c-bull-light); }
@keyframes wobble { 0%, 100% { transform: rotate(-1.2deg) } 50% { transform: rotate(1.2deg) } }
@keyframes shake { 0%, 100% { transform: translate(0) } 25% { transform: translate(-6px, 3px) } 50% { transform: translate(5px, -4px) } 75% { transform: translate(-3px, 5px) } }
@keyframes party { 0% { background-color: var(--c-paper) } 50% { background-color: #e6e9f6 } 100% { background-color: var(--c-paper) } }
@keyframes maximum { 0% { opacity: 0; transform: scale(0.3) rotate(-8deg) } 20% { opacity: 1; transform: scale(1.1) rotate(2deg) } 80% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(1.6) } }
@media (prefers-reduced-motion: no-preference) {
  .hype-5 h2 em, .hype-5 h1 em { text-shadow: 0 0 24px rgb(156 168 212 / 0.9); }
  .hype-7 h2 { animation: wobble 0.6s ease-in-out infinite; }
  .hype-9 { animation: party 0.8s ease-in-out infinite; }
  .hype-11 { animation: shake 0.25s linear 8, party 0.4s ease-in-out infinite; }
}
`;
