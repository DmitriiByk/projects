# ReferOn — animated landing (mobile)

Faithful, animation-rich reproduction of the ReferOn Figma "Test 1" mobile
landing page (440px). Built with **React + TypeScript + Vite + Tailwind v4**,
motion by **Framer Motion** and **Lenis** smooth scroll.

## Run locally

```bash
cd referon-landing
npm install
npm run dev        # http://localhost:5174
```

Build for production:

```bash
npm run build && npm run preview
```

## Sections

Hero · Setups (Casino / Sportsbook / Affiliate Network / Multi-brand) ·
Stats · Awards · Logo marquee · Footer.

## Motion design

- **Lenis** momentum smooth-scrolling across the whole page.
- **Hero** — animated aurora gradient, light-streak overlays, a floating
  product card with scroll-linked **parallax** + idle float, staggered headline
  reveal, and a **magnetic** glossy CTA with an indigo arrow chip (→ orange on
  hover).
- **Morphing payment card** — the "3,450 EUR" card is rebuilt as DOM (not a
  baked image) and rendered as a single element that travels from a tilted
  **pseudo-3D** pose in the hero to a **flat** pose in the Setups intro as you
  scroll (CSS `perspective` + scroll-driven `rotateX`/scale/translate). The
  hero's baked PNG stack is clipped so the DOM card replaces its top card with
  no duplicate. Reduced-motion users get a static flat card in the landing zone.
- **Setups** — a **pinned horizontal-scroll gallery**: as you scroll vertically
  the cards morph from a fanned vertical **stack** into a horizontal row and
  scroll sideways, with a progress bar tracking the sweep. Each card has a
  gradient hairline border, accent glow, and feature list. (Reduced-motion users
  get a native horizontal scroll-snap row instead of the scrolljacked pin.)
- **Stats** — numbers **count up** from zero; gradient accent ticks, a soft glow
  behind each figure, and **draw-in** gradient dividers.
- **Awards** — deep-navy glass panel with an animated **sheen** sweep, a slow
  **conic glow**, and staggered award badges.
- **Logos** — dual **marquee** rows scrolling in opposite directions, edge fades.
- Headings use a **line-mask wipe**; section blocks share gradient **beam**
  dividers.
- Global: top **scroll-progress** bar and a soft **spotlight cursor** (desktop).
- All motion respects `prefers-reduced-motion`. Reveals are **visibility-safe**
  (`useArmed`): in a backgrounded/headless tab where rAF is paused, content
  renders visible by default instead of being trapped behind a paused reveal.

## Assets

Figma assets are stored locally in `public/assets/` (logos, mockups, gradients).
The design is mobile-only (440px); on wider screens the page is centered in a
floating "device" frame over an ambient backdrop.
