import { useEffect, useRef, useState, type CSSProperties } from "react";

// The moving parts of emfc.es/kostya: the "heyyy" curtain at the start, his framed portrait, and the
// tip jar. The page itself is src/routes/kostya.tsx.

/** His palette: velvet, gold and a little leopard. Only on this page. */
export const KOSTYA_CSS = `
.kostya { --k-velvet: #2a0b36; --k-velvet-deep: #1c0625; --k-gold: #d9b45b; --k-gold-deep: #9c7a2e; --k-cream: #f6eddb; --k-lilac: #cdb9d6; }
.kostya-leopard { background-color: #c9964e; background-size: 160px 160px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='%23a8702e'%3E%3Cellipse cx='22' cy='26' rx='9' ry='7.5'/%3E%3Cellipse cx='86' cy='14' rx='9' ry='7.5'/%3E%3Cellipse cx='86' cy='174' rx='9' ry='7.5'/%3E%3Cellipse cx='140' cy='44' rx='9' ry='7.5'/%3E%3Cellipse cx='52' cy='78' rx='9' ry='7.5'/%3E%3Cellipse cx='118' cy='98' rx='9' ry='7.5'/%3E%3Cellipse cx='20' cy='124' rx='9' ry='7.5'/%3E%3Cellipse cx='80' cy='140' rx='9' ry='7.5'/%3E%3Cellipse cx='-12' cy='-10' rx='9' ry='7.5'/%3E%3Cellipse cx='-12' cy='150' rx='9' ry='7.5'/%3E%3Cellipse cx='148' cy='-10' rx='9' ry='7.5'/%3E%3Cellipse cx='148' cy='150' rx='9' ry='7.5'/%3E%3C/g%3E%3Cg fill='none' stroke='%232e1b0d' stroke-width='6' stroke-linecap='round'%3E%3Cpath d='M33.0 26.0A11 11 0 0 1 25.7 36.4'/%3E%3Cpath d='M21.5 37.0A11 11 0 0 1 12.6 31.7'/%3E%3Cpath d='M11.0 26.6A11 11 0 0 1 16.4 16.5'/%3E%3Cpath d='M20.5 15.1A11 11 0 0 1 31.4 20.4'/%3E%3Cpath d='M93.2 22.3A11 11 0 0 1 81.4 24.0'/%3E%3Cpath d='M77.4 20.9A11 11 0 0 1 76.5 8.5'/%3E%3Cpath d='M79.1 5.4A11 11 0 0 1 89.9 3.7'/%3E%3Cpath d='M94.2 6.7A11 11 0 0 1 96.0 18.6'/%3E%3Cpath d='M93.2 182.3A11 11 0 0 1 81.4 184.0'/%3E%3Cpath d='M77.4 180.9A11 11 0 0 1 76.5 168.5'/%3E%3Cpath d='M79.1 165.4A11 11 0 0 1 89.9 163.7'/%3E%3Cpath d='M94.2 166.7A11 11 0 0 1 96.0 178.6'/%3E%3Cpath d='M145.2 53.7A11 11 0 0 1 134.0 53.2'/%3E%3Cpath d='M130.1 48.9A11 11 0 0 1 131.8 36.6'/%3E%3Cpath d='M134.8 34.3A11 11 0 0 1 146.1 34.9'/%3E%3Cpath d='M150.0 39.3A11 11 0 0 1 148.3 51.2'/%3E%3Cpath d='M58.8 86.7A11 11 0 0 1 46.1 87.3'/%3E%3Cpath d='M42.2 83.0A11 11 0 0 1 42.7 72.1'/%3E%3Cpath d='M45.7 69.0A11 11 0 0 1 58.1 68.9'/%3E%3Cpath d='M61.2 71.9A11 11 0 0 1 62.2 82.0'/%3E%3Cpath d='M126.6 104.9A11 11 0 0 1 116.8 108.9'/%3E%3Cpath d='M111.3 106.7A11 11 0 0 1 107.2 96.0'/%3E%3Cpath d='M109.4 91.1A11 11 0 0 1 121.5 87.6'/%3E%3Cpath d='M124.7 89.3A11 11 0 0 1 129.0 98.9'/%3E%3Cpath d='M27.7 131.9A11 11 0 0 1 16.9 134.6'/%3E%3Cpath d='M13.4 132.8A11 11 0 0 1 9.5 120.8'/%3E%3Cpath d='M11.1 117.6A11 11 0 0 1 21.0 113.0'/%3E%3Cpath d='M25.2 114.3A11 11 0 0 1 31.0 124.6'/%3E%3Cpath d='M87.6 148.0A11 11 0 0 1 77.8 150.8'/%3E%3Cpath d='M73.6 149.0A11 11 0 0 1 69.0 139.4'/%3E%3Cpath d='M70.1 135.2A11 11 0 0 1 79.3 129.0'/%3E%3Cpath d='M83.6 129.6A11 11 0 0 1 90.9 138.4'/%3E%3Cpath d='M-1.7 -6.1A11 11 0 0 1 -12.2 1.0'/%3E%3Cpath d='M-16.7 -0.1A11 11 0 0 1 -23.0 -10.9'/%3E%3Cpath d='M-21.4 -15.8A11 11 0 0 1 -10.8 -20.9'/%3E%3Cpath d='M-6.2 -19.4A11 11 0 0 1 -1.0 -9.3'/%3E%3Cpath d='M-1.7 153.9A11 11 0 0 1 -12.2 161.0'/%3E%3Cpath d='M-16.7 159.9A11 11 0 0 1 -23.0 149.1'/%3E%3Cpath d='M-21.4 144.2A11 11 0 0 1 -10.8 139.1'/%3E%3Cpath d='M-6.2 140.6A11 11 0 0 1 -1.0 150.7'/%3E%3Cpath d='M158.3 -6.1A11 11 0 0 1 147.8 1.0'/%3E%3Cpath d='M143.3 -0.1A11 11 0 0 1 137.0 -10.9'/%3E%3Cpath d='M138.6 -15.8A11 11 0 0 1 149.2 -20.9'/%3E%3Cpath d='M153.8 -19.4A11 11 0 0 1 159.0 -9.3'/%3E%3Cpath d='M158.3 153.9A11 11 0 0 1 147.8 161.0'/%3E%3Cpath d='M143.3 159.9A11 11 0 0 1 137.0 149.1'/%3E%3Cpath d='M138.6 144.2A11 11 0 0 1 149.2 139.1'/%3E%3Cpath d='M153.8 140.6A11 11 0 0 1 159.0 150.7'/%3E%3C/g%3E%3Cg fill='%232e1b0d'%3E%3Cellipse cx='60' cy='36' rx='5.4' ry='3.6'/%3E%3Cellipse cx='104' cy='60' rx='4.9' ry='3.4'/%3E%3Cellipse cx='12' cy='82' rx='4.7' ry='3.5'/%3E%3Cellipse cx='90' cy='112' rx='4.2' ry='3.6'/%3E%3Cellipse cx='42' cy='150' rx='5.1' ry='4.3'/%3E%3Cellipse cx='134' cy='126' rx='3.7' ry='4.2'/%3E%3Cellipse cx='70' cy='104' rx='3.7' ry='3.6'/%3E%3C/g%3E%3C/svg%3E"); }
.kostya-hey { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; overflow: hidden; cursor: pointer;
  animation: kostya-hey-gone 0.01s linear 3.3s forwards; }
@keyframes kostya-hey-gone { to { visibility: hidden; } }
.kostya-curtain { position: absolute; top: 0; bottom: 0; width: 50.5%; background: #2a0b36; }
.kostya-curtain-left { left: 0; animation: kostya-left 0.9s cubic-bezier(0.7, 0, 0.3, 1) 2.35s forwards; }
.kostya-curtain-right { right: 0; animation: kostya-right 0.9s cubic-bezier(0.7, 0, 0.3, 1) 2.35s forwards; }
@keyframes kostya-left { to { transform: translateX(-100%); } }
@keyframes kostya-right { to { transform: translateX(100%); } }
.kostya-word { position: relative; margin: 0; padding: 0 4vw; font-family: var(--font-serif); font-style: italic; color: #d9b45b;
  font-size: min(12.5vw, 190px); line-height: 1.1; white-space: nowrap; animation: kostya-word-gone 0.4s cubic-bezier(0.2, 0.7, 0.2, 1) 2.2s forwards; }
.kostya-word span { display: inline-block; max-width: 0; opacity: 0; animation: kostya-y 0.01s steps(1) forwards; animation-delay: calc(0.35s + var(--i) * 0.11s); }
@keyframes kostya-y { to { max-width: 1em; opacity: 1; } }
@keyframes kostya-word-gone { to { opacity: 0; transform: scale(1.08); } }
@media (prefers-reduced-motion: reduce) { .kostya-hey { display: none; } }
.kostya-coin { position: fixed; z-index: 70; width: 30px; height: 30px; border-radius: 9999px; display: grid; place-items: center; pointer-events: none;
  background: #d9b45b; border: 3px solid #9c7a2e; color: #4a3209; font: 600 17px/1 var(--font-serif); }
`;

/** How many y's in "heyyyyyyyyyyyyy". */
const YS = 13;

/** The opening: "hey" stretches out on velvet curtains, which then part. Click, or Escape, to skip. */
export function Hey() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setGone(true), 3500);
    const skip = (e: KeyboardEvent) => e.key === "Escape" && setGone(true);
    window.addEventListener("keydown", skip);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", skip);
    };
  }, []);
  if (gone) return null;
  return (
    <div className="kostya-hey" onClick={() => setGone(true)}>
      <div aria-hidden className="kostya-curtain kostya-curtain-left" />
      <div aria-hidden className="kostya-curtain kostya-curtain-right" />
      <p aria-hidden className="kostya-word">
        he
        {Array.from({ length: YS }, (_, i) => (
          <span key={i} style={{ "--i": i } as CSSProperties}>
            y
          </span>
        ))}
      </p>
      <button
        type="button"
        onClick={() => setGone(true)}
        className="absolute bottom-6 right-6 text-sm text-[#cdb9d6] underline-offset-4 hover:underline"
      >
        Skip the intro
      </button>
    </div>
  );
}

/**
 * His portrait in a gold frame on a leopard mat, with the essentials drawn on: shades and a chain.
 * Drawn for this photo (a 1024 square), so they sit on his eyes and collar at any size.
 */
export function Portrait({ src }: { src: string }) {
  return (
    <figure className="relative mx-auto w-full max-w-[460px]">
      <div className="kostya-leopard p-[7%]">
        <div className="relative border-[12px] border-[var(--k-gold)] bg-[#f1e2bf] outline outline-4 -outline-offset-[16px] outline-[var(--k-gold-deep)]">
          <img
            src={src}
            alt="Kostya, in shades and a gold chain"
            width={1024}
            height={1024}
            className="block aspect-square w-full object-cover mix-blend-multiply"
          />
          <svg viewBox="0 0 1024 1024" aria-hidden className="absolute inset-0 h-full w-full">
            {/* The chain comes out from under his collar and hangs over the shirt, with his initial. */}
            <path d="M402 688 C418 930 606 930 622 676" fill="none" stroke="#9c7a2e" strokeWidth="13" strokeLinecap="round" />
            <path d="M402 688 C418 930 606 930 622 676" fill="none" stroke="#e7c76f" strokeWidth="9" strokeLinecap="round" strokeDasharray="13 7" />
            <circle cx="512" cy="872" r="40" fill="#d9b45b" stroke="#9c7a2e" strokeWidth="7" />
            <text x="512" y="889" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="50" fill="#5b3d0c">
              K
            </text>
            {/* The shades */}
            <g transform="rotate(-2.6 508 361)">
              <path d="M369 342 L318 352 M648 336 L708 346" stroke="#9c7a2e" strokeWidth="9" strokeLinecap="round" />
              <path d="M497 348 Q508 336 520 348" fill="none" stroke="#d9b45b" strokeWidth="8" strokeLinecap="round" />
              <rect x="367" y="322" width="132" height="84" rx="34" fill="#160b1c" stroke="#d9b45b" strokeWidth="7" />
              <rect x="518" y="316" width="132" height="84" rx="34" fill="#160b1c" stroke="#d9b45b" strokeWidth="7" />
              <path d="M392 340 L428 336 M543 334 L579 330" stroke="#fff" strokeOpacity="0.45" strokeWidth="7" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>
      <figcaption className="relative mx-auto -mt-4 w-fit bg-[var(--k-gold)] px-5 py-2 font-serif text-[17px] italic text-[#3a2412]">
        Kostya, at work. Oil on velvet.
      </figcaption>
    </figure>
  );
}

const TIP = 20;
const TIP_KEY = "emfc-kostya-tips";
const TIP_LINES = [
  "Kostya noticed.",
  "He's counting it in front of you.",
  "Kostya appreciates your business.",
  "That's how he likes it.",
  "You're a regular now.",
  "The ring finger is getting crowded.",
  "Okay, he's buying another coat.",
  "Kostya always gets paid. Thank you for understanding.",
  "He tipped his hat to you. It's a fur hat.",
  "Legendary. Kostya will remember this.",
];

/** Gold coins thrown up from the button. Nothing moves with reduced motion. */
function coins(from: HTMLElement | null, count = 14) {
  if (!from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = from.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const coin = document.createElement("span");
    coin.className = "kostya-coin";
    coin.textContent = "€";
    coin.setAttribute("aria-hidden", "true");
    coin.style.left = `${r.left + r.width / 2}px`;
    coin.style.top = `${r.top}px`;
    document.body.appendChild(coin);
    const dx = (Math.random() - 0.5) * 420;
    const up = 120 + Math.random() * 180;
    const spin = (Math.random() - 0.5) * 900;
    const fall = window.innerHeight - r.top + 80;
    coin.animate(
      [
        { transform: "translate(-50%, 0) rotate(0deg)" },
        { transform: `translate(calc(-50% + ${dx * 0.5}px), ${-up}px) rotate(${spin * 0.4}deg)`, offset: 0.3 },
        { transform: `translate(calc(-50% + ${dx}px), ${fall}px) rotate(${spin}deg)` },
      ],
      { duration: 1300 + Math.random() * 600, easing: "cubic-bezier(0.3, 0, 0.6, 1)" },
    ).onfinish = () => coin.remove();
  }
}

/** The tip jar: every tip is €20 of pretend money, and Kostya's gratitude grows. Kept in this browser. */
export function TipJar() {
  const [total, setTotal] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    try {
      setTotal(Number(localStorage.getItem(TIP_KEY) ?? 0) || 0);
    } catch {
      // Private mode: start from nothing. Kostya hates that.
    }
  }, []);
  const tip = () => {
    const next = total + TIP;
    setTotal(next);
    try {
      localStorage.setItem(TIP_KEY, String(next));
    } catch {
      // Private mode: the tip still counts, just not for long.
    }
    coins(button.current);
  };
  const tips = total / TIP;
  return (
    <div className="flex flex-col items-center gap-6">
      <button
        ref={button}
        type="button"
        onClick={tip}
        className="btn bg-[var(--k-gold)] text-[#2a0b36] transition-transform hover:brightness-105 active:scale-95"
      >
        Tip Kostya €{TIP}
      </button>
      <p aria-live="polite" className="min-h-[1.6em] text-center font-serif text-2xl italic text-[var(--k-gold)] md:text-3xl">
        {tips > 0 ? TIP_LINES[Math.min(tips, TIP_LINES.length) - 1] : ""}
      </p>
      <p className="text-center text-base text-[var(--k-lilac)]">
        {tips > 0 ? `You've tipped Kostya €${total} so far.` : "Nothing tipped yet. He has noticed that too."}
      </p>
    </div>
  );
}
