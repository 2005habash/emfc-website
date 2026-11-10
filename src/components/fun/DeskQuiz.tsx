import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Em, Eyebrow, Portrait } from "@/components/site/ui";
import { departments } from "@/lib/departments";
import { leadershipOf, memberByName } from "@/lib/team";
import { cn } from "@/lib/utils";
import { deskFor, QUIZ } from "./quiz-data";
import { toyFor, TOYS } from "./toys/catalog";
import { ShareResult } from "./toys/parts";

const LETTERS = ["A", "B", "C", "D"];

/** One line of character per department, shown with the result. */
const HABITAT: Record<string, string> = {
  "investment-banking": "Your natural habitat: a deal room at 2am, with the model open.",
  "private-markets": "You think in holding periods and IRRs, even on holiday.",
  "asset-management": "You read markets the way other people read novels.",
  "fixed-income": "You know the bond market is where the real action is.",
};

/** "Which desk are you?": five questions on the Departments page, and a desk to visit at the end. */
export function DeskQuiz() {
  const [answers, setAnswers] = useState<number[]>([]);
  const step = answers.length;
  const done = step === QUIZ.length;

  return (
    <section id="quiz" className="scroll-mt-36 bg-night text-white lg:scroll-mt-40">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow tone="light">Five questions, fifteen desks</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Which desk <br className="max-sm:hidden" />
            <Em light>are you?</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mist md:text-base/[1.7]">
            Not sure where you fit at EMFC? Answer five questions and find the desk that sounds most
            like you, and who runs it. Strictly unscientific, mostly accurate.
          </p>
          <ol aria-label="Progress" className="mt-2 flex gap-1.5">
            {QUIZ.map((q, i) => (
              <li
                key={q.question}
                className={cn(
                  "h-1 flex-1 transition-colors duration-300",
                  i < step ? "bg-bull-light" : "bg-white/15",
                )}
              >
                <span className="sr-only">
                  Question {i + 1} {i < step ? "answered" : ""}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-col gap-3 border-t border-white/15 pt-6">
            <span className="caps text-[10px] tracking-[0.2em] text-haze">Or play a desk</span>
            <ul className="flex flex-wrap gap-2">
              {TOYS.map((t) => {
                const [department, desk] = t.desk.split("/");
                return (
                  <li key={t.id}>
                    <Link
                      to="/departments/$department/$desk"
                      params={{ department, desk }}
                      hash={t.id}
                      title={t.hook}
                      className="inline-flex rounded-full border border-white/25 px-3.5 py-2 text-[13px] text-mist transition-colors hover:border-bull-light hover:text-white"
                    >
                      {t.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
          {done ? (
            <Result answers={answers} onAgain={() => setAnswers([])} />
          ) : (
            <div
              key={step}
              className="flex animate-fade-up flex-col gap-6 [animation-duration:0.45s]"
            >
              <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.1em] text-haze">
                <span>
                  Question {step + 1} of {QUIZ.length}
                </span>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setAnswers((a) => a.slice(0, -1))}
                    className="inline-flex items-center gap-1.5 py-2 hover:text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Back
                  </button>
                )}
              </div>
              <h3 className="font-serif text-[34px]/[1.05] md:text-[48px]/[1.05]">
                {QUIZ[step].question}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {QUIZ[step].answers.map((a, i) => (
                  <li key={a.text}>
                    <button
                      type="button"
                      onClick={() => setAnswers((x) => [...x, i])}
                      className="group flex w-full items-center gap-4 border border-white/20 px-4 py-4 text-left transition-colors hover:border-bull-light hover:bg-white/[0.06] md:px-5"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/30 font-mono text-[12px] text-mist transition-colors group-hover:border-bull-light group-hover:bg-bull-light group-hover:text-deep">
                        {LETTERS[i]}
                      </span>
                      <span className="text-[16px]/[1.45] md:text-[17px]/[1.45]">{a.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Result({ answers, onAgain }: { answers: number[]; onAgain: () => void }) {
  const [dSlug, kSlug] = deskFor(answers).split("/");
  const d = departments.find((x) => x.slug === dSlug)!;
  const k = d.desks.find((x) => x.slug === kSlug)!;
  const groupLead = d.groups?.find((g) => g.desks.includes(k.slug))?.lead;
  const person = memberByName(k.lead ?? groupLead ?? "") ?? leadershipOf(d.slug)[0];
  const toy = toyFor(`${d.slug}/${k.slug}`);

  return (
    <div className="flex animate-fade-up flex-col gap-7 border border-white/20 p-6 [animation-duration:0.5s] md:p-9">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-bull-light">
          Your desk
        </span>
        <p className="font-serif text-[56px]/[0.92] tracking-[-0.015em] md:text-[84px]/[0.92]">
          {k.name}
        </p>
        <span className="caps text-[10.5px] tracking-[0.2em] text-haze">
          {d.name}
          {k.group ? `, ${k.group}` : ""}
        </span>
      </div>
      <p className="text-[16px]/[1.65] text-mist md:text-[17px]/[1.65]">
        {HABITAT[d.slug] ? `${HABITAT[d.slug]} ` : ""}
        {k.line}
      </p>
      {person && (
        <div className="group flex items-center gap-4 border-t border-white/15 pt-6">
          <Portrait member={person} className="h-16 w-16 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1">
            <span className="caps text-[10px] tracking-[0.2em] text-haze">Who to talk to</span>
            <span className="font-serif text-xl/[1.15] md:text-2xl/[1.15]">
              {person.displayName ?? person.name}
            </span>
            <span className="text-[13px] text-mist">{person.title}</span>
          </div>
        </div>
      )}
      {toy && (
        <Link
          to="/departments/$department/$desk"
          params={{ department: d.slug, desk: k.slug }}
          hash={toy.id}
          className="group flex items-center justify-between gap-4 border border-bull-light/40 px-5 py-4 transition-colors hover:border-bull-light hover:bg-white/[0.04]"
        >
          <span className="flex flex-col gap-1">
            <span className="caps text-[10px] tracking-[0.2em] text-bull-light">
              The desk&apos;s challenge
            </span>
            <span className="font-serif text-[22px]/[1.15]">{toy.title}</span>
            <span className="text-[13px] text-mist">{toy.hook}</span>
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
            strokeWidth={1.75}
          />
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          to="/departments/$department/$desk"
          params={{ department: d.slug, desk: k.slug }}
          className="btn btn-sm btn-white"
        >
          Visit the desk
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
        <ShareResult
          text={`I'm ${k.name}. Which EMFC desk are you?`}
          path="/departments#quiz"
          label="Share"
        />
        <button type="button" onClick={onAgain} className="btn btn-sm text-mist hover:text-white">
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          Again
        </button>
      </div>
    </div>
  );
}
