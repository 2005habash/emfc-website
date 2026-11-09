import { ArrowLeft, ArrowRight, Shuffle, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { TECHNICAL_AREAS, TECHNICALS } from "./technicals";

const SECONDS = 60;

function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * "Sixty-second technicals" on the Resources page: interview questions on cards that flip to a model
 * answer. With the clock on, each card gives you a minute before it turns over by itself.
 */
export function Flashcards() {
  const [area, setArea] = useState<string | null>(null);
  const [order, setOrder] = useState<number[] | null>(null);
  const [at, setAt] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [clock, setClock] = useState(false);
  const [left, setLeft] = useState(SECONDS);

  const cards = useMemo(() => {
    const all = order ? order.map((i) => TECHNICALS[i]) : TECHNICALS;
    return area ? all.filter((t) => t.area === area) : all;
  }, [area, order]);
  const card = cards[Math.min(at, cards.length - 1)];

  const show = (i: number) => {
    setAt((i + cards.length) % cards.length);
    setFlipped(false);
    setLeft(SECONDS);
  };

  // The clock: a minute per card, then the answer turns over by itself.
  useEffect(() => {
    if (!clock || flipped) return;
    if (left <= 0) {
      setFlipped(true);
      return;
    }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [clock, flipped, left]);

  return (
    <section id="technicals" className="scroll-mt-24">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Eyebrow>Interview prep</Eyebrow>
          <h2 className="font-serif text-[44px]/[0.98] tracking-[-0.01em] md:text-[64px]/[0.98]">
            Sixty-second <Em>technicals</Em>
          </h2>
          <p className="text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            The questions finance interviews ask again and again, each with a short model answer.
            Say yours out loud, then turn the card over.
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Topics">
            {[null, ...TECHNICAL_AREAS].map((a) => (
              <button
                key={a ?? "all"}
                type="button"
                aria-pressed={area === a}
                onClick={() => {
                  setArea(a);
                  setAt(0);
                  setFlipped(false);
                  setLeft(SECONDS);
                }}
                className={cn(
                  "caps rounded-full border px-3.5 py-2 text-[10px] tracking-[0.14em] transition-colors",
                  area === a ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                )}
              >
                {a ?? "All"}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={clock}
            onClick={() => {
              setClock((c) => !c);
              setLeft(SECONDS);
              setFlipped(false);
            }}
            className={cn("btn btn-sm self-start", clock ? "btn-ink" : "btn-outline-ink")}
          >
            <Timer className="h-3.5 w-3.5" strokeWidth={1.75} />
            {clock ? "Stop the clock" : "Start the clock"}
          </button>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-7 lg:col-start-6">
          <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.1em] text-mute">
            <span>
              {card.area}, card {Math.min(at, cards.length - 1) + 1} of {cards.length}
            </span>
            {clock && (
              <span
                className={cn("tabular-nums", left <= 10 && !flipped && "text-bull")}
                aria-live="off"
              >
                {flipped ? "Time's up" : `0:${String(left).padStart(2, "0")}`}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") show(at + 1);
              if (e.key === "ArrowLeft") show(at - 1);
            }}
            className="group block w-full text-left [perspective:1600px]"
          >
            <span
              className={cn(
                "grid transition-transform duration-500 [transform-style:preserve-3d]",
                flipped && "[transform:rotateY(180deg)]",
              )}
            >
              <span
                aria-hidden={flipped}
                className="flex min-h-[320px] flex-col justify-between gap-8 border border-line bg-panel p-7 [backface-visibility:hidden] [grid-area:1/1] group-hover:border-ink md:min-h-[360px] md:p-10"
              >
                <span className="font-serif text-[30px]/[1.12] md:text-[42px]/[1.1]">
                  {card.question}
                </span>
                <span className="caps text-[10.5px] tracking-[0.18em] text-mute">
                  Turn over for the answer
                </span>
              </span>
              <span
                aria-hidden={!flipped}
                className="flex min-h-[320px] flex-col justify-between gap-8 bg-night p-7 text-white [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)] md:min-h-[360px] md:p-10"
              >
                <span className="text-[16px]/[1.7] text-mist md:text-[18px]/[1.7]">
                  {card.answer}
                </span>
                <span className="caps text-[10.5px] tracking-[0.18em] text-bull-light">
                  Turn back for the question
                </span>
              </span>
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => show(at - 1)}
              className="btn btn-sm btn-outline-ink"
              aria-label="Previous card"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button type="button" onClick={() => show(at + 1)} className="btn btn-sm btn-ink">
              Next question
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => {
                setOrder(shuffled(TECHNICALS.length));
                setAt(0);
                setFlipped(false);
                setLeft(SECONDS);
              }}
              className="btn btn-sm text-ink hover:bg-stone"
            >
              <Shuffle className="h-3.5 w-3.5" strokeWidth={1.75} />
              Shuffle
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
