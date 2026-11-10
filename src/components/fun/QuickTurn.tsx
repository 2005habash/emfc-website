import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { markPlayed } from "./career";
import { ShareResult } from "./toys/parts";
import { useHashTarget } from "./useHashTarget";

// "Quick turn" in the Arcade: a short choose-your-own-weekend story about the most dangerous email in
// finance. Six endings; the ones a visitor has found are kept in their own browser only.

type Scene =
  | { at: string; text: string; choices: { label: string; to: string }[] }
  | { ending: string; at: string; text: string };

const STORY: Record<string, Scene> = {
  start: {
    at: "Friday, 18:47",
    text: "You have a dinner booked for nine. An email lands from your MD: “Quick turn on the Paella deck? Shouldn't take long.” The deck is 84 pages.",
    choices: [
      { label: "Reply “On it!” and cancel dinner", to: "cancel" },
      { label: "Reply “Of course. First thing Monday?”", to: "monday" },
      { label: "Open the deck before replying", to: "open" },
    ],
  },
  cancel: {
    at: "Friday, 21:30",
    text: "Page 47 of 84. You notice the logo on page 12 sits three pixels lower than the one on page 11. Nobody asked. But now you know.",
    choices: [
      { label: "Align every logo in the deck", to: "logos" },
      { label: "Leave it. It's Friday", to: "page12" },
    ],
  },
  logos: {
    ending: "The Perfectionist",
    at: "Saturday, 02:14",
    text: "Every logo in all 84 pages sits on the same line. You send the deck. At 02:15 the MD replies: “Thanks. Client moved the meeting to next month.”",
  },
  page12: {
    ending: "The Page 12 Incident",
    at: "Monday, 08:01",
    text: "The MD prints the deck, holds page 12 up to the light, and looks at you for a long, long time.",
  },
  monday: {
    at: "Friday, 18:48",
    text: "The MD replies in four seconds: “Sure. The client meeting is Monday at 8:00.”",
    choices: [
      { label: "Work through the weekend alone", to: "alone" },
      { label: "Message your EMFC desk for help", to: "desk" },
    ],
  },
  alone: {
    ending: "The Weekend Warrior",
    at: "Sunday, 23:58",
    text: "Deck sent. You have now seen every sunrise this weekend, and the delivery driver knows your name.",
  },
  desk: {
    ending: "The Desk",
    at: "Saturday, 13:00",
    text: "Your desk turns up with croissants. You split the pages, check each other's numbers and finish by lunch. This is what the club is for.",
  },
  open: {
    at: "Friday, 18:52",
    text: "Page 1 says Project Paella. Page 2 says Project Gazpacho. Page 3 has a chart with no labels on either axis.",
    choices: [
      { label: "Fix it all quietly", to: "quietly" },
      { label: "Ask the MD which project this is", to: "ask" },
    ],
  },
  quietly: {
    ending: "The Silent Hero",
    at: "Monday, 09:30",
    text: "You fixed 63 things nobody will ever notice. The MD writes back two words: “Good deck.” You print the email and frame it.",
  },
  ask: {
    ending: "The Question",
    at: "Friday, 18:53",
    text: "The MD replies: “Both. Don't ask.” You have more questions than when you started, and dinner is cancelled anyway.",
  },
};

const ENDINGS = Object.values(STORY).flatMap((s) => ("ending" in s ? [s.ending] : []));
const KEY = "emfc-quick-turn";

function readFound(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((x) => ENDINGS.includes(x)) : [];
  } catch {
    return [];
  }
}

/** "Quick turn" in the Arcade. */
export function QuickTurn() {
  useHashTarget("quick-turn");
  const [scene, setScene] = useState("start");
  const [found, setFound] = useState<string[]>([]);
  useEffect(() => setFound(readFound()), []);
  const s = STORY[scene];

  const go = (to: string) => {
    const next = STORY[to];
    setScene(to);
    if ("ending" in next) {
      markPlayed("quick-turn");
      const list = [...new Set([...readFound(), next.ending])];
      setFound(list);
      try {
        localStorage.setItem(KEY, JSON.stringify(list));
      } catch {
        // Private mode: the endings just won't be remembered.
      }
    }
  };

  return (
    <section id="quick-turn" className="scroll-mt-24 bg-stone">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow>A choose-your-own weekend</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Quick <Em>turn</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            The two most dangerous words in finance, usually sent on a Friday evening. Make your
            choices and see where your weekend ends up.
          </p>
          <div className="flex flex-col gap-3 border-t border-ink pt-5">
            <span className="caps text-[10px] tracking-[0.2em] text-mute">
              Endings found: {found.length} of {ENDINGS.length}
            </span>
            <ul className="flex flex-wrap gap-2">
              {ENDINGS.map((e) => (
                <li
                  key={e}
                  className={cn(
                    "min-w-10 border px-3 py-1.5 text-center text-[13px]",
                    found.includes(e) ? "border-ink" : "border-dashed border-line text-mute",
                  )}
                >
                  {found.includes(e) ? (
                    e
                  ) : (
                    <>
                      <span aria-hidden>?</span>
                      <span className="sr-only">Not found yet</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
          <div className="overflow-hidden border border-line bg-field shadow-[0_20px_50px_rgb(0_0_0/0.08)]">
            <div className="flex flex-col gap-1 border-b border-line px-5 py-4 text-[13px] md:px-7">
              <span className="flex justify-between gap-4">
                <span>
                  <span className="text-mute">From </span>The MD
                </span>
                <span className="font-mono text-[12px] text-mute">{s.at}</span>
              </span>
              <span>
                <span className="text-mute">Subject </span>Quick turn
              </span>
            </div>
            <div
              key={scene}
              className="flex animate-fade-up flex-col gap-6 p-5 [animation-duration:0.35s] md:p-7"
            >
              {"ending" in s ? (
                <>
                  <span className="caps text-[10px] tracking-[0.2em] text-bull">
                    Ending: {s.ending}
                  </span>
                  <p className="font-serif text-[30px]/[1.2] md:text-[36px]/[1.18]">{s.text}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setScene("start")}
                      className="btn btn-sm btn-ink"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Back to Friday
                    </button>
                    <ShareResult
                      text={`My weekend ended as "${s.ending}" on EMFC's Quick turn. What's yours?`}
                      path="/arcade#quick-turn"
                      onLight
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="font-serif text-[28px]/[1.22] md:text-[32px]/[1.2]">{s.text}</p>
                  <div className="flex flex-col gap-2.5">
                    {s.choices.map((c) => (
                      <button
                        key={c.to}
                        type="button"
                        onClick={() => go(c.to)}
                        className="group flex items-center justify-between gap-4 border border-ink px-4 py-3.5 text-left text-[15px]/[1.45] transition-colors hover:bg-ink hover:text-paper"
                      >
                        {c.label}
                        <ArrowRight
                          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                          strokeWidth={1.75}
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
