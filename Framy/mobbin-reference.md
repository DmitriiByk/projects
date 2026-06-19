---
name: mobbin-reference
description: "Reference layer for design work. Use the connected Mobbin MCP to ground projecting and Figma audits in real-world UI conventions (3–5 references per pattern) instead of taste. Canonical source — other design skills point here, do not restate."
---

# Mobbin Reference Protocol

Mobbin (connected as an MCP server) is the **real-world reference layer** for ForgeX/Framy design work. It holds screens, flows and apps from shipping products. Use it to ground decisions in observed conventions — what real apps in the category actually do — not in taste. This file is the canonical protocol; other skills point here and never restate it.

This layer **informs, it never dictates.** On any conflict, ForgeX doctrine wins: Rule 0 tiers, sentinel colors, the token contract, brand-agnostic baseline. Extract *structure and patterns*, never brand specifics (colors, logos, copy) — that would violate the brand-agnostic baseline.

## When to consult (triggers)
- Designing a new screen, component, or flow.
- Auditing or analyzing a Figma frame (does it match how the pattern is normally solved?).
- Choosing between layout/navigation patterns.
- Judging the right decoration level for a surface (see `decoration-craft.md`).
- Converting a copied brand mockup onto the DS (see `casino-mockup-conversion.md`).

## How to query
1. Name the pattern / screen type precisely (e.g. "wallet balance home", "transaction history list", "onboarding phone verification", "casino lobby / game grid").
2. Call the Mobbin tools (exact names are visible via `/mcp` or the Framy connector inspector — typically a screen/app/flow search). Filter by **industry** relevant to the work (iGaming/casino, fintech) and platform.
3. Pull **3–5 references** of the same pattern. One example is an anecdote; 3–5 reveal the convention.

## What to extract
- Layout hierarchy and the standard blocks + their order.
- States the pattern normally handles: empty, loading, error, success.
- Navigation model and primary interaction affordances.
- Category decoration norms (where real premium apps spend richness vs. stay plain).

## How to apply
Map the observed conventions onto **ForgeX components and token classes** (read real names from `tailwind.config.js`). Follow the convention by default; **deviate only with a stated reason**, and tie the deviation to a Rule 0 tier (Standard / 🟩High-Custom / 🟧Low-Custom).

## Two flows

**Projecting (designing).** Mobbin first → extract conventions for the pattern → build with ForgeX tokens/components. References set the skeleton; the DS sets the finish.

**Figma audit (analyzing a mockup).** Read the frame via the Figma MCP (active selection or node-id) → search Mobbin for the same screen type → diff it: what conforms to the convention vs. what diverges. Flag each divergence with (a) the reference it breaks from, (b) whether it's an intentional tier decision or debt, (c) a token-mapped fix.

## Output discipline
Cite the specific references used (app + screen/flow) so every decision is auditable — the same way a spec cites token classes. "Looks right" is not an output; "matches the convention seen in N references, mapped to tokens X/Y" is.
