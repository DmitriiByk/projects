import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useArmed } from "../hooks/useArmed";

type Direction = "up" | "down" | "left" | "right" | "none";

const offset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 36 },
  down: { y: -36 },
  left: { x: 36 },
  right: { x: -36 },
  none: {},
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
  amount = 0.3,
  once = true,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  amount?: number;
  once?: boolean;
}) {
  const armed = useArmed();

  // Until armed (tab visible), render in the resting/visible state so content
  // never gets trapped behind a paused animation.
  return (
    <motion.div
      className={className}
      initial={armed ? { opacity: 0, ...offset[direction] } : false}
      whileInView={armed ? { opacity: 1, x: 0, y: 0 } : undefined}
      viewport={{ once, amount }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
