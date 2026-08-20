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

## The record is not evidence for itself

`figma/components.measured.json` is what Figma is drawn from and what the browser tests assert
against. Both comparisons pass whenever the record is internally consistent — including when the
record disagrees with the product. That is how a modal shipped with the wrong padding, the wrong
radius, and its action row at the wrong inset while every gate stayed green.

So a value in that record has to earn its place. Each one must be either compared to a product
render in `scripts/measure-product-components.mjs`, or carry a `$`-prefixed note saying who decided
it and why. `figma/unverified-values.json` holds the ones that are neither — a debt ledger, not a
contract. The gate fails when an unlisted unverified value appears and when a listed one has been
settled, so the number only goes down.

## A claim about the product needs a quotation

An agent that is asked "does the product declare this?" will usually say yes. Asking it to check
carefully does not change that — the instruction is unfalsifiable, so skimming and reading are
indistinguishable in the output. The record is then filled with confident sentences nobody can audit.

So a verdict that confirms a product declaration is not a sentence. It must carry, per axis:

- the **exact command** that was run, against the pinned commit — `git show <commit>:<path>` or
  `git grep -n <pattern> <commit> -- <path>`, never the product working tree, which is ahead of it;
- the **verbatim source line**, copied not paraphrased;
- the **line number** that line sits on.

A confirmation whose quotation cannot be found, byte for byte, at that path and commit is **void** —
not a weaker confirmation, a rejected one. That check is mechanical, so run it: the quotation is
there precisely so a script can re-derive the verdict without trusting the agent that produced it.

This is the same rule as *Never draw a value you did not measure*, applied one level up. There the
machine judges the value; here the machine judges whether the value was ever looked at.

## Workflow

- Update the manifest, normative document, implementation, tests, and release note together.
- Run `pnpm build`, `pnpm check`, and `pnpm verify` before handoff.
- Do not mark Web or Figma as done without a shipped artifact and verification evidence.
- Do not copy product-repository debt into the normative catalog.
