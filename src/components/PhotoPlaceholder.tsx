import { ImageIcon } from "lucide-react";

type Props = {
  ratio?: "video" | "wide" | "square" | "portrait";
  label?: string;
  className?: string;
};

const ratioClass: Record<NonNullable<Props["ratio"]>, string> = {
  video: "aspect-video",
  wide: "aspect-[21/9]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
};

/**
 * Neutral photography placeholder. Correct aspect ratio, object-cover safe,
 * never stretches. Swap for a real <img className="h-full w-full object-cover" />
 * when real photography is available.
 */
export function PhotoPlaceholder({ ratio = "video", label = "Photo coming soon", className = "" }: Props) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-sm border border-border bg-[var(--cream)] ${ratioClass[ratio]} ${className}`}
      aria-label={label}
      role="img"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(11,31,58,0.04) 0 12px, rgba(11,31,58,0) 12px 24px)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <ImageIcon className="h-6 w-6 opacity-60" aria-hidden />
        <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
      </div>
    </div>
  );
}
