import { useState } from "react";
import { Em } from "@/components/site/ui";
import { eur } from "./format";
import { Aside, Headline, Lever, ShareResult, ToyShell } from "./parts";

/** Exit values the slider steps through, in €m: venture outcomes span orders of magnitude. */
const EXITS = [50, 100, 250, 500, 750, 1000, 2000, 3000, 5000, 10000];

type Inputs = { fund: number; stake: number; dilution: number; exit: number };

function verdict(multiple: number) {
  if (multiple >= 3) return "A fund-maker. The partners will name the next fund after it.";
  if (multiple >= 1) return "This one company returns the whole fund. Drinks are on the partners.";
  if (multiple >= 0.5) return "Getting there, but the fund needs another winner.";
  if (multiple >= 0.1) return "A nice outcome that won't move the fund.";
  return "A rounding error for the fund. Venture is a game of outliers.";
}

/** The VC & Growth desk's toy: can one winner return the whole fund? */
export function ReturnTheFund() {
  const [inputs, setInputs] = useState<Inputs>({ fund: 100, stake: 15, dilution: 50, exit: 5 });
  const set = (key: keyof Inputs) => (v: number) => setInputs((s) => ({ ...s, [key]: v }));
  const exitValue = EXITS[inputs.exit];
  const kept = (inputs.stake / 100) * (1 - inputs.dilution / 100);
  const proceeds = kept * exitValue;
  const multiple = proceeds / inputs.fund;
  const needed = inputs.fund / kept;

  return (
    <ToyShell
      id="return-the-fund"
      title={
        <>
          Return the <Em>fund</Em>
        </>
      }
      intro="Venture runs on a power law: one company has to pay for all the others. Set the fund, your stake and the exit, and see whether your winner returns the fund on its own."
      levers={
        <>
          <Lever
            label="Fund size"
            value={inputs.fund}
            min={50}
            max={500}
            step={25}
            display={eur(inputs.fund)}
            onChange={set("fund")}
          />
          <Lever
            label="Your stake when you invest"
            value={inputs.stake}
            min={5}
            max={30}
            step={1}
            display={`${inputs.stake}%`}
            onChange={set("stake")}
          />
          <Lever
            label="Dilution from later rounds"
            value={inputs.dilution}
            min={0}
            max={70}
            step={5}
            display={`${inputs.dilution}%`}
            onChange={set("dilution")}
          />
          <Lever
            label="Exit value"
            value={inputs.exit}
            min={0}
            max={EXITS.length - 1}
            step={1}
            display={eur(exitValue)}
            onChange={set("exit")}
          />
        </>
      }
      note="Assumptions: one investment, no follow-on money, no fees or carry. Simplified on purpose."
    >
      <Headline
        stats={[
          {
            label: "Fund returned",
            value: `${multiple < 10 ? multiple.toFixed(2) : multiple.toFixed(0)}x`,
          },
          { label: "Your proceeds", value: eur(proceeds) },
        ]}
        verdict={verdict(multiple)}
      />

      {/* The fund against what this one company pays back, on one scale. */}
      <div className="flex flex-col gap-3">
        <span className="caps text-[10px] tracking-[0.2em] text-haze">Against the fund</span>
        {[
          { label: "The fund", value: inputs.fund, className: "bg-white/25" },
          { label: "This exit", value: proceeds, className: "bg-bull-light" },
        ].map((b) => (
          <div
            key={b.label}
            className="grid grid-cols-[84px_minmax(0,1fr)_72px] items-center gap-3 text-[13px]"
          >
            <span className="text-mist">{b.label}</span>
            <span className="relative h-5">
              <span
                className={`absolute inset-y-0 left-0 transition-all duration-300 ${b.className}`}
                style={{ width: `${(b.value / Math.max(inputs.fund, proceeds)) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono tabular-nums text-mist">{eur(b.value)}</span>
          </div>
        ))}
      </div>

      <Aside>
        You keep {(kept * 100).toFixed(1)}% at exit. To return the fund on its own, this company has
        to sell for {eur(needed)}
        {needed >= 1000 ? ", unicorn territory." : "."}
      </Aside>
      <div>
        <ShareResult
          text={`My startup returned the fund ${multiple.toFixed(1)}x on EMFC's site. Venture is a power law.`}
          path="/arcade#return-the-fund"
        />
      </div>
    </ToyShell>
  );
}
