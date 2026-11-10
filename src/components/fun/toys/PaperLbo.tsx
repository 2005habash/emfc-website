import { useState } from "react";
import { Em } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { eurM as eur } from "./format";
import { Aside, Headline, Lever, ShareResult, ToyShell } from "./parts";

const EBITDA = 100; // €m at entry
const YEARS = 5;
const PAYDOWN = 0.4; // share of each year's EBITDA left to repay debt, after interest, tax, capex and working capital

type Inputs = { entry: number; leverage: number; growth: number; exit: number };

/** A five-year buyout with simple, stated assumptions: the arithmetic of a paper LBO. */
function lbo({ entry, leverage, growth, exit }: Inputs) {
  const entryEv = entry * EBITDA;
  const debt0 = leverage * EBITDA;
  const equity0 = entryEv - debt0;
  let debt = debt0;
  let cash = 0;
  let ebitda = EBITDA;
  for (let year = 1; year <= YEARS; year++) {
    ebitda *= 1 + growth / 100;
    const free = PAYDOWN * ebitda;
    const repaid = Math.min(debt, free);
    debt -= repaid;
    cash += free - repaid;
  }
  const exitEv = exit * ebitda;
  const equity5 = Math.max(0, exitEv - debt + cash);
  const mom = equity5 / equity0;
  const irr = mom > 0 ? Math.pow(mom, 1 / YEARS) - 1 : -1;
  // Where the gain came from: the three levers every PE interview asks about.
  const bridge = {
    growth: (ebitda - EBITDA) * entry,
    multiple: (exit - entry) * ebitda,
    deleverage: debt0 - debt + cash,
  };
  return { entryEv, debt0, equity0, ebitda, exitEv, debt, cash, equity5, mom, irr, bridge };
}

function verdict(irr: number, mom: number) {
  if (mom < 1) return "You lost money. The LPs would like a word.";
  if (irr < 0.08) return "Below the 8% hurdle. No carry this time.";
  if (irr < 0.15) return "Above the hurdle, but the committee wants a better entry price.";
  if (irr < 0.2) return "Respectable. Just short of the classic 20% target.";
  if (irr < 0.25) return "Cleared 20%. The investment committee says yes.";
  return "Top quartile. Your LPs want to know your secret.";
}

/** The Private Equity desk's toy: move four levers and watch a buyout's returns change. */
export function PaperLbo() {
  const [inputs, setInputs] = useState<Inputs>({ entry: 10, leverage: 5, growth: 6, exit: 10 });
  const set = (key: keyof Inputs) => (v: number) =>
    setInputs((s) => {
      const next = { ...s, [key]: v };
      // Keep at least one turn of EBITDA as equity.
      next.leverage = Math.min(next.leverage, next.entry - 1);
      return next;
    });
  const r = lbo(inputs);
  const gains = r.bridge.growth + r.bridge.multiple + r.bridge.deleverage;
  const multipleHeavy = gains > 0 && r.bridge.multiple / gains > 0.5;
  const irr = r.mom > 0 ? `${(r.irr * 100).toFixed(1)}%` : "-100%";

  return (
    <ToyShell
      id="paper-lbo"
      title={
        <>
          Run a paper <Em>LBO</Em>
        </>
      }
      intro="PE interviews often ask for a paper LBO: a buyout's returns, worked out in minutes with a pen. Pull the four levers and see what your fund makes. Can you clear 20%?"
      levers={
        <>
          <Lever
            label="Entry multiple"
            value={inputs.entry}
            min={6}
            max={14}
            step={0.5}
            display={`${inputs.entry.toFixed(1)}x EBITDA`}
            onChange={set("entry")}
          />
          <Lever
            label="Debt at entry"
            value={inputs.leverage}
            min={1}
            max={Math.min(7, inputs.entry - 1)}
            step={0.5}
            display={`${inputs.leverage.toFixed(1)}x EBITDA`}
            onChange={set("leverage")}
          />
          <Lever
            label="EBITDA growth"
            value={inputs.growth}
            min={0}
            max={15}
            step={1}
            display={`${inputs.growth}% a year`}
            onChange={set("growth")}
          />
          <Lever
            label="Exit multiple"
            value={inputs.exit}
            min={6}
            max={14}
            step={0.5}
            display={`${inputs.exit.toFixed(1)}x EBITDA`}
            onChange={set("exit")}
          />
        </>
      }
      note="Assumptions: EBITDA of €100m at entry, a five-year hold, 40% of each year's EBITDA left to repay debt, no fees. Simplified on purpose."
    >
      <Headline
        stats={[
          { label: "IRR", value: irr },
          { label: "Money multiple", value: `${r.mom.toFixed(2)}x` },
        ]}
        verdict={verdict(r.irr, r.mom)}
      />

      <Bridge equity0={r.equity0} equity5={r.equity5} bridge={r.bridge} />
      {multipleHeavy && (
        <Aside className="-mt-3">
          Careful: most of this return comes from selling at a higher multiple, the one lever you
          don&apos;t control. Interviewers will ask.
        </Aside>
      )}

      <table className="w-full font-mono text-[12.5px] md:text-[13px]">
        <thead>
          <tr className="text-left text-haze">
            <th className="pb-2 font-normal uppercase tracking-[0.08em]">€m</th>
            <th className="pb-2 text-right font-normal uppercase tracking-[0.08em]">Entry</th>
            <th className="pb-2 text-right font-normal uppercase tracking-[0.08em]">Year 5</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {(
            [
              ["EBITDA", EBITDA, r.ebitda],
              ["Enterprise value", r.entryEv, r.exitEv],
              ["Net debt", r.debt0, r.debt - r.cash],
              ["Equity", r.equity0, r.equity5],
            ] as const
          ).map(([label, a, b]) => (
            <tr key={label} className="border-t border-white/10">
              <td className="py-2 text-mist">{label}</td>
              <td className="py-2 text-right">{eur(a)}</td>
              <td className="py-2 text-right">{eur(b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="-mt-2 flex flex-col gap-5">
        <p className="text-[12px] text-haze">
          Rule of thumb: 2.0x in five years is about 15% a year, 3.0x is about 25%.
        </p>
        <ShareResult
          text={`I made a ${irr} IRR on EMFC's paper LBO. Can you beat it?`}
          path="/arcade#paper-lbo"
        />
      </div>
    </ToyShell>
  );
}

/** Where the equity gain came from, as a small waterfall: equity in, the three levers, equity out. */
function Bridge({
  equity0,
  equity5,
  bridge,
}: {
  equity0: number;
  equity5: number;
  bridge: { growth: number; multiple: number; deleverage: number };
}) {
  const steps = [
    { label: "Equity in", from: 0, to: equity0, total: true },
    { label: "EBITDA growth", from: equity0, to: equity0 + bridge.growth },
    {
      label: "Multiple",
      from: equity0 + bridge.growth,
      to: equity0 + bridge.growth + bridge.multiple,
    },
    { label: "Debt paydown", from: equity0 + bridge.growth + bridge.multiple, to: equity5 },
    { label: "Equity out", from: 0, to: equity5, total: true },
  ];
  const lo = Math.min(0, ...steps.map((s) => Math.min(s.from, s.to)));
  const hi = Math.max(...steps.map((s) => Math.max(s.from, s.to)), 1);
  const at = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <div className="flex flex-col gap-2.5">
      <span className="caps text-[10px] tracking-[0.2em] text-haze">Where the money came from</span>
      {steps.map((s) => {
        const left = at(Math.min(s.from, s.to));
        const width = Math.max(0.6, at(Math.max(s.from, s.to)) - left);
        const change = s.to - s.from;
        return (
          <div
            key={s.label}
            className="grid grid-cols-[112px_minmax(0,1fr)_64px] items-center gap-3 text-[13px] md:grid-cols-[128px_minmax(0,1fr)_72px]"
          >
            <span className="text-mist">{s.label}</span>
            <span className="relative h-5">
              <span
                className={cn(
                  "absolute inset-y-0 transition-all duration-300",
                  s.total ? "bg-white" : change >= 0 ? "bg-bull-light" : "bg-haze/40",
                )}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            </span>
            <span className="text-right font-mono tabular-nums text-mist">
              {s.total ? eur(s.to) : `${change >= 0 ? "+" : "-"}${eur(Math.abs(change))}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
