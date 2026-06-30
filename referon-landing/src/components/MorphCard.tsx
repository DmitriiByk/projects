import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/** The "3,450 EUR" payment card, rebuilt as DOM so it can morph 3D → flat. */
export function PaymentCard() {
  return (
    <div className="w-[320px] rounded-[18px] border border-black/5 bg-white p-[18px] font-mono-ui text-[#131313]">
      <div className="flex items-center gap-[8px]">
        <span className="text-[22px] font-bold tracking-tight">3,450 EUR</span>
        <span className="ml-auto inline-flex items-center gap-[5px] rounded-[7px] bg-[#fff3e3] px-[8px] py-[4px] text-[10px] font-medium text-[#e07b1a]">
          <span className="text-[11px] leading-none">↻</span>
          Ready for processing
        </span>
      </div>

      <div className="mt-[12px] grid grid-cols-3 gap-[8px] text-[10px]">
        {[
          ["ID", "436612"],
          ["Type", "Commission"],
          ["Company", "Avocado Production, Ltd."],
        ].map(([k, v]) => (
          <div key={k}>
            <div className="text-black/40">{k}</div>
            <div className="mt-[2px] font-medium text-black/80">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-[14px] border-t border-black/[0.07] pt-[12px]">
        <p className="text-[13px] font-bold">Payment breakdown</p>
        <div className="mt-[10px] flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-[5px] text-black/45">
            Total amount
            <span className="grid size-[12px] place-items-center rounded-full bg-black/10 text-[8px] text-black/50">
              ?
            </span>
          </span>
          <span className="text-[13px] font-semibold">3,450 EUR</span>
        </div>

        <div className="mt-[12px] grid grid-cols-2 gap-x-[16px] gap-y-[12px] text-[11px]">
          {[
            ["Amount", "3,450 EUR"],
            ["Tax", "0 EUR"],
            ["Currency amount", "3,450 EUR"],
            ["Conversion rate", "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-black/45">{k}</div>
              <div className="mt-[2px] font-medium">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Drives a single PaymentCard from a tilted "3D" pose in the hero to a flat
 * pose down in the Setups intro, as one continuous element on scroll.
 * Page-absolute inside `.device`; the same node travels + flattens.
 */
export function MorphCardLayer() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const p = useTransform(scrollY, [120, 820], [0, 1]);
  const rotateX = useTransform(p, [0, 1], [23, 0]);
  const rotateZ = useTransform(p, [0, 1], [-6, 0]);
  const scale = useTransform(p, [0, 1], [1.08, 0.9]);
  const y = useTransform(p, [0, 1], [-642, 0]);
  const x = useTransform(p, [0, 1], [-8, 0]);

  if (reduce) return null;

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[1150px] z-[14] -translate-x-1/2"
      style={{ perspective: 900 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateZ,
          scale,
          y,
          x,
          transformStyle: "preserve-3d",
        }}
        className="rounded-[18px] shadow-[0px_36px_60px_rgba(30,30,60,0.32)]"
      >
        <PaymentCard />
      </motion.div>
    </div>
  );
}
