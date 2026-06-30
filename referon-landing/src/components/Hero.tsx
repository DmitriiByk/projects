import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { assets } from "../lib/assets";
import { Header } from "./Header";
import { GlossyButton } from "./GlossyButton";
import { useArmed } from "../hooks/useArmed";

export function Hero() {
  const armed = useArmed();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax layers — foreground card moves most, glow least.
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const cardScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const headingY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      ref={ref}
      className="grain relative h-[1009px] w-full overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(181.5deg, #161b40 0.24%, #353989 44.67%, #9499d4 72%, #cecfe3 100%)",
      }}
    >
      {/* animated aurora */}
      <div className="aurora" />

      {/* drifting accent orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-60px] top-[140px] size-[220px] rounded-full opacity-50 blur-[50px] [animation:blob_12s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,121,0,0.6), rgba(89,92,216,0.2) 60%, transparent 75%)",
        }}
      />

      {/* decorative light streaks from Figma (top-left) */}
      <img
        src={assets.heroDeco1}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[-168px] top-[-226px] w-[641px] opacity-80 mix-blend-screen"
      />
      <img
        src={assets.heroDeco2}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[-312px] top-[-165px] w-[464px] opacity-70 mix-blend-screen"
      />

      <Header />

      {/* indigo glow behind the floating card */}
      <motion.div
        aria-hidden
        style={{ y: glowY }}
        className="pointer-events-none absolute left-1/2 top-[640px] h-[420px] w-[330px] -translate-x-1/2 rounded-full bg-[#4a4ebd] opacity-70 blur-[80px]"
      />

      {/* headline + copy */}
      <motion.div
        variants={stagger}
        initial={armed ? "hidden" : "show"}
        animate="show"
        style={{ y: headingY, opacity: headingOpacity }}
        className="absolute left-[40px] top-[180px] z-20 w-[364px]"
      >
        <motion.h1
          variants={item}
          className="font-display text-[44px] font-semibold leading-[48px] text-white text-balance [text-shadow:0_2px_30px_rgba(89,92,216,0.45)]"
        >
          Your{" "}
          <span className="text-[53px] font-medium text-[#ff7900]">
            affiliate program
          </span>
          , finally under control
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-[20px] w-[360px] font-display text-[16px] leading-[23px] tracking-[-0.24px] text-white/60"
        >
          The next-gen affiliate platform for iGaming operators. Manage multiple
          brands, automate complex commissions, and track data in real time.
        </motion.p>
        <motion.div variants={item} className="mt-[40px]">
          <GlossyButton label="Book live demo" />
        </motion.div>
      </motion.div>

      {/* floating product card (parallax) */}
      <motion.div
        style={{ y: cardY, scale: cardScale }}
        initial={armed ? { opacity: 0, y: 60, rotate: -3 } : false}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1.1, delay: armed ? 0.5 : 0, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute left-1/2 top-[470px] z-10 w-[541px] -translate-x-1/2"
      >
        <motion.img
          src={assets.heroCardMain}
          alt="ReferOn payment & deposits dashboard"
          className="w-full select-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
          draggable={false}
          // top ~46% (the whole payment card) is clipped — the DOM MorphCard
          // renders it instead and flattens into the next section on scroll
          style={reduce ? undefined : { clipPath: "inset(46% 0 0 0)" }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* "how it works" + caption */}
      <motion.div
        initial={armed ? { opacity: 0, y: 16 } : false}
        whileInView={armed ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute left-1/2 top-[912px] z-20 flex -translate-x-1/2 flex-col items-center text-center"
      >
        <a
          href="#how"
          className="font-ui text-[13px] font-bold uppercase tracking-wide text-[#d2d2d2] underline underline-offset-4 transition-colors hover:text-white"
        >
          how it works
        </a>
        <p className="mt-[14px] font-mono-ui text-[10px] leading-[15px] text-white/50">
          Migrating, launching, or integrating?
          <br />
          We can map the right setup first.
        </p>
      </motion.div>
    </section>
  );
}
