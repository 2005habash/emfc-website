import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { markPlayed } from "./career";
import { ShareResult } from "./toys/parts";
import { useHashTarget } from "./useHashTarget";

// "Find the plug" in the Arcade. A plug is a number typed into a model to make it tie. Each round is a
// small income statement, made up on the spot, with exactly one cell that doesn't add up; the player
// clicks it before the MD's clock runs out. The wrong cell is always a total or a percentage, so one
// fix makes every line tie again.

const ROUNDS = 5;
const ROUND_SECONDS = 45;
const YEARS = ["FY23", "FY24", "FY25"];

const COMPANIES = [
  "Montjuïc Foods",
  "Gràcia Robotics",
  "Tibidabo Telecom",
  "Sant Pau Health",
  "Born Fashion",
  "Raval Records",
  "Poblenou Mobility",
  "Sarrià Software",
  "Barceloneta Boats",
  "Les Corts Logistics",
  "Eixample Energy",
  "Horta Hotels",
];

type Row = {
  label: string;
  /** "total" rows add up the lines above them; "pct" rows are percentages; the rest are inputs. */
  kind: "input" | "total" | "pct";
  values: (number | null)[];
};

type Model = {
  company: string;
  rows: Row[];
  wrong: { row: number; col: number; was: number };
  why: string;
};

const rnd = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

/** A whole model that ties, then one total or percentage knocked out of line. */
function makeModel(company: string): Model {
  const revenue = [Math.round(rnd(180, 900))];
  revenue.push(Math.round(revenue[0] * (1 + rnd(0.04, 0.18))));
  revenue.push(Math.round(revenue[1] * (1 + rnd(0.04, 0.18))));
  const cogsPct = rnd(0.38, 0.6);
  const opexPct = rnd(0.14, 0.24);
  const daPct = rnd(0.03, 0.06);
  const interest = Math.round(rnd(6, 24));

  const cogs = revenue.map((r) => -Math.round(r * (cogsPct + rnd(-0.02, 0.02))));
  const gross = revenue.map((r, i) => r + cogs[i]);
  const opex = revenue.map((r) => -Math.round(r * (opexPct + rnd(-0.015, 0.015))));
  const ebitda = gross.map((g, i) => g + opex[i]);
  const da = revenue.map((r) => -Math.round(r * daPct));
  const ebit = ebitda.map((e, i) => e + da[i]);
  const int = revenue.map(() => -interest);
  const tax = ebit.map((e, i) => -Math.max(0, Math.round((e + int[i]) * 0.25)));
  const net = ebit.map((e, i) => e + int[i] + tax[i]);
  const growth = revenue.map((r, i) =>
    i === 0 ? null : Math.round((r / revenue[i - 1] - 1) * 1000) / 10,
  );
  const margin = revenue.map((r, i) => Math.round((ebitda[i] / r) * 1000) / 10);

  const rows: Row[] = [
    { label: "Revenue", kind: "input", values: revenue },
    { label: "Growth", kind: "pct", values: growth },
    { label: "Cost of sales", kind: "input", values: cogs },
    { label: "Gross profit", kind: "total", values: gross },
    { label: "Operating costs", kind: "input", values: opex },
    { label: "EBITDA", kind: "total", values: ebitda },
    { label: "EBITDA margin", kind: "pct", values: margin },
    { label: "D&A", kind: "input", values: da },
    { label: "EBIT", kind: "total", values: ebit },
    { label: "Interest", kind: "input", values: int },
    { label: "Tax", kind: "input", values: tax },
    { label: "Net income", kind: "total", values: net },
  ];

  // Knock one total or percentage out of line.
  const candidates = rows.flatMap((r, row) =>
    r.kind === "input" ? [] : r.values.flatMap((v, col) => (v === null ? [] : [{ row, col }])),
  );
  const { row, col } = pick(candidates);
  const was = rows[row].values[col]!;
  let wrong: number;
  if (rows[row].kind === "pct") {
    wrong = Math.round((was + pick([-1, 1]) * rnd(1.5, 5)) * 10) / 10;
  } else {
    const digits = String(Math.abs(was));
    const swapped =
      digits.length >= 3
        ? Number(digits[0] + digits[2] + digits[1] + digits.slice(3)) * Math.sign(was)
        : was;
    wrong =
      Math.random() < 0.4 && swapped !== was
        ? swapped
        : was + pick([-1, 1]) * Math.round(rnd(6, 40));
  }
  rows[row].values[col] = wrong;

  const n = (v: number) => Math.abs(v).toLocaleString("en-GB");
  const at = (label: string) => rows.find((r) => r.label === label)!.values[col]!;
  const whys: Record<string, string> = {
    "Gross profit": `Gross profit is revenue less cost of sales: ${n(at("Revenue"))} less ${n(at("Cost of sales"))} is ${n(was)}, not ${n(wrong)}.`,
    EBITDA: `EBITDA is gross profit less operating costs: ${n(at("Gross profit"))} less ${n(at("Operating costs"))} is ${n(was)}, not ${n(wrong)}.`,
    EBIT: `EBIT is EBITDA less D&A: ${n(at("EBITDA"))} less ${n(at("D&A"))} is ${n(was)}, not ${n(wrong)}.`,
    "Net income": `Net income is EBIT less interest and tax: ${n(at("EBIT"))} less ${n(at("Interest"))} and ${n(at("Tax"))} is ${n(was)}, not ${n(wrong)}.`,
    Growth: `Revenue went from ${n(revenue[col - 1] ?? 0)} to ${n(revenue[col])}: growth of ${was.toFixed(1)}%, not ${wrong.toFixed(1)}%.`,
    "EBITDA margin": `EBITDA of ${n(ebitda[col])} on revenue of ${n(revenue[col])} is a margin of ${was.toFixed(1)}%, not ${wrong.toFixed(1)}%.`,
  };
  return {
    company,
    rows,
    wrong: { row, col, was },
    why: `${YEARS[col]}: ${whys[rows[row].label]}`,
  };
}

/** The file every model lives in, named the way real ones end up named. */
const fileName = (company: string) =>
  `${company.normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, "_")}_model_v14_FINAL_final2.xlsx`;

/** Money the way a model shows it: costs in brackets. Percentages with one decimal. */
const show = (row: Row, v: number | null) => {
  if (v === null) return "n.a.";
  if (row.kind === "pct") return `${v.toFixed(1)}%`;
  const s = Math.abs(v).toLocaleString("en-GB");
  return v < 0 ? `(${s})` : s;
};

function verdict(score: number) {
  if (score === ROUNDS)
    return "The model ties. The MD signs it off without a single comment. A first.";
  if (score >= ROUNDS - 2) return "Nearly there. One more pass and it's ready for the client.";
  if (score >= 1) return "The MD found the rest. Expect comments in red pen.";
  return "The model went to the client. The client found the plug.";
}

/** "Find the plug" in the Arcade: spot the cell that doesn't add up. */
export function FindThePlug() {
  useHashTarget("find-the-plug");
  const [models, setModels] = useState<Model[] | null>(null);
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [choice, setChoice] = useState<{ row: number; col: number } | "time" | null>(null);
  const [left, setLeft] = useState(ROUND_SECONDS);
  const desk = useRef<HTMLDivElement>(null);

  const start = () => {
    const names = [...COMPANIES].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
    setModels(names.map(makeModel));
    setAt(0);
    setScore(0);
    setChoice(null);
    setLeft(ROUND_SECONDS);
    // On a phone the model sits below the introduction: bring it into view.
    requestAnimationFrame(() =>
      desk.current?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  };

  const model = models?.[at];
  const done = models !== null && at >= models.length;

  // The MD's clock for each model.
  useEffect(() => {
    if (!model || choice) return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      const remaining = ROUND_SECONDS - Math.floor((Date.now() - startedAt) / 1000);
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) setChoice("time");
    }, 250);
    return () => clearInterval(id);
  }, [model, choice]);

  const choose = (row: number, col: number) => {
    if (!model || choice) return;
    setChoice({ row, col });
    if (row === model.wrong.row && col === model.wrong.col) setScore((s) => s + 1);
  };
  const next = () => {
    if (models && at + 1 >= models.length) markPlayed("find-the-plug");
    setChoice(null);
    setLeft(ROUND_SECONDS);
    setAt((a) => a + 1);
  };

  const found =
    choice &&
    choice !== "time" &&
    model &&
    choice.row === model.wrong.row &&
    choice.col === model.wrong.col;

  return (
    <section id="find-the-plug" className="scroll-mt-24 bg-stone">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Eyebrow>A puzzle for analysts</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Find the <Em>plug</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            A plug is a number typed in to make a model tie. Each of these five models has one cell
            that doesn't add up: a total or a percentage. Click it before the MD gets to it.
          </p>
          <p className="text-[13.5px]/[1.6] text-mute">
            Figures in € millions, costs in brackets. Every company is made up.
          </p>
        </div>

        <div
          ref={desk}
          className="flex scroll-mt-24 flex-col gap-5 lg:col-span-7 lg:col-start-6"
          aria-live="polite"
        >
          {done ? (
            <div className="flex animate-fade-up flex-col gap-6 bg-night p-6 text-white [animation-duration:0.5s] md:p-9">
              <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-bull-light">
                {score} of {ROUNDS} plugs found
              </span>
              <p className="font-serif text-[40px]/[1.05] md:text-[50px]/[1.02]">
                {verdict(score)}
              </p>
              <div className="flex flex-wrap gap-3">
                <ShareResult
                  text={`I found ${score} of ${ROUNDS} plugs in EMFC's models. Can you make them tie?`}
                  path="/arcade#find-the-plug"
                />
                <button
                  type="button"
                  onClick={start}
                  className="btn btn-sm text-mist hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Five new models
                </button>
              </div>
            </div>
          ) : model ? (
            <>
              <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.1em] text-mute">
                <span>
                  Model {at + 1} of {ROUNDS}, found {score}
                </span>
                <span className={cn("tabular-nums", left <= 10 && !choice && "text-ink")}>
                  {choice ? "Pencils down" : `The MD arrives in ${left}s`}
                </span>
              </div>
              <div
                key={at}
                className="animate-fade-up overflow-hidden border border-line bg-field [animation-duration:0.35s]"
              >
                <div className="flex items-center justify-between gap-4 border-b border-line bg-stone px-4 py-2.5">
                  <span className="truncate font-mono text-[12px] text-mute">
                    {fileName(model.company)}
                  </span>
                </div>
                <table className="w-full border-collapse font-mono text-[12.5px] tabular-nums md:text-[13.5px]">
                  <thead>
                    <tr className="border-b border-line text-mute">
                      <th className="px-3 py-2 text-left font-normal md:px-4">{model.company}</th>
                      {YEARS.map((y) => (
                        <th key={y} className="px-2 py-2 text-right font-normal md:px-4">
                          {y}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {model.rows.map((r, row) => (
                      <tr
                        key={r.label}
                        className={cn(
                          r.kind === "total" && "border-t border-ink/40 font-semibold",
                          r.kind === "pct" && "italic text-mute",
                        )}
                      >
                        <th
                          scope="row"
                          className={cn(
                            "px-3 py-1.5 text-left md:px-4",
                            r.kind === "total" ? "font-semibold" : "font-normal",
                          )}
                        >
                          {r.label}
                        </th>
                        {r.values.map((v, col) => {
                          const isWrong = row === model.wrong.row && col === model.wrong.col;
                          const picked =
                            choice && choice !== "time" && choice.row === row && choice.col === col;
                          return (
                            <td key={col} className="p-0 text-right">
                              <button
                                type="button"
                                disabled={v === null || Boolean(choice)}
                                onClick={() => choose(row, col)}
                                aria-label={`${r.label}, ${YEARS[col]}: ${show(r, v)}`}
                                className={cn(
                                  "w-full px-2 py-1.5 text-right transition-colors md:px-4",
                                  !choice &&
                                    v !== null &&
                                    "hover:bg-bull/15 focus-visible:bg-bull/15",
                                  choice && isWrong && "bg-bull text-white",
                                  picked && !isWrong && "bg-ink/10 line-through",
                                )}
                              >
                                {show(r, v)}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {choice && (
                <div className="flex animate-fade-up flex-col gap-4 border-t border-ink pt-5 [animation-duration:0.3s]">
                  <p className="text-[15.5px]/[1.65]">
                    <span className="font-medium">
                      {found
                        ? "Found it."
                        : choice === "time"
                          ? "The MD found it first."
                          : "Not that one."}
                    </span>{" "}
                    {model.why}
                  </p>
                  <button type="button" onClick={next} className="btn btn-sm btn-ink self-start">
                    {at + 1 >= ROUNDS ? "See your review" : "Next model"}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-start gap-5 border border-line bg-field p-6 md:p-9">
              <span className="font-mono text-[12px] text-mute">Inbox: 1 unread</span>
              <p className="font-serif text-[30px]/[1.15] md:text-[38px]/[1.12]">
                “The numbers don't tie. Can you take a look before the client call? Thanks.”
              </p>
              <button type="button" onClick={start} className="btn btn-ink">
                Open the first model
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
