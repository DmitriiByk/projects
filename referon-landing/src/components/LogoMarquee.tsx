import { assets } from "../lib/assets";

const ROW_A = [
  { src: assets.logoSlotspalace, name: "Slotspalace" },
  { src: assets.logoCasombie, name: "Casombie" },
  { src: assets.logoZetcasino, name: "Zetcasino" },
  { src: assets.logoSlotspalace, name: "Slotspalace" },
  { src: assets.logoCasombie, name: "Casombie" },
];
const ROW_B = [
  { src: assets.logoZetcasino, name: "Zetcasino" },
  { src: assets.logoSlotspalace, name: "Slotspalace" },
  { src: assets.logoCasombie, name: "Casombie" },
  { src: assets.logoZetcasino, name: "Zetcasino" },
  { src: assets.logoSlotspalace, name: "Slotspalace" },
];

function Row({ items }: { items: { src: string; name: string }[] }) {
  return (
    <div className="flex shrink-0 items-center gap-[32px] pr-[32px]">
      {items.map((l, i) => (
        <div key={i} className="flex items-center gap-[8px]">
          <img
            src={l.src}
            alt={l.name}
            draggable={false}
            className="size-[32px] rounded-md object-cover"
          />
          <span className="whitespace-nowrap font-mono-ui text-[10px] font-semibold uppercase text-[#6e6e6e]">
            {l.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LogoMarquee() {
  return (
    <section className="w-full bg-white py-[20px]">
      <p className="mb-[16px] text-center font-mono-ui text-[11px] uppercase tracking-[0.16em] text-[#9a9ab0]">
        Trusted by leading iGaming brands
      </p>
      <div className="relative mx-auto flex w-[392px] flex-col gap-[14px] overflow-hidden border-y border-black/[0.07] py-[16px]">
        <div className="marquee-track opacity-70">
          <Row items={ROW_A} />
          <Row items={ROW_A} />
        </div>
        <div className="marquee-track reverse opacity-50">
          <Row items={ROW_B} />
          <Row items={ROW_B} />
        </div>
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[120px] bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[120px] bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
