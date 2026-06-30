import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { LineReveal } from "./LineReveal";
import { CountUp } from "./CountUp";
import { GlossyButton } from "./GlossyButton";

const STATS = [
  { value: 300, suffix: "K+", label: "Brands powered by ReferOn across iGaming markets", accent: "#fb6000" },
  { value: 270, suffix: "K+", label: "Operators running their affiliate programs on ReferOn", accent: "#595cd8" },
  { value: 187, suffix: "+", label: "Shortlisted since launch", accent: "#3b6fd4" },
  { value: 590, suffix: "+", label: "Industry awards won since launch", accent: "#7c4dd8" },
] as const;

export function Stats() {
  return (
    <section className="relative w-full overflow-hidden bg-white px-[24px] py-[48px]">
      {/* soft gradient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[260px]"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(89,92,216,0.10), transparent 60%), radial-gradient(120% 80% at 100% 10%, rgba(251,96,0,0.08), transparent 55%)",
        }}
      />
      <div className="relative">
        <Reveal>
          <span className="inline-flex items-center gap-[8px] rounded-full bg-[#f1f1fb] px-[12px] py-[7px] font-display text-[12px] font-medium uppercase tracking-wide text-indigo-700">
            <span className="size-[6px] rounded-full bg-[#595cd8]" />
            By the numbers
          </span>
        </Reveal>
        <LineReveal
          className="mt-[16px] font-display text-[32px] font-semibold leading-[36px] text-ink"
          lines={["Trusted at scale by", "iGaming operators"]}
          delay={0.05}
        />

        <div className="mt-[28px]">
          {STATS.map((s, i) => (
            <div key={s.label} className="group relative py-[22px]">
              <Reveal delay={i * 0.05} direction="up">
                <div className="flex items-start gap-[16px]">
                  {/* accent tick */}
                  <motion.span
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-[6px] h-[44px] w-[4px] origin-top rounded-full"
                    style={{ background: `linear-gradient(${s.accent}, ${s.accent}33)` }}
                  />
                  <div className="flex-1">
                    <span className="relative inline-block">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -inset-x-4 -inset-y-2 rounded-full opacity-60 blur-[22px]"
                        style={{ background: `${s.accent}26` }}
                      />
                      <CountUp
                        value={s.value}
                        suffix={s.suffix}
                        className="relative font-display text-[40px] font-semibold leading-none text-ink"
                      />
                    </span>
                    <p className="mt-[8px] max-w-[320px] font-display text-[16px] leading-[22px] tracking-[-0.24px] text-ink/65">
                      {s.label}
                    </p>
                  </div>
                </div>
              </Reveal>
              {/* draw-in divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="beam mt-[22px] origin-left"
              />
            </div>
          ))}
        </div>

        <Reveal className="mt-[36px] flex justify-center">
          <GlossyButton label="Book live demo" />
        </Reveal>
      </div>
    </section>
  );
}
