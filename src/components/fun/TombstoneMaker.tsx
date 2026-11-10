import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Em, Eyebrow } from "@/components/site/ui";
import { IMAGES } from "@/lib/site";
import { markPlayed } from "./career";
import { INK, loadImage, SANS, SERIF, shareImage, spaced, wrap } from "./cards";
import { useHashTarget } from "./useHashTarget";

const VERBS = ["has acquired", "has merged with", "has sold", "has raised", "has refinanced"];
const ROLES = [
  "Financial adviser to the buyer",
  "Financial adviser to the seller",
  "Sole bookrunner",
  "Lead arranger",
  "Moral support",
];

type Deal = {
  buyer: string;
  verb: string;
  target: string;
  value: string;
  role: string;
  adviser: string;
};

const W = 1080;
const H = 1350;

/** A tombstone, the way banks announce a closed deal: centred, framed, "a matter of record only". */
async function draw(canvas: HTMLCanvasElement, deal: Deal) {
  await Promise.all([
    document.fonts.load(`500 80px ${SERIF}`),
    document.fonts.load(`500 28px ${SANS}`),
  ]).catch(() => {});
  const bull = await loadImage(IMAGES.bullMark).catch(() => null);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = INK.paper;
  ctx.fillRect(0, 0, W, H);
  // The double rule of a classic tombstone.
  ctx.strokeStyle = INK.night;
  ctx.lineWidth = 6;
  ctx.strokeRect(56, 56, W - 112, H - 112);
  ctx.lineWidth = 2;
  ctx.strokeRect(78, 78, W - 156, H - 156);
  ctx.textAlign = "center";
  ctx.fillStyle = INK.mute;
  ctx.font = `500 22px ${SANS}`;
  spaced(ctx, "THIS ANNOUNCEMENT APPEARS AS A MATTER OF RECORD ONLY", W / 2, 170, 3.2);
  if (bull) ctx.drawImage(bull, W / 2 - 55, 230, 110, 100);
  ctx.fillStyle = INK.ink;
  ctx.font = `500 84px ${SERIF}`;
  let y = wrap(ctx, deal.buyer || "Your company", W / 2, 470, 860, 88);
  ctx.font = `italic 400 46px ${SERIF}`;
  ctx.fillStyle = INK.bull;
  ctx.fillText(deal.verb, W / 2, y + 28);
  ctx.fillStyle = INK.ink;
  ctx.font = `500 84px ${SERIF}`;
  y = wrap(ctx, deal.target || "Its target", W / 2, y + 140, 860, 88);
  if (deal.value) {
    ctx.font = `500 48px ${SANS}`;
    ctx.fillText(deal.value, W / 2, y + 60);
    y += 90;
  }
  ctx.strokeStyle = INK.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 160, y + 50);
  ctx.lineTo(W / 2 + 160, y + 50);
  ctx.stroke();
  ctx.fillStyle = INK.ink;
  ctx.font = `600 40px ${SERIF}`;
  ctx.fillText(deal.adviser || "EMFC", W / 2, y + 130);
  ctx.fillStyle = INK.mute;
  ctx.font = `500 22px ${SANS}`;
  spaced(ctx, deal.role.toUpperCase(), W / 2, y + 178, 4);
  const month = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  ctx.font = `400 26px ${SANS}`;
  ctx.fillText(month, W / 2, H - 150);
  ctx.font = `400 20px ${SANS}`;
  ctx.fillText("Made at emfc.es, not a real deal", W / 2, H - 112);
}

/** "Tombstone maker" on the Off the clock page: announce a deal of your own, banker style. */
export function TombstoneMaker() {
  useHashTarget("tombstone");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [deal, setDeal] = useState<Deal>({
    buyer: "EMFC Capital",
    verb: VERBS[0],
    target: "Your free time",
    value: "€0.00",
    role: ROLES[0],
    adviser: "Your name",
  });
  const set = (key: keyof Deal) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDeal((d) => ({ ...d, [key]: e.target.value.slice(0, 48) }));

  useEffect(() => {
    if (canvas.current) void draw(canvas.current, deal);
  }, [deal]);

  const save = () =>
    canvas.current?.toBlob((blob) => {
      if (!blob) return;
      markPlayed("tombstone");
      void shareImage(
        blob,
        "emfc-tombstone.png",
        "Deal closed. Made my own tombstone at emfc.es/play",
      );
    }, "image/png");

  const field = "h-12 w-full rounded border border-mute bg-field px-3 text-[15px] text-ink";
  const label = "caps text-[10px] tracking-[0.2em] text-mute";

  return (
    <section id="tombstone" className="scroll-mt-24 bg-stone">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow>Deal toys</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[80px]/[0.95]">
            Tombstone <Em>maker</Em>
          </h2>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            When a deal closes, banks announce it with a tombstone: who bought what, for how much,
            and who advised. Announce your own.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={label}>Buyer</span>
              <input className={field} value={deal.buyer} onChange={set("buyer")} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={label}>Deal</span>
              <select className={field} value={deal.verb} onChange={set("verb")}>
                {VERBS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={label}>Target</span>
              <input className={field} value={deal.target} onChange={set("target")} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={label}>Value</span>
              <input className={field} value={deal.value} onChange={set("value")} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={label}>Adviser</span>
              <input className={field} value={deal.adviser} onChange={set("adviser")} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={label}>Role</span>
              <select className={field} value={deal.role} onChange={set("role")}>
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="flex flex-col items-center gap-5 lg:col-span-6 lg:col-start-7">
          <canvas
            ref={canvas}
            width={W}
            height={H}
            aria-label={`Tombstone: ${deal.buyer} ${deal.verb} ${deal.target}`}
            className="h-auto w-full max-w-[400px] shadow-[0_20px_50px_rgb(0_0_0/0.18)]"
          />
          <button type="button" onClick={save} className="btn btn-sm btn-ink">
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Download your tombstone
          </button>
        </div>
      </div>
    </section>
  );
}
