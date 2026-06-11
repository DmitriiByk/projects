# PlayID — Project Index

Entry point for any agent working in the PlayID track. Read this first.

## What PlayID is
- Mobile apps shipped to **Google Play / Apple App Store**.
- Also the home for **quick prototypes meant to be shown on a phone**.
- Stack: **Flutter + Riverpod** (default state management; switchable to BLoC if a project decides so).
- This is a **separate world from Forge-X**. Forge-X = casino brands on the **web** (React/Tailwind, `build-tokens.js`). Do NOT apply Forge-X web conventions here, and do NOT apply Flutter conventions to Forge-X.

## Design source (shared, read-only)
- Design comes from the **same Figma** as Forge-X: "ForgeX | Library", `fileKey = natBqfvZvRAk2RrvPIpBmo` (account weggan040@gmail.com, team Framy).
- Token flow for PlayID: **Figma → `design-system-keeper` → Flutter `ThemeData`** (W3C JSON tokens as the interchange).
- The web track consumes the same Figma differently (`build-tokens.js` → `tailwind.config.js`). One source, two independent consumers — they must not interfere.

## Guardrails (mirror Forge-X doctrine)
- Agents **read** design from Figma; they do NOT mutate the Figma collection **topology** (collections, alias structure, scopes).
- Never bake concept-specific values (brand colors, fonts) into source generators as a permanent commitment ("Path B" is forbidden). Concept values stay as theme/token data, not hardcoded in app code.
- When in doubt about a shared-Figma change, treat the Figma library as read-only and surface a proposal.

## Custom agents for this track
Installed user-skills (trigger by context or via `/name`):
- **ux-ui-researcher** — stack-neutral; patterns/references, 2–3 options with trade-offs + recommendation, always flags edge/empty/loading/error states + accessibility.
- **flutter-feature-architect** — feature-first folder structure, `AsyncValue` states, Riverpod providers, data flow, code skeleton. Use before building UI.
- **design-system-keeper** — Figma ↔ W3C JSON tokens (two-way), consistency audit, layout into Flutter `ThemeData`. Honor the guardrails above when it touches the shared Figma.
- **image-asset-handler** — asset prep: WebP/compression, @1x/@2x/@3x density slicing for Flutter, before→after report.

## How agents get project knowledge
- Project-specific facts live **here** (this CLAUDE.md) and in per-feature notes — not baked into the general skills.
- Skills stay general/reusable; they reference this file for PlayID specifics.
- When a real Flutter project lands in this folder, add its conventions (router, packages, existing structure) below.

## Product model (all three sibling apps)
- Core: create account + KYC once → connect to casino brands one-click. Also a wallet (store/deposit/withdraw/transfer to brands).
- Business KPI = casino **Connect** (main revenue). Principle: connect is the main **action**, NOT the main **content** (else it reads as a PlayID clone to the stores).
- Three sibling apps share functionality, must differ in design to pass Apple + Google ("design spam / copycat" rejections judge IA + interaction patterns + concept, not just colors). Every pattern must differ from BOTH neighbors:
  - **PlayID** — light, purple, Montserrat, casino-aggregator+wallet. (Web prod is migrating row-list → cards, so "row list" as a differentiator is at risk.)
  - **Kassu** — dark, blue, wallet-first. Tapbar: Home/Payments/Offers/Menu/Play. Regulated markets.
  - **1PassApp** — the one we differentiate. Concept = **"Player Pass / игровой профиль"** (identity tool, not catalog, not wallet).
- Full product/design detail lives in memory: `Claude Brain/playid-1passapp.md`.

## Project-specific conventions (Flutter code)
- _(empty — fill in when the first Flutter project is created: navigation/router choice, package list, folder layout, naming.)_
