---
name: component-builder
description: "Orchestrator for building/migrating a ForgeX component. Sequences the existing rules and points to their canonical sources — it does NOT restate them. Use when creating a new component, adding variants, or porting a component in the ForgeX/Framy Figma library."
---

# SKILL: Component Builder (orchestrator)

This is a **workflow index**, not a rulebook. It tells you what to read, in what order, and how to decide — every actual rule lives in its canonical source. Do not copy rule text into this file (it would drift). Follow the steps; open the linked source at each one.

## Step 0 — Orient (always)
Read `CLAUDE.md` read-order first: `doctrine/forgex_architectural_doctrine.md` (Rule 0) → `DESIGN_SYSTEM_GUIDE.md` → `tailwind.config.js` for real class names.

## Step 1 — Naming (separate source, do not absorb)
All naming/casing/structure conventions live in **`DESIGN_SYSTEM_GUIDE.md §1`** (UpperCamelCase, dot-notation sub-components, `is/has/can` booleans, allowed variant tokens §1.4, slash-notation §1.5). Apply them from there. This skill never duplicates naming rules.

## Step 2 — Classify the customization tier
Determine Standard / 🟩High-Custom / 🟧Low-Custom per **doctrine Rule 0** (read the COMPONENT_SET stroke binding). The tier dictates what may be customized and what counts as a violation later.

## Step 3 — Choose the assembly mechanic
- Decomposition into sub-components → **doctrine Rule 2** (dot-namespace) and rebrand-pipeline §3 "Atomic Assembly & Instance Slots".
- Variant matrix vs BOOLEAN + INSTANCE_SWAP slots → **doctrine Rule 7**.
- Hug vs Fill / spatial integrity → rebrand-pipeline → "Component Engineering & Architecture" §2 (Hug vs Fill) + §4 (Anti-Hardcode Spatial Validation).
- Per-variant fidelity vs math-scaling → **doctrine Rule 10 / V9 lesson**.

## Step 4 — Apply design tricks (easy to miss — go look)
Open **`doctrine/forgex_architectural_doctrine.md` → "Design Tricks & Mechanics"**:
- Entry #1 — Layered Negative Space Gap (transparent container; gap = the design).
- Variation A — Auto-Layout Padding gap (padding on outer FILL inner).
- Background Implementation Verification (6 valid background techniques — read the reference before assuming one).
- Magenta `#ff00ff` sentinel (active erasure) vs the gap (passive) — don't confuse them.

## Step 5 — Tokens & edits
Bind everything to tokens (no hardcoding). Real class names from `tailwind.config.js` — note spacing keys are px-numeric (`p-16` = 16px, NOT 4px) and `main-<family>` needs a role suffix (`bg-main-brand` = `-base` by default; foreground on CTA is `text-main-<family>-contrast`). Fix at master level (**doctrine Rule 15**), typography via text-styles not fontName (**Rule 16**), don't override gradients on instances (**Rule 12**), never `resetOverrides()` for targeted cleanup (**Rule 13**), hold scope (**Rule 14**), audit sizes before multi-size migration (**Rule 11**).
- In code, declare each component's tier with a `// @ds-tier: standard|high-custom|low-custom` marker (consumed by the linter — see design-debt-linter.md).

## Step 6 — Verify
- Run `design-debt-linter.md` on the code side (doctrine-aware).
- Background Implementation Verification checklist (Step 4) on each variant.
- Respect the canonical skip-list (see `CLAUDE.md` §4 / design-debt-linter.md): sentinel colors `#ff00ff`, `#808080`, brand-protected logo colors, AND tier-border colors `#06b204`/`#ff8a05`/`#0c1212` — none of these are violations.

## Cross-project note
Scoped to ForgeX/Framy. Other projects (e.g. PlayID wallets) may share this system or differ — confirm before reusing; swap sources/paths accordingly.
