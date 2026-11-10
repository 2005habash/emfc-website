import { Coffee, Linkedin } from "lucide-react";
import { useRef, useState } from "react";
import { FirmLogo } from "@/components/site/FirmLogo";
import { Em, Eyebrow, Portrait } from "@/components/site/ui";
import { MEMBERS } from "@/data/members";
import { safeUrl } from "@/lib/site";
import { markPlayed } from "./career";
import { useHashTarget } from "./useHashTarget";

const POOL = MEMBERS.filter((m) => m.photo);

// Openers for a first coffee chat: questions that start a real conversation, not a CV recital.
const OPENERS = [
  "What surprised you most in your first year in finance?",
  "Which deal or trade taught you the most, and why?",
  "What does a good week look like on your desk?",
  "If you were starting your master's again, what would you do differently?",
  "Which firm on your CV would you go back to, and why?",
  "What is a skill nobody tells you that you will need?",
  "What are you reading or following to stay sharp right now?",
  "How did you choose between the offers or paths you had?",
  "What question do you wish people asked you more often?",
  "Who in the club should I meet next?",
];

/** "Coffee chat roulette" in the Arcade: spin, meet a member, say hello on LinkedIn. */
export function CoffeeRoulette() {
  useHashTarget("roulette");
  const [index, setIndex] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const spin = () => {
    if (spinning) return;
    const target = Math.floor(Math.random() * POOL.length);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIndex(target);
      markPlayed("roulette");
      return;
    }
    setSpinning(true);
    // A slot machine: fast at first, slowing down onto the chosen member.
    let step = 0;
    const steps = 16;
    const tick = () => {
      step += 1;
      if (step >= steps) {
        setIndex(target);
        setSpinning(false);
        markPlayed("roulette");
        return;
      }
      setIndex(Math.floor(Math.random() * POOL.length));
      timer.current = setTimeout(tick, 40 + step * step * 1.6);
    };
    tick();
  };

  const m = index === null ? null : POOL[index];
  // A different opener with each member, chosen by their position so it stays put while shown.
  const opener = index === null ? null : OPENERS[index % OPENERS.length];
  const linkedin = m ? safeUrl(m.linkedin) : undefined;

  return (
    <section id="roulette" className="scroll-mt-24 bg-stone">
      <div className="gutter grid items-center gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow>Networking, simplified</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Coffee chat <Em>roulette</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            {POOL.length} members, one coffee. Spin, meet someone from another desk, and say hello
            on LinkedIn. The best conversations at EMFC start exactly like this.
          </p>
          <button
            type="button"
            onClick={spin}
            disabled={spinning}
            className="btn btn-ink self-start"
          >
            <Coffee className="h-4 w-4" strokeWidth={1.75} />
            {m ? "Spin again" : "Spin"}
          </button>
        </div>

        <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
          <div className="group grid gap-6 border border-line bg-panel p-5 sm:grid-cols-[200px_minmax(0,1fr)] md:p-7">
            {m ? (
              <Portrait
                member={m}
                className={spinning ? "aspect-square w-full blur-[1px]" : "aspect-square w-full"}
                sizes="(min-width: 640px) 200px, 88vw"
              />
            ) : (
              <span className="grid aspect-square w-full place-items-center bg-tile font-serif text-[64px] italic text-mute">
                ?
              </span>
            )}
            <div className="flex flex-col justify-center gap-3">
              {m ? (
                <>
                  <span className="caps text-[10px] tracking-[0.2em] text-mute">
                    {spinning ? "Spinning" : "Your coffee chat"}
                  </span>
                  <span className="font-serif text-[34px]/[1.05] md:text-[40px]/[1.05]">
                    {m.displayName ?? m.name}
                  </span>
                  <span className="text-[14px] text-mute">
                    {m.title}
                    {m.programme ? `, ${m.programme}` : ""}
                  </span>
                  {!spinning && m.firms.length > 0 && (
                    <span className="mt-1 flex flex-wrap items-center gap-2 [--logo-h:24px]">
                      {m.firms.map((f) => (
                        <span key={f} className="flex h-10 items-center bg-plate px-3">
                          <FirmLogo name={f} />
                        </span>
                      ))}
                    </span>
                  )}
                  {!spinning && linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noreferrer"
                      data-linkedin-of={m.slug}
                      className="btn btn-sm btn-outline-ink mt-2 self-start"
                    >
                      <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Say hello on LinkedIn
                    </a>
                  )}
                  {!spinning && opener && (
                    <p className="mt-2 border-l-2 border-bull pl-4 font-serif text-[19px]/[1.35] italic">
                      <span className="caps mb-1 block font-sans text-[10px] not-italic tracking-[0.2em] text-mute">
                        An opener
                      </span>
                      &ldquo;{opener}&rdquo;
                    </p>
                  )}
                </>
              ) : (
                <>
                  <span className="caps text-[10px] tracking-[0.2em] text-mute">
                    Your coffee chat
                  </span>
                  <span className="font-serif text-[34px]/[1.05] text-mute md:text-[40px]/[1.05]">
                    Who will it be?
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
