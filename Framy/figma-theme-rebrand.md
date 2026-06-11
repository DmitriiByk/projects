---
name: figma-theme-rebrand
description: "DEPRECATED redirect. Theme rebranding is handled by the Dynamic Theme Interpreter pipeline (rebrand-pipeline.md). This file no longer contains an independent workflow."
---

# ⚠️ DEPRECATED — see `rebrand-pipeline.md`

This skill is **superseded** by `rebrand-pipeline.md` (the Dynamic Theme Interpreter). Do not follow the old steps that used to live here — they instructed baking concept-specific HEX values into `tailwind.config.js` and overwriting primitive HEX inside semantic tokens. Both contradict project doctrine:

- `doctrine/feedback_dynamic_theme_interpreter.md` — concept values NEVER go into `build-tokens.js` / `tailwind.config.js` ("Path B" is forbidden). They go into a per-concept JSON override.
- `doctrine/feedback_forgex_variable_injection.md` — in Figma, overwrite existing variable *values* in place by name-match; never create a parallel collection, never write raw HEX into semantic slots (theme aliases from palette).

## What to do instead

For any "rebrand from a concept / image" request, run **`rebrand-pipeline.md`**:
1. Phase 1 — extract visual DNA from `concept.png` (Pillow; color-plugin curve math as reference).
2. Phase 2 — diff against the baseline; decide shallow (primitives only) vs deep (alias retargets).
3. Phase 3 — typography diagnostic (mono/dual, glyph fingerprint, per-role textCase).
4. Phase 4 — emit `themes/<slug>.theme.json` (the deliverable).
5. Phase 5 — verify via Figma variable-value preview; never edit the generated config to "fix" the preview.

Figma application of the override: overwrite existing `palette` / `theme` / `radius` variable values in place (Tokens Studio import of `themes/<slug>.tokens-studio.json`, or Figma REST `POST /v1/files/:key/variables`). See `feedback_forgex_variable_injection.md` for the bulk-write constraints.

> Keep this redirect until the file is removed entirely. Do not re-add an independent rebrand workflow here.
