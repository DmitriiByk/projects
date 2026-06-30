import { useLayoutEffect, useState } from "react";

/**
 * Returns true only once it's safe to run entrance/reveal animations — i.e. the
 * document is actually visible. In a hidden/backgrounded tab or a headless
 * renderer, rAF-driven animations are paused, so a reveal that starts from a
 * hidden state would never play and the content would ship blank. Gating the
 * "hidden initial" on this flag keeps content visible by default and only
 * arms the reveal when it can actually complete.
 */
export function useArmed(): boolean {
  const [armed, setArmed] = useState(false);

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    if (document.visibilityState === "visible") {
      setArmed(true);
      return;
    }
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setArmed(true);
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return armed;
}
