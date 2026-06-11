---
name: feedback-forgex-radius-doctrine
description: "ForgeX has NO 'sharp-corner-everywhere' identity — radius/xs=0 was a brand-button aesthetic, not a system-wide rule"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5558b810-b085-4076-9965-b52b71d84d0a
---

There is no ForgeX system rule that says "all components must use `radius/xs = 0`." The `radius/xs = 0` value I noted on the Finalized Brand Button was a **component-specific aesthetic** (metallic-plate chrome with sharp edges as part of that brand's CTA style), NOT a system-wide identity directive.

**Why:** Components have intentionally different shape language — Cards may want `radius/sm`, Chips may want `radius/xl` (pill), Buttons may want `radius/xs` (sharp). Forcing one radius token across all components destroys the design system's component-distinguishing shape semantics.

**How to apply:**
- Do NOT rebind component radii to `radius/xs` as part of "ForgeX identity alignment."
- Each component's radius choice is an independent design decision. Leave existing radius bindings (radius/sm, radius/md, radius/lg, radius/xl) alone unless the user explicitly directs a per-component change.
- The Batch 1 ButtonGroup.Item rebind (radius/sm → radius/xs, 464 corners) was done under user-approved instruction but framed as "brand identity" — that framing was wrong. The rebind itself stands because the user approved it, but don't extrapolate it to other components.

See [[feedback-forgex-variable-injection]] for the related override doctrine.
