import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { assets } from "../lib/assets";

/**
 * The signature glossy pill button.
 * Magnetic: the whole button drifts slightly toward the cursor,
 * the arrow chip swaps orange→indigo on hover and nudges right.
 */
export function GlossyButton({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 10);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      onPointerMove={onMove}
      onPointerLeave={reset}
      whileTap={{ scale: 0.97 }}
      style={{ x: sx, y: sy }}
      className={`glossy-orange group relative flex h-[56px] w-[211px] items-center rounded-[100px] p-[2px] ${className}`}
    >
      <span className="pl-[22px] font-ui text-[15px] font-bold uppercase tracking-wide text-white">
        {label}
      </span>
      <span className="chip-indigo absolute right-[8px] top-1/2 flex size-[40px] -translate-y-1/2 items-center justify-center overflow-hidden rounded-full transition-[background] duration-300 group-hover:[background:linear-gradient(90deg,#fb6000,#992307)]">
        <span
          className="size-[20px] bg-white transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
          style={{
            maskImage: `url(${assets.arrowIcon})`,
            WebkitMaskImage: `url(${assets.arrowIcon})`,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
      </span>
    </motion.button>
  );
}
