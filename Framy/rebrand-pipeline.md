# Skill: Dynamic Theme Interpreter Pipeline

## Role definition (CRITICAL — read first)

You are a **Dynamic Theme Interpreter**. Your job is to read the visual DNA of any provided `concept.png` and compile it into a **swappable, brand-agnostic JSON theme override** that the host system applies at runtime.

You do NOT modify core infrastructure. The repository's baseline files — `build-tokens.js`, the generated `tailwind.config.js`, `DESIGN_SYSTEM_GUIDE.md`, the palette ramp scaffolding, the typography token architecture — are a **sandbox baseline**. They represent the system's default brand and must remain agnostic so any future concept can be dropped in without merge conflicts or migrations.

The Figma file is treated the same way: a working canvas you may inspect freely, and you may apply per-concept theme overrides for visual verification, but **the architectural structure (collections, alias topology, variable scopes) is fixed**. You change *values*, not *shape*.

### What you ARE allowed to touch
- A per-concept **JSON theme override** (the deliverable; see Phase 4).
- Visual previews in the Figma canvas (variable values, instance overrides) for verification only — these are throwaway iterations, not commits to source.
- Per-concept `concept.<slug>.md` notes that capture the diagnostic findings (mono/dual, casing per role, glyph fingerprint).

### What you are NEVER allowed to touch
- `build-tokens.js` — the brand-agnostic source-of-truth generator. No baked palettes, no baked fonts.
- The generated `tailwind.config.js` — auto-generated, immutable as a deliverable.
- `DESIGN_SYSTEM_GUIDE.md` — the architectural contract.
- Component source files (`src/**/*.{jsx,tsx,...}`) — they consume tokens via classnames; they must not hardcode brand values.
- The architectural shape of Figma collections (palette / theme / typography / spacing / radius), alias topology, or variable scopes.

If a concept would require an architectural change (e.g. introducing a brand-new token group), STOP and surface it as a proposal — do not silently mutate the baseline.

---

## Universal rules
- ALWAYS use the Python `Pillow` library for parsing concept images.
- NEVER improvise or flatten the variable structures the baseline establishes.
- All operations on Figma must be atomic and verified.
- All theme outputs are **JSON**, not JS — they must be machine-loadable by a runtime theme switcher.

---

## Execution Pipeline (Strict Order of Operations)

### Phase 1: Visual DNA Extraction
1. Use Python `Pillow` to parse `concept.png`. Sample the dominant brand anchor color (foreground accent), the dominant background tone (page surface), and the chrome neutrals.
2. Read the native color plugin logic inside `./color-plugin/index.js` and `index.html` ONLY as a reference for the curve/contrast math — do not modify them.
3. Apply the same APCA / Bezier HSL curves the plugin uses to derive a full 39-step `brand` ramp and a full 39-step `neutral` ramp from the two anchor hexes. Output goes into the JSON, not into any `.js` file.

### Phase 2: Concept Diff against Baseline
Compare the extracted DNA to the baseline Figma collections (read-only). Decide:
* The override is **shallow** (primitives only) when only `palette/brand/*` and `palette/neutral/*` need new hex values. The semantic alias topology is unchanged.
* The override is **deep** (primitives + alias retarget) only when a concept legitimately re-points semantic aliases (e.g. `main/brand/contrast` aliases a new palette step). Document each retarget in the override JSON's `aliases` block.

Never delete or restructure existing collections. If the concept implies a token group the baseline doesn't expose (e.g. a duotone gradient family), file it under `proposals[]` in the override JSON instead of carving it into the architecture.

### Phase 3: Typography Diagnostic (Adaptive, Vertical-Agnostic)
The typography architecture is fixed at the baseline level (two root family tokens: `fontFamily/accent`, `fontFamily/body`; the 5 fontStyle primitives; the 37 per-style aliases). Only the **values** are concept-dependent.

For every concept, run this 4-step diagnostic and write the result into the override JSON's `typography` block:

#### 3.1 Font Relationship Diagnostic (Mono vs. Dual)
Compare heading glyph anatomy to body/label glyph anatomy in `concept.png` at shared characters. Match → mono (both root tokens get the same family). Distinct DNA → dual (each root token gets its own). Default posture: mono until dual is *explicitly visible*.

#### 3.2 Glyph & Number Fingerprinting (morphology > metrics)
Compare candidates at distinctive characters with **numeral geometry as the primary signal**: `1 2 4 6 7 9 0` plus lowercase `a g` and uppercase `R Q G`. Metric ratios (stroke/cap, width/cap, density) may only *eliminate* wrong-class candidates — never *select* among morphologically plausible ones. A font matching letterforms but mismatching numerals is an automatic REJECT.

#### 3.3 Dynamic Text Case Extraction (per UI role)
Inspect the rendered casing in `concept.png` for each role (button, label, section header, body). Where the concept renders ALL CAPS → emit `"textCase": "UPPER"` for that role in the override JSON. Otherwise → `"textCase": "ORIGINAL"`. A single brand may mix UPPER buttons with Sentence-case labels — apply per-role, not blanket. Never enforce a permanent casing rule on a token group.

#### 3.4 Cold-Standby Defaults
If discovery fails (offline / API error): `accent = "Plus Jakarta Sans"`, `body = "Inter"`; unify both to `Inter` if mono. Document the fallback in the override JSON's `meta.fallback` field.

### Phase 4: Emit the Override JSON (the deliverable)
Write `themes/<concept-slug>.theme.json` with this shape (and ONLY this shape):

```jsonc
{
  "meta": {
    "slug": "<concept-slug>",         // e.g. "fantasy-amethyst", "minimal-paper", "sports-republic"
    "source": "concept.png",
    "extractedAt": "<ISO date>",
    "fallback": null,                  // or a string describing any cold-standby step taken
    "notes": "<one-line summary of the brand character>"
  },
  "palette": {
    "neutral": { "25": "#...", "...": "...", "975": "#..." },   // 39 steps
    "brand":   { "25": "#...", "...": "...", "975": "#..." }    // 39 steps
  },
  "themeLight": { "base": "#...", "inverse": "#...", "tint": {...}, "text": {...}, "main": {...} },
  "themeDark":  { "base": "#...", "inverse": "#...", "tint": {...}, "text": {...}, "main": {...} },
  "typography": {
    "mode": "mono" | "dual",
    "fontFamilyAccent": "<family>",
    "fontFamilyBody":   "<family>",
    "fontStyleNaming":  "space" | "joined",  // "Semi Bold" vs "SemiBold"
    "textCase": {
      "button":         "UPPER" | "ORIGINAL",
      "label":          "UPPER" | "ORIGINAL",
      "headline":       "ORIGINAL",
      "title":          "ORIGINAL",
      "body":           "ORIGINAL",
      "bodyStrong":     "ORIGINAL",
      "display":        "ORIGINAL"
    }
  },
  "radius": {                          // optional — present only when override is needed
    "xs": 2, "sm": 4, "md": 8, "lg": 12, "xl": 16, "max": 9999
  },
  "aliases": {                         // optional — explicit semantic retargets
    "main/brand/contrast": "palette/neutral/975"
  },
  "proposals": []                      // optional — flagged architectural extensions (do NOT auto-apply)
}
```

A runtime theme switcher (out of scope for this skill) reads this JSON and applies it as CSS variable overrides + Figma variable value overrides. The core `build-tokens.js`, `tailwind.config.js`, and Figma collection topology remain untouched.

---

## Phase 5: Verification
1. Render a Figma preview by applying the override values to the existing variable collections (variable value overrides only — no structural changes).
2. Screenshot the affected variant and visually compare to `concept.png`.
3. Run the diagnostic delta back through Phase 3 to confirm casing-per-role and font-family choices still hold.
4. If verification fails, iterate on the JSON. Do NOT edit `build-tokens.js` or the generated `tailwind.config.js` to "fix" the preview.

---

## Anti-patterns (PERMANENT)
- ❌ Editing `build-tokens.js` with concept-specific colors, fonts, or comments. Brand purple ≠ brand baseline, lime ≠ brand baseline, Inter ≠ baseline default font for every brand. The baseline is whatever the unmodified file says it is.
- ❌ Editing the generated `tailwind.config.js` by hand. It is rewritten by `build-tokens.js`; hand edits silently revert.
- ❌ Hardcoding `textCase = 'UPPER'` (or any permanent transform) into a token group. Casing is concept-driven, per UI role.
- ❌ Hardcoding a mono-or-dual assumption. Run the diagnostic every time.
- ❌ Mutating Figma collection topology (renaming collections, deleting alias slots, repacking ramp scales) to fit a single concept's needs.
- ❌ "Path B" maneuvers that ground concept-specific values into the codebase. The pipeline grounds the *architecture* into the codebase; concepts only ground into JSON overrides.

---

## 🧩 Section: Component Engineering & Architecture

### 1. Relational Color Mapping & Style Generation Veto (STRICT)
- **NON-NEGOTIABLE:** You are STRICTLY FORBIDDEN from creating new color styles, generating new variables, or inserting raw HEX/RGB values into the Figma file that do not already exist in the project's established token system.
- Rebranding and theme adaptation must be achieved EXCLUSIVELY by remapping existing baseline tokens based on a calculated relational hierarchy.
- Prior to processing any layout, scan the existing master components to discover mathematical relationships between layers (e.g., contrast deltas between backgrounds and foreground text, color shifts for interactive states like Hover/Active).
- Apply new brand colors by preserving these calculated relationships. If a conceptual design introduces an unmapped color, you must bind it to the closest compliant existing token or return a validation error. Never spawn temporary or rogue styles.

### 2. Adaptive Layout Layout Integrity (Hug vs Fill)
- Do not force component dimensions to default back to text boundaries or hardcoded sizes.
- Strictly respect and preserve the pre-existing spatial properties found in the source mockup. If a component (e.g., a button, input, or nested row) is set to `Fill Container` to stretch across its parent frame, maintain that responsive behavior. Use `Hug Contents` only where the element is explicitly designed to size itself strictly around its text copy length.

### 3. Atomic Assembly & Instance Slots
- Complex UI structures must be assembled exclusively using pre-existing atomic units (base buttons, badges, icons, inputs).
- For dynamic or interchangeable content areas within a component, utilize native Instance Swap properties (Slots) to allow seamless content replacement without mutating or breaking the underlying component architecture.

### 4. Anti-Hardcode Spatial Validation
- Audit all component layouts to ensure that internal padding (`Padding`), gaps between elements (`Gap`), and corner radiuses (`Radius`) are strictly bound to the project's predefined spatial grid system and radius strategy. Flag any hardcoded pixel values that drift from the design system rules.

### 🗂️ Component Naming & Directory Placement Mapping:
- **Naming Alignment:** The structural path and naming convention of a component within the Figma layout tree must mirrors its future directory location and filename in the codebase (e.g., `Category/Folder/ComponentName` in Figma translates directly to `src/components/category/Folder/ComponentName.tsx` in code).
- **Organization:** All master components must be strictly organized and extracted onto dedicated design system pages according to their architectural depth, keeping the working layout files completely clean and token-compliant.

---

## 🎨 Asset Exception Pipeline (amends the Style Generation Veto)

The Style Generation Veto in §1 above bans inventing rogue tokens. Real-world brand identities, however, require decorative assets that the baseline token system does not natively expose (textured fills, custom gradients, brand-specific shadows). This section defines the **single permitted escape valve**.

### 1. Decorative Asset Exception (SCOPED)
The following asset classes are permitted in a concept's finalized components even when the baseline does not pre-expose a slot for them:

- **Image fills** on component surfaces (e.g., textured "metallic plate" backgrounds for primary buttons).
- **Custom gradients** (`gradient/*` token family) used as fills or strokes.
- **Typography shadows** (e.g., `shadow/text/btn`) and other `shadow/*` Effect tokens.
- **Brand-specific color namespaces** that extend rather than replace the baseline (e.g., `tint/additional1/*`, `x1/*`).

This exception applies **only to decorative assets**. It does NOT relax the veto on:
- Inventing raw HEX values inside existing semantic slots (`main/*`, `text/*`, `tint/neutral/*`).
- Restructuring or renaming existing collections.
- Bypassing the relational mapping rules in §1 for any token that has a compliant existing slot.

### 2. The Proposals Pipeline (MANDATORY ROUTING)
When the concept requires an asset that has no compliant baseline slot, do NOT raise a validation error and do NOT block the build. Instead:

1. **Capture** the asset (token name, type, value, usage site) at the moment it is introduced.
2. **Route** it into the `proposals[]` array inside `themes/<slug>.theme.json` under a `"Concept-Specific Extension"` classification.
3. **Apply** it in the Figma preview and code as a per-concept addition — never write it into `build-tokens.js`, `tailwind.config.js`, or the baseline Figma collections.
4. **Surface** the proposals at handoff so the design system team can decide whether to promote any extension into the baseline (as an empty scaffold) in a subsequent baseline release.

### 3. `proposals[]` Entry Shape
Each entry in `proposals[]` must be self-describing enough for a reviewer to decide between "promote to baseline" and "keep concept-local":

```jsonc
{
  "id": "<stable-slug>",                          // e.g. "shadow-text-btn", "gradient-brand-plate"
  "class": "shadow" | "gradient" | "imageFill" | "namespace" | "rampExtension",
  "tokenName": "shadow/text/btn",                 // proposed token path
  "value": "...",                                 // resolved value (Effect spec, gradient stops, asset ref, etc.)
  "usedBy": ["<component path>", "..."],          // where this asset appears in the concept
  "rationale": "<one-line brand-identity reason>",
  "baselineImpact": "concept-local" | "promote-empty-scaffold" | "promote-with-default",
  "createdAt": "<ISO date>"
}
```

### 4. Anti-patterns under the Exception
- ❌ Using the exception to smuggle a rogue HEX into an existing `main/*` or `text/*` slot. The exception covers *new asset classes*, not *new values in existing slots*.
- ❌ Writing decorative assets into `build-tokens.js` or hand-editing `tailwind.config.js` to expose them. They live in the per-concept theme JSON until the design system explicitly promotes them.
- ❌ Omitting `proposals[]` entries for decorative assets that were applied. Silent application defeats the audit trail and re-creates the original veto violation.
- ❌ Treating the exception as a default. Run the relational remap first; only when no compliant slot exists may the asset be routed to `proposals[]`.
