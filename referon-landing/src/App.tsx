import { useEffect } from "react";
import { motion, useMotionValue, useScroll, useSpring } from "framer-motion";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { Hero } from "./components/Hero";
import { MorphCardLayer } from "./components/MorphCard";
import { Setups } from "./components/Setups";
import { Stats } from "./components/Stats";
import { Awards } from "./components/Awards";
import { LogoMarquee } from "./components/LogoMarquee";
import { Footer } from "./components/Footer";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-[#fb6000] via-[#ff7900] to-[#595cd8]"
    />
  );
}

/** Soft glow that trails the cursor — desktop only. */
function SpotlightCursor() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 180, damping: 22 });
  const sy = useSpring(y, { stiffness: 180, damping: 22 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX - 150);
      y.set(e.clientY - 150);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-40 hidden size-[300px] rounded-full opacity-50 mix-blend-screen blur-[40px] md:block"
    >
      <div className="size-full rounded-full bg-[radial-gradient(circle,rgba(89,92,216,0.5),transparent_70%)]" />
    </motion.div>
  );
}

export default function App() {
  useSmoothScroll();

  return (
    <>
      <ScrollProgress />
      <SpotlightCursor />
      <main className="device">
        <MorphCardLayer />
        <Hero />
        <Setups />
        <Stats />
        <Awards />
        <LogoMarquee />
        <Footer />
      </main>
    </>
  );
}
