import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "header" | "article";
  /**
   * Stays in place and visible: only the lines inside it (the classes grow-x, grow-y and wipe-in,
   * styles.css) wait for it to scroll into view.
   */
  still?: boolean;
  "aria-hidden"?: boolean;
};

/**
 * Marks the page as running its scripts ("reveal-ready"), which switches off the no-script fallback in
 * styles.css so entrances play as content scrolls into view. On a slow load the fallback may already
 * have shown some content: that content is marked as shown first, so it doesn't hide again.
 */
function armReveals() {
  const root = document.documentElement;
  if (root.classList.contains("reveal-ready")) return;
  document.querySelectorAll<HTMLElement>('[data-reveal=""]:not([data-shown])').forEach((el) => {
    if (getComputedStyle(el).opacity === "1") el.setAttribute("data-shown", "");
  });
  root.classList.add("reveal-ready");
}

/**
 * Fades its content up once it scrolls into view. The content is in the page from the start: it is only
 * hidden while the page is marked as allowed to animate (the "motion" class, set before paint), so it
 * stays visible with reduced motion and without JavaScript, and if the scripts never run, styles.css
 * shows anything still hidden after three seconds. Lines inside it with the classes grow-x, grow-y or
 * wipe-in grow in at the same moment.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  still = false,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    armReveals();
    if (el.hasAttribute("data-shown")) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.setAttribute("data-shown", "");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as never}
      data-reveal={still ? "still" : ""}
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
