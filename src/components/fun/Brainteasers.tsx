import { ArrowRight, Lightbulb, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { markPlayed } from "./career";
import { ShareResult } from "./toys/parts";
import { useHashTarget } from "./useHashTarget";

// "Brainteasers" in the Arcade: the classic puzzles of trading and quant interviews, six a game. Each
// takes a number; two tries, a hint if wanted, and the working afterwards.

type Teaser = {
  q: string;
  /** Accepted answers, and how close counts. */
  answers: number[];
  tol?: number;
  /** Answers in percent: a fraction like 2/3 counts as 66.7. */
  percent?: boolean;
  unit?: string;
  hint: string;
  why: string;
};

const TEASERS: Teaser[] = [
  {
    q: "A bat and a ball cost €1.10 together. The bat costs €1.00 more than the ball. How much is the ball?",
    answers: [5, 0.05],
    unit: "cents",
    hint: "If the ball were 10 cents, the bat would be €1.10 and the pair €1.20.",
    why: "Call the ball x. The bat is x + 1.00, so 2x + 1.00 = 1.10 and x = 0.05. Five cents, not ten.",
  },
  {
    q: "How many times a day do the hour and minute hands of a clock lie exactly on top of each other?",
    answers: [22],
    hint: "Not every hour: between 11 and 1 they meet only once, at 12.",
    why: "The minute hand laps the hour hand 11 times every 12 hours, so 22 times a day.",
  },
  {
    q: "You flip a fair coin until you get two heads in a row. On average, how many flips does that take?",
    answers: [6],
    hint: "Call the answer E and think about what the first one or two flips can be.",
    why: "A tail first wastes a flip; a head then a tail wastes two; two heads end it. So E = 0.5(1 + E) + 0.25(2 + E) + 0.25(2), which gives E = 6.",
  },
  {
    q: "A patch of lily pads doubles in size every day. It covers the whole lake on day 48. On which day did it cover half the lake?",
    answers: [47],
    hint: "Work backwards, one day at a time.",
    why: "It doubles every day, so the day before it covers the lake it covers half of it: day 47.",
  },
  {
    q: "100 lockers start closed. Student 1 opens them all, student 2 toggles every second locker, student 3 every third, and so on up to student 100. How many lockers are open at the end?",
    answers: [10],
    hint: "A locker is toggled once for each number that divides it.",
    why: "Only numbers with an odd count of divisors end up open: the perfect squares 1, 4, 9 and so on up to 100. That's 10.",
  },
  {
    q: "You roll two fair dice. The chance they add up to 7 is one in how many?",
    answers: [6],
    hint: "Count the pairs that make 7, out of 36.",
    why: "Six of the 36 pairs make 7: 1 and 6, 2 and 5, and so on. Six in 36 is one in six.",
  },
  {
    q: "Three doors, one car. You pick door 1. The host, who knows where the car is, opens door 3 to show a goat. If you switch to door 2, what is your chance of winning?",
    answers: [66.67],
    tol: 1,
    percent: true,
    unit: "%",
    hint: "Your first pick was right one time in three. Opening a door doesn't change that.",
    why: "Your door keeps its one in three. The other two in three now sit on the one door the host left shut. Switching wins about 67% of the time.",
  },
  {
    q: "How many zeros are there at the end of 100 factorial (100 x 99 x 98 x ... x 1)?",
    answers: [24],
    hint: "Each zero needs a 5 and a 2, and there are plenty of 2s. Count the 5s.",
    why: "The multiples of 5 up to 100 give 20 fives, and 25, 50, 75 and 100 give one more each: 24 zeros.",
  },
  {
    q: "A stock rises 50% one year and falls 50% the next. By how much is it down over the two years?",
    answers: [25, -25],
    unit: "%",
    hint: "Start with €100.",
    why: "€100 becomes €150, then €75: down 25%. Percentage moves don't cancel out.",
  },
  {
    q: "How many squares of any size are there on a chessboard?",
    answers: [204],
    hint: "Count the 1 by 1 squares, then the 2 by 2s, and so on.",
    why: "64 + 49 + 36 + 25 + 16 + 9 + 4 + 1 = 204.",
  },
  {
    q: "If 5 machines take 5 minutes to make 5 widgets, how long would 100 machines take to make 100 widgets?",
    answers: [5],
    unit: "minutes",
    hint: "How long does one machine take to make one widget?",
    why: "Each machine makes one widget in 5 minutes, so 100 machines make 100 widgets in the same 5 minutes.",
  },
  {
    q: "At 8% a year, roughly how many years does it take money to double?",
    answers: [9],
    tol: 0.5,
    unit: "years",
    hint: "Bankers divide 72 by the rate.",
    why: "The rule of 72: 72 / 8 = 9 years. The exact answer is about 9.01.",
  },
  {
    q: "Two trains 100 km apart head towards each other at 50 km/h each. A fly zips back and forth between them at 75 km/h until they meet. How far does the fly travel?",
    answers: [75],
    unit: "km",
    hint: "Forget the zigzags. How long until the trains meet?",
    why: "They close at 100 km/h, so they meet in an hour. The fly flies for an hour at 75 km/h: 75 km.",
  },
  {
    q: "Ten people at an EMFC event each shake hands with everyone else once. How many handshakes is that?",
    answers: [45],
    hint: "Each pair shakes hands once.",
    why: "Each of the 10 shakes 9 hands, and that counts every handshake twice: 10 x 9 / 2 = 45.",
  },
  {
    q: "How many people do you need in a room for the chance that two of them share a birthday to pass 50%?",
    answers: [23],
    hint: "Far fewer than 183. Think about how many pairs there are.",
    why: "23 people make 253 pairs, and the chance of a shared birthday passes 50% (about 50.7%).",
  },
  {
    q: "€100 grows at 10% a year. What is it worth after two years?",
    answers: [121],
    unit: "€",
    hint: "The interest earns interest.",
    why: "100 x 1.1 x 1.1 = 121.",
  },
];

const PER_GAME = 6;
const TRIES = 2;

/** The first number in what was typed: "5", "0,05", "2/3", "66.7%", "€121". */
function parse(input: string, percent?: boolean): number | null {
  const s = input.replace(/(\d),(\d)/g, "$1.$2");
  const frac = s.match(/(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  let n: number;
  if (frac) n = Number(frac[1]) / Number(frac[2]);
  else {
    const m = s.match(/-?\d+(?:\.\d+)?/);
    if (!m) return null;
    n = Number(m[0]);
  }
  if (percent && (frac || (n > 0 && n < 1))) n *= 100;
  return n;
}

const right = (t: Teaser, n: number | null) =>
  n !== null && t.answers.some((a) => Math.abs(n - a) <= (t.tol ?? 0.001));

function verdict(score: number) {
  if (score === PER_GAME) return "Trading floor material. Can you start on Monday?";
  if (score >= PER_GAME - 2) return "Sharp. The quant desk would like a second interview.";
  if (score >= 2) return "Not bad. Bring a pen next time.";
  return "The ball cost five cents. Remember that one.";
}

/** "Brainteasers" in the Arcade. */
export function Brainteasers() {
  useHashTarget("brainteasers");
  const [seed, setSeed] = useState(0);
  // The same six on the server and in the first render; shuffled once the page runs.
  const [set, setSet] = useState<Teaser[]>(() => TEASERS.slice(0, PER_GAME));
  useEffect(() => {
    setSet([...TEASERS].sort(() => Math.random() - 0.5).slice(0, PER_GAME));
  }, [seed]);
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [value, setValue] = useState("");
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState(false);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const done = at >= set.length;
  const t = set[at];

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!t || result || !value.trim()) return;
    if (right(t, parse(value, t.percent))) {
      setResult("right");
      setScore((s) => s + 1);
      return;
    }
    const used = tries + 1;
    setTries(used);
    if (used >= TRIES) setResult("wrong");
    else input.current?.select();
  };
  const next = () => {
    if (at + 1 >= set.length) markPlayed("brainteasers");
    setAt((a) => a + 1);
    setValue("");
    setTries(0);
    setHint(false);
    setResult(null);
  };
  const again = () => {
    setSeed((s) => s + 1);
    setAt(0);
    setScore(0);
    setValue("");
    setTries(0);
    setHint(false);
    setResult(null);
  };

  return (
    <section id="brainteasers" className="scroll-mt-24">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow>Trading and quant interviews</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Brain<Em>teasers</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            The puzzles trading desks love to ask, to see how you think under a little pressure. Six
            of them, two tries each, no calculator needed. Most have a trap.
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
          {done ? (
            <div className="flex animate-fade-up flex-col gap-6 bg-night p-6 text-white [animation-duration:0.5s] md:p-9">
              <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-bull-light">
                {score} of {set.length} solved
              </span>
              <p className="font-serif text-[40px]/[1.05] md:text-[52px]/[1.02]">
                {verdict(score)}
              </p>
              <div className="flex flex-wrap gap-3">
                <ShareResult
                  text={`I solved ${score} of ${set.length} brainteasers on EMFC's Arcade. The bat and the ball got me.`}
                  path="/arcade#brainteasers"
                />
                <button
                  type="button"
                  onClick={again}
                  className="btn btn-sm text-mist hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Six more
                </button>
              </div>
            </div>
          ) : (
            <form
              key={`${seed}-${at}`}
              onSubmit={check}
              className="flex animate-fade-up flex-col gap-6 [animation-duration:0.35s]"
            >
              <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.1em] text-mute">
                <span>
                  {at + 1} of {set.length}
                </span>
                <span>Solved {score}</span>
              </div>
              <p className="font-serif text-[28px]/[1.2] md:text-[34px]/[1.18]">{t.q}</p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex h-14 min-w-0 flex-1 items-center gap-2 border border-ink bg-field px-4 focus-within:outline-2 focus-within:outline-ink sm:max-w-[280px]">
                  <span className="sr-only">Your answer</span>
                  <input
                    ref={input}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={result !== null}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Your answer"
                    className="min-w-0 flex-1 bg-transparent font-mono text-[18px] text-ink outline-none placeholder:text-mute"
                  />
                  {t.unit && <span className="shrink-0 text-[14px] text-mute">{t.unit}</span>}
                </label>
                <button type="submit" disabled={result !== null} className="btn btn-ink h-14">
                  Check
                </button>
                {!hint && result === null && (
                  <button
                    type="button"
                    onClick={() => setHint(true)}
                    className="btn btn-sm text-mute hover:text-ink"
                  >
                    <Lightbulb className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Hint
                  </button>
                )}
              </div>
              {tries > 0 && result === null && (
                <p className="text-[14.5px] text-mute">Not quite. One more try.</p>
              )}
              {hint && result === null && (
                <p className="border-l-2 border-bull pl-4 text-[15px]/[1.6] text-mute">{t.hint}</p>
              )}
              {result && (
                <div className="flex animate-fade-up flex-col gap-4 border-t border-ink pt-5 [animation-duration:0.3s]">
                  <p className="text-[15.5px]/[1.65]">
                    <span className={cn("font-medium", result === "right" && "text-bull")}>
                      {result === "right" ? "Right." : "Not this time."}
                    </span>{" "}
                    {t.why}
                  </p>
                  <button type="button" onClick={next} className="btn btn-sm btn-ink self-start">
                    {at + 1 >= set.length ? "See your score" : "Next teaser"}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
