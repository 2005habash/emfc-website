import { ArrowRight, Download, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { IMAGES } from "@/lib/site";
import { cn } from "@/lib/utils";
import { markPlayed } from "./career";
import { drawCard, INK, loadImage, SANS, SERIF, shareImage, spaced, wrap } from "./cards";
import { useHashTarget } from "./useHashTarget";

type Question = { q: string; options: string[]; answer: number; why: string; fit?: true };

// Technicals with one right answer, and fit questions with one sensible one.
const BANK: Question[] = [
  {
    q: "Depreciation rises by €10 and the tax rate is 40%. What happens to cash?",
    options: ["Up €4", "Down €6", "Down €10", "No change"],
    answer: 0,
    why: "Net income falls €6, but the €10 of depreciation is added back: cash is up €4.",
  },
  {
    q: "A buyer at 20x earnings buys a target at 12x, all in shares. Before synergies, the deal is...",
    options: ["Accretive", "Dilutive", "Exactly neutral", "Impossible to say"],
    answer: 0,
    why: "Paying with shares priced at 20x for earnings priced at 12x adds to earnings per share.",
  },
  {
    q: "Interest rates rise. What happens to a bond's price?",
    options: ["It falls", "It rises", "Nothing, the coupon is fixed", "It goes to par"],
    answer: 0,
    why: "Fixed coupons are worth less when new bonds pay more.",
  },
  {
    q: "Which usually costs a company more: equity or debt?",
    options: ["Equity", "Debt", "They cost the same", "Whichever the CFO prefers"],
    answer: 0,
    why: "Shareholders are paid last and take more risk, and interest is tax deductible.",
  },
  {
    q: "You buy at 10x EBITDA and sell at 10x after EBITDA doubles. No debt. Your money multiple?",
    options: ["2.0x", "1.0x", "4.0x", "1.5x"],
    answer: 0,
    why: "Same multiple, twice the EBITDA: twice the value.",
  },
  {
    q: "Enterprise value 1,000, debt 300, cash 100. What is the equity worth?",
    options: ["800", "600", "1,200", "1,400"],
    answer: 0,
    why: "Equity value is enterprise value minus debt plus cash: 1,000 − 300 + 100.",
  },
  {
    q: "Which of these is not a usual way to value a company?",
    options: [
      "Revenue per employee, squared",
      "Comparable companies",
      "Precedent transactions",
      "A DCF",
    ],
    answer: 0,
    why: "The other three are the classic toolkit.",
  },
  {
    q: "Doubling your money in five years is an IRR of about...",
    options: ["15%", "10%", "20%", "40%"],
    answer: 0,
    why: "2.0x over five years is about 14.9% a year.",
  },
  {
    q: "A bond is cut from BBB- to BB+. It is now...",
    options: ["High yield", "Still investment grade", "In default", "Triple A"],
    answer: 0,
    why: "BBB- is the last investment grade rung; BB+ is high yield, a fallen angel.",
  },
  {
    q: "Pre-money valuation €8m, the round raises €2m. The new investor owns...",
    options: ["20%", "25%", "10%", "80%"],
    answer: 0,
    why: "€2m of a €10m post-money valuation.",
  },
  {
    q: "Why investment banking?",
    options: [
      "Steep learning on live deals, and I've done my homework on the job",
      "The bonus",
      "My parents work in finance",
      "I hear the hours are flexible",
    ],
    answer: 0,
    why: "Specific, honest, and it shows you know what the job is.",
    fit: true,
  },
  {
    q: "Your MD wants the model by 8am. At 2am you find a mistake in it. You...",
    options: [
      "Fix it, flag it in the email and own it",
      "Hope nobody notices",
      "Blame Excel",
      "Resign",
    ],
    answer: 0,
    why: "Mistakes happen; hiding them is what ends careers.",
    fit: true,
  },
  {
    q: "Tell us about a deal you've followed recently.",
    options: [
      "One I can explain: who bought what, why, and at what multiple",
      "I don't really follow deals",
      "All of them",
      "The one in the film Wall Street",
    ],
    answer: 0,
    why: "One deal, known well, beats ten headlines.",
    fit: true,
  },
  {
    q: "Where do you see yourself in five years?",
    options: [
      "Having learnt the craft, with a clear view of my next step",
      "In your chair",
      "On a beach",
      "No idea",
    ],
    answer: 0,
    why: "Ambitious and grounded beats either one alone.",
    fit: true,
  },
];

const SECONDS = 60;
const LENGTH = 6;

/** The outcome by score, from an exploding offer to a polite no. */
function outcome(score: number) {
  if (score === LENGTH)
    return {
      title: "Exploding offer",
      line: "Perfect score. Sign by Friday, before another bank does.",
      letter:
        "We are delighted to offer you a Summer Analyst position. The offer expires on Friday at 5pm, so please do not take it to a competitor.",
    };
  if (score >= LENGTH - 1)
    return {
      title: "Offer",
      line: "Welcome to the analyst class.",
      letter:
        "We are pleased to offer you a Summer Analyst position. Your desk, your monitors and your 7am starts are waiting.",
    };
  if (score >= LENGTH - 2)
    return {
      title: "Final round",
      line: "The MD would like a word.",
      letter:
        "Thank you for a strong Superday. We would like to invite you to a final round with one of our Managing Directors.",
    };
  if (score >= 2)
    return {
      title: "Waitlist",
      line: "Close. Keep your phone on.",
      letter:
        "Thank you for your time at our Superday. You were a strong candidate, and we have placed you on our waitlist for this year's class.",
    };
  return {
    title: "We'll keep your CV on file",
    line: "Every banker has a rejection story. This is yours.",
    letter:
      "Thank you for your interest. After careful consideration we will not be moving forward, but we will keep your CV on file. We wish you every success.",
  };
}

function pick() {
  const technical = BANK.filter((q) => !q.fit).sort(() => Math.random() - 0.5);
  const fit = BANK.filter((q) => q.fit).sort(() => Math.random() - 0.5);
  // Shuffle each question's options, keeping track of the right one.
  return [...technical.slice(0, LENGTH - 2), ...fit.slice(0, 2)]
    .sort(() => Math.random() - 0.5)
    .map((q) => {
      const order = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
      return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
    });
}

/** "The Superday" in the Arcade: a timed mock interview that ends with a letter. */
export function Superday() {
  useHashTarget("superday");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [left, setLeft] = useState(SECONDS);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<{ q: Question; right: boolean }[]>([]);
  const started = useRef(0);
  const [took, setTook] = useState(0);

  const finish = () => {
    setTook(Math.round((Date.now() - started.current) / 1000));
    setDone(true);
    markPlayed("superday");
  };

  useEffect(() => {
    if (!questions || done) return;
    if (left <= 0) {
      finish();
      return;
    }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [questions, done, left]);

  const start = () => {
    setQuestions(pick());
    setAt(0);
    setScore(0);
    setChosen(null);
    setLeft(SECONDS);
    setDone(false);
    setAnswers([]);
    started.current = Date.now();
  };

  const answer = (i: number) => {
    if (!questions || chosen !== null) return;
    const q = questions[at];
    const right = i === q.answer;
    setChosen(i);
    if (right) setScore((s) => s + 1);
    setAnswers((a) => [...a, { q, right }]);
    setTimeout(() => {
      setChosen(null);
      if (at + 1 >= questions.length) finish();
      else setAt(at + 1);
    }, 900);
  };

  return (
    <section id="superday" className="scroll-mt-24 bg-night text-white">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow tone="light">Mock interview</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            The <Em light>Superday</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mist md:text-base/[1.7]">
            Six questions, sixty seconds: technicals and fit, the way a final round mixes them. At
            the end, a letter. Hopefully the good kind.
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
          {!questions ? (
            <div className="flex flex-col items-start gap-6 border border-white/20 p-6 md:p-9">
              <p className="font-serif text-[30px]/[1.15] md:text-[38px]/[1.15]">
                The panel is ready for you.
              </p>
              <p className="text-[15px]/[1.65] text-mist">
                Four technical questions and two about you. The clock starts when you do.
              </p>
              <button type="button" onClick={start} className="btn btn-white">
                Start the Superday
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ) : done ? (
            <Result score={score} took={took} answers={answers} onAgain={start} />
          ) : (
            <div
              key={at}
              className="flex animate-fade-up flex-col gap-6 [animation-duration:0.35s]"
            >
              <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.1em] text-haze">
                <span>
                  Question {at + 1} of {questions.length}
                  {questions[at].fit ? ", fit" : ", technical"}
                </span>
                <span className={cn("tabular-nums", left <= 10 && "text-white")}>
                  0:{String(left).padStart(2, "0")}
                </span>
              </div>
              <div className="h-0.5 w-full bg-white/15">
                <div
                  className="h-full bg-bull-light transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(left / SECONDS) * 100}%` }}
                />
              </div>
              <h3 className="font-serif text-[28px]/[1.15] md:text-[38px]/[1.12]">
                {questions[at].q}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {questions[at].options.map((o, i) => {
                  const show = chosen !== null;
                  const right = i === questions[at].answer;
                  return (
                    <li key={o}>
                      <button
                        type="button"
                        onClick={() => answer(i)}
                        disabled={show}
                        className={cn(
                          "flex w-full items-center gap-4 border px-4 py-3.5 text-left text-[15.5px]/[1.45] transition-colors md:px-5",
                          !show && "border-white/20 hover:border-bull-light hover:bg-white/[0.06]",
                          show && right && "border-bull-light bg-bull-light text-deep",
                          show &&
                            !right &&
                            i === chosen &&
                            "border-white/40 text-haze line-through",
                          show && !right && i !== chosen && "border-white/10 text-haze",
                        )}
                      >
                        {o}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {chosen !== null && (
                <p className="text-[13.5px]/[1.6] text-mist">{questions[at].why}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Result({
  score,
  took,
  answers,
  onAgain,
}: {
  score: number;
  took: number;
  answers: { q: Question; right: boolean }[];
  onAgain: () => void;
}) {
  const o = outcome(score);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const letter = async () => {
    setBusy(true);
    try {
      const blob = await drawLetter(name.trim() || "Candidate", score, took, o.letter);
      await shareImage(
        blob,
        "emfc-superday-letter.png",
        `My EMFC Superday: ${o.title}. Try it at emfc.es/arcade`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex animate-fade-up flex-col gap-7 border border-white/20 p-6 [animation-duration:0.5s] md:p-9">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-bull-light">
          {score} of {answers.length || LENGTH} in {took} seconds
        </span>
        <p className="font-serif text-[48px]/[0.95] tracking-[-0.015em] md:text-[68px]/[0.95]">
          {o.title}
        </p>
        <p className="font-serif text-[22px]/[1.3] italic text-mist">{o.line}</p>
      </div>
      <ul className="flex flex-col gap-2 border-t border-white/15 pt-5 text-[13.5px]/[1.55]">
        {answers.map(({ q, right }) => (
          <li key={q.q} className="flex gap-3">
            <span
              className={cn("mt-0.5 shrink-0 font-mono", right ? "text-bull-light" : "text-haze")}
            >
              {right ? "✓" : "✕"}
            </span>
            <span className="text-mist">
              {q.q} <span className="text-white">{q.options[q.answer]}.</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3 border-t border-white/15 pt-6">
        <label htmlFor="superday-name" className="caps text-[10px] tracking-[0.2em] text-haze">
          Name on the letter
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="superday-name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 40))}
            placeholder="Your name"
            className="h-12 min-w-0 flex-1 rounded-full border border-white/40 bg-white/5 px-5 text-base text-white placeholder:text-haze focus-visible:outline-2 focus-visible:outline-white"
          />
          <button
            type="button"
            onClick={letter}
            disabled={busy}
            className="btn btn-sm btn-white h-12"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Get your letter
          </button>
        </div>
        <p className="text-[12px] text-haze">Made on your device; your name goes nowhere.</p>
      </div>
      <button
        type="button"
        onClick={onAgain}
        className="btn btn-sm self-start px-0 text-mist hover:text-white"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
        Another Superday
      </button>
    </div>
  );
}

/** The letter, on paper, the way a firm would send it. */
async function drawLetter(name: string, score: number, took: number, body: string) {
  const bull = await loadImage(IMAGES.bullMark).catch(() => null);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return drawCard(1080, 1350, (ctx) => {
    ctx.fillStyle = INK.paper;
    ctx.fillRect(0, 0, 1080, 1350);
    ctx.fillStyle = INK.night;
    ctx.fillRect(0, 0, 1080, 18);
    if (bull) ctx.drawImage(bull, 96, 96, 110, 100);
    ctx.fillStyle = INK.ink;
    ctx.font = `600 64px ${SERIF}`;
    ctx.textAlign = "left";
    ctx.fillText("EMFC", 226, 170);
    ctx.font = `500 22px ${SANS}`;
    ctx.fillStyle = INK.mute;
    spaced(ctx, "THE SUPERDAY PANEL", 230, 206, 5);
    ctx.textAlign = "right";
    ctx.font = `400 26px ${SANS}`;
    ctx.fillText(`Barcelona, ${today}`, 984, 170);
    ctx.textAlign = "left";
    ctx.fillStyle = INK.ink;
    ctx.font = `500 58px ${SERIF}`;
    ctx.fillText(`Dear ${name},`, 96, 380);
    ctx.font = `400 34px ${SANS}`;
    ctx.fillStyle = INK.ink;
    let y = wrap(ctx, body, 96, 470, 888, 54);
    ctx.fillStyle = INK.mute;
    ctx.font = `400 28px ${SANS}`;
    y = wrap(
      ctx,
      `Your Superday: ${score} of 6 answers right, in ${took} seconds.`,
      96,
      y + 30,
      888,
      44,
    );
    ctx.fillStyle = INK.ink;
    ctx.font = `italic 400 54px ${SERIF}`;
    ctx.fillText("The Superday panel", 96, Math.max(y + 120, 1000));
    ctx.font = `500 22px ${SANS}`;
    ctx.fillStyle = INK.mute;
    spaced(ctx, "ESADE MASTER'S FINANCE CLUB", 96, Math.max(y + 168, 1048), 5);
    ctx.strokeStyle = INK.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(96, 1218);
    ctx.lineTo(984, 1218);
    ctx.stroke();
    ctx.font = `400 24px ${SANS}`;
    ctx.fillStyle = INK.mute;
    ctx.fillText("Not a real offer, sadly. Practise at emfc.es/arcade", 96, 1268);
  });
}
