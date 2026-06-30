import { assets } from "../lib/assets";
import { Reveal } from "./Reveal";

const COMPANY = ["About us", "Testimonials", "Careers", "News & Events", "Contact us"];
const PRODUCT = [
  "Reward Logic",
  "Affiliate Management",
  "Reporting & Tracking",
  "Campaigns & Media",
  "Payments & Finances",
  "Platform & API",
];

function Column({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-[16px]">
      <p className="font-ui text-[16px] font-bold tracking-[-0.32px] text-white">{title}</p>
      {links.map((l) => (
        <a
          key={l}
          href="#"
          className="font-ui text-[16px] tracking-[-0.32px] text-white/70 transition-colors hover:text-white"
        >
          {l}
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-white px-[8px] py-[48px]">
      <Reveal direction="up">
        <div className="rounded-[16px] bg-[#10132d] px-[40px] py-[40px]">
          <div className="flex max-w-[298px] flex-col gap-[24px]">
            <img
              src={assets.logoFooter}
              alt="ReferOn"
              draggable={false}
              className="h-[22px] w-[97px] object-contain"
            />
            <p className="font-ui text-[16px] leading-[24px] tracking-[-0.32px] text-white">
              The next-gen affiliate management platform built for iGaming
              operators
            </p>
          </div>

          <div className="mt-[48px] flex gap-[40px]">
            <Column title="Company" links={COMPANY} />
            <Column title="Product" links={PRODUCT} />
          </div>

          <p className="mt-[48px] max-w-[236px] font-ui text-[14px] leading-[20px] tracking-[-0.28px] text-[#7b7b7b]">
            ReferOn 2026 · Affiliate management platform for iGaming
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
