---
name: feedback-dynamic-theme-interpreter
description: "Treat the Framy rebrand pipeline as a Dynamic Theme Interpreter. Never bake concept-specific colors, fonts, or casing into build-tokens.js, tailwind.config.js, or Figma collection topology. Emit a per-concept JSON theme override instead."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ccdb08f7-478a-4d0a-8676-cba4d6b3541c
---

The Framy / ForgeX rebrand pipeline is a **brand-agnostic sandbox**. Your role is a **Dynamic Theme Interpreter**: read the visual DNA from any `concept.png` and compile it into a swappable JSON theme override. The core infrastructure stays untouched between concepts so any new concept (fantasy, minimal, corporate, sports, whatever) can drop in cleanly.

**Why:** I made the exact opposite mistake. After verifying lime/Plus Jakarta Sans in Figma for a sports concept, I executed "Path B" — wrote the lime ramp, the `#0d0e0f` contrast token, and `Plus Jakarta Sans` directly into `build-tokens.js`, regenerated `tailwind.config.js`, and proudly produced a diff. The user reverted everything and corrected the doctrine in strong terms: *"We are NOT hardcoding or baking specific brand values (like lime colors or Plus Jakarta Sans) into the core codebase. The goal of this pipeline is to train you to work with abstract design systems, where default tokens serve as a baseline sandbox."* The whole point of the pipeline is to *practice* the diagnostic-to-override workflow against arbitrary concepts, not to monolithically commit one concept's brand to the source.

**How to apply:**

1. **Editable surface vs. immutable surface — know the boundary.**
   - **Editable per concept:** a `themes/<slug>.theme.json` override; Figma variable *values* applied as throwaway previews; per-concept `concept.<slug>.md` notes.
   - **Immutable infrastructure:** `build-tokens.js`, generated `tailwind.config.js`, `DESIGN_SYSTEM_GUIDE.md`, `src/**/*.{jsx,tsx,...}`, and the architectural *shape* of Figma collections (collection names, alias topology, scopes, the 5 fontStyle primitives, the 37 per-style aliases). Change values, not shape.

2. **Concept-specific values go into JSON, not JS.** The deliverable shape is documented in `rebrand-pipeline.md` Phase 4 — meta, palette (39-step neutral + brand), themeLight/themeDark, typography (mode + family + per-role textCase), optional radius, optional aliases retargets, optional proposals[].

3. **Default postures are immutable.** Don't pre-commit to "always mono" or "always UPPER on buttons" — run the diagnostic every concept. Cold-standby (`Plus Jakarta Sans` accent / `Inter` body, unify to `Inter` if mono) is a *fallback*, not a default brand. If a concept demands a token group the baseline doesn't expose, file it under `proposals[]` in the JSON — never carve it into the architecture.

4. **No "Path B" maneuvers.** If the user asks to "ground the verified tokens into the codebase," translate that into "emit the override JSON." Updating `build-tokens.js` to bake one brand is always wrong, regardless of how confident the verification was.

5. **Watch the two mirrored docs.** `~/Downloads/rebrand-pipeline.md` and `~/Documents/Claude/Projects/Framy/rebrand-pipeline.md` are the same doctrine — keep them in sync after every doctrinal edit. The Framy copy is the canonical one (colocated with `build-tokens.js`, `color-plugin/`, `concept.png`).
