import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useArmed } from "../hooks/useArmed";

/**
 * Reveals heading lines with a mask-wipe: each line slides up from behind
 * a clipped edge. Pass lines as separate children. Falls back to fully-visible
 * lines when the tab isn't visible (so the heading never ships blank).
 */
export function LineReveal({
  lines,
  className,
  delay = 0,
  stagger = 0.09,
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const armed = useArmed();

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            initial={armed ? { y: "110%" } : false}
            whileInView={armed ? { y: 0 } : undefined}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.8,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
