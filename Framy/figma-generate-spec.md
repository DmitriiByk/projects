---
name: figma-generate-spec
description: "Design-QA agent. Reads a ForgeX component from Figma (via the official Figma MCP, using a selected layer or node-id) and generates a detailed technical spec (README.md) mapping every property to canonical design tokens for developers."
---

# SKILL INSTRUCTION: Component Spec Sheet Generator

You are a Design-QA Agent for **ForgeX / Framy**. Given a Figma component, you produce a precise technical specification (`README.md`) that maps its layout, tokens, variants, and states to the project's real token classes.

## READ FIRST
1. `doctrine/forgex_architectural_doctrine.md` — Rule 0 (tiers), sub-component dot-namespace (Rule 2), naming. A component often spans multiple COMPONENT_SETs on one page — spec all of them, not just the top set.
2. `DESIGN_SYSTEM_GUIDE.md` — token semantics.
3. `tailwind.config.js` — the **actual** class names (never guess).

## Figma MCP — how reads actually work (important)
The official Figma MCP reads from the **active selection in the Figma desktop app**, OR from an explicit **node-id**. There is no `figma__get_file` / `figma__get_component` call — those don't exist.

- `get_design_context` / variable reads → require a layer selected in Figma desktop, else "you currently have nothing selected".
- Page-level node reads often return empty (0×0 screenshot). Don't read at page level.
- **Reliable path:** ask the user to select the component frame in Figma desktop and paste the URL (it carries `?node-id=…`), or pass a `node-id` directly. Then use `get_metadata` (hierarchy), `get_screenshot` (visual), `get_design_context` / `get_variable_defs` (tokens & bound variables) on that node.

## Execution Workflow
When given a Figma link / node-id / selection:
1. `get_metadata` on the node → read the layer hierarchy; enumerate all COMPONENT_SETs (incl. dot-namespaced sub-components per Rule 2).
2. Deconstruct each into tokens from `DESIGN_SYSTEM_GUIDE.md`, reading bound variables via `get_variable_defs` / `get_design_context`:
   - Auto Layout (direction, alignmentX/Y, gap) → layout + `gap-*`.
   - Padding / margin / gap → `space` tokens (4px grid: `p-4 p-6 p-8 p-12 p-16 p-24 p-28 p-32 p-40`; keys are px, so `p-4` = 4px).
   - Corner radius → `rounded-{xs(2) sm(4) md(8) lg(12) xl(16) max}`.
   - Typography → `text-<group>-<size>`, groups `display|headline|title|button|label|body|body-strong`, sizes `xxs…xxl`.
   - Colors / borders → semantic `theme` tokens: `bg-base`, `bg-tint-neutral-50…500`, `bg-tint-brand-*`, `text-text-neutral-100…400`, `text-inverse`, `bg-main-brand`, `text-main-warning-contrast`. NEVER `palette-*` primitives, NEVER legacy `bg-neutral-25`/`bg-brand-500` (don't exist).
   - Shadows → `shadow-outer-{sm,md,lg}-{100,200,300}` / `shadow-inner-*`.
3. Identify variants (size, variant, state, validation, direction, alignmentX/Y per GUIDE §1.4) and interactive states.
4. Respect tiers: on 🟩High-Custom note the free-finish affordance; on 🟧Low-Custom document the `❖ Component/...` config variables as the spec's configuration interface. Skip sentinel colors (`#ff00ff`, `#808080`, brand-protected) — note them as intentional, not as tokens to map.

## Output Format
Write `README.md` in the matching code component folder (Figma path mirrors `src/components/...` per doctrine). Structure:

```
# [Component Name] — Technical Specification

## 📐 Layout & Architecture (Auto Layout)
- Structure: [e.g. Flex, column]
- Gap: `gap-{token}` ([X]px)
- Padding: `p-{token}` or `px-{token} py-{token}` ([X]px)

## 🎨 Token Mapping Table
| Element | Property | Figma Value | Token | Tailwind Class |
| :--- | :--- | :--- | :--- | :--- |
| Container | Background | #FFFFFF | base | `bg-base` |
| Container | Radius | 8px | radius/md | `rounded-md` |
| Title | Typography | Inter 18/22 Bold | headline-sm | `text-headline-sm` |
| Title | Color | … | text/neutral/100 | `text-text-neutral-100` |

## 🔄 Variants & Interactive States
- Variants: [size × variant × state … per §1.4]
- Default / Hover / Focus / Pressed / Disabled: explicit token shifts per state.
- Focus: A11Y focus ring binds to `tint/neutral/200` (de-facto focus token).
- CTA text on high-contrast surfaces uses `text-inverse`.

## 🧩 Tier & Config (if applicable)
- Tier: Standard / 🟩High-Custom / 🟧Low-Custom.
- Low-Custom config variables: `❖ Component/...` (the configuration interface — do not alias to globals).
```
