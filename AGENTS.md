# AGENTS.md

## Scope

This repository owns Klipse design decisions, distribution packages, documentation, and release tooling.
Product scenes and product-only implementation audits belong in the Klipse product repository.

## Source of truth

1. `design/manifest.json` is the catalog and status source of truth.
2. Normative documents under `design/` define behavior and acceptance criteria.
3. `packages/tokens/src/klipse.tokens.json` owns P2 token values; generated token files are projections.
4. Generated files must be rebuilt; never edit generated regions or `design/llms/*` by hand.

## Workflow

- Update the manifest, normative document, implementation, tests, and release note together.
- Run `pnpm build`, `pnpm check`, and `pnpm verify` before handoff.
- Do not mark Web or Figma as done without a shipped artifact and verification evidence.
- Do not copy product-repository debt into the normative catalog.
