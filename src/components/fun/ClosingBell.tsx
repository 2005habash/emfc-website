import { ArrowDown, ArrowUp, BellRing, Minus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { markPlayed } from "./career";
import { ShareResult } from "./toys/parts";
import { useHashTarget } from "./useHashTarget";

// "Closing bell" in the Arcade: sixty seconds of a made-up stock, Tapas Tech, moved by made-up
// headlines. Go long, go short or stay flat; the score is the profit on a €1 million position, after
// a small fee for every trade. Nothing here is a real company or real news.

const SECONDS = 60;
const TICK_MS = 250;
const TICKS = (SECONDS * 1000) / TICK_MS;
const SIZE = 1_000_000;
const FEE = 250;
/** Price noise per tick: about 4% either way over a whole game. */
const NOISE = 0.0025;

/** A headline and how it moves the price, in percent a second, for a few seconds after it lands. */
type News = { text: string; drift: number };

const NEWS: News[] = [
  { text: "Tapas Tech beats earnings by a mile", drift: 0.9 },
  { text: "Activist fund discloses a 5% stake", drift: 0.6 },
  { text: "Analyst upgrades Tapas Tech to Buy", drift: 0.45 },
  { text: "Takeover rumours: a US giant is circling", drift: 1 },
  { text: "Tapas Tech wins a large government contract", drift: 0.55 },
  { text: "Croquetas division posts a record quarter", drift: 0.5 },
  { text: "ECB cuts rates by a quarter point", drift: 0.4 },
  { text: "€500 million share buyback announced", drift: 0.5 },
  { text: "CEO resigns in a LinkedIn post", drift: -0.9 },
  { text: "Short seller publishes a 90-page report", drift: -1 },
  { text: "Full-year guidance cut", drift: -0.7 },
  { text: "Auditor asks for more time", drift: -0.8 },
  { text: "ECB surprises with a rate hike", drift: -0.45 },
  { text: "Biggest client signs with a competitor", drift: -0.6 },
  { text: "Warehouse flooded, again", drift: -0.4 },
  { text: "Rights issue priced at a steep discount", drift: -0.6 },
  { text: "Analyst says the stock could go up or down", drift: 0 },
  { text: "CEO spotted at Camp Nou", drift: 0 },
  { text: "Company changes the font in its logo", drift: 0 },
  { text: "Intern replies all to 4,000 people", drift: 0 },
  { text: "Board approves a new coffee machine", drift: 0 },
];

type Position = -1 | 0 | 1;

type Sim = {
  prices: number[];
  position: Position;
  pnl: number;
  trades: number;
  headlines: { at: number; text: string }[];
  effects: { from: number; to: number; drift: number }[];
  nextNewsAt: number;
  deck: News[];
};

const gaussian = () => {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const euros = (n: number) => {
  const s = `€${Math.abs(Math.round(n)).toLocaleString("en-GB")}`;
  return n < -0.5 ? `(${s})` : s;
};

const clock = (ticks: number) => {
  const left = Math.max(0, Math.ceil(SECONDS - (ticks * TICK_MS) / 1000));
  return `0:${String(left).padStart(2, "0")}`;
};

function verdict(pnl: number) {
  if (pnl >= 50_000) return "Trader of the year. The desk wants to know your secret.";
  if (pnl >= 15_000) return "A green day. Drinks are on you.";
  if (pnl >= 0) return "Up, just. Nobody will mention it at the morning meeting.";
  if (pnl >= -20_000) return "A red day. Risk would like a quiet word.";
  return "Margin call. Please hand in your badge at reception.";
}

const W = 600;
const H = 220;

/** The price so far, the opening price as a dashed line, and a tick for each headline. */
function Chart({ sim }: { sim: Sim }) {
  const { prices, headlines } = sim;
  const lo = Math.min(...prices, 100);
  const hi = Math.max(...prices, 100);
  const pad = Math.max((hi - lo) * 0.15, 0.6);
  const y = (p: number) => H - ((p - (lo - pad)) / (hi - lo + 2 * pad)) * H;
  const x = (i: number) => (i / TICKS) * W;
  const points = prices.map((p, i) => `${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  const last = prices.length - 1;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Tapas Tech's price so far"
    >
      <line
        x1={0}
        x2={W}
        y1={y(100)}
        y2={y(100)}
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeDasharray="4 6"
      />
      {headlines.map((h) => (
        <line
          key={h.at}
          x1={x(h.at)}
          x2={x(h.at)}
          y1={0}
          y2={H}
          stroke="currentColor"
          strokeOpacity={0.12}
        />
      ))}
      <polyline
        points={points}
        fill="none"
        stroke="var(--c-bull-light)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <circle cx={x(last)} cy={y(prices[last])} r={5} fill="var(--c-bull-light)" />
    </svg>
  );
}

/** "Closing bell" in the Arcade: a minute of trading on made-up headlines. */
export function ClosingBell() {
  useHashTarget("closing-bell");
  const sim = useRef<Sim | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const panel = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"ready" | "running" | "done">("ready");
  const [, setFrame] = useState(0);

  const finish = useCallback(() => {
    clearInterval(timer.current);
    const s = sim.current;
    if (s && s.position !== 0) {
      // The bell closes every position.
      s.position = 0;
    }
    setPhase("done");
    markPlayed("closing-bell");
  }, []);

  const step = useCallback(() => {
    const s = sim.current;
    if (!s) return;
    const t = s.prices.length;
    if (t > TICKS) {
      finish();
      return;
    }
    if (t >= s.nextNewsAt && s.deck.length) {
      const n = s.deck.shift()!;
      s.headlines.unshift({ at: t, text: n.text });
      // The market takes a second to read it, then moves for three to five seconds.
      const from = t + 4;
      if (n.drift)
        s.effects.push({ from, to: from + 12 + Math.floor(Math.random() * 8), drift: n.drift });
      s.nextNewsAt = t + 28 + Math.floor(Math.random() * 12);
    }
    const drift = s.effects.reduce((a, e) => (t >= e.from && t < e.to ? a + e.drift : a), 0);
    const p0 = s.prices[t - 1];
    const p1 = p0 * Math.exp(drift / 100 / (1000 / TICK_MS) + NOISE * gaussian());
    s.prices.push(p1);
    s.pnl += s.position * SIZE * (p1 / p0 - 1);
    setFrame((f) => f + 1);
  }, [finish]);

  const start = () => {
    sim.current = {
      prices: [100],
      position: 0,
      pnl: 0,
      trades: 0,
      headlines: [],
      effects: [],
      nextNewsAt: 10,
      deck: [...NEWS].sort(() => Math.random() - 0.5),
    };
    setPhase("running");
    clearInterval(timer.current);
    timer.current = setInterval(step, TICK_MS);
    // On a phone the desk sits below the introduction: bring all of it into view.
    requestAnimationFrame(() =>
      panel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
    );
  };

  useEffect(() => () => clearInterval(timer.current), []);

  const trade = useCallback((next: Position) => {
    const s = sim.current;
    if (!s || s.position === next) return;
    s.position = next;
    s.trades += 1;
    s.pnl -= FEE;
    setFrame((f) => f + 1);
  }, []);

  // Keys while the clock runs: up to buy, down to sell, F to go flat.
  useEffect(() => {
    if (phase !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const next = ({ ArrowUp: 1, ArrowDown: -1, f: 0, F: 0 } as Record<string, Position>)[e.key];
      if (next === undefined) return;
      e.preventDefault();
      trade(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, trade]);

  const s = sim.current;
  const price = s ? s.prices[s.prices.length - 1] : 100;
  const change = price / 100 - 1;

  return (
    <section id="closing-bell" className="scroll-mt-24 bg-night text-white">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Eyebrow tone="light">Sixty seconds on the desk</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Closing <Em light>bell</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mist md:text-base/[1.7]">
            One stock, one minute, a €1 million position. Headlines land, the price moves a second
            later. Buy, sell or stay flat, and be in the green when the bell rings.
          </p>
          <ul className="flex flex-col gap-1.5 text-[13.5px]/[1.6] text-haze">
            <li>Every trade costs €{FEE}. Your broker thanks you.</li>
            <li>Not every headline is news.</li>
            <li className="hidden md:block">Keys: up to buy, down to sell, F to go flat.</li>
          </ul>
        </div>

        <div
          ref={panel}
          className="flex scroll-mt-24 flex-col gap-5 border border-white/20 p-5 md:p-7 lg:col-span-7 lg:col-start-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[0.1em]">
            <span className="flex items-baseline gap-3">
              <span className="text-haze">Tapas Tech</span>
              <span className="text-[18px] tabular-nums text-white">{price.toFixed(2)}</span>
              <span className={cn("tabular-nums", change >= 0 ? "text-bull-light" : "text-haze")}>
                {change >= 0 ? "+" : "−"}
                {Math.abs(change * 100).toFixed(2)}%
              </span>
            </span>
            <span className="tabular-nums text-haze">
              {phase === "done" ? "Closed" : clock(s ? s.prices.length - 1 : 0)}
            </span>
          </div>

          {s ? (
            <Chart sim={s} />
          ) : (
            <div className="flex aspect-[600/220] w-full items-center justify-center border border-dashed border-white/15 text-[14px] text-haze">
              The market opens when you do.
            </div>
          )}

          <div aria-live="polite" className="min-h-[52px] border-t border-white/15 pt-3">
            {s?.headlines.slice(0, 2).map((h, i) => (
              <p
                key={h.at}
                className={cn(
                  "flex gap-3 text-[15px]/[1.5]",
                  i === 0 ? "animate-fade-up text-white [animation-duration:0.3s]" : "text-haze",
                )}
              >
                <span className="font-mono text-[12px] tabular-nums text-bull-light">
                  {clock(h.at)}
                </span>
                {h.text}
              </p>
            ))}
          </div>

          {phase === "done" && s ? (
            <div className="flex animate-fade-up flex-col gap-5 border-t border-white/15 pt-5 [animation-duration:0.5s]">
              <span className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-bull-light">
                <BellRing className="h-4 w-4" strokeWidth={1.75} />
                The bell. {s.trades} {s.trades === 1 ? "trade" : "trades"}, {euros(s.trades * FEE)}{" "}
                in fees
              </span>
              <p className="font-serif text-[56px]/none tabular-nums md:text-[72px]/none">
                <span className={s.pnl >= 0 ? "text-bull-light" : "text-haze"}>{euros(s.pnl)}</span>
              </p>
              <p className="font-serif text-[28px]/[1.15] md:text-[34px]/[1.12]">
                {verdict(s.pnl)}
              </p>
              <div className="flex flex-wrap gap-3">
                <ShareResult
                  text={
                    s.pnl >= 0
                      ? `I made ${euros(s.pnl)} in sixty seconds on EMFC's Closing bell. Beat that.`
                      : `I lost ${euros(-s.pnl)} in sixty seconds on EMFC's Closing bell. Can you do better?`
                  }
                  path="/arcade#closing-bell"
                />
                <button
                  type="button"
                  onClick={start}
                  className="btn btn-sm text-mist hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Another day
                </button>
              </div>
            </div>
          ) : phase === "running" && s ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="caps text-[10px] tracking-[0.2em] text-haze">
                  {s.position === 1 ? "Long" : s.position === -1 ? "Short" : "Flat"}, P&L
                </span>
                <span
                  className={cn(
                    "font-mono text-[22px] tabular-nums md:text-[26px]",
                    s.pnl >= 0 ? "text-bull-light" : "text-haze",
                  )}
                >
                  {euros(s.pnl)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { to: 1, label: "Buy", Icon: ArrowUp },
                    { to: 0, label: "Flat", Icon: Minus },
                    { to: -1, label: "Sell", Icon: ArrowDown },
                  ] as const
                ).map(({ to, label, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => trade(to)}
                    aria-pressed={s.position === to}
                    className={cn(
                      "flex h-16 items-center justify-center gap-2 border font-serif text-[24px] transition-colors",
                      s.position === to
                        ? "border-bull-light bg-bull-light text-deep"
                        : "border-white/25 hover:border-bull-light hover:bg-white/[0.06]",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button type="button" onClick={start} className="btn btn-white self-start">
              <BellRing className="h-4 w-4" strokeWidth={1.75} />
              Open the market
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
