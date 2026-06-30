import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { LineReveal } from "./LineReveal";
import { useArmed } from "../hooks/useArmed";

const BADGES = ["SiGMA 2025", "EGR B2B", "iGB Affiliate", "AffiliateCon"];

export function Awards() {
  const armed = useArmed();
  return (
    <section className="w-full bg-white px-[16px] py-[24px]">
      <div className="sheen grain relative overflow-hidden rounded-[24px] bg-[#10132d] px-[28px] py-[48px]">
        {/* conic glow + aurora — kept subtle so the panel stays deep navy */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-[200px] rounded-full opacity-[0.18] blur-[44px]">
          <div className="conic-glow size-full rounded-full" />
        </div>
        <div className="aurora opacity-[0.14]" />

        <div className="relative z-10">
          <Reveal>
            <span className="inline-flex items-center gap-[8px] rounded-full border border-white/15 bg-white/5 px-[12px] py-[7px] font-display text-[12px] font-medium uppercase tracking-wide text-white/80">
              <span className="size-[6px] rounded-full bg-[#ff7900]" />
              Recognition
            </span>
          </Reveal>
          <LineReveal
            className="mt-[16px] font-display text-[32px] font-semibold leading-[36px] text-white"
            lines={[
              "Built to win.",
              <>
                <span className="text-[#ff7900]">Recognized</span> by experts
              </>,
            ]}
            delay={0.05}
          />
          <Reveal delay={0.18}>
            <p className="mt-[16px] max-w-[376px] font-display text-[16px] leading-[23px] tracking-[-0.24px] text-white/65 text-pretty">
              Shortlisted and awarded across the industry's biggest stages —
              ReferOn is the platform iGaming teams trust to scale their
              affiliate programs with confidence.
            </p>
          </Reveal>

          {/* award badges */}
          <div className="mt-[28px] flex flex-wrap gap-[10px]">
            {BADGES.map((b, i) => (
              <motion.span
                key={b}
                initial={armed ? { opacity: 0, y: 14, scale: 0.96 } : false}
                whileInView={armed ? { opacity: 1, y: 0, scale: 1 } : undefined}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="grad-border rounded-full bg-white/[0.06] px-[14px] py-[8px] text-[13px] font-medium text-white/85"
                style={
                  {
                    "--gb-from": "rgba(255,121,0,0.6)",
                    "--gb-via": "rgba(255,255,255,0.2)",
                    "--gb-to": "rgba(89,92,216,0.5)",
                  } as React.CSSProperties
                }
              >
                {b}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
