---
name: figma-token-sync
description: "Sync the token STRUCTURE from Figma into build-tokens.js, then regenerate tailwind.config.js. Pulls which tokens exist and their geometry (sizes, lineHeight, letterSpacing, slots) — NEVER concept values (font family, colors). Scoped to ForgeX/Framy; adapt paths for other projects."
---

# SKILL INSTRUCTION: Figma → build-tokens.js Structure Sync

You sync **token structure** from the Figma library into `build-tokens.js`, then regenerate `tailwind.config.js`. This is the codebase-side counterpart to the rebrand pipeline: the rebrand pipeline pushes *concept values* into a JSON override; this skill pulls *architectural structure* into the source generator.

## ⚠️ The one rule that defines this skill — structure, not values
`build-tokens.js` is the **brand-agnostic baseline**. You may sync into it ONLY structural facts:
- **Which tokens exist** — e.g. a typography group gained a size step (`headline/xxl`), a new spacing key, a new radius slot, a new semantic color slot in the `theme` shape.
- **Geometry of those tokens** — fontSize, lineHeight, letterSpacing pairings; spacing px values; radius px values; the slot names.

You must NEVER sync **concept values** into `build-tokens.js`:
- ❌ Font **family** (e.g. the file currently shows `Jost` — that's a concept; baseline default stays `Inter`).
- ❌ Color **hex values** (palette ramps, theme hexes — these are concept, they live in `themes/<slug>.theme.json`).
- ❌ Concept-specific font weights/casing that differ from the baseline architecture.

Rule of thumb: *"which tokens exist"* → `build-tokens.js`. *"what they became for this brand"* → theme JSON (see `rebrand-pipeline.md`). Baking concept values into `build-tokens.js` is the forbidden "Path B" (`doctrine/feedback_dynamic_theme_interpreter.md`).

If a sync would require a concept value to land in `build-tokens.js`, STOP and route it to the rebrand pipeline instead.

## READ FIRST
1. `doctrine/feedback_dynamic_theme_interpreter.md` — the structure-vs-value boundary.
2. `DESIGN_SYSTEM_GUIDE.md` — the token contract.
3. Current `build-tokens.js` — know what structure already exists before diffing.

## Figma MCP — how to read (no guessing)
Reads come from a selected layer OR an explicit **node-id**. Page-level reads return empty.
- Ask the user to select the relevant frame in Figma desktop and paste the URL (carries `?node-id=…`), or pass a node-id directly.
- Use `get_variable_defs(nodeId, fileKey)` to pull the variable definitions for that node — this returns the token names + their resolved values/geometry.
- File: "ForgeX | Library", `fileKey = natBqfvZvRAk2RrvPIpBmo`. (Other projects: use their own file key.)

## Workflow
1. **Target a frame** that exposes the tokens you want to sync (e.g. a "Typography" overview frame shows all type tokens; a tokens/variables doc frame shows color/spacing/radius).
2. **Read** via `get_variable_defs`. Enumerate the token names and their geometry.
3. **Diff against `build-tokens.js`:**
   - Tokens present in Figma but missing in code → **structural gap to add**.
   - Tokens in code but absent in Figma → flag as possibly-legacy; confirm before removing (don't pad artificial sizes; sync to what Figma actually carries).
   - For each, separate **structure (sync)** from **value (do NOT sync)**.
4. **Edit `build-tokens.js`** — add/adjust only the structural entries. Keep the baseline font family and any baseline default values; do not overwrite them with concept hexes/families.
   - Naming: sizes are `xxs/xs/sm/md/lg/xl/xxl` (NOT `2xs/2xl`). Only `headline` carries the full 7-step range; other groups 5 (sync to Figma reality, not the GUIDE's idealized 7-for-all).
   - Typography sub-properties (fontSize, lineHeight, letterSpacing, fontWeight) stay bundled per token.
5. **Regenerate** `tailwind.config.js` by running the build script (never hand-edit the generated config):
   ```
   node build-tokens.js
   ```
6. **Verify:**
   - `git diff build-tokens.js tailwind.config.js` — confirm only structural additions, no concept values leaked in.
   - Confirm new classes appear with correct names (`text-headline-xxl`, `p-<grid>`, `rounded-<slot>`, `bg-tint-…`).
   - Spot-check one synced token end-to-end (Figma value → build-tokens entry → generated class).

## Output
Report concisely:
- **Synced (structure):** e.g. "+`headline/xxl` (32/36), +spacing `28`."
- **Skipped (concept values, by design):** e.g. "font family `Jost`, palette hexes → belong in theme JSON, not synced."
- **Flagged:** tokens in code but not Figma (await confirmation before removal).
- **Regen + verify:** confirmation that `node build-tokens.js` ran and the diff is structure-only.

## Cross-project note
This file is scoped to **ForgeX/Framy**. Other projects (e.g. PlayID wallet apps) may share this exact design system or run a different one. If reused elsewhere: keep the structure-vs-value rule (it's universal), but swap the `fileKey`, file paths, baseline defaults, and any project-specific naming. Do not assume another project's tokens match ForgeX.
