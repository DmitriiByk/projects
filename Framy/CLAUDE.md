# ForgeX / Framy — Project Index

Entry point for any agent working in this repo. **Read in the order below before editing anything.**

## 0. Read order (MANDATORY)
1. `doctrine/forgex_architectural_doctrine.md` — **Rule 0 first.** Customization tiers govern what is/isn't a violation. Everything else qualifies Rule 0.
2. `DESIGN_SYSTEM_GUIDE.md` — naming conventions, color semantics, typography, workflow guardrails (the token contract).
3. `tailwind.config.js` — the **actual** generated class names. Never guess token classes; read them here.

## 1. Architecture in one breath
- **Source of truth:** `build-tokens.js` → regenerates `tailwind.config.js`. Never hand-edit the generated config.
- **Brand-agnostic baseline.** `build-tokens.js`, the generated config, the GUIDE, and Figma collection *topology* are a sandbox baseline. Concepts never get baked into them.
- **Token classes (real names):** `bg-base`, `text-inverse`, `bg-tint-neutral-50…500`, `bg-tint-brand-50…300`, `text-text-neutral-100…400`, `bg-main-brand`, `text-main-warning-contrast`, `shadow-outer-sm-100`, `rounded-md`, `p-16` (px-keyed 4px grid).
  - Legacy/incorrect names that DO NOT exist: `bg-neutral-25`, `bg-brand-500`. Use the semantic shapes above.
- **Typography:** `text-<group>-<size>`, groups `display|headline|title|button|label|body|body-strong`, sizes `xxs…xxl` (only `headline` has the full 7).
- **Figma file:** "ForgeX | Library" (`natBqfvZvRAk2RrvPIpBmo`), account weggan040@gmail.com, team Framy.

## 2. Doctrine (read before any Figma audit/fix) — `doctrine/`
- `forgex_architectural_doctrine.md` — Rule 0 (Standard / 🟩High-Custom `#06b204` / 🟧Low-Custom `#ff8a05`) + Rules 1–16. Page-as-component, dot-namespace sub-components, icon source-binding, sentinel colors, variant-matrix collapse, negative-space gap mechanic, migration discipline.
- `feedback_dynamic_theme_interpreter.md` — never bake concept colors/fonts into `build-tokens.js`/`tailwind.config.js` ("Path B" is forbidden); emit a JSON override.
- `feedback_forgex_radius_doctrine.md` — no "sharp corners everywhere" rule; per-component radius is intentional.
- `feedback_forgex_variable_injection.md` — rebrand = overwrite existing Figma variable *values* in place by name-match; never a parallel collection. MCP can't bulk-write → Tokens Studio import or REST API.
- `verify-button-colors.js` — verification script.

## 3. Skills (workflows) — repo root `.md`
- `casino-mockup-conversion.md` — playbook for converting copied casino-brand mockups onto the DS, using EntrancePage (Dolly Casino) as the canonical reference: block→component map, theme application, checklist, known gaps (game cards).
- `component-builder.md` — orchestrator for building/migrating a component.
- `decoration-craft.md` — decorating components: WHERE rich decoration is worth it vs plain fill/stroke, the lightest-technique-that-works ladder, full toolkit (shadows/gradients/glow/masks/blend/textures/chrome) + responsive rules. Sequences the rules + points to sources (does NOT restate them). Naming stays in GUIDE §1; surfaces the buried "Design Tricks & Mechanics".
- `design-debt-linter.md` — scan code for hardcoded debt, autofix to token classes. Doctrine-aware (respects Rule 0 + sentinels).
- `figma-generate-spec.md` — generate a component technical spec (README) from Figma.
- `figma-token-sync.md` — sync token **structure** (which tokens exist + geometry) from Figma into `build-tokens.js`, regenerate `tailwind.config.js`. Never syncs concept values (font family, colors) — those go to theme JSON.
- `rebrand-pipeline.md` — **Dynamic Theme Interpreter** (the mature rebrand workflow): concept.png → JSON theme override (Phases 1–5). Canonical copy lives here; a mirror exists at `~/Downloads/rebrand-pipeline.md` — keep in sync.
- `figma-theme-rebrand.md` — DEPRECATED redirect to `rebrand-pipeline.md` (already reconciled; the old contradictory "bake concept HEX into config" workflow was removed). Use `rebrand-pipeline.md` for all rebrands.
- `mobbin-reference.md` — **reference layer.** Use the connected Mobbin MCP to ground projecting and Figma audits in real-world UI conventions (3–5 references per pattern). Canonical protocol; the design skills point here. Informs, never overrides doctrine; extract structure, never brand specifics.

## 3a. Routing — design references
Any design work that involves projecting a screen/component or auditing a Figma mockup should pull real-world references via **Mobbin** first, following `mobbin-reference.md`. `component-builder`, `decoration-craft`, `figma-generate-spec` and `casino-mockup-conversion` already point to it at the right step. Mobbin informs decisions; doctrine (Rule 0, sentinels, token contract) still wins on conflict.

## 4. Sentinel colors (NEVER flag as debt)
- `#ff00ff` magenta — icon mask-paint slot.
- `#808080` grey — card image-slot placeholder.
- Payment/flag/social brand colors + store-badge greys — legally fixed.
- Tier borders `#06b204` / `#ff8a05` / `#0c1212` — encode customization tier.
- **Tier in code:** components declare their tier with a `// @ds-tier: standard|high-custom|low-custom` marker at the top of the file (Figma borders don't exist in `.tsx`). The linter reads it to decide what to skip; no marker = standard.

## 5. Assets
- `themes/` — per-concept JSON overrides (`forgex-brand`, `excitewin`) + `forgex-brand.tokens-studio.json` (bulk Figma import path).
- `color-plugin/` — APCA/Bézier ramp math. Reference only; do not modify.
- `concept.png` — current concept input for the rebrand pipeline.
