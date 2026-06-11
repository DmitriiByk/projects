---
name: feedback-forgex-variable-injection
description: ForgeX/Framy rebrand — overwrite the active production Figma variable collection/mode in place; never create a parallel collection
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5558b810-b085-4076-9965-b52b71d84d0a
---

When injecting a per-concept theme JSON (e.g. `themes/forgex-brand.theme.json`) into the project's Figma file, **overwrite the values of the existing active palette / theme / radius variables in place** — do not create a parallel "ForgeX Brand" collection.

**Why:** A parallel collection forces the designer to manually re-link 120+ variables across every component, which takes longer than starting over. The whole point of bound variables in the production blueprint is that overwriting their values automatically re-renders the entire library. The "doctrine" written into rebrand-pipeline.md about Figma collections being "fixed" was over-cautious — it correctly applies to source code (`build-tokens.js`, `tailwind.config.js`) but Figma variable *values* are explicitly the runtime layer that the JSON override is meant to drive. Architecture (collections, modes, alias topology, scopes) stays fixed; values get overwritten.

**How to apply:**
- Map ForgeX values onto existing variables by **name match** in the active collections: `palette` (mode `default`), `theme` (mode applied to blueprint — `light`/`1:1` by default in this file), `radius` (`Mode 1`).
- See [[feedback-dynamic-theme-interpreter]] for the source-code-side doctrine that still holds: don't bake concept values into `build-tokens.js` or `tailwind.config.js`.
- The blueprint's "active" mode is whichever the page/frame currently renders — check `node.explicitVariableModes` and fall back to `collection.defaultModeId`.

**Known execution constraint:** The Figma MCP `use_figma` plugin channel cannot bulk-overwrite heavily-bound variables in this file — each `setValueForMode` triggers a re-render cascade across all dependent variants (85+ button variants), which exceeds the MCP transport window and drops the connection. Confirmed atomic: failed writes leave nothing partially applied. Workable paths:
1. **Tokens Studio plugin import** of `themes/forgex-brand.tokens-studio.json` — the standard production bulk-update path; handles re-rendering internally.
2. **Figma REST API** `POST /v1/files/:key/variables` — bulk endpoint, bypasses in-plugin re-render cascade. Requires a Figma PAT.
3. **One-var-per-call plugin loop** — slow (~120 round trips) but works if the other two aren't available.

Do NOT propose creating a parallel/sibling collection as a fallback — that was the path the user explicitly rejected.
