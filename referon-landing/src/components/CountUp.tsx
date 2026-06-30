import { useEffect, useRef } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useTransform,
  motion,
} from "framer-motion";
import { useArmed } from "../hooks/useArmed";

/** Counts from 0 → value once it scrolls into view (when the tab is visible). */
export function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const armed = useArmed();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (!armed || !inView) return;
    const controls = animate(count, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [armed, inView, value, count]);

  // Tab not visible → render the final value directly (never a stuck "0").
  if (!armed) {
    return (
      <span ref={ref} className={className}>
        {value.toLocaleString()}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
