import { useState } from "react";
import { Em } from "@/components/site/ui";
import { eur, pct } from "./format";
import { Aside, Headline, Lever, ToyShell } from "./parts";

type Inputs = { cash: number; growth: number; wacc: number; terminal: number };

/** A five-year DCF with a perpetuity growth terminal value. */
function dcf({ cash, growth, wacc, terminal }: Inputs) {
  const w = wacc / 100;
  const g = terminal / 100;
  let flow = cash;
  let forecast = 0;
  for (let t = 1; t <= 5; t++) {
    if (t > 1) flow *= 1 + growth / 100;
    forecast += flow / (1 + w) ** t;
  }
  const terminalValue = (flow * (1 + g)) / (w - g) / (1 + w) ** 5;
  const value = forecast + terminalValue;
  return { forecast, terminalValue, value, share: terminalValue / value };
}

function verdict(share: number) {
  if (share >= 0.8)
    return "Most of this value lives beyond year five. Defend that terminal growth.";
  if (share >= 0.6) return "A typical DCF: the years you can't forecast carry most of the value.";
  return "Unusually grounded: most of the value comes from the years you forecast.";
}

/** The Equity Research desk's toy: value a company in four levers, and see where the value sits. */
export function Dcf() {
  const [inputs, setInputs] = useState<Inputs>({ cash: 100, growth: 8, wacc: 9, terminal: 2 });
  const set = (key: keyof Inputs) => (v: number) => setInputs((s) => ({ ...s, [key]: v }));
  const r = dcf(inputs);
  const higher = dcf({ ...inputs, wacc: inputs.wacc + 1 });

  return (
    <ToyShell
      id="dcf"
      title={
        <>
          What&apos;s it <Em>worth?</Em>
        </>
      }
      intro="A DCF in four levers: cash flow, growth, the discount rate and the growth that lasts forever. Most of the answer usually hides in the last one."
      levers={
        <>
          <Lever
            label="Free cash flow next year"
            value={inputs.cash}
            min={10}
            max={200}
            step={5}
            display={eur(inputs.cash)}
            onChange={set("cash")}
          />
          <Lever
            label="Growth, years 2 to 5"
            value={inputs.growth}
            min={0}
            max={25}
            step={1}
            display={`${inputs.growth}% a year`}
            onChange={set("growth")}
          />
          <Lever
            label="Discount rate (WACC)"
            value={inputs.wacc}
            min={6}
            max={14}
            step={0.5}
            display={`${inputs.wacc.toFixed(1)}%`}
            onChange={set("wacc")}
          />
          <Lever
            label="Growth after year 5, forever"
            value={inputs.terminal}
            min={0}
            max={4}
            step={0.25}
            display={`${inputs.terminal.toFixed(2)}% a year`}
            onChange={set("terminal")}
          />
        </>
      }
      note="Assumptions: five years of forecast, then a terminal value growing at a constant rate forever, all discounted at the WACC. Simplified on purpose."
    >
      <Headline
        stats={[
          { label: "Enterprise value", value: eur(r.value) },
          { label: "From the terminal value", value: pct(r.share, 0) },
        ]}
        verdict={verdict(r.share)}
      />

      {/* The value split between the forecast years and everything after them. */}
      <div className="flex flex-col gap-3">
        <span className="caps text-[10px] tracking-[0.2em] text-haze">Where the value sits</span>
        <div className="flex h-9 w-full overflow-hidden">
          <span
            className="flex items-center bg-white px-3 text-[12px] font-medium text-deep transition-all duration-300"
            style={{ width: `${(1 - r.share) * 100}%` }}
          >
            {r.share < 0.88 && "Years 1 to 5"}
          </span>
          <span
            className="flex items-center justify-end bg-bull-light px-3 text-[12px] font-medium text-deep transition-all duration-300"
            style={{ width: `${r.share * 100}%` }}
          >
            After year 5
          </span>
        </div>
        <div className="flex justify-between font-mono text-[12px] tabular-nums text-mist">
          <span>{eur(r.forecast)}</span>
          <span>{eur(r.terminalValue)}</span>
        </div>
      </div>

      <Aside>
        That is {(r.value / inputs.cash).toFixed(1)} times next year&apos;s cash flow. Raise the
        discount rate by one point and the value falls{" "}
        {((1 - higher.value / r.value) * 100).toFixed(0)}%, to {eur(higher.value)}.
      </Aside>
    </ToyShell>
  );
}
