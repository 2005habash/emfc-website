import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { markPlayed } from "./career";
import { ShareResult } from "./toys/parts";
import { useHashTarget } from "./useHashTarget";

type Term = { term: string; real: boolean; note: string };

// Finance has real terms stranger than anything made up. The made-up ones are ours.
const TERMS: Term[] = [
  { term: "Matador bond", real: true, note: "A bond sold in Spain by a foreign issuer. Olé." },
  {
    term: "Paella defence",
    real: false,
    note: "Made up. Throwing every asset into one pan is not a strategy.",
  },
  {
    term: "Pac-Man defence",
    real: true,
    note: "A target fights off a hostile bid by bidding for the bidder.",
  },
  { term: "Fallen angel", real: true, note: "A bond cut from investment grade to high yield." },
  { term: "Siesta clause", real: false, note: "Made up, though every analyst has asked for one." },
  { term: "Dead cat bounce", real: true, note: "A short rally in a market that keeps falling." },
  {
    term: "Kangaroo bond",
    real: true,
    note: "A bond in Australian dollars, sold in Australia by a foreign issuer.",
  },
  { term: "Tapas bond", real: false, note: "Made up. Small plates, small coupons." },
  {
    term: "Macaroni defence",
    real: true,
    note: "Bonds that must be repaid at a premium if the company is taken over, so they expand like pasta.",
  },
  { term: "Lazy unicorn", real: false, note: "Made up. Unicorns are many things, never lazy." },
  {
    term: "Sleeping beauty",
    real: true,
    note: "A company ripe for a takeover that nobody has approached yet.",
  },
  {
    term: "Flamingo spread",
    real: false,
    note: "Made up. The only pink thing on a trading floor is the P&L on a good day.",
  },
  {
    term: "Lobster trap",
    real: true,
    note: "A takeover defence that stops big holders of convertible securities from converting.",
  },
  {
    term: "Croissant swap",
    real: false,
    note: "Made up. Swaps are for rates and currencies, not pastries.",
  },
  {
    term: "Killer bees",
    real: true,
    note: "Advisers a company hires to fight off a hostile takeover.",
  },
  { term: "Moonwalk default", real: false, note: "Made up. Defaults only go one way." },
];

const ROUNDS = 10;

function verdict(score: number) {
  if (score === ROUNDS) return "Ten from ten. You speak fluent Bloomberg.";
  if (score >= ROUNDS - 2) return "Excellent. Nobody gets a paella defence past you.";
  if (score >= ROUNDS / 2) return "Not bad. Finance jargon is strange on purpose.";
  return "Honestly, half of it does sound made up.";
}

/** "Real or made up?" in the Arcade: real finance jargon against invented terms. */
export function RealOrMadeUp() {
  useHashTarget("real-or-made-up");
  const [seed, setSeed] = useState(0);
  const [terms, setTerms] = useState<Term[]>(() => TERMS.slice(0, ROUNDS));
  useEffect(() => {
    setTerms([...TERMS].sort(() => Math.random() - 0.5).slice(0, ROUNDS));
  }, [seed]);
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState<boolean | null>(null);
  const done = at >= terms.length;

  const call = (g: boolean) => {
    if (guess !== null) return;
    setGuess(g);
    if (g === terms[at].real) setScore((s) => s + 1);
  };
  const next = () => {
    setGuess(null);
    if (at + 1 >= terms.length) markPlayed("real-or-made-up");
    setAt((a) => a + 1);
  };

  return (
    <section id="real-or-made-up" className="scroll-mt-24 bg-stone">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow>Jargon</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Real or <Em>made up?</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            Finance has a word for everything, and some of them sound invented. Ten terms: which
            ones would get you a nod in a deal team, and which ones would get you a look?
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
          {done ? (
            <div className="flex animate-fade-up flex-col gap-6 bg-night p-6 text-white [animation-duration:0.5s] md:p-9">
              <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-bull-light">
                {score} of {terms.length}
              </span>
              <p className="font-serif text-[40px]/[1.05] md:text-[52px]/[1.02]">
                {verdict(score)}
              </p>
              <div className="flex flex-wrap gap-3">
                <ShareResult
                  text={`I got ${score} of ${terms.length} on EMFC's Real or made up. Is a Matador bond real?`}
                  path="/arcade#real-or-made-up"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSeed((s) => s + 1);
                    setAt(0);
                    setScore(0);
                    setGuess(null);
                  }}
                  className="btn btn-sm text-mist hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  New terms
                </button>
              </div>
            </div>
          ) : (
            <div
              key={`${seed}-${at}`}
              className="flex animate-fade-up flex-col gap-7 [animation-duration:0.35s]"
            >
              <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.1em] text-mute">
                <span>
                  Term {at + 1} of {terms.length}
                </span>
                <span>Score {score}</span>
              </div>
              <p className="font-serif text-[56px]/[0.95] tracking-[-0.015em] md:text-[84px]/[0.95]">
                “{terms[at].term}”
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[true, false].map((g) => {
                  const right = guess !== null && g === terms[at].real;
                  return (
                    <button
                      key={String(g)}
                      type="button"
                      onClick={() => call(g)}
                      disabled={guess !== null}
                      className={cn(
                        "h-16 border font-serif text-[26px] transition-colors",
                        guess === null && "border-ink hover:bg-ink hover:text-paper",
                        right && "border-bull bg-bull text-white",
                        guess !== null && !right && "border-line text-mute",
                      )}
                    >
                      {g ? "Real" : "Made up"}
                    </button>
                  );
                })}
              </div>
              {guess !== null && (
                <div className="flex animate-fade-up flex-col gap-4 border-t border-ink pt-5 [animation-duration:0.3s]">
                  <p className="text-[15.5px]/[1.65]">
                    <span className="font-medium">
                      {guess === terms[at].real ? "Right." : "Wrong."}
                    </span>{" "}
                    {terms[at].note}
                  </p>
                  <button type="button" onClick={next} className="btn btn-sm btn-ink self-start">
                    {at + 1 >= terms.length ? "See your score" : "Next term"}
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
