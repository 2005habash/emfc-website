import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IMAGES } from "@/lib/site";
import { onBullRun } from "./signals";

type Bull = { id: number; size: number; bottom: number; duration: number; delay: number };

/**
 * A herd of EMFC bulls charging across the screen: the terminal's BULL command, the Konami code and the
 * bull in the footer set it off. With reduced motion the bulls stay home and only the message shows.
 */
export function BullRun() {
  const [herd, setHerd] = useState<Bull[]>([]);

  useEffect(
    () =>
      onBullRun(() => {
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        toast("Bull run", {
          description: still
            ? "Your device asks for less motion, so the bulls stayed home. Markets are up anyway."
            : "EMFC is up. This is not investment advice.",
        });
        if (still) return;
        const base = Date.now();
        const count = window.innerWidth < 640 ? 6 : 10;
        const bulls = Array.from({ length: count }, (_, i) => ({
          id: base + i,
          size: 70 + Math.random() * 110,
          bottom: 2 + Math.random() * 30,
          duration: 2.4 + Math.random() * 1.6,
          delay: Math.random() * 1.1,
        }));
        setHerd(bulls);
        const longest = Math.max(...bulls.map((b) => b.duration + b.delay));
        setTimeout(() => setHerd((h) => (h[0]?.id === base ? [] : h)), longest * 1000 + 200);
      }),
    [],
  );

  if (!herd.length) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {herd.map((b) => (
        <div
          key={b.id}
          className="absolute left-0 [animation-fill-mode:both]"
          style={{
            bottom: `${b.bottom}vh`,
            width: b.size,
            animation: `bull-run ${b.duration}s linear ${b.delay}s both`,
          }}
        >
          <img
            src={IMAGES.bullMark}
            alt=""
            className="w-full drop-shadow-[0_10px_12px_rgb(2_8_42/0.35)]"
            style={{ animation: `gallop ${0.32 + b.size / 900}s ease-in-out infinite` }}
          />
        </div>
      ))}
    </div>
  );
}
