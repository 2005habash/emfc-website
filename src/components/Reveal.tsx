import { motion, useReducedMotion, type Variants, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "header" | "article";
} & Omit<
  HTMLMotionProps<"div">,
  "initial" | "whileInView" | "viewport" | "transition" | "children"
>;

export function Reveal({ children, className, delay = 0, as = "div", ...rest }: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  if (reduce) {
    return (
      <Comp className={className} {...rest}>
        {children}
      </Comp>
    );
  }
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      // "some" rather than a fraction: tall blocks on phones can never be 20% visible at once.
      viewport={{ once: true, amount: "some", margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      {...rest}
    >
      {children}
    </Comp>
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
