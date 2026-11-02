import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "header" | "article";
};

/**
 * Marks the page as running its scripts ("reveal-ready"), which switches off the no-script fallback in
 * styles.css so entrances play as content scrolls into view. On a slow load the fallback may already
 * have shown some content: that content is marked as shown first, so it doesn't hide again.
 */
function armReveals() {
  const root = document.documentElement;
  if (root.classList.contains("reveal-ready")) return;
  document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])").forEach((el) => {
    if (getComputedStyle(el).opacity === "1") el.setAttribute("data-shown", "");
  });
  root.classList.add("reveal-ready");
}

/**
 * Fades its content up once it scrolls into view. The content is in the page from the start: it is only
 * hidden while the page is marked as allowed to animate (the "motion" class, set before paint), so it
 * stays visible with reduced motion and without JavaScript, and if the scripts never run, styles.css
 * shows anything still hidden after three seconds.
 */
export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
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
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

const parentVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function StaggerGrid({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      variants={parentVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
