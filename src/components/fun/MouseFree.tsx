import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { markPlayed } from "./career";
import { ShareResult } from "./toys/parts";
import { useHashTarget } from "./useHashTarget";

// Excel on Windows, the way banks run it. Each action and its shortcut.
const SHORTCUTS: { action: string; keys: string }[] = [
  { action: "Fill down", keys: "Ctrl D" },
  { action: "Fill right", keys: "Ctrl R" },
  { action: "Paste special", keys: "Ctrl Alt V" },
  { action: "Open Format Cells", keys: "Ctrl 1" },
  { action: "Lock a reference with $ while editing a formula", keys: "F4" },
  { action: "Edit the active cell", keys: "F2" },
  { action: "AutoSum", keys: "Alt =" },
  { action: "Select the whole column", keys: "Ctrl Space" },
  { action: "Select the whole row", keys: "Shift Space" },
  { action: "Insert today's date", keys: "Ctrl ;" },
  { action: "Jump to the last used cell", keys: "Ctrl End" },
  { action: "Select a formula's direct precedents", keys: "Ctrl [" },
  { action: "Insert a new sheet", keys: "Shift F11" },
  { action: "Show formulas instead of values", keys: "Ctrl `" },
  { action: "Turn a range into a table", keys: "Ctrl T" },
  { action: "Format as a percentage", keys: "Ctrl Shift 5" },
];

const ROUNDS = 8;

function verdict(score: number) {
  if (score === ROUNDS) return "You can unplug the mouse. The MD will never know it existed.";
  if (score >= ROUNDS - 2) return "Fast hands. Your models will be done before the coffee.";
  if (score >= ROUNDS / 2) return "Getting there. Tape over the mouse for a week.";
  return "The mouse is a crutch. Time to let go.";
}

function makeRounds() {
  return [...SHORTCUTS]
    .sort(() => Math.random() - 0.5)
    .slice(0, ROUNDS)
    .map((s) => {
      const wrong = SHORTCUTS.filter((x) => x.keys !== s.keys)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((x) => x.keys);
      return { ...s, options: [s.keys, ...wrong].sort(() => Math.random() - 0.5) };
    });
}

/** Keys drawn as keycaps. */
function Keys({ keys, className }: { keys: string; className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {keys.split(" ").map((k, i) => (
        <kbd
          key={i}
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-[5px] border border-current/30 border-b-[3px] px-2.5 font-mono text-[14px]"
        >
          {k}
        </kbd>
      ))}
    </span>
  );
}

/** "Mouse-free" on the Off the clock page: name the Excel shortcut every analyst uses. */
export function MouseFree() {
  useHashTarget("mouse-free");
  const [seed, setSeed] = useState(0);
  const [rounds, setRounds] = useState<ReturnType<typeof makeRounds> | null>(null);
  useEffect(() => setRounds(makeRounds()), [seed]);
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const done = rounds !== null && at >= rounds.length;

  const choose = (keys: string) => {
    if (!rounds || pick) return;
    setPick(keys);
    if (keys === rounds[at].keys) setScore((s) => s + 1);
  };
  const next = () => {
    setPick(null);
    if (rounds && at + 1 >= rounds.length) markPlayed("mouse-free");
    setAt((a) => a + 1);
  };

  return (
    <section id="mouse-free" className="scroll-mt-24 bg-night text-white">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow tone="light">Excel on Windows</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Mouse-<Em light>free</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mist md:text-base/[1.7]">
            On a deal team, the mouse is optional and the shortcuts are not. Eight actions every
            analyst does a hundred times a day: name the keys.
          </p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
          {!rounds ? null : done ? (
            <div className="flex animate-fade-up flex-col gap-6 border border-white/20 p-6 [animation-duration:0.5s] md:p-9">
              <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-bull-light">
                {score} of {rounds.length}
              </span>
              <p className="font-serif text-[40px]/[1.05] md:text-[52px]/[1.02]">
                {verdict(score)}
              </p>
              <div className="flex flex-wrap gap-3">
                <ShareResult
                  text={`I knew ${score} of ${rounds.length} Excel shortcuts on EMFC's Mouse-free. Can you go mouse-free?`}
                  path="/play#mouse-free"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSeed((s) => s + 1);
                    setAt(0);
                    setScore(0);
                    setPick(null);
                  }}
                  className="btn btn-sm text-mist hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Again
                </button>
              </div>
            </div>
          ) : (
            <div
              key={`${seed}-${at}`}
              className="flex animate-fade-up flex-col gap-6 [animation-duration:0.35s]"
            >
              <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.1em] text-haze">
                <span>
                  {at + 1} of {rounds.length}
                </span>
                <span>Score {score}</span>
              </div>
              <h3 className="font-serif text-[34px]/[1.1] md:text-[44px]/[1.08]">
                {rounds[at].action}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {rounds[at].options.map((o) => {
                  const right = pick !== null && o === rounds[at].keys;
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => choose(o)}
                      disabled={pick !== null}
                      className={cn(
                        "flex min-h-16 items-center justify-center border px-3 py-3 transition-colors",
                        pick === null &&
                          "border-white/25 hover:border-bull-light hover:bg-white/[0.06]",
                        right && "border-bull-light bg-bull-light text-deep",
                        pick !== null && !right && "border-white/10 text-haze",
                      )}
                    >
                      <Keys keys={o} />
                    </button>
                  );
                })}
              </div>
              {pick !== null && (
                <div className="flex flex-col gap-4 border-t border-white/15 pt-5">
                  <p className="text-[15px]/[1.6] text-mist">
                    {pick === rounds[at].keys ? "Right." : "Not quite."} {rounds[at].action}:{" "}
                    <span className="text-white">{rounds[at].keys.split(" ").join(" + ")}</span>.
                  </p>
                  <button type="button" onClick={next} className="btn btn-sm btn-white self-start">
                    {at + 1 >= rounds.length ? "See your score" : "Next shortcut"}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
