---
name: casino-mockup-conversion
description: "Playbook for converting a copied casino-brand mockup in the ForgeX Library Figma file onto the design system, using the EntrancePage (Dolly Casino) desktop frame as the canonical reference. Block→DS-component map + theme-application + conversion checklist + known debt to avoid."
---

# Casino Mockup Conversion — reference playbook

Reference frame: **EntrancePage / `breakpoint=desktop`** (node `168369:53998`) in "ForgeX | Library" (`natBqfvZvRAk2RrvPIpBmo`), brand **Dolly Casino**. This is the gold-standard to which other mockups in the file must be brought. Use this map + checklist to convert each new screen consistently.

## Block → DS component map (what each block must become)
Replace any copied/raw block with the corresponding ForgeX `❖` component INSTANCE:

| Block on screen | DS component (instance) | Status in reference |
|---|---|---|
| Top bar | `❖ Header` (+ `hasCoinsBalance`) | ✅ done |
| Hero banner | `❖ MainBanner` (+ `❖ Pagination/Item`) | ✅ done |
| Sport events strip | `❖ SportEntrancePage` → `❖ MatchCard` / `❖ OddsItem` / `❖ MatchCardsSlider` / `❖ SliderButton` | ✅ done |
| Promo banner ("UNLOCK …") | `❖ BannerSection` | ✅ done |
| Side navigation | `❖ MainMenuSidebar` | ✅ done |
| Footer | `❖ Footer` (+ `❖ Links`, `❖ Payments`) | ✅ done |
| Scrollbar | `❖ ScrollBar` (+ `❖ Thumb`) | ✅ done |
| Inputs / links | `❖ Input` / `❖ Link` | ✅ done |
| **Game cards / category rows** (Top, New, Popular, Slots, Roulette, Live Casino…) | **DS card-family: `CardGroup` / `CardSlider` / `InlineCardSlider`** — confirm exact variant per row | ❌ **GAP** — reference still uses LOCAL `GameCard*` (`GameCardCover/Default/PokerBlackjack/RouletteGameShow/Favorite`). These must become DS instances. Do NOT replicate the local pattern onto new mockups. |

## Theme application (per brand, e.g. Dolly Casino)
- Apply the brand by **overwriting existing variable VALUES in place by name-match** in the `palette`/`theme`/`radius` collections — never a parallel collection (doctrine `feedback_forgex_variable_injection.md`).
- Never bake concept values (brand hexes, font) into `build-tokens.js`/`tailwind.config.js` — that's the forbidden Path B (`feedback_dynamic_theme_interpreter.md`).
- Reference's concept values for orientation: `base #060e0e` (dark), `main/brand/base #c49557` (gold), `text/brand/base #63b7b7` (teal dual-character), font **Jost**, radii overridden to sharp (`radius/xs|sm|md = 0`, `lg|xl = 12`, `max = 30`).
- Decorative brand extensions are allowed via `x1/*` and `tint/additional1/*` (Asset Exception) — route new ones to `proposals[]`, don't invent rogue HEX in semantic slots.

## Brand look lives in the DECORATIVE internal layers (not just tokens)
**Colors + font are NOT enough.** What makes a screen read as a specific brand is the decorative content INSIDE components: background images/textures, custom gradients, SVG/VECTOR art, sliced chrome plates on buttons, hero imagery, brand logos. These live in the internal layers of components — especially **High-Custom (🟩)** ones (banners, hero cards, brand buttons, logos) where decoration is the authoring affordance (Rule 0 + Asset Exception + Design Tricks: chrome buttons with per-variant image fills / negative-space gap).

Consequence for audit & conversion:
- A block can be a correct `❖` instance with bound color tokens and STILL look off-brand if its internal image/gradient/SVG assets are old, foreign (from the source project), generic, or missing.
- So every converted screen must be checked at the **decorative-asset level**, not just token level: do the High-Custom components carry the brand's actual images/gradients/SVG/chrome? Compare against the reference (DollyCasino) per component, visually.
- Detect decoration in node JSON via: `imageRef` (image fills), `GRADIENT_*` fills, `"VECTOR"` nodes. A content screen with ≈0 of these is likely flat/unbranded or missing assets.

## Conversion checklist (run per new mockup)
1. List the blocks on the screen; map each to its DS component via the table above.
2. Replace every copied/raw block with the DS component **instance** — keep nothing as a local copy. Game cards → the DS card-family (the known gap), not local `GameCard*`.
3. Apply the brand theme by overwriting variable values in place (name-match). Bind every paint/spacing/radius/typography to a token — no hardcoded hex.
4. Fix at the **master/atomic level** (doctrine Rule 15 / Rule 2) so changes propagate to all breakpoints — don't redo per breakpoint column.
5. Honor tiers: tag code components with `// @ds-tier:` (see `CLAUDE.md` §4); in Figma respect Rule 0 (green/orange borders).
6. **Verify with a full-page cascade test across all 4 breakpoints** (doctrine: full-page render is the cascade rig), then the `design-debt-linter.md` pass.

## Known debt to fix / avoid (found in the reference)
- `neutrlal` typo in `shadow/outer/color/neutrlal/100` — fix at library level.
- ~6 raw `#dec3a1` in button `box-shadow` (decorative highlight off-token) + a few hardcoded shadow-effect colors — bind to a token or route via Asset Exception.
- Library-hygiene leftovers seen at variable level (not applied in the screen code): `UI KIT/Input/Border` (foreign namespace from the source project), `❖ Footer/…??` unfinished names. Clean at library/publisher level.
- The game-card gap above is the single biggest carry-over — resolve it in the reference first so new mockups copy the right pattern.
