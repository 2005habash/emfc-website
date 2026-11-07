import type { CSSProperties } from "react";
import { LOGOS } from "@/data/logos";
import { cn } from "@/lib/utils";

/**
 * A firm's current logo, from the logo pack (src/data/logos.ts, made by tools/import-logos.py), as the
 * firm publishes it: never stretched, recoloured, filtered or cropped. The parent sets one height as
 * `--logo-h` (on a white `bg-plate`, since most logos are dark). Each logo is scaled from that height
 * for its proportions, so a wide wordmark and a square mark look the same size, and never runs wider
 * than four times the height. A firm without a logo yet, or whose logo exists only in white, shows its
 * name in text in the same place; a logo that is only a symbol gets the name beside it, as the firm's
 * own site shows it.
 */
export function FirmLogo({ name, className }: { name: string; className?: string }) {
  const logo = LOGOS[name];
  const text = "font-serif font-semibold leading-[1.1] text-plate-ink text-[length:calc(var(--logo-h,40px)*0.5)]";
  if (!logo || logo.white) return <span className={cn(text, "text-center", className)}>{name}</span>;
  const img = (
    <img
      src={logo.src}
      alt={logo.mark ? "" : name}
      width={logo.w}
      height={logo.h}
      loading="lazy"
      decoding="async"
      style={{ "--k": (logo.w / logo.h) ** -0.3 } as CSSProperties}
      className="h-[calc(var(--logo-h,40px)*var(--k))] w-auto max-w-[calc(var(--logo-h,40px)*4)] object-contain"
    />
  );
  if (!logo.mark) return <span className={cn("inline-flex", className)}>{img}</span>;
  return (
    <span className={cn("inline-flex items-center gap-[calc(var(--logo-h,40px)*0.22)]", className)}>
      {img}
      <span className={text}>{name}</span>
    </span>
  );
}
