import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { markPlayed } from "./career";
import { ShareResult } from "./toys/parts";
import { useHashTarget } from "./useHashTarget";

type Day = {
  /** ISO date. */
  date: string;
  headline: string;
  asset: string;
  move: "bull" | "bear";
  what: string;
};

// Days that moved markets, and what really happened next. Figures rounded, from the day itself.
const DAYS: Day[] = [
  {
    date: "1987-10-19",
    headline: "Black Monday: selling hits New York from the opening bell.",
    asset: "the Dow Jones",
    move: "bear",
    what: "The Dow fell 22.6% in a single day, still its worst day ever.",
  },
  {
    date: "2008-09-15",
    headline: "Lehman Brothers files for bankruptcy, the largest in US history.",
    asset: "the Dow Jones",
    move: "bear",
    what: "The Dow lost about 4.4%, over 500 points, and the crisis went global.",
  },
  {
    date: "2009-03-09",
    headline: "The S&P 500 closes at 676, its low of the financial crisis.",
    asset: "the S&P 500 over the next ten years",
    move: "bull",
    what: "It roughly quadrupled within a decade: one of the great bull markets.",
  },
  {
    date: "2012-07-26",
    headline: "Mario Draghi: the ECB will do “whatever it takes” to preserve the euro.",
    asset: "Spanish government bonds",
    move: "bull",
    what: "Spain's 10-year yield, above 7% that week, began a long fall, and bond prices rose.",
  },
  {
    date: "2015-01-15",
    headline: "The Swiss National Bank suddenly drops its cap on the franc.",
    asset: "Swiss shares",
    move: "bear",
    what: "The franc briefly jumped almost 30% against the euro, and the SMI fell 8.7% that day.",
  },
  {
    date: "2016-06-24",
    headline: "The UK wakes up to a vote to leave the European Union.",
    asset: "the pound",
    move: "bear",
    what: "Sterling fell about 8% against the dollar during the day, to its lowest since 1985.",
  },
  {
    date: "2020-03-16",
    headline: "The Fed cuts rates to zero on a Sunday as Covid spreads.",
    asset: "the S&P 500 on Monday",
    move: "bear",
    what: "It fell 12%, its worst day since 1987.",
  },
  {
    date: "2020-11-09",
    headline: "Pfizer and BioNTech say their vaccine is 90% effective.",
    asset: "Zoom",
    move: "bear",
    what: "Markets rallied, but Zoom fell about 17%: the world planned to leave the house.",
  },
  {
    date: "2022-02-24",
    headline: "Russia invades Ukraine.",
    asset: "Brent crude oil",
    move: "bull",
    what: "Brent rose above $100 a barrel for the first time since 2014.",
  },
  {
    date: "2025-01-27",
    headline: "DeepSeek, a cheap Chinese AI model, tops the app charts.",
    asset: "Nvidia",
    move: "bear",
    what: "Nvidia fell about 17% and lost close to $600bn of value, a record for one day.",
  },
  {
    date: "2025-04-09",
    headline: "The US pauses most of its new tariffs for 90 days.",
    asset: "the S&P 500",
    move: "bull",
    what: "It rose about 9.5%, one of its best days since the Second World War.",
  },
];

const ROUNDS = 8;

const date = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function verdict(score: number) {
  if (score === ROUNDS) return "Perfect. Bloomberg TV is on line one.";
  if (score >= ROUNDS - 2) return "Sharp instincts. The trading floor would have you.";
  if (score >= ROUNDS / 2) return "Better than a coin. Most fund managers would take it.";
  return "The market humbles everyone eventually. You just got there early.";
}

/** The nearest anniversary in the list, for "on this day" (today, or the next one coming up). */
function onThisDay() {
  const now = new Date();
  const md = (iso: string) => Number(iso.slice(5, 7)) * 100 + Number(iso.slice(8, 10));
  const today = (now.getMonth() + 1) * 100 + now.getDate();
  const sorted = [...DAYS].sort((a, b) => md(a.date) - md(b.date));
  const exact = sorted.find((d) => md(d.date) === today);
  const later = sorted.find((d) => md(d.date) > today);
  const day = exact ?? later ?? sorted[0];
  const years = now.getFullYear() + (exact || later ? 0 : 1) - Number(day.date.slice(0, 4));
  return { day, exact: Boolean(exact), years };
}

/** "Bull or bear?" on the Fund page: famous market days, and whether you'd have called them. */
export function BullOrBear() {
  useHashTarget("bull-or-bear");
  const [seed, setSeed] = useState(0);
  // The same order on the server and in the first render; shuffled once the page runs.
  const [days, setDays] = useState<Day[]>(() => DAYS.slice(0, ROUNDS));
  useEffect(() => {
    setDays([...DAYS].sort(() => Math.random() - 0.5).slice(0, ROUNDS));
  }, [seed]);
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState<"bull" | "bear" | null>(null);
  const done = at >= days.length;
  const [today, setToday] = useState<ReturnType<typeof onThisDay> | null>(null);
  useEffect(() => setToday(onThisDay()), []);

  const call = (g: "bull" | "bear") => {
    if (guess) return;
    setGuess(g);
    if (g === days[at].move) setScore((s) => s + 1);
  };
  const next = () => {
    setGuess(null);
    if (at + 1 >= days.length) markPlayed("bull-or-bear");
    setAt((a) => a + 1);
  };
  const again = () => {
    setSeed((s) => s + 1);
    setAt(0);
    setScore(0);
    setGuess(null);
  };

  return (
    <section id="bull-or-bear" className="scroll-mt-24 bg-stone">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow>While the fund is quiet</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Bull or <Em>bear?</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            Eight days that moved markets. You get the headline and the asset; call the move before
            the tape does.
          </p>
          {today && (
            <div className="mt-2 flex flex-col gap-2 border-t border-ink pt-5">
              <span className="caps text-[10px] tracking-[0.2em] text-mute">
                {today.exact
                  ? "On this day in market history"
                  : `Coming up in market history: ${date(today.day.date).replace(/ \d{4}$/, "")}`}
              </span>
              <p className="font-serif text-[22px]/[1.3]">{today.day.headline}</p>
              <span className="text-[13px] text-mute">
                {today.exact
                  ? `${today.day.date.slice(0, 4)}, ${today.years} years ago today`
                  : `${today.day.date.slice(0, 4)}: ${today.years} years on ${date(today.day.date).replace(/ \d{4}$/, "")}`}
              </span>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
          {done ? (
            <div className="flex animate-fade-up flex-col gap-6 bg-night p-6 text-white [animation-duration:0.5s] md:p-9">
              <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-bull-light">
                {score} of {days.length} called right
              </span>
              <p className="font-serif text-[40px]/[1.05] md:text-[52px]/[1.02]">
                {verdict(score)}
              </p>
              <div className="flex flex-wrap gap-3">
                <ShareResult
                  text={`I called ${score} of ${days.length} market days on EMFC's Bull or bear. Can you beat it?`}
                  path="/fund#bull-or-bear"
                />
                <button
                  type="button"
                  onClick={again}
                  className="btn btn-sm text-mist hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  New days
                </button>
              </div>
            </div>
          ) : (
            <div
              key={`${seed}-${at}`}
              className="flex animate-fade-up flex-col gap-6 [animation-duration:0.35s]"
            >
              <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.1em] text-mute">
                <span>{date(days[at].date)}</span>
                <span>
                  {at + 1} of {days.length}, score {score}
                </span>
              </div>
              <h3 className="font-serif text-[30px]/[1.15] md:text-[40px]/[1.12]">
                {days[at].headline}
              </h3>
              <p className="text-[16px]/[1.6]">
                Bull or bear for <span className="font-medium">{days[at].asset}</span>?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(["bull", "bear"] as const).map((g) => {
                  const right = guess && g === days[at].move;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => call(g)}
                      disabled={Boolean(guess)}
                      className={cn(
                        "flex h-16 items-center justify-center gap-2 border font-serif text-[26px] capitalize transition-colors",
                        !guess && "border-ink hover:bg-ink hover:text-paper",
                        right && "border-bull bg-bull text-white",
                        guess && !right && "border-line text-mute",
                      )}
                    >
                      {g === "bull" ? "▲" : "▼"} {g}
                    </button>
                  );
                })}
              </div>
              {guess && (
                <div className="flex animate-fade-up flex-col gap-4 border-t border-ink pt-5 [animation-duration:0.3s]">
                  <p className="text-[15.5px]/[1.65]">
                    <span className="font-medium">
                      {guess === days[at].move ? "Right." : "Wrong."}
                    </span>{" "}
                    {days[at].what}
                  </p>
                  <button type="button" onClick={next} className="btn btn-sm btn-ink self-start">
                    {at + 1 >= days.length ? "See your score" : "Next day"}
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
