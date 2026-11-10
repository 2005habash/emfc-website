import { useState } from "react";
import { Em } from "@/components/site/ui";
import { eur } from "./format";
import { Aside, Headline, Lever, ToyShell } from "./parts";

function verdict(cap: number) {
  if (cap < 4.5) return "Prime territory: the kind of building investors queue for.";
  if (cap < 6) return "Core: a solid building in a good location.";
  if (cap < 7.5) return "Value-add: there's work to do, and money to be made.";
  return "Opportunistic: a high yield, and the risk that comes with it.";
}

/** The Real Assets desk's toy: a building is worth its rent divided by the cap rate. */
export function CapRate() {
  const [rent, setRent] = useState(5);
  const [cap, setCap] = useState(5);
  const value = rent / (cap / 100);
  const up = rent / ((cap + 0.5) / 100);
  const down = rent / ((cap - 0.5) / 100);
  // The seesaw: a higher cap rate lifts its end and sinks the value's end.
  const tilt = (cap - 6) * 4;

  return (
    <ToyShell
      id="cap-rate"
      title={
        <>
          The cap rate <Em>seesaw</Em>
        </>
      }
      intro="A building is worth its yearly rent divided by the cap rate, the yield investors accept. When cap rates go up, values go down, and a small move swings the price a lot."
      levers={
        <>
          <Lever
            label="Net rent a year"
            value={rent}
            min={1}
            max={20}
            step={0.5}
            display={eur(rent)}
            onChange={setRent}
          />
          <Lever
            label="Cap rate"
            value={cap}
            min={3}
            max={9}
            step={0.25}
            display={`${cap.toFixed(2)}%`}
            onChange={setCap}
          />
        </>
      }
      note="Assumptions: the rent is the building's net operating income, steady, with no debt. Simplified on purpose."
    >
      <Headline
        stats={[
          { label: "Value", value: eur(value) },
          { label: "Years of rent", value: `${(100 / cap).toFixed(1)}` },
        ]}
        verdict={verdict(cap)}
      />

      <svg
        viewBox="0 0 520 190"
        className="h-auto w-full"
        role="img"
        aria-label={`A seesaw: cap rate ${cap.toFixed(2)}% on one end, value ${eur(value)} on the other`}
      >
        <polygon points="260,112 226,176 294,176" className="fill-white/25" />
        <line x1="150" x2="370" y1="176" y2="176" className="stroke-white/20" />
        <g
          className="transition-transform duration-500 ease-out"
          style={{
            transform: `rotate(${tilt}deg)`,
            transformOrigin: "260px 112px",
            transformBox: "view-box",
          }}
        >
          <rect x="30" y="104" width="460" height="10" rx="2" className="fill-white" />
          <rect x="34" y="64" width="128" height="40" rx="3" className="fill-bull-light" />
          <text
            x="98"
            y="89"
            textAnchor="middle"
            className="fill-deep font-mono text-[15px] font-medium"
          >
            {cap.toFixed(2)}%
          </text>
          <rect x="358" y="64" width="128" height="40" rx="3" className="fill-white" />
          <text
            x="422"
            y="89"
            textAnchor="middle"
            className="fill-deep font-mono text-[15px] font-medium"
          >
            {eur(value)}
          </text>
        </g>
        <text
          x="98"
          y="30"
          textAnchor="middle"
          className="fill-haze font-mono text-[12px] uppercase"
        >
          Cap rate
        </text>
        <text
          x="422"
          y="30"
          textAnchor="middle"
          className="fill-haze font-mono text-[12px] uppercase"
        >
          Value
        </text>
      </svg>

      <Aside>
        Half a point up on the cap rate and the building is worth {eur(up)} (
        {(((up - value) / value) * 100).toFixed(0)}%). Half a point down and it is worth {eur(down)}{" "}
        (+{(((down - value) / value) * 100).toFixed(0)}%).
      </Aside>
    </ToyShell>
  );
}
