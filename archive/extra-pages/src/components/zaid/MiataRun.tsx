import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { rain } from "@/components/zaid/ZaidFun";

// Miata Run: a small driving game on emfc.es/zaid. Drive the red 1991 Miata down a three-lane road,
// dodge em dashes, cones, potholes and rogue "VP" signs, and collect coffee and term sheets. The
// score is the valuation. Arrow keys or A and D steer; on a phone, tap either side of the road.

const W = 360;
const H = 600;
const ROAD = { left: 40, right: 320 };
const LANES = [0, 1, 2].map((i) => ROAD.left + ((ROAD.right - ROAD.left) / 3) * (i + 0.5));
const CAR = { w: 44, h: 78, y: H - 120 };
const BEST_KEY = "emfc-miata-best";

type Kind = "dash" | "cone" | "pothole" | "vp" | "coffee" | "sheet";
type Thing = { kind: Kind; lane: number; y: number; h: number };
const HAZARDS: Kind[] = ["dash", "dash", "cone", "pothole", "vp"];

const CRASHES: Record<Kind, string> = {
  dash: "Hit by an em dash. The house style claims another victim.",
  cone: "A traffic cone. Barcelona's most loyal resident.",
  pothole: "A pothole. The Miata will need a moment.",
  vp: "You hit a \"VP\" sign. It's Vice-President, written out.",
  coffee: "",
  sheet: "",
};

const money = (m: number) => (m >= 1000 ? `€${(m / 1000).toFixed(2)}bn` : `€${m.toFixed(1)}m`);
const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCar(ctx: CanvasRenderingContext2D, x: number, lightsUp: boolean, tilt: number) {
  ctx.save();
  ctx.translate(x, CAR.y + CAR.h / 2);
  ctx.rotate(tilt);
  const { w, h } = CAR;
  // shadow
  ctx.fillStyle = "rgb(0 0 0 / 0.25)";
  roundRect(ctx, -w / 2 + 3, -h / 2 + 5, w, h, 12);
  ctx.fill();
  // body
  ctx.fillStyle = "#d7262e";
  roundRect(ctx, -w / 2, -h / 2, w, h, 12);
  ctx.fill();
  // pop-up headlights: flat when down, raised pods with light when up
  ctx.fillStyle = lightsUp ? "#2a2a2a" : "#b81f26";
  roundRect(ctx, -w / 2 + 5, -h / 2 + 6, 12, lightsUp ? 9 : 6, 2);
  ctx.fill();
  roundRect(ctx, w / 2 - 17, -h / 2 + 6, 12, lightsUp ? 9 : 6, 2);
  ctx.fill();
  if (lightsUp) {
    const beam = ctx.createLinearGradient(0, -h / 2, 0, -h / 2 - 110);
    beam.addColorStop(0, "rgb(255 246 200 / 0.55)");
    beam.addColorStop(1, "rgb(255 246 200 / 0)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 6, -h / 2 + 6);
    ctx.lineTo(w / 2 - 6, -h / 2 + 6);
    ctx.lineTo(w / 2 + 18, -h / 2 - 110);
    ctx.lineTo(-w / 2 - 18, -h / 2 - 110);
    ctx.closePath();
    ctx.fill();
  }
  // windscreen, open roof, seats
  ctx.fillStyle = "#1c2230";
  roundRect(ctx, -w / 2 + 6, -h / 2 + 24, w - 12, 12, 4);
  ctx.fill();
  ctx.fillStyle = "#3a1416";
  roundRect(ctx, -w / 2 + 7, -h / 2 + 38, w - 14, 22, 5);
  ctx.fill();
  ctx.fillStyle = "#14161c";
  roundRect(ctx, -w / 2 + 9, -h / 2 + 41, 11, 14, 3);
  ctx.fill();
  roundRect(ctx, w / 2 - 20, -h / 2 + 41, 11, 14, 3);
  ctx.fill();
  // tail lights
  ctx.fillStyle = "#ff8a3d";
  ctx.fillRect(-w / 2 + 4, h / 2 - 5, 9, 3);
  ctx.fillRect(w / 2 - 13, h / 2 - 5, 9, 3);
  ctx.restore();
}

function drawThing(ctx: CanvasRenderingContext2D, t: Thing) {
  const x = LANES[t.lane];
  const y = t.y;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  switch (t.kind) {
    case "dash":
      // An em dash, drawn rather than typed: a long, heavy horizontal bar.
      ctx.fillStyle = "#141b34";
      roundRect(ctx, x - 38, y - 7, 76, 14, 3);
      ctx.fill();
      ctx.fillStyle = "#9ca8d4";
      ctx.font = "600 9px Geist, system-ui, sans-serif";
      ctx.fillText("EM DASH", x, y + 18);
      break;
    case "cone":
      ctx.fillStyle = "#ff7a1a";
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x + 15, y + 16);
      ctx.lineTo(x - 15, y + 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - 9, y, 18, 5);
      break;
    case "pothole":
      ctx.fillStyle = "#2f3138";
      ctx.beginPath();
      ctx.ellipse(x, y, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1d1f24";
      ctx.beginPath();
      ctx.ellipse(x + 3, y + 2, 17, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "vp":
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, x - 22, y - 18, 44, 36, 5);
      ctx.fill();
      ctx.strokeStyle = "#d7262e";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "#d7262e";
      ctx.font = "700 17px Geist, system-ui, sans-serif";
      ctx.fillText("VP", x, y + 1);
      break;
    case "coffee":
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, x - 12, y - 12, 24, 26, 4);
      ctx.fill();
      ctx.fillStyle = "#6b3f22";
      ctx.fillRect(x - 10, y - 9, 20, 6);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + 14, y + 2, 5, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      break;
    case "sheet":
      ctx.fillStyle = "#fffdf5";
      ctx.fillRect(x - 13, y - 17, 26, 34);
      ctx.fillStyle = "#5a67a2";
      for (let i = 0; i < 4; i++) ctx.fillRect(x - 9, y - 11 + i * 6, i === 3 ? 10 : 18, 2);
      ctx.font = "700 8px Geist, system-ui, sans-serif";
      ctx.fillText("TERM", x, y + 12);
      break;
  }
  ctx.restore();
}

/** The game window. Opens over the page; Escape or the close button leaves. */
export function MiataRun({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"ready" | "playing" | "over">("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [crash, setCrash] = useState("");
  const steer = useRef<(dir: -1 | 1) => void>(() => {});
  const lights = useRef<() => void>(() => {});

  useEffect(() => {
    if (open) {
      setBest(readBest());
      setPhase("ready");
    }
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "playing") return;
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let lane = 1;
    let x = LANES[1];
    let speed = 4;
    let distance = 0;
    let bonus = 0;
    let lightsUp = false;
    let things: Thing[] = [];
    let nextRow = 160;
    let stripe = 0;
    let frame = 0;
    let last = performance.now();
    let alive = true;

    steer.current = (dir) => {
      lane = Math.max(0, Math.min(2, lane + dir));
    };
    lights.current = () => {
      lightsUp = !lightsUp;
    };

    const valuation = () => distance / 400 + bonus;

    const spawnRow = () => {
      const free = Math.floor(Math.random() * 3);
      const row: Thing[] = [];
      for (let l = 0; l < 3; l++) {
        if (l === free) {
          if (Math.random() < 0.35) row.push({ kind: Math.random() < 0.7 ? "coffee" : "sheet", lane: l, y: -40, h: 28 });
        } else if (Math.random() < 0.55 + Math.min(0.3, distance / 40000)) {
          row.push({ kind: HAZARDS[Math.floor(Math.random() * HAZARDS.length)], lane: l, y: -40, h: 30 });
        }
      }
      if (!row.some((t) => !["coffee", "sheet"].includes(t.kind))) {
        const l = (free + 1 + Math.floor(Math.random() * 2)) % 3;
        row.push({ kind: HAZARDS[Math.floor(Math.random() * HAZARDS.length)], lane: l, y: -40, h: 30 });
      }
      things.push(...row);
    };

    const draw = () => {
      // verge and road
      ctx.fillStyle = "#6f8f4e";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#e6d7b8";
      ctx.fillRect(ROAD.left - 10, 0, 10, H);
      ctx.fillRect(ROAD.right, 0, 10, H);
      ctx.fillStyle = "#3b3f47";
      ctx.fillRect(ROAD.left, 0, ROAD.right - ROAD.left, H);
      // palm-ish trees passing by
      for (let i = 0; i < 5; i++) {
        const ty = ((i * 150 + stripe * 2) % (H + 120)) - 60;
        for (const tx of [16, W - 16]) {
          ctx.fillStyle = "#4f6d36";
          ctx.beginPath();
          ctx.arc(tx, ty, 13, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // lane stripes
      ctx.fillStyle = "#f2f0e8";
      const laneW = (ROAD.right - ROAD.left) / 3;
      for (let l = 1; l < 3; l++) {
        for (let y = (stripe % 60) - 60; y < H; y += 60) ctx.fillRect(ROAD.left + laneW * l - 2, y, 4, 32);
      }
      for (const t of things) drawThing(ctx, t);
      const tilt = (LANES[lane] - x) * -0.006;
      drawCar(ctx, x, lightsUp, tilt);
      // valuation
      ctx.fillStyle = "rgb(0 11 61 / 0.78)";
      roundRect(ctx, 12, 12, 168, 44, 8);
      ctx.fill();
      ctx.fillStyle = "#9ca8d4";
      ctx.font = "600 9px Geist, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("VALUATION", 24, 28);
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 18px Geist, system-ui, sans-serif";
      ctx.fillText(money(valuation()), 24, 47);
    };

    const loop = (now: number) => {
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      speed = Math.min(14, 4 + distance / 2500);
      const step = speed * dt;
      distance += step;
      stripe += step;
      x += (LANES[lane] - x) * Math.min(1, 0.25 * dt);
      nextRow -= step;
      if (nextRow <= 0) {
        spawnRow();
        nextRow = Math.max(120, 230 - distance / 120);
      }
      for (const t of things) t.y += step;
      things = things.filter((t) => t.y < H + 60);

      const carTop = CAR.y + 6;
      const carBottom = CAR.y + CAR.h - 6;
      for (const t of things) {
        const tx = LANES[t.lane];
        const hit = Math.abs(tx - x) < CAR.w / 2 + 10 && t.y + t.h / 2 > carTop && t.y - t.h / 2 < carBottom;
        if (!hit) continue;
        if (t.kind === "coffee" || t.kind === "sheet") {
          bonus += t.kind === "sheet" ? 5 : 1;
          t.y = H + 100;
          if (t.kind === "sheet") rain(6, { x: c.getBoundingClientRect().left + (tx / W) * c.clientWidth, y: c.getBoundingClientRect().top + (CAR.y / H) * c.clientHeight });
        } else {
          alive = false;
          const final = valuation();
          setScore(final);
          setCrash(CRASHES[t.kind]);
          if (final > readBest()) {
            try {
              localStorage.setItem(BEST_KEY, String(final));
            } catch {
              // Not remembered, still impressive.
            }
            setBest(final);
            if (final > 5) rain(40);
          }
          setPhase("over");
        }
      }
      draw();
      if (alive) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) {
        e.preventDefault();
        steer.current(-1);
      } else if (["ArrowRight", "d", "D"].includes(e.key)) {
        e.preventDefault();
        steer.current(1);
      } else if (["l", "L", " "].includes(e.key)) {
        e.preventDefault();
        lights.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, phase]);

  const tap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "playing") return;
    const r = e.currentTarget.getBoundingClientRect();
    steer.current(e.clientX - r.left < r.width / 2 ? -1 : 1);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[min(96vw,460px)] max-w-none gap-4 rounded-none border-line bg-night p-4 text-white sm:rounded-none">
        <div className="flex items-baseline justify-between gap-3 pr-8">
          <DialogTitle className="font-serif text-[28px] font-medium italic">Miata Run</DialogTitle>
          <span className="caps text-[10px] tracking-[0.2em] text-bull-light">Best {money(best)}</span>
        </div>
        <DialogDescription className="sr-only">
          A driving game. Steer the Miata between three lanes with the arrow keys or by tapping either side of the road.
          Avoid em dashes, cones, potholes and VP signs; collect coffee and term sheets.
        </DialogDescription>
        <div className="relative">
          <canvas
            ref={canvas}
            width={W}
            height={H}
            onPointerDown={tap}
            className="block aspect-[3/5] max-h-[72vh] w-full touch-none bg-[#3b3f47]"
          />
          {phase !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-night/85 p-6 text-center">
              {phase === "ready" ? (
                <>
                  <p className="font-serif text-[40px]/[1] italic">Miata Run</p>
                  <ul className="flex flex-col gap-1.5 text-[14px]/[1.5] text-[#C9CEDD]">
                    <li>Dodge em dashes, cones, potholes and VP signs.</li>
                    <li>Coffee adds €1m. Term sheets add €5m.</li>
                    <li>Arrow keys, or tap the left or right of the road.</li>
                    <li>L flips the pop-up headlights. Purely for style.</li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="caps text-[10.5px] tracking-[0.24em] text-bull-light">Exit valuation</p>
                  <p className="font-serif text-[56px]/none">{money(score)}</p>
                  <p className="max-w-[300px] text-[15px]/[1.5] text-[#C9CEDD]">{crash}</p>
                  {score >= best && score > 0 && <p className="font-serif text-[22px] italic text-bull-light">New record. Zaid would be proud.</p>}
                </>
              )}
              <button type="button" className="btn bg-white text-night hover:bg-bull-light" onClick={() => setPhase("playing")} autoFocus>
                {phase === "ready" ? "Start the engine" : "Drive again"}
              </button>
            </div>
          )}
        </div>
        {phase === "playing" && (
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            <button type="button" className="btn btn-sm btn-outline-white" onPointerDown={() => steer.current(-1)}>
              Left
            </button>
            <button type="button" className="btn btn-sm btn-outline-white" onPointerDown={() => steer.current(1)}>
              Right
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
