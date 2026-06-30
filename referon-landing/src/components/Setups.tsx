import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { assets } from "../lib/assets";
import { Reveal } from "./Reveal";
import { LineReveal } from "./LineReveal";
import { GlossyButton } from "./GlossyButton";
import { SetupsGallery } from "./SetupsGallery";
import { PaymentCard } from "./MorphCard";

export function Setups() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const mockupX = useTransform(scrollYProgress, [0, 1], [50, -90]);

  return (
    <>
      <section
        id="how"
        ref={ref}
        className="relative w-full pt-[20px]"
        style={{
          backgroundImage:
            "linear-gradient(181deg, #cecfe3 0%, #eef0fb 14%, #ffffff 34%)",
        }}
      >
        {/* landing zone for the morphing payment card (rendered in App layer).
            Reduced-motion users get a static flat card here instead. */}
        <div className="relative mx-auto flex h-[470px] w-[440px] items-center justify-center">
          <div className="absolute left-1/2 top-[150px] h-[260px] w-[300px] -translate-x-1/2 rounded-full bg-[#595cd8]/10 blur-[55px]" />
          {reduce && (
            <div className="relative rounded-[18px] shadow-[0px_36px_60px_rgba(30,30,60,0.18)]">
              <PaymentCard />
            </div>
          )}
        </div>

        {/* heading */}
        <div className="px-[32px]">
          <Reveal>
            <span
              className="inline-flex items-center gap-[8px] rounded-full px-[12px] py-[7px] font-display text-[12px] font-medium uppercase tracking-wide text-ink"
              style={{
                backgroundImage:
                  "linear-gradient(131deg, #f8f8ff 3%, #d9dbff 66%)",
              }}
            >
              <span className="size-[6px] rounded-full bg-[#fb6000]" />
              Services
            </span>
          </Reveal>
          <LineReveal
            className="mt-[26px] font-display text-[32px] font-semibold leading-[36px] text-ink"
            lines={["Built for different", "affiliate setups"]}
            delay={0.05}
          />
          <Reveal delay={0.18}>
            <p className="mt-[16px] max-w-[376px] font-display text-[16px] leading-[23px] tracking-[-0.24px] text-ink/75 text-pretty">
              The next-gen affiliate platform for iGaming operators. Manage
              multiple brands, automate complex commissions, and track data in
              real time.
            </p>
          </Reveal>
        </div>

        {/* wide dashboard mockup in a glass frame */}
        <Reveal direction="none" className="mt-[36px] px-[16px]">
          <motion.div
            style={{ x: mockupX }}
            className="grad-border relative rounded-[16px] bg-white/40 p-[5px] shadow-[0_30px_70px_-24px_rgba(50,55,132,0.5)] backdrop-blur-md"
          >
            <img
              src={assets.dashboardMockup}
              alt="ReferOn analytics dashboard"
              draggable={false}
              className="w-[800px] max-w-none rounded-[12px]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[140px] rounded-b-[16px] bg-gradient-to-b from-transparent to-white" />
          </motion.div>
        </Reveal>

        <div className="mt-[40px] px-[40px]">
          <div className="beam" />
        </div>
      </section>

      {/* pinned horizontal gallery */}
      <SetupsGallery />

      {/* CTA */}
      <section className="bg-white pb-[80px] pt-[10px]">
        <Reveal className="flex flex-col items-center gap-[26px]">
          <GlossyButton label="Book live demo" />
          <a
            href="#"
            className="font-ui text-[15px] font-bold uppercase tracking-wide text-ink underline underline-offset-4"
          >
            how it works
          </a>
        </Reveal>
      </section>
    </>
  );
}
