import { useState } from "react";
import { Em } from "@/components/site/ui";
import { Aside, Headline, Lever, ToyShell } from "./parts";

type Inputs = { coupon: number; years: number; yieldPct: number };

/** Price per 100 of face value, with annual coupons. */
function price(coupon: number, years: number, y: number) {
  let p = 0;
  for (let t = 1; t <= years; t++) p += coupon / (1 + y) ** t;
  return p + 100 / (1 + y) ** years;
}

/** Modified duration: the % price change for a one point move in the yield. */
function duration(coupon: number, years: number, y: number) {
  let weighted = 0;
  for (let t = 1; t <= years; t++) weighted += (t * coupon) / (1 + y) ** t;
  weighted += (years * 100) / (1 + y) ** years;
  return weighted / price(coupon, years, y) / (1 + y);
}

function verdict(p: number) {
  if (Math.abs(p - 100) < 0.05) return "At par: the coupon pays exactly what the market asks.";
  if (p < 100) return "Below par: the market wants more than your coupon pays.";
  return "Above par: your coupon pays more than the market asks.";
}

const W = 520;
const H = 220;
const MAX_YIELD = 10;

/** The Rates desk's toy: move the yield and watch the price, and see why long bonds move most. */
export function BondYield() {
  const [inputs, setInputs] = useState<Inputs>({ coupon: 3, years: 10, yieldPct: 4 });
  const set = (key: keyof Inputs) => (v: number) => setInputs((s) => ({ ...s, [key]: v }));
  const { coupon, years, yieldPct } = inputs;
  const y = yieldPct / 100;
  const p = price(coupon, years, y);
  const up = price(coupon, years, y + 0.01);
  const down = price(coupon, years, Math.max(0, y - 0.01));

  // The price against the yield, from 0% to 10%, on one fixed scale, so a longer bond's curve
  // visibly steepens. Prices above 220 (long, high-coupon bonds at near-zero yields) run off the top.
  const top = 220;
  const at = (yp: number, pr: number) =>
    [(yp / MAX_YIELD) * W, Math.max(-12, H - (pr / top) * H)] as const;
  const curve = Array.from({ length: 41 }, (_, i) => {
    const yp = (i / 40) * MAX_YIELD;
    const [x, py] = at(yp, price(coupon, years, yp / 100));
    return `${i ? "L" : "M"}${x.toFixed(1)},${py.toFixed(1)}`;
  }).join(" ");
  const [dotX, dotY] = at(yieldPct, p);
  const parY = at(0, 100)[1];

  return (
    <ToyShell
      id="bond-yield"
      title={
        <>
          Move the <Em>yield</Em>
        </>
      }
      intro="When yields rise, bond prices fall, and the longer the bond, the harder it falls. Set a bond, move the market's yield and watch the price."
      levers={
        <>
          <Lever
            label="Coupon"
            value={coupon}
            min={0}
            max={8}
            step={0.25}
            display={`${coupon.toFixed(2)}% a year`}
            onChange={set("coupon")}
          />
          <Lever
            label="Years to maturity"
            value={years}
            min={1}
            max={30}
            step={1}
            display={`${years} ${years === 1 ? "year" : "years"}`}
            onChange={set("years")}
          />
          <Lever
            label="Market yield"
            value={yieldPct}
            min={0}
            max={MAX_YIELD}
            step={0.25}
            display={`${yieldPct.toFixed(2)}%`}
            onChange={set("yieldPct")}
          />
        </>
      }
      note="Assumptions: a plain bond paying its coupon once a year and 100 at maturity, priced per 100 of face value."
    >
      <Headline
        stats={[
          { label: "Price", value: p.toFixed(1) },
          { label: "Duration", value: duration(coupon, years, y).toFixed(1) },
        ]}
        verdict={verdict(p)}
      />

      <figure className="flex flex-col gap-2">
        <svg
          viewBox={`-8 -12 ${W + 16} ${H + 24}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Price against yield; at ${yieldPct.toFixed(2)}% the price is ${p.toFixed(1)}`}
        >
          <line
            x1="0"
            x2={W}
            y1={parY}
            y2={parY}
            className="stroke-white/25"
            strokeDasharray="4 5"
          />
          <text x={W} y={parY - 8} textAnchor="end" className="fill-haze font-mono text-[12px]">
            Par, 100
          </text>
          <path d={curve} fill="none" strokeWidth="2.5" className="stroke-bull-light" />
          <line x1={dotX} x2={dotX} y1={dotY} y2={H} className="stroke-white/20" />
          <circle cx={dotX} cy={dotY} r="7" className="fill-white" />
        </svg>
        <figcaption className="flex justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-haze">
          <span>Yield 0%</span>
          <span>{MAX_YIELD}%</span>
        </figcaption>
      </figure>

      <Aside>
        If yields rise one point, the price falls to {up.toFixed(1)} (
        {(((up - p) / p) * 100).toFixed(1)}%).
        {y >= 0.01 && (
          <>
            {" "}
            If they fall one point, it rises to {down.toFixed(1)} (+
            {(((down - p) / p) * 100).toFixed(1)}%). It gains more than it loses: that is convexity.
          </>
        )}
      </Aside>
    </ToyShell>
  );
}
