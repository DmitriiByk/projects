---
name: forgex-architectural-doctrine
description: "Structural rules learned about the ForgeX design system file — page architecture, component decomposition, customization tiers, icon binding model, and per-component token conventions"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5558b810-b085-4076-9965-b52b71d84d0a
---

Architectural rules learned from inspecting the ForgeX design system file (`natBqfvZvRAk2RrvPIpBmo`). Each rule reflects an intentional pattern, not an accident — read these before any audit or fix in this file.

**READ RULE 0 FIRST.** It is the master policy that governs how every other rule applies — especially how to interpret which paints, strokes, and variables are "violations" vs intentional design freedoms.

## Rule 0 — Master Component Customization Hierarchy (THE GOVERNING POLICY)

**Why:** Every component in ForgeX is classified into one of three customization tiers, indicated by the stroke color on its COMPONENT_SET frame. The tier governs what may and may not be modified on instances of that component. All subsequent rules in this doctrine implement or qualify Rule 0.

### Tier 1 — Standard Components *(simple stroke / no special border)*

- **Customization scope:** Total freedom at the instance level. Designers may alter fills, strokes, layout, padding, radius, child layers — anything — to fit the specific context.
- **When to apply:** Generic primitives and atoms where downstream flexibility matters more than enforcement (basic Dividers, Skeletons, simple wrappers).
- **Audit posture:** Standard token-binding hygiene applies. Raw HEX on an instance is a violation as usual; bind to canonical tokens.

### Tier 2 — High-Custom Components *(🟩 GREEN border on COMPONENT_SET frame)*

- **Visual indicator:** The COMPONENT_SET frame's stroke is bound to `container/type/component/highCustom/borderColor = #06b204` (lime green). Documentation page: `🟩 Hight-Custom Component (stylize freely)`.
- **Customization scope:** Designers MAY freely modify the visual appearance on instances — add custom borders, shadows, gradients, background images, brand fills. This is the home of brand-aesthetic surfaces (Banners, Logos, hero cards, the metallic-plate ForgeX brand button).
- **PROHIBITED:** Altering the component's *internal logic, layer structure, auto-layout constraints, or padding/gap arithmetic*. Structure is fixed; only finish is free.
- **Audit posture:** Raw HEX, gradients, image fills, drop shadows on green-bordered components are NOT violations — they are the documented authoring affordance. **DO NOT flag them as hardcoded-paint errors.** DO flag: re-parented children, removed/added layers that change the API, broken or unbound auto-layout sizing.

### Tier 3 — Low-Custom / Configurable Components *(🟧 ORANGE border on COMPONENT_SET frame)*

- **Visual indicator:** The COMPONENT_SET frame's stroke is bound to `container/type/component/lowCustom/borderColor = #ff8a05` (orange). Documentation page: `🟧 Low-Custom Component (set the variables)`.
- **Customization scope:** Visual appearance is modified ONLY through the component's dedicated namespaced variables in the `component` collection (e.g., `❖ Menu/❖ Item/◆ default/textColor`, `❖ Header/borderColor`, `❖ Footer/backgroundColor`). Designers configure by editing variable values, never by overriding fills on the canvas.
- **PROHIBITED:** Manual instance-level layer overrides (changing fill/stroke/padding directly on a canvas instance). Also prohibited from the *audit side*: re-aliasing the namespaced variables to global tokens — doing so removes the customization knob the component exists to expose.
- **Audit posture:** `❖ Component/...` variables ARE the configuration interface. **Preserve them.** If a Low-Custom variable holds a raw HEX matching a current global token, that's storing the current product decision, not a frozen mistake. The right fix when the product decision changes is to update the variable's value or alias intentionally — never strip the variable. Flag: canvas-level fill/stroke overrides on instances of Low-Custom components.

### How Rule 0 governs the rest of this doctrine

- **Rule 3 (3-tier border visual system)** is the *implementation* of Rule 0 — the green/orange/default stroke colors are the in-canvas indicators of which tier each component belongs to. Rule 3's "don't delete the border tokens" guidance flows directly from Rule 0.
- **Rule 5 (per-component namespaced variables)** describes the *existence* of these variables; Rule 0 governs how to *treat* them per tier. The "alias to canonical token" advice in Rule 5 applies to Standard and High-Custom tiers. **For Low-Custom components, Rule 0 supersedes Rule 5 — preserve the namespaced variable.**
- **Rule 6 (contextual radiuses)** holds for all tiers; sharp-corner enforcement is never a system-wide policy regardless of tier.

### Detection at audit time

1. Read the COMPONENT_SET's `boundVariables.strokes[0].id`; resolve to the variable name.
2. Classify the component:
   - bound to `container/type/component/default/borderColor` → **Standard**
   - bound to `container/type/component/highCustom/borderColor` → **High-Custom**
   - bound to `container/type/component/lowCustom/borderColor` → **Low-Custom**
   - no binding → check the docs page or default to Standard
3. Apply tier-specific audit posture (see above).
4. If unsure, **inspect the COMPONENT_SET's stroke binding before flagging or fixing**. A raw `#06b204` fill on a green-bordered component is the *border itself*, not a violation; a raw gradient on a green-bordered hero card is intentional brand-aesthetic freedom, not a violation.

---

## Rule 1 — One-component-per-page with hierarchical sections

**Why:** The file uses a *page-as-component* convention. Every component lives on its own dedicated page (e.g., `  CardGroup`, `  IconButton`, `  Link`). Pages are organized into ALL-CAPS spaced-letter section headers (`C O M P O N E N T S`, `L A Y O U T`, `M E N U`, `C A R D S`, `M O D A L S`, `F O R M S`, `S Y S T E M`, etc.). Section dividers use bare `---` pages. Component pages use a two-space leading indent (`  CardGroup`).

**How to apply:**
- To locate a component by name: do NOT search the Instruction page or a single canvas. Walk `figma.root.children` and find the matching page (`  ComponentName`).
- One known top-level page (`Instruction`, id `168244:538806`) is the *entry / docs page*, NOT where production components live. Production components are dispersed across ~80+ pages.
- Section structure must be preserved. Never delete `---` divider pages or ALL-CAPS section headers — they're navigational.

## Rule 2 — Sub-component decomposition with dot-namespace

**Why:** Complex components (organisms) are broken into multiple COMPONENT_SETs on the same page, name-spaced with dot notation:
- `LeaderBoard` (page) → `LeaderBoard` + `LeaderBoard.Table` + `LeaderBoard.Table.Item.Place` + `LeaderBoard.Table.Item.Prize` (4 COMPONENT_SETs on one page)
- `InlineCardSlider` page → `InlineCardSlider` + `.Mask` + `.Stack` + `.Card`
- `GameBanner` page → `GameBanner` + `GameBanner.PlayButton`

Each sub-set is independently variant-able and instance-swappable. The parent composes them via INSTANCE_SWAP component properties (e.g., `InlineCardSlider.Stack` exposes `CardSlot1#...` through `CardSlot5#...`).

**How to apply:**
- When auditing, walk *all* COMPONENT_SETs on a component's page — auditing only the top-level set misses ~60-80% of the architecture.
- When fixing, fix at the deepest atomic set possible; changes propagate upward through composition. Don't rebuild a `LeaderBoard.Table` if the issue is in `LeaderBoard.Table.Item.Place`.
- Sub-component names are a designed contract — preserve the dot-namespace. `LeaderBoard.Table.Item.Place` is meant to be readable as "LeaderBoard → Table → Item → Place".

## Rule 3 — Three-tier customization border system (the *implementation* of Rule 0)

**Why:** The colored borders on COMPONENT_SET frames are the in-canvas visual indicators of Rule 0's three customization tiers. This rule documents the technical encoding; Rule 0 is the *policy* those borders enforce. Critical correction to earlier-session interpretation: these are NOT debug junk. Each tier has a dedicated documentation page in the file:
- `🟩 Hight-Custom Component (stylize freely)` doc page → `container/type/component/highCustom/borderColor = #06b204` (lime green border). Means: consumers may freely override styles.
- `🟧 Low-Custom Component (set the variables)` doc page → `container/type/component/lowCustom/borderColor = #ff8a05` (orange border). Means: consumers must use variable bindings only — no raw overrides.
- `container/type/component/default/borderColor = #0c1212` (dark teal border). Means: standard / no-special-policy component.

**How to apply:**
- **DO NOT delete `highCustom` / `lowCustom` / `default` variables wholesale** as I did in Batch 1 ("debug-green border purge"). That deletion stripped intentional documentation annotation tokens from the file.
- The Batch 1 deletion removed local copies but the user may have re-imported from a library; the system survives.
- If a component shouldn't carry one of these borders, the right fix is to *unbind that specific component's stroke from the tier variable*, NOT to delete the tier variable itself.
- When asked to "delete the debug border," clarify first: do they mean the *visible border on a specific frame* (unbind), or the *tier system itself* (rarely the right move).

## Rule 4 — Icon source-binding model + magenta mask-paint sentinel

**Why:** ForgeX uses a shared icon library (page id `1:8` "Icons"). Every icon used across components is an INSTANCE of a source VECTOR in that library, with source IDs in the `2125:*` and `4332:*` ranges. Two parts to the convention:

**(a) Source-binding propagation:** Binding the source vector's fill once propagates to every instance file-wide, UNLESS per-instance fill overrides exist. (Card Group's `picture-load` had 214 per-instance overrides that ignored the source binding — they had to be rebound individually.)

**(b) Magenta mask-paint sentinel:** Icons often use a `#ff00ff` (magenta) RECTANGLE behind a vector mask. The magenta is a *sentinel color* meaning "this is the icon-color slot" — the consumer doesn't change magenta; they bind the mask container's fill to the appropriate semantic token (`text/neutral/200` or whatever fits the context). Seen in `Icon` component (id `7145:28032`) variant=mask: `Color` rectangle holds #ff00ff intentionally.

**How to apply:**
- For icon color fixes, **always try source-binding first** (one bind = file-wide fix). Only fall through to per-instance binding if the source is already bound but the icon still renders wrong → instance override case.
- `#ff00ff` on an `Icon/*` mask-container Vector or Rectangle is NEVER a violation. It's the sentinel. Skip it in audits.
- Known source vector IDs already bound to `text/neutral/200` from prior batches: `2125:118670` (InfoCircle), `2125:118614` (ChevronRight), `2125:118676` (Search), `2125:118766` (ImageOutlined), `2125:118812` (Icon/Chip), `2125:118722` (Icon/DataAdd), `2125:118626` (Icon/ChevronLeft), `4332:160971` (Icon/Xmark), `2125:118736` (Icon/ExclamationTriangle), `2125:118790` (Icon/XmarkCircle).
- Discovered in Batch 3 but NOT YET BOUND: `2125:118730` (Icon/Loader, used in IconButton), `2125:118772` (Icon/Play, used in GameBanner), `83196:12572` (Icon/Coins/Default, used in LeaderBoard).

## Rule 5 — Per-component namespaced variables (`❖ Component/◆ variant/property`)

**Why:** Components have their own variable namespace using a glyph convention: `❖` (white diamond) for the component, `◆` (black diamond) for the variant or property. Examples:
- `❖ Callout/◆ info/iconColor: #705516`
- `❖ Badge/◆ Timer/◆ warning/borderWidth: 0`
- `❖ ButtonGroup/❖ Item/◆ primary/◆ default/borderWidth: 1`
- `❖ ToggleButtonGroup/❖ Item/borderWidth: 0`

These are valid variables, but they often hold **raw HEX or numeric values rather than aliasing to the canonical `main/*`, `text/*`, `tint/*` semantic tokens**. Frozen at the time the variant was authored.

**How to apply (READ RULE 0 FIRST — tier classification changes everything below):**

- **For Standard / High-Custom tier components:** namespaced color variables (`❖ X/◆ Y/textColor`) should be **aliased to canonical tokens**, not held as raw HEX. If `❖ Callout/◆ warning/iconColor = #f19437`, alias to `main/warning/base` so brand changes propagate.
- **For Low-Custom tier components (🟧 orange-bordered): Rule 0 OVERRIDES this rule. DO NOT alias `❖ Component/*` variables to global tokens.** They are the configuration interface — the customization knob the component intentionally exposes. Aliasing them to globals removes the knob. If the raw value is stale, update the raw value or alias *only when the global IS the intended new default*. Never alias as a reflex to "tighten" the system; you're loosening the component's API.
- All tiers: "soft hardcoding" = the paint IS bound to a variable but the variable holds a raw value. Whether to alias depends on the tier (above). Detect by checking the COMPONENT_SET's tier classification before deciding.

## Rule 6 — Component geometry uses contextual radiuses, NOT a flat sharp-corner rule

**Why:** ForgeX deliberately uses different corner-radius tokens per component to express different shape semantics. There is **no system-wide rule that components must use `radius/xs = 0`** ("sharp corners"). The `radius/xs = 0` value on the Finalized Brand Button was a *component-specific* aesthetic (metallic-plate CTA chrome), not a global identity directive.

Confirmed cases of intentional contextual radiuses (do not "correct" these):
- **Chip** uses `radius/xl = 16` (pill shape) — a recognized convention for badge-like elements; user explicitly confirmed this stays.
- **Cards** (CardGroup, Card Slider, Categories, Headline) use `radius/sm = 4` extensively — appropriate for card surfaces.
- **Button / ButtonGroup.Item** use `radius/xs = 0` post-Batch-1 rebind — that's the brand button identity.
- **Callout** uses its own `❖ Callout/radius = 12` (`radius/lg`) — component-specific.
- **BoxedTabs** uses unbound `cornerRadius = 4` on its container — needs binding but the radius *value* is intentional.

**How to apply:**
- When asked to "align to brand identity," DO NOT extrapolate one component's radius choice to others. Confirm per-component before rebinding any radius token.
- The Batch 1 ButtonGroup.Item rebind (`radius/sm → radius/xs`, 464 corners) was the *one* authorized identity-rebind — do not repeat it on Cards, Chips, Callouts, Headlines, Categories, etc.
- See [[feedback-forgex-radius-doctrine]] for the original correction.

## Rule 7 — Collapse heavy variant matrices to BOOLEAN + INSTANCE_SWAP

**Why:** Several components encode content-presence flags (`hasIcon`, `hasLabel`, `hasCheckbox`, `hasCounter`) as VARIANT axes, exploding the matrix:
- `ButtonGroup.Item/Default` had 9 VARIANT axes = 1,024 theoretical variants, 32 actually built. Most axes were booleans masquerading as variants.
- `ButtonGroup` parent set encoded item-count + columns as variants (`cols=1, items=13` etc.), 11 explicit configurations — meaning consumers couldn't have a 7-item group without authoring a new variant.

The fix pattern is composable architecture rather than enumerated permutations:
1. **Boolean component properties** for binary content toggles: `hasIcon`, `hasLabel`, `hasCheckbox`, `hasCounter`, `hasBadge`, `hasDivider` — these belong as `BOOLEAN` props on the COMPONENT_SET, wired to control child layer visibility. ForgeX already uses this pattern correctly on `BoxedTabs.Item` (`hasBadge`), `Accordion.Item` (`hasDivider`), `LeaderBoard` (`hasTitle`, `hasSubtitle`), `GameBanner` (`overlineText`, `titleText` as TEXT props).
2. **INSTANCE_SWAP slots** for variable-count compositions: parent container is a single auto-layout with N child slots exposed as `INSTANCE_SWAP` properties. Reference implementation already in the file: `InlineCardSlider.Stack` exposes `CardSlot1`, `CardSlot2`, `CardSlot3`, `CardSlot4`, `CardSlot5` — fixed-slot composition. Should be applied to ButtonGroup parent set (replace `cols × items` variants with auto-layout + slots).
3. **Sub-component decomposition** (Rule 2) for genuinely-different sub-elements: `LeaderBoard.Table.Item.Place` and `LeaderBoard.Table.Item.Prize` as separate atomic COMPONENT_SETs, composed into `LeaderBoard.Table`. Apply when sub-elements have meaningfully different internal structure, not just different content.

**How to apply:**
- **Threshold for refactor:** a component with >5 VARIANT axes OR >100 actually-built variants is a refactor candidate. Boolean-style variant names (`has*`, `is*`, `with*`) are immediate flags for BOOLEAN-prop conversion.
- **High-risk operation:** this refactor *detaches all existing instances* of the component file-wide and breaks Code Connect mappings. Never execute in a single pass. Plan as a coordinated migration: branch the Figma file, update Code Connect mappings, stage instance reattachment. Batch 1's user-deferred ButtonGroup matrix collapse is the canonical example.
- **Safe related cleanups** that don't touch instances: drop single-option VARIANT axes (e.g., `variant=["default"]` only), rename axes for clarity, add new BOOLEAN props alongside (without deleting variants). Save the matrix-collapse itself for the planned migration.

## Bonus observations (kept short)

- **Page-extent marker:** every component page's first top-level child is a thin ` ` (single-space-named) RECTANGLE at (0,0). Skip in traversal.
- **TEXT component properties for copy:** high-content components (Link `labelText`, GameBanner `overlineText`/`titleText`, LeaderBoard `titleText`/`subtitleText`, LeaderBoard.Table.Item.Prize `amountText`) parameterize their text as `TEXT` component properties rather than hardcoding the layer characters.
- **Variant-explosion correlation with cleanliness:** the high-variant components (Link 126, IconButton 80, LeaderBoard.Table 8) are mostly *clean* on hardcoded paints — variant scaling forces token discipline. The "atomic" sub-components (Item.Place, Item.Prize, Logo/App, Logo/Default) are also clean. Bloat lives in the *medium* layer where component-namespaced tokens proliferate (Callout, ButtonGroup.Item).
- **Card-family `#808080` mask placeholder** is consistent across CardGroup, CardSlider, InlineCardSlider — a documented image-slot stand-in, not a token violation.

### Batch 4 micro-patterns

- **Surface dichotomy `on=base` vs `on=tint`** — Inputs (and presumably any input-like component) declare which surface they sit on via an explicit VARIANT axis. Background tokens swap accordingly: `on=base` uses `tint/neutral/50` (lighter than base canvas), `on=tint` uses `base` (darker than the tinted card surface). Demonstrates the "contextual contrast" principle — components don't assume their parent surface; consumers pick the variant matching where they're placing it. Apply this pattern to any component that ships on both raw page surfaces and tinted cards.
- **Canonical focus-ring token: `tint/neutral/200`** — both Input and RadioButtonGroup.Item bind their focused-state outer stroke to `tint/neutral/200` across every variant. Single token = file-wide consistent focus appearance. Treat as the de-facto focus-ring token; new interactive components should follow.
- **`isEmpty` boolean for placeholder text semantic** — Input's text color flips to `text/neutral/300` when `isEmpty=true`, `text/neutral/200` when populated. Data-state-driven placeholder behavior via a BOOLEAN component property rather than a dedicated placeholder TEXT prop.
- **`validation` as a separate orthogonal axis from `state`** — Input has independent `state=default|hovered|focused|disabled` × `validation=default|success|error`. Allows e.g. `focused + error` combos. Validation primarily shifts text color (error → `text/negative/base`) and leaves surface alone; success leaves visuals unchanged. Validation depends on adjacent icons/labels for full status communication, not on input-internal coloring.
- **ProgressBar discrete-progress matrix** — encodes progress as `progress=0|25|50|75|100` × `size=lg|md|sm` = 15 variants. Genuine refactor candidate (Rule 7 collapse): single component with numeric `progress` component property + dynamic fill-width binding would replace the matrix. Static enumeration was probably authored when Figma lacked dynamic numeric props.
- **Locked library convention `system 🔒/❖ X/...`** — variables prefixed with `system 🔒/` (literal 🔒 emoji) are library-protected and must not be modified by consumers. Companion to Rule 5: `❖ Component/...` is the writeable consumer namespace; `system 🔒/❖ Component/...` is the immutable library version.
- **`MainBanner.Game.Progress` sub-decomposition** (Progress + Fill + Track + Milestone) — complex domain-specific progress components are built by composing the generic ProgressBar primitives with new atoms (Milestone markers). Don't fork the generic ProgressBar — extend via composition. Same architectural pattern as Rule 2 (dot-namespace decomposition) but applied at the design-language level: "GameProgress is ProgressBar plus milestones."
- **Stale-concept hazard in `❖ Component/...` namespaced color variables** — these variables hold raw HEX from when the variant was authored; a brand swap does NOT update them. Confirmed cases retroactively re-aliased after Batch 4:
  - `❖ Link/◆ tertiary/◆ default/textColor` was frozen at `#777790` (pre-ForgeX cool grey) → re-aliased to `text/neutral/300`.
  - `❖ Header/borderColor`, `❖ Header/backgroundColor`, `❖ Card/❖ Headline/primaryTextColor`, `❖ MainBanner/❖ Pagination/...` — all held raw HEX matching *current* tokens but would have drifted on next rebrand → re-aliased to canonical `tint/*`, `base`, `text/*`, `main/*`.
  - Detection rule: when a `❖/◆`-namespaced color variable holds a raw value, alias it to the closest canonical semantic token even if the value currently matches. The audit catches stale values; the alias prevents future drift.

### Batch 5 macro-tier patterns

- **Brand-protected logo/flag colors are the 3rd intentional sentinel category** (alongside `#ff00ff` magenta mask and `#808080` card-mask placeholder). Payment-logo brand colors (Visa `#1434cb`, Mastercard `#ff5f00` + `#eb001b` + `#f79e1b`, Maestro `#ebab1f`), country-flag colors (US `#0a17a7` + `#e6273e`), social-icon brand colors, and brand-guideline-mandated greys (Google Play badge `#a6a6a6`) are *legally fixed* and MUST NOT be rebound to theme tokens. Exclude these from token audits — a teal Mastercard logo is wrong. Detection rule: VECTOR fills inside `PaymentLogo`, `Group 3258`, `Icon/En`, `Icon/{Visa,Mastercard,...}`, `Footer.AppButton`, `google-play-badge`, `app-store-badge` are protected.

- **Layout-shell theming knob convention** — every macro layout container exposes its own `❖ X/backgroundColor` (+ optionally `borderColor`/`borderWidth`) as a writeable consumer-namespace variable. Confirmed for `❖ Layout`, `❖ MainMenuSidebar`, `❖ MainMenuDrawer`, `❖ Header`, `❖ Footer`, `❖ Backdrop`. These should all be aliased to canonical tokens (`base`, `tint/neutral/*`) rather than holding raw HEX. Pattern emerges: macro-layout shells declare ONE central theming knob each rather than scattering theme bindings across descendants.

- **Per-component breakpoint metadata** — each macro component declares its responsive operative range with three vars: `breakpoint/width/{default, min, max}`. Confirmed values per component: Layout = `default:360, min:320, max:767` (mobile-range), MainMenu = `default:360, min:1280, max:1919` (laptop-range), Footer + ChallengesPage = `default:360` only. Breakpoints are NOT a single global table — each macro component scopes its own range. New components should follow the same three-var convention.

- **State-aware geometry tokens for collapsible UI** — `❖ MainMenuSidebar/◆ expanded/padding{Left,Top,Right,Bottom}` paired with `◆ collapsed/padding{...}` shows how stateful layout components declare per-state geometry. Current values are symmetric (12px everywhere in both states) but the architecture allows asymmetric per-state. Apply to any other expand/collapse/open/closed UI: declare both states' paddings explicitly even if they currently match.

- **Atomic shadow composition** — shadows are built from sub-token primitives composed into one Effect token:
  ```
  shadow/outer/color/neutral/200   = #0000001a
  shadow/outer/size/sm/x           = 0
  shadow/outer/size/sm/y           = 4
  shadow/outer/size/sm/blur        = 12
  shadow/outer/size/sm/spread      = 0
  shadow/outer/sm/neutral/200      = Effect(DROP_SHADOW, color: <color>, offset: (<x>, <y>), radius: <blur>, spread: <spread>)
  ```
  The composed shadow token references the atomic primitives by name. Allows tweaking shadow appearance by editing one primitive (e.g., bump `blur` from 12 to 16) without touching every consumer. New shadow tokens should follow this `color × size × composed-Effect` decomposition.

- **Library-wide naming hygiene debt** — recurring authoring artifacts across the file:
  - `??` placeholder suffix on uncertain variable names (`borderWidth??`, `paddingTop??`) — never cleaned up after authoring.
  - Typo orphans: `Accordeon` (vs Accordion) — siblings of correctly-spelled variables, both kept active. `neutrlal` typo in shadow-color token names (fixed in Batch 5 → `neutral`).
  - Colon-prefix node names: `Dev:Page` — Batch 5 confirmed this was NOT a dev artifact but a legitimate responsive Layout component, just mis-named with a misleading prefix. Renamed to `Layout.Page` to fit the dot-namespace convention (Rule 2).
  Most typo-orphan variables live in remote libraries and can't be deleted from local consumers (same restriction as `isDev` / `highCustom`). Cleanup must happen at the library publisher level.

- **Token cascade verification = full-page assembly test.** When a brand value is overwritten centrally (Batch 1 + 4 variable injection), the only confident way to verify propagation is to audit a real composed page with thousands of nested instances. ChallengesPage (11,985 walked nodes) confirmed `main/brand/base: #9a721b` (ForgeX gold) + `text/brand/base: #418383` (teal dual-character) + `main/neutral/base: #3a7d7d` (teal) all landed correctly through the entire component composition chain. **Full-page renders are the cascade-test rig**; component-set audits alone don't validate the cascade.

- **Content-context as a variant dimension** — MainMenu has three parallel top-level variants: `MainMenu/Default`, `MainMenu/Semantic`, `MainMenu/Sport&Casino`. These aren't size/state variants — they're *content-context* variants, the same component rendering its MainMenu.Item primitives differently depending on the surrounding product context (generic vs sport vs casino product flow). A 4th dimension beyond size × state × variant: content-context. Useful when one component must visually adapt to the page's domain while keeping the same atomic API.

### Batch 4 cumulative gaps surfaced (followup hazards to track)

- **`main/accent/*` was overlooked in the Batch 1 variable overwrite** — only `main/brand/*` + `main/neutral/*` + `text/*` + `tint/*` were updated. Accent slots still held pre-ForgeX lime green `#7fc03d` until Batch 4 fixed them. **Lesson:** the canonical semantic-color groups in `theme` are `base`, `inverse`, `main/{neutral,brand,accent}/*`, `tint/{neutral,brand}/*`, `text/{neutral,brand,positive,negative,info,warning}/*`. Future rebrand passes MUST cover all of these, not just the common neutral+brand pair.
- **`text/positive/*`, `text/negative/*`, `text/info/*`, `text/warning/*` and `main/{positive,negative,info,warning}/*`** were NEVER overwritten in any batch. They may legitimately stay at universal status colors (red=error etc.) regardless of brand, but confirm this is intentional rather than another oversight.
- **`isDev` variable persists via remote-library reference** — local-level `.remove()` clears local instances but the variable resurfaces because consumers reference it through a published-library import. Same pattern as the `highCustom` debug-tier tokens. Cleaning up requires touching the upstream library, not local consumers.

### Retroactive implications of Rule 0 (post-amendment audit)

Rule 0 was injected *after* Batches 1-5 had already executed. Several actions in prior batches were taken under the old (looser) understanding that `❖ Component/*` namespaced variables should always be aliased to canonical tokens. Under Rule 0, these decisions require per-component tier re-classification:

- **Batch 4 re-aliasings of 7 namespaced vars:** `❖ Link/◆ tertiary/◆ default/textColor`, `❖ MainBanner/❖ Pagination/❖ Item/◆ active/{borderColor,backgroundColor}`, `❖ Header/{borderColor,backgroundColor}`, `❖ Card/❖ Headline/{primaryTextColor,accentTextColor}`. If any of the source components (Link, MainBanner, Header, Card) is classified Low-Custom under Rule 0, the aliasing removed its customization knob and should be reverted (restore raw value held at the variable level).
- **Batch 5 re-aliasings of 6 namespaced vars:** `❖ Layout/backgroundColor`, `❖ MainMenuSidebar/{backgroundColor,borderColor}`, `❖ Footer/backgroundColor`, `❖ Tooltip/textColor`, `❖ Link/◆ secondary/◆ default/textColor`. Same evaluation needed — these are layout-shell theming knobs, and several (Layout/Sidebar/Footer) are *likely* Low-Custom by intent (the doctrine page named them as configurable shells).
- **Re-classification protocol:** for each re-aliased variable, inspect the parent COMPONENT_SET's stroke binding. If `lowCustom` → revert the alias and restore an editable raw value at the variable level. If `default` or `highCustom` → the alias stands.
- **High-Custom audit retraction:** any prior batch that flagged a raw HEX fill, gradient, or image fill on a green-bordered COMPONENT_SET as a violation was wrong by Rule 0. Those are intentional brand-aesthetic affordances. No specific Batch 1-5 action triggered this (most fixes targeted icon-source vectors, which are tier-neutral), but the audit *findings* tables in past summaries that listed gradient/image fills on green-bordered components should be mentally retracted.

The Batch 1 deletion of local `container/type/component/highCustom/*` variables is now a known mistake — it removed local copies of the tier indicators. The variables resurfaced via remote library import (documented under "remote-library survivors") so the system survived, but future sessions should NEVER delete these — they encode tier membership per Rule 0.

## Design Tricks & Mechanics

This section documents non-obvious visual techniques used in ForgeX where the *absence* of structure, or the deliberate gap between layered components, is the structural mechanism itself. These are easy to break with well-intentioned "cleanup" passes that fill, simplify, or solidify what is intentionally empty.

### Entry #1 — The Layered Negative Space Gap

**Mechanic.** Complex chrome buttons (and other multi-layer metallic/textured surfaces) are built from at least two separately-instanced background components: an outer **stroke/bezel** layer and an inner **fill/texture** layer. The premium depth and the "this is a sculpted physical object" reading come from a small, deliberate gap of *empty pixels* between those two layers — typically 2-4px depending on size — through which the underlying canvas (or absence thereof) shows.

**The trap.** The button's *container frame* — the COMPONENT variant that hosts both layers — must remain **completely transparent**: no native `fills`, no native `strokes`. If the container has any solid fill (even an accent-token alias), that fill sits behind both layers and *occupies the gap*, turning the layered composition into a flat color block. The stroke/bezel and fill/texture still render correctly individually, but the negative space between them is no longer empty — it's painted — and the depth effect is destroyed.

This is counterintuitive because the gap is *not encoded anywhere*. There is no `gap` property, no spacer node, no shadow. The space exists only because the stroke layer is sized slightly larger than the fill layer, and the container behind them is transparent. Programmatic auditors that flag "container has no background fill" as a bug and helpfully add a default fill will silently destroy every chrome button in the file.

**How to apply:**
- For any button/surface variant that hosts ≥ 2 absolute-positioned chrome instances (stroke + fill, or stroke + fill + texture overlay), the variant container's `fills` and `strokes` MUST be empty arrays. Quaternary/ghost variants follow the same rule for the same reason.
- Never set a "default" container background "for safety" on a chrome-bearing variant. Safety here looks like emptiness.
- When auditing a chrome button visually, the test is: zoom into the 2-4px border region between stroke and fill — you should see canvas (or whatever is behind the button on the page), not paint. If you see paint, the container has been filled and the depth is lost.
- When porting a chrome variant matrix from a reference set into a fresh target set: copy the chrome instances, but do NOT copy the container's `fills`/`strokes` array — clear them explicitly. Default values on freshly-cloned variants are NOT safe to keep.
- This trick generalizes: any multi-layer composite where one layer is intentionally inset from another relies on the same negative-space mechanic. The Plus icon mask convention (`#ff00ff` magenta sentinel) is a related-but-different pattern — magenta is *active* erasure via a known color; the gap mechanic is *passive* erasure via absence.

**Concrete instance:** the target Button set (`84:48081`) reskin in Batch 9 initially copied chrome instances correctly but kept the variants' inherited SOLID fills (teal/dark-teal/dark across 77 variants). Result: every primary/secondary/tertiary button rendered as a flat slab even though the chrome instances were positioned correctly. Fix: explicit `fills = []` + `strokes = []` on every variant container, with the quaternary ghost variants treated as the exemplar (already correctly empty by design).

#### Variation A — The Auto-Layout Padding Method

A simpler, procedural alternative to the absolute-positioned stroke+fill stack for *clean vector* buttons (flat colors with a single stroke, no metallic textures or multi-layer image fills). The gap is generated by layout math instead of asset sizing.

**Structure (two nested Auto-Layout frames):**
- **Outer Frame** — carries the **stroke/border**. `fills = []` (no background). `layoutMode = HORIZONTAL` or `VERTICAL`. The container that gets the visible outline.
- **Inner Frame** — carries the **solid fill color** + the button's content (icons, label). Sized `FILL` on both axes so it expands inside the outer frame.

**The gap mechanic.** Set the Outer Frame's padding uniformly — `paddingLeft = paddingRight = paddingTop = paddingBottom = 2` (or 3, or 4 depending on size step). That padding *is* the gap. The Inner Frame, sized FILL, automatically shrinks inward by exactly that amount on every edge, producing a mathematically perfect, responsive negative-space ring between the stroke (drawn on the outer frame's edge) and the colored fill (starting at the inner frame's edge).

**Why this works.** Unlike the absolute-positioned variation, the gap is not encoded in chrome asset sizing — it's computed by the auto-layout engine every time the button resizes. The gap stays mathematically exact at every width and every dynamic content length. No per-size insets to maintain, no chrome variants to author, no asset-vs-frame coordination.

**When to choose Variation A vs the base (absolute) mechanic:**
| Use Variation A when… | Use the base absolute mechanic when… |
|---|---|
| Button is flat-color with a single stroke | Button has metallic / textured / multi-layer image fills |
| Stroke is a uniform line (solid color, single weight) | Bezel needs separate left/center/right artwork or per-state highlights |
| You want one component to scale to any size | You have a pre-sliced 3-section chrome matrix with per-size proportions |
| There is no published chrome COMPONENT to instance | You're matching a reference set's chrome routing 1:1 |
| Content-driven width (HUG / FILL) is the norm | Width is fixed per variant and chrome must align exactly |

**How to apply:**
- Build the Outer Frame first with `fills = []`, your desired `strokes` (single SOLID, weight from a token), `cornerRadius` from a token, and `paddingLeft/Right/Top/Bottom = N` where N is the size-step gap (commonly 2 / 3 / 4 for xs / md / lg sizes — keep it consistent across the size axis).
- Append the Inner Frame as the *first* child. Set its own `fills` to the button's color token, `cornerRadius` to the outer's radius minus N (so the inner corner sits inside the outer corner cleanly), and `layoutSizingHorizontal = "FILL"`, `layoutSizingVertical = "FILL"`.
- Append button content (icons, label) inside the Inner Frame, NOT inside the Outer Frame. The Outer Frame's only job is "stroke + padding."
- Never set a fill on the Outer Frame. Never set a stroke on the Inner Frame. Either inversion collapses the gap.
- For state variants (hovered/pressed/disabled), only the Inner Frame's fill color (and optionally the Outer Frame's stroke color) changes — the gap math stays identical across states.

**Trade-off vs Entry #1's base mechanic.** Variation A is structurally cheaper (1 component, native layout) but cosmetically limited (cannot do textured/metallic chrome, cannot do per-side asymmetric bezels). The base mechanic is more expensive (chrome COMPONENT matrix per size+state) but supports the full premium-asset visual vocabulary. Both rely on the same underlying truth: *the gap is the design*.

### V9 lesson — Never math-scale a single asset when source provides a per-variant matrix

When the source design has explicit, dedicated variants for every size × state combination (e.g., `Component 1` in `168407:121243` with 3 sizes × 3 states = 9 cells, each holding pre-baked image hashes and per-size proportions), the correct replica is **a matching local COMPONENT_SET with one variant per cell**, not one component with programmatically scaled geometry.

**Why:** the design team's per-cell artwork encodes things math-scaling can't recover — different base image hashes between size rows (defaults: lg uses `20a60323...`, md/sm use `29ec575b...`), state-specific overlay layers absent from other states (hover adds `5014288a...` highlight + `1968f639...` detail; pressed adds `e4770245...` shadow + `8f5051c6...` depth + `0ef4e0ca...` detail), and per-size proportioned stroke widths/capsule highlights designed for each layout context. Scaling one cell's bitmap to a smaller frame just compresses pixels, losing the variant-specific artistic decisions.

**How to apply:**
- Before building, audit the source for a per-variant matrix. Read every variant's `l/c/r` (or analogous) sections to discover whether each cell uses unique image hashes, unique child counts, or unique multi-fill stacks. If yes, plan a matching local matrix.
- Build one local COMPONENT per source variant. Combine via `figma.combineAsVariants` into a single COMPONENT_SET with the same property axes (size × state) as source.
- Each variant must use the source's actual per-cell image hashes (not a single shared hash with different transforms). Image hashes persist in the file's image registry even when source components are remote, so they're reusable from local components.
- Preserve the inner responsive structure (e.g., `l/c/r` 3-section layout with FILL/STRETCH constraints) — only the *artwork* differs per variant, the *responsive math* stays the same.
- Wire each consumer variant (e.g., MainBanner.Button branded × {size × state}) to the matching chrome variant via `instance.swapComponent(chromeVariant)`. Don't try to share one chrome instance across multiple size/state cells.

**Concrete instance:** V8 used a single BackgroundChrome COMPONENT (168386:1205) with cap widths math-scaled 40→27 for md/sm and was rejected. V9 replaced it with a 9-variant BackgroundChrome COMPONENT_SET (168435:1412), and MainBanner.Button (4050:45382) grew from 12 → 18 variants (added hover/pressed branded × lg/md/sm) so every branded cell hosts its matching chrome.

This is now Rule 10 of the doctrine: **per-variant fidelity over programmatic scaling when source provides the matrix.**

### Audit Rule — Background Implementation Verification (pre-handoff check)

**The problem this solves:** when porting a component, the background fill may be implemented in several legitimate ways. Assuming one technique and applying it universally causes silent regressions — a frame that should have `fills = []` gets a solid fill, or a required inset shape is never added.

**Rule: never assume — always read the reference first.**

Before finalising any component migration, compare the background implementation between source and target. The background of any frame or embedded interactive element can be built in multiple valid ways:

| Technique | Structure signature |
|---|---|
| **Direct frame fill** | `frame.fills.length > 0` — fill sits on the root frame itself |
| **Inset shape** | `frame.fills = []` + child `Rectangle` at `(x:N, y:N)` with `w: frameW - 2N, h: frameH - 2N` carrying the fill — creates a visible gap/margin |
| **Negative space gap (Entry #1)** | Two absolute-positioned chrome instances (stroke + fill), root frame `fills = []` — gap is the absence between them |
| **Auto-layout padding (Variation A)** | Outer frame `fills = []` with padding `N`, inner FILL child carries the fill |
| **Component variable** | Fill bound via `❖ Component/backgroundColor` variable — no direct paint on the frame |
| **Image / gradient fill** | Fill is `IMAGE` or `GRADIENT` type, possibly on a dedicated child shape |

**Verification checklist (run on every embedded interactive element and every ported variant):**

1. Read `source.fills` — is it empty or populated?
2. If empty: find what child node carries the visual background. Note its type, size, position, and variable binding.
3. Confirm the target mirrors the exact same structure — same node carrying the fill, same size relationship, same token binding.
4. **Red flag:** `source.fills = []` but `target.fills.length > 0` (or vice versa) — structure mismatch, regression.
5. **Red flag:** source has a child background shape that target is missing entirely — the shape was lost in migration.

**Concrete instance (Batch Input migration):** `Input.Button` in the reference has `fills = []` on the root `48×48` frame + a child `Rectangle 40×40` at `x:4, y:4` carrying `tint/neutral/d100`. The migrated target had the fill applied directly to the root frame — visually similar but structurally wrong: no inset gap, fill bleeds to the full frame edge. Fix: clear `fills` on root frame, add inset `Background` child with correct dimensions and token binding.

**Rule: check per-variant, not per-component.** Different variants of the same COMPONENT_SET may have fundamentally different layer structures. Before adding or removing any layer, inspect each variant in the reference individually — do not assume all variants share the same structure. Example: `Input.Button/variant=tinted` has a `Background` rect; `Input.Button/variant=clear` does not. Applying the same operation blindly to all variants creates phantom layers in clear/ghost/ghost variants and holes in the rendered output.

**Rule: layer naming is UpperCamelCase, functional.** When creating new layers during migration, never use Figma auto-generated names (`Rectangle 240650036`, `Frame 123`, `Group 4`). Name by function: `Background`, `Border`, `Overlay`, `Mask`, `Shadow`. This applies even when the reference uses an auto-generated name — the reference may itself be non-compliant. Apply `DESIGN_SYSTEM_GUIDE.md §1.1` to all new layer names.

---

### Rule 11 — Pre-Migration Size Audit (mandatory before touching any multi-size component)

**The problem this solves:** `lg` and other outlier sizes frequently have a fundamentally different internal structure compared to `xs/sm/md` — different `layoutMode` on container frames, different child types (a `Group` instead of individual instances, a `VERTICAL` layout instead of `HORIZONTAL`), different child counts. Discovering this mid-migration causes wasted iterations and scope creep.

**Rule: read every size variant individually before writing a single line of migration code.**

Before starting any migration that involves multiple size variants:

1. Fetch one variant per size from the reference (e.g. `default` state across `xs`, `sm`, `md`, `lg`).
2. For each size, record: `layoutMode` of every container frame, `type` and `name` of every direct child, child counts, and fill types (`SOLID` vs `GRADIENT_LINEAR` vs `IMAGE`).
3. Flag any size that deviates from the dominant pattern — treat it as a separate migration case, not an edge case to patch later.
4. Only then write the migration script, branching explicitly per size.

**Concrete instance:** `IconButton` border frame (`button-border`) uses `HORIZONTAL` layout with 5 `INSTANCE` children for `xs/sm/md`, but `VERTICAL` layout with a `Group` + `FRAME` child for `lg`. Discovering this after migrating all 45 `xs/sm/md` variants required a separate `lg` pass and introduced regressions on earlier sizes.

---

### Rule 12 — Gradient Fill Inheritance (never override gradient fills on instances)

**The problem this solves:** gradient fills store multiple bound variables — one per gradient stop. Calling `setBoundVariableForPaint()` on an instance replaces the entire gradient with a single solid fill, silently destroying the multi-stop gradient inherited from the master.

**Rules:**

- Before applying any fill override to an instance, check `instance.fills[0].type`. If it is `GRADIENT_LINEAR` or `GRADIENT_RADIAL` — **do not touch it**. The instance inherits the gradient correctly from its master; no override is needed.
- Only apply `setBoundVariableForPaint()` when `fills[0].type === "SOLID"` and you explicitly need to change the color token.
- If a gradient stop's variable binding must change, do it on the **master component**, not on the instance. The change propagates to all instances automatically.
- Detection at audit time: if a texture instance renders as a flat color block when it should have a gradient, check whether `fills[0].type` was silently mutated from `GRADIENT_LINEAR` to `SOLID`.

**Concrete instance:** `tertiary`, `secondary`, and `primary` texture instances in `IconButton` all carry `GRADIENT_LINEAR` fills with 2 bound variables each. Applying `setBoundVariableForPaint()` during migration flattened all gradients to solid fills, requiring a separate fix pass to restore inheritance by clearing the fill overrides.

---

### Rule 13 — resetOverrides() is Forbidden for Targeted Cleanup

**The problem this solves:** `instance.resetOverrides()` resets ALL overrides on an instance — fills, strokes, layout positioning, visibility, text content, child overrides — not just the property you intend to clear. Using it for targeted fill cleanup silently destroys positioning, icon visibility, and other intentional overrides.

**Rules:**

- **Never call `resetOverrides()`** as a way to "clean up" fills or strokes on an instance. It is a nuclear reset, not a scalpel.
- To clear only fills: `instance.fills = []`
- To clear only strokes: `instance.strokes = []`
- To restore gradient inheritance specifically: set `instance.fills = []` — this removes the override and lets the master's gradient show through.
- The only legitimate use of `resetOverrides()` is when you explicitly want to wipe every override on an instance and restore it to 100% master state. Document this intent in a comment when you do it.

**Concrete instance:** calling `resetOverrides()` on Icon instances inside `IconButton` during a fill cleanup pass wiped their `layoutPositioning = ABSOLUTE` and centering overrides, causing all icons to reflow out of position. Required a separate pass to re-center all 60 variants.

---

### Rule 14 — Scope Discipline (never expand scope mid-migration without explicit approval)

**The problem this solves:** mid-task scope expansion — touching components or variants not in the original request — introduces regressions in areas that were previously stable, and makes rollback harder because the blast radius is larger than the original task.

**Rules:**

- Before starting, state the exact scope: which component, which variants, which properties.
- If during execution you discover that a related component also needs fixing (e.g. `quaternary` while working on `primary/secondary/tertiary`), **stop and surface it as a proposal** — do not silently include it in the current pass.
- Complete the scoped task first, verify it, then handle the adjacent finding as a separate task.
- The correct response to discovering an out-of-scope issue: "I noticed `quaternary` also has token mismatches. Should I include it in this pass or handle it separately after we verify `primary/secondary/tertiary`?"

**Concrete instance:** while migrating `primary/secondary/tertiary` token bindings on `IconButton`, `quaternary` was also modified without explicit approval. This introduced incorrect token bindings (`tint/neutral/100` as icon color) that required a full rollback of all 80 variants and a separate restoration pass from the reference.

---

### Rule 15 — Always Fix at Master Level

**The problem this solves:** fixing text, fills, or icons directly on a variant or instance instead of the master component creates per-instance overrides that break component consistency and are invisible to consumers of the library.

**Rule:** before touching any property inside a component — walk up the hierarchy to find the deepest master COMPONENT that owns that element. Fix there, not on the instance or variant frame.

**How to apply:**
- When a property needs changing inside a Headline, Button, or any composite component — first identify which sub-component COMPONENT_SET owns that element (e.g. `Headline.Controls.ActionButton` owns the "See all" text, not `Headline` itself).
- Navigate to that master, make the fix there, and let it propagate to all instances automatically.
- Red flag: if you are calling `node.fills =` or `node.fontSize =` on a node whose parent chain includes an INSTANCE — you are fixing at the wrong level.

---

### Rule 16 — Typography Changes via Text Style Tokens, Never via fontName

**The problem this solves:** changing `node.fontName = { family: "Jost", style: "Regular" }` directly detaches the text node from the design system's typography token, creating invisible style debt that breaks on the next design system update.

**Rule:** when changing font weight, size, or line height — find the correct `typography/*` text style in the system and bind it via `node.textStyleId`. Never set `fontName` or `fontSize` d

Related memory: [[feedback-forgex-variable-injection]], [[feedback-forgex-radius-doctrine]], [[feedback-dynamic-theme-interpreter]].
