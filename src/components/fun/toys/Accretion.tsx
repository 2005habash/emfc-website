import { useState } from "react";
import { Em } from "@/components/site/ui";
import { eur, signedPct } from "./format";
import { Aside, Headline, Lever, ShareResult, ToyShell } from "./parts";

// The buyer earns €100m on 100m shares (EPS €1.00); the target earns €40m. Cash is borrowed.
const BUYER_EARNINGS = 100;
const BUYER_SHARES = 100;
const TARGET_EARNINGS = 40;
const DEBT_COST = 0.04; // after tax

type Inputs = { buyerPe: number; targetPe: number; stock: number; synergies: number };

/** Pro forma earnings per share after the deal, against the buyer's €1.00 today. */
function deal({ buyerPe, targetPe, stock, synergies }: Inputs) {
  const sharePrice = buyerPe * (BUYER_EARNINGS / BUYER_SHARES);
  const price = targetPe * TARGET_EARNINGS;
  const newShares = ((stock / 100) * price) / sharePrice;
  const interest = (1 - stock / 100) * price * DEBT_COST;
  const shares = BUYER_SHARES + newShares;
  const earnings = BUYER_EARNINGS + TARGET_EARNINGS + synergies - interest;
  const eps = earnings / shares;
  const before = BUYER_EARNINGS / BUYER_SHARES;
  // Synergies a year that would bring EPS back to where it was.
  const breakeven = Math.max(0, before * shares - (BUYER_EARNINGS + TARGET_EARNINGS - interest));
  return { price, eps, before, change: eps / before - 1, breakeven };
}

function verdict(change: number) {
  if (change >= 0.05) return "Strongly accretive. The board wants to announce on Monday.";
  if (change >= 0.005) return "Accretive. Shareholders will like the maths.";
  if (change > -0.005) return "Roughly neutral. The deal has to stand on its strategy.";
  if (change > -0.05) return "Dilutive. Time to sharpen the synergy story.";
  return "Badly dilutive. The analysts will have questions.";
}

/** The M&A desk's toy: is the deal accretive or dilutive to the buyer's earnings per share? */
export function Accretion() {
  const [inputs, setInputs] = useState<Inputs>({
    buyerPe: 18,
    targetPe: 22,
    stock: 50,
    synergies: 0,
  });
  const set = (key: keyof Inputs) => (v: number) => setInputs((s) => ({ ...s, [key]: v }));
  const r = deal(inputs);
  const earningsYield = 1 / inputs.targetPe;

  return (
    <ToyShell
      id="accretion"
      title={
        <>
          Accretive or <Em>dilutive?</Em>
        </>
      }
      intro="The first question about any deal: does the buyer's earnings per share go up or down? Set the prices and the mix of cash and shares, and find out before the analysts do."
      levers={
        <>
          <Lever
            label="Buyer's P/E"
            value={inputs.buyerPe}
            min={10}
            max={30}
            step={1}
            display={`${inputs.buyerPe}x`}
            onChange={set("buyerPe")}
          />
          <Lever
            label="Price paid, as a P/E"
            value={inputs.targetPe}
            min={8}
            max={30}
            step={1}
            display={`${inputs.targetPe}x, ${eur(r.price)}`}
            onChange={set("targetPe")}
          />
          <Lever
            label="Paid in shares"
            value={inputs.stock}
            min={0}
            max={100}
            step={10}
            display={`${inputs.stock}%, the rest in cash`}
            onChange={set("stock")}
          />
          <Lever
            label="Synergies a year"
            value={inputs.synergies}
            min={0}
            max={20}
            step={1}
            display={`${eur(inputs.synergies)} after tax`}
            onChange={set("synergies")}
          />
        </>
      }
      note="Assumptions: the buyer earns €100m on 100m shares, the target earns €40m, and the cash is borrowed at 4% after tax. Simplified on purpose."
    >
      <Headline
        stats={[
          { label: "Change in EPS", value: signedPct(r.change) },
          { label: "EPS after the deal", value: `€${r.eps.toFixed(2)}` },
        ]}
        verdict={verdict(r.change)}
      />
      <ul className="flex flex-col gap-4 text-[14px]/[1.6] text-mist">
        <li className="flex gap-3">
          <Mark ok={inputs.buyerPe > inputs.targetPe} />
          <span>
            <span className="text-white">The shares:</span> paying in shares adds to EPS when the
            buyer&apos;s P/E is higher than the P/E it pays ({inputs.buyerPe}x against{" "}
            {inputs.targetPe}x).
          </span>
        </li>
        <li className="flex gap-3">
          <Mark ok={earningsYield > 0.04} />
          <span>
            <span className="text-white">The cash:</span> borrowing adds to EPS when the
            target&apos;s earnings yield, one over its P/E ({(earningsYield * 100).toFixed(1)}%),
            beats the 4% the debt costs.
          </span>
        </li>
      </ul>
      {r.change < 0 && (
        <Aside>
          {eur(Math.ceil(r.breakeven))} of synergies a year would make this deal break even.
        </Aside>
      )}
      <div>
        <ShareResult
          text={`My deal on EMFC's site came out ${signedPct(r.change)} on EPS. Accretive or dilutive, can you do better?`}
          path="/departments/investment-banking/m-and-a#accretion"
        />
      </div>
    </ToyShell>
  );
}

function Mark({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        ok
          ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bull-light text-[11px] font-semibold text-deep"
          : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/30 text-[11px] text-haze"
      }
    >
      <span aria-hidden>{ok ? "✓" : "✕"}</span>
      <span className="sr-only">{ok ? "Adds to EPS" : "Takes from EPS"}</span>
    </span>
  );
}
