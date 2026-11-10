import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Words that giggle: the letters hop one after another when the words, or a card around them marked
 * `group`, are hovered or focused. With `every`, they also giggle on their own now and then (the
 * Arcade's title). The motion lives in styles.css and only runs where the page may animate (the
 * "motion" class); otherwise the letters sit still. Screen readers get the words as plain text.
 */
export function Giggle({
  text,
  className,
  every,
}: {
  text: string;
  className?: string;
  /** Milliseconds between giggles on their own, starting shortly after the page loads. */
  every?: number;
}) {
  const [wave, setWave] = useState(false);
  useEffect(() => {
    if (!every) return;
    let stop: ReturnType<typeof setTimeout> | undefined;
    const giggle = () => {
      setWave(true);
      stop = setTimeout(() => setWave(false), 900 + text.length * 60);
    };
    const first = setTimeout(giggle, 700);
    const id = setInterval(giggle, every);
    return () => {
      clearTimeout(first);
      clearTimeout(stop);
      clearInterval(id);
    };
  }, [every, text.length]);

  let i = 0;
  return (
    <span className={cn("giggle", wave && "giggle-wave", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(" ").map((word, w) => (
          <span key={w}>
            {w > 0 && " "}
            <span className="whitespace-nowrap">
              {[...word].map((ch) => (
                <span key={i} className="giggle-letter" style={{ "--i": i++ } as CSSProperties}>
                  {ch}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
