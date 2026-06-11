---
name: decoration-craft
description: "How to craft component decoration in Forge-X: judge WHERE rich decoration is worth it vs a plain fill/stroke, pick the LIGHTEST technique that achieves the look, build it RESPONSIVE, and bind to tokens. Full toolkit — fills, strokes, extra frames, shadows, gradients, glow, masks, blend modes, textures/noise, multi-layer chrome — each with selection criteria. Use whenever adding, judging, or reviewing visual decoration on any component."
---

# Decoration Craft — Forge-X playbook

A practical guide to *decorating* components: when a surface deserves richness, which technique to reach for, and how to keep it responsive and token-bound. Builds on the doctrine's "Design Tricks & Mechanics" — read those for the deep mechanics; this is the decision layer + the wider toolkit.

## Step 0 — Does this surface even need decoration? (the WHERE)
Decoration earns its place where it builds **hierarchy or brand**, not everywhere.

- **Rich decoration belongs on** (🟩 High-Custom territory): hero/main banners, primary CTA / brand buttons, promo & win/celebration moments, logos, empty-state focal art, top-of-funnel surfaces the brand is "sold" on.
- **Keep it plain** (Standard / 🟧 Low-Custom): forms, inputs, lists, tables, navigation, secondary/tertiary buttons, dense content, utility chrome. Here a token fill + stroke + radius is the *correct* finish — more is noise.
- **The test:** remove the decoration mentally. If hierarchy/brand is lost → keep it. If nothing is lost → cut it. Over-decorated utility UI reads as cheap, not premium.

## The core rule — climb to the LIGHTEST technique that achieves the look
Each rung up costs more (build time, maintenance, responsive fragility). Use the cheapest rung that reads the same at the **target size on a real screen**. Never jump to images/chrome when an effect+gradient is indistinguishable; never under-build a hero the brand depends on.

1. **Solid fill** (token) — flat surface.
2. **+ Stroke / border** (token) — separation, definition.
3. **+ Corner radius** (token) — shape semantics.
4. **+ Native effect** (token) — outer shadow (elevation), inner shadow (inset/pressed), layer blur, background blur.
5. **+ Gradient** fill or stroke — depth, sheen, brand warmth (often replaces an image).
6. **+ Extra colored frame** (inset child / overlay) — a second surface, ring, two-tone, or tint overlay. Cheapest way to fake a "plate", a gap, or a glassy layer without assets.
7. **+ Glow / highlight** — outer shadow in a brand color with spread (energy/focus); 1px top highlight line for an embossed edge.
8. **+ Blend-mode / opacity overlay frame** — multiply/screen/overlay/soft-light frame to enrich color over imagery or add sheen.
9. **+ Mask** (vector or alpha) — shape a gradient/image to a form: gradient text, clipped art, icon coloring, spotlight reveals.
10. **+ Image fill / texture / noise** — real material (metallic plate, felt, paper grain). Asset-bound — see responsive rules.
11. **+ Multi-layer chrome** — stroke+fill+gap (doctrine Entry #1) or per-variant image-slice matrix (Rule 10). Premium sculpted surfaces. Most expensive; reserve for the signature brand element only.

## Toolkit catalog (what / when / responsive / cost)
| Technique | Reach for it when… | Responsive | Cost |
|---|---|---|---|
| Solid fill | any surface base | free (resolution-independent) | ~0 |
| Stroke/border | edges, separation, focus ring | free | ~0 |
| Radius | shape character (pill, sharp, soft) | free | ~0 |
| Outer shadow | elevation, floating cards, dropdowns | free (token) | low |
| Inner shadow | inset wells, pressed states, recessed inputs | free | low |
| Layer / bg blur | glass panels, frosted overlays, focus dim | free | low |
| Gradient (lin/rad/ang) | depth, metallic sheen, sky/glow backgrounds | free | low |
| Extra inset/overlay frame | two-tone plates, rings, tint layers, the *gap* | free (auto-layout) | low |
| Glow (colored shadow+spread) | CTAs, active states, jackpots, neon | free | low |
| Blend-mode overlay | richen color over photos, add sheen | mostly free | med |
| Mask (vector/alpha) | gradient text, clipped art, spotlight, icon fill | vector=free, image=asset-bound | med |
| Image fill | photographic/material surfaces (hero, plate) | **asset-bound** | high |
| Texture/noise overlay | grain, fabric, metal microtexture | asset-bound (tileable helps) | med-high |
| Multi-layer chrome / slice matrix | the one signature premium button/banner | **asset-bound, per-variant** | highest |

Deep mechanics for the hard ones live in the doctrine — don't reinvent:
- **Negative-space gap** (two layers, transparent container) → Entry #1. The container's `fills`/`strokes` MUST be empty; never fill the gap.
- **Auto-layout padding gap** (procedural, resizes perfectly) → Variation A. Prefer this over a sliced matrix for flat-color buttons.
- **Per-variant image matrix** (don't math-scale one asset) → Rule 10 / V9.
- **Background implementation** (6 valid ways a fill can be built) → "Background Implementation Verification". Read the reference before assuming one.

## Attach decoration: stroke-on-content vs its own component
Two ways to put an ornament on a content surface (card, button, banner):

- **Stroke on the content** — border/outline applied directly to the content frame. Use when the decoration is a plain edge the frame shape already supports (rectangle + corner radius). Cheapest, zero extra nodes.
- **Separate decoration component** (vector overlay laid over the content) — use when ANY of these is true:
  1. **The shape can't be a stroke** — notched/bracketed corners, bevels, ornaments, multi-piece frames. Figma strokes only follow rectangle + radius; custom geometry must be drawn as vector → componentized.
  2. **Reused across many surfaces/states** — one master propagates to every card and every state (Rule 15), instead of redrawing per instance.
  3. **Composes over swappable content** — cover art, badges, hover overlays change underneath; the decoration stays put as an independent layer.
  4. **Needs independent responsive behavior** — build it from corner-pieces / 9-slice / auto-layout so notch geometry doesn't distort on resize, decoupled from the content's sizing.

  **Scalable-frame construction (the key technique):** split the ornament into FIXED corner pieces and STRETCHING middles. In Figma: the corner vectors are `Hug`/fixed size; the middle edge segments are set to **`Fill`** along their axis in an auto-layout, so the whole frame grows/shrinks with the card while corners stay crisp. (CSS analogue: `border-image` 9-slice.) Never scale the corner geometry — only the middles fill. This is why such frames are their own component: the fixed-vs-fill split is baked into the component, not the content.
- Always bind the decoration's stroke/fill to tokens, and build it to resize (never bake fixed-size notches that smear).

**Reference example (GameCard):** the corner-notch frame is a *decoration component* (notches aren't stroke-able, reused across default/new/hover + every card, sits over swappable game art). A plain inner border on the same card would just be a *stroke on content*. Same card, two techniques, chosen by what each ornament needs.

## Responsive decoration — the discipline that makes or breaks it
Sort every technique into two buckets and prefer the first:
- **Resolution-independent (default choice):** fills, gradients, strokes, radius, native effects (shadow/blur/glow), vector masks, auto-layout padding gap, extra frames. These recompute on resize — build with **auto-layout** so decoration follows content at every width.
- **Asset-bound (use only when unavoidable):** image fills, sliced chrome, fixed bitmap textures. These don't scale cleanly — author **per-breakpoint variants** (Rule 10), use tileable/9-slice assets, or replace with a resolution-independent equivalent.

Per-breakpoint adaptation (decide per role, not blanket):
- **Density:** fewer ornaments / simpler effects on mobile; full richness on desktop.
- **Swap:** rich → simple technique below a breakpoint (e.g. image hero → gradient hero on mobile).
- **Hide:** drop non-essential decoration on small screens to protect performance and clarity.
- Default posture: do it with effects + gradients + frames first; go asset-bound only when the look genuinely can't be achieved otherwise.

## Forge-X rules (always)
- **Bind to tokens** — colors, radius, shadows, spacing all map to tokens; no hardcoded values. Raw HEX / gradient / image fills are allowed ONLY on 🟩 High-Custom per Rule 0 + the Asset Exception; capture any new decorative token in `proposals[]`.
- **Respect sentinels** — `#ff00ff` (icon mask), `#808080` (image placeholder), brand-protected logo colors are not debt.
- **Build & fix at master level** (Rule 15) so decoration propagates to every instance and breakpoint — never per-instance.
- **Tag the tier in code** — `// @ds-tier: standard|high-custom|low-custom` (drives the linter).

## Anti-patterns
- Decorating utility UI "to make it pop" — it adds noise, kills hierarchy.
- Jumping to image/chrome when gradient + shadow reads identical at target size.
- Fixed bitmap decoration that smears on resize (use auto-layout + effects, or per-variant assets).
- Painting the negative-space gap container (destroys the depth — Entry #1).
- Baking concept-specific decorative assets into `build-tokens.js` (Path B).
- Math-scaling one chrome asset across sizes instead of a per-variant matrix (Rule 10).
