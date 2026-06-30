import { motion } from "framer-motion";
import { assets } from "../lib/assets";

export function Header() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="glossy-indigo absolute left-1/2 top-[90px] z-30 flex h-[68px] w-[408px] -translate-x-1/2 items-center justify-between rounded-[100px] pl-[24px] pr-[8px]"
    >
      <img
        src={assets.logoHeader}
        alt="ReferOn"
        className="h-[22px] w-[97px] object-contain"
        draggable={false}
      />
      <button
        type="button"
        aria-label="Open menu"
        className="chip-orange flex size-[52px] items-center justify-center rounded-full transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        <span className="flex flex-col items-center gap-[4px]">
          <span className="block h-[2px] w-[20px] rounded-full bg-white" />
          <span className="block h-[2px] w-[20px] rounded-full bg-white" />
          <span className="block h-[2px] w-[20px] rounded-full bg-white" />
        </span>
      </button>
    </motion.header>
  );
}
