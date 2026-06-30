import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { assets } from "../lib/assets";

type Setup = {
  title: string;
  blurb: string;
  features: string[];
  accent: string;
  tint: string;
};

const SETUPS: Setup[] = [
  {
    title: "Casino",
    blurb: "Real-time GGR, NGR and deposit tracking built for casino brands.",
    features: ["GGR / NGR / deposits", "Bonus cost control", "Player-level drill-down"],
    accent: "#fb6000",
    tint: "rgba(251,96,0,0.16)",
  },
  {
    title: "Sportsbook",
    blurb: "Per-market commission logic with live, bet-level reporting.",
    features: ["Per-market commissions", "Bet-level reporting", "Live margin & risk"],
    accent: "#595cd8",
    tint: "rgba(89,92,216,0.16)",
  },
  {
    title: "Affiliate Network",
    blurb: "Sub-affiliate hierarchies, payouts and fraud controls in one place.",
    features: ["Sub-affiliate trees", "Automated payouts", "Fraud & traffic checks"],
    accent: "#3b6fd4",
    tint: "rgba(59,111,212,0.16)",
  },
  {
    title: "Multi-brand",
    blurb: "Run every brand from one console with shared, unified analytics.",
    features: ["One unified console", "Cross-brand analytics", "Shared media library"],
    accent: "#7c4dd8",
    tint: "rgba(124,77,216,0.16)",
  },
];

const CARD_W = 300;
const GAP = 20;
const STEP = CARD_W + GAP;
const VIEW = 440;
const LEFT_PAD = 20;
const SPREAD_END = 0.3;
// translate so the last card lands fully in view with right padding
const MAX_X = VIEW - LEFT_PAD - (LEFT_PAD + (SETUPS.length - 1) * STEP + CARD_W);
// during the stack phase the pile is centered
const PILE_X = (VIEW - CARD_W) / 2 - LEFT_PAD;

function Check({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={color} opacity="0.16" />
      <path
        d="M4.7 8.2l2 2 4.6-4.6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowChip({ accent }: { accent: string }) {
  return (
    <span
      className="flex size-[40px] items-center justify-center overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-110"
      style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
    >
      <span
        className="size-[18px] bg-white transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
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
  );
}

function CardFace({ s }: { s: Setup }) {
  return (
    <div
      className="grad-border group relative flex h-[380px] w-[300px] flex-col overflow-hidden rounded-[24px] bg-white/65 p-[26px] shadow-[0_24px_50px_-18px_rgba(50,55,132,0.45)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_34px_70px_-20px_rgba(50,55,132,0.55)]"
      style={
        {
          "--gb-from": s.accent,
          "--gb-via": "rgba(255,255,255,0.5)",
          "--gb-to": "rgba(255,255,255,0.1)",
        } as React.CSSProperties
      }
    >
      {/* accent glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-[160px] rounded-full opacity-70 blur-[40px]"
        style={{ background: s.tint }}
      />
      <span
        className="mb-[18px] inline-flex w-fit items-center gap-[6px] rounded-full px-[10px] py-[5px] text-[11px] font-semibold uppercase tracking-wide"
        style={{ background: s.tint, color: s.accent }}
      >
        <span className="size-[6px] rounded-full" style={{ background: s.accent }} />
        Setup
      </span>
      <h3 className="font-display text-[26px] font-semibold leading-[30px] text-ink text-balance">
        {s.title}
      </h3>
      <p className="mt-[10px] font-display text-[15px] leading-[21px] tracking-[-0.2px] text-ink/70">
        {s.blurb}
      </p>
      <ul className="mt-auto flex flex-col gap-[10px]">
        {s.features.map((f) => (
          <li key={f} className="flex items-center gap-[10px] text-[14px] text-ink/80">
            <Check color={s.accent} />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-[18px] flex items-center justify-between">
        <span className="text-[13px] font-semibold" style={{ color: s.accent }}>
          Explore
        </span>
        <ArrowChip accent={s.accent} />
      </div>
    </div>
  );
}

function GalleryCard({
  s,
  index,
  spreadP,
}: {
  s: Setup;
  index: number;
  spreadP: MotionValue<number>;
}) {
  const x = useTransform(spreadP, (v) => (1 - v) * (-index * STEP));
  const y = useTransform(spreadP, (v) => (1 - v) * (index * 8));
  const rotate = useTransform(spreadP, (v) => (1 - v) * ((index - 1.5) * 8));
  const scale = useTransform(spreadP, (v) => 0.86 + v * 0.14);

  return (
    <motion.div
      style={{ x, y, rotate, scale, zIndex: SETUPS.length - index }}
      className="relative shrink-0"
    >
      <CardFace s={s} />
    </motion.div>
  );
}

/** Reduced-motion / fallback: a plain native horizontal scroll-snap row. */
function StaticRow() {
  return (
    <section className="bg-white pb-[60px] pt-[20px]">
      <div className="px-[32px]">
        <h3 className="font-display text-[24px] font-semibold text-ink">
          Choose your setup
        </h3>
      </div>
      <div className="mt-[20px] flex snap-x snap-mandatory gap-[20px] overflow-x-auto px-[20px] pb-[16px] [scrollbar-width:none]">
        {SETUPS.map((s) => (
          <div key={s.title} className="snap-center">
            <CardFace s={s} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SetupsGallery() {
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start start", "end end"],
  });

  const trackX = useTransform(
    scrollYProgress,
    [0, SPREAD_END, 1],
    [PILE_X, 0, MAX_X]
  );
  const spreadP = useTransform(scrollYProgress, [0, SPREAD_END], [0, 1]);
  const fill = useTransform(scrollYProgress, [SPREAD_END, 1], [0, 1]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);

  if (reduce) return <StaticRow />;

  return (
    <section ref={wrap} className="relative h-[300vh] bg-white">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        {/* compact header + progress */}
        <motion.div style={{ opacity: labelOpacity }} className="px-[32px]">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Built for your vertical
          </span>
          <h3 className="mt-[8px] font-display text-[30px] font-semibold leading-[34px] text-ink text-balance">
            Choose your setup
          </h3>
          <div className="mt-[18px] h-[3px] w-[120px] overflow-hidden rounded-full bg-black/10">
            <motion.div
              style={{ scaleX: fill }}
              className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[#595cd8] to-[#fb6000]"
            />
          </div>
        </motion.div>

        {/* horizontal track */}
        <motion.div
          style={{ x: trackX, paddingLeft: LEFT_PAD }}
          className="mt-[34px] flex items-center gap-[20px]"
        >
          {SETUPS.map((s, i) => (
            <GalleryCard key={s.title} s={s} index={i} spreadP={spreadP} />
          ))}
        </motion.div>

        <div className="px-[32px] pt-[28px] text-[13px] text-ink/45">
          Scroll to browse setups ↓
        </div>
      </div>
    </section>
  );
}
