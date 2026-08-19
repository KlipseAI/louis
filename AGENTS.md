# AGENTS.md

## Scope

This repository owns Klipse design decisions, distribution packages, documentation, and release tooling.
Product scenes and product-only implementation audits belong in the Klipse product repository.

## Source of truth

1. `design/manifest.json` is the catalog and status source of truth.
2. Normative documents under `design/` define behavior and acceptance criteria.
3. `packages/tokens/src/klipse.tokens.json` owns P2 token values; generated token files are projections.
4. Generated files must be rebuilt; never edit generated regions or `design/llms/*` by hand.

## Never draw a value you did not measure

**This is the rule that has been broken most often.** When reproducing anything the product owns —
in Figma, in a token, in a measured contract — every number and colour must come from a measurement,
and the measurement must be recorded in a generated file. Only placeholder *content* may be invented:
a project title, a person's name, sample copy.

The failure looks the same every time: one element gets measured, the parts around it get drawn from
memory of what such a thing usually looks like, and the drawing then reads as evidence. It has
produced a mint upgrade button the product never had, a banner 120px too short, a modal whose action
row sat at the wrong inset, and a floating button that exists only in a landing-page demo.

- `figma/product-specimens.json` may declare **structure only** — which constant wraps which, the tag
  it renders as, and placeholder text. It may not contain a single spacing, size, colour, or radius.
- `scripts/measure-product-variants.mjs` renders that structure and measures every node.
- Figma inventory pages are generated from those measurements. If a value is absent, it cannot be
  drawn; add a probe first.
- The same applies to `figma/components.measured.json`: a value with no measurement behind it needs a
  `$`-prefixed note naming who decided it and why.

## Workflow

- Update the manifest, normative document, implementation, tests, and release note together.
- Run `pnpm build`, `pnpm check`, and `pnpm verify` before handoff.
- Do not mark Web or Figma as done without a shipped artifact and verification evidence.
- Do not copy product-repository debt into the normative catalog.
