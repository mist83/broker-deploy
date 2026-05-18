# Doctrine Compose API

This is the preferred long-term flow for the remote brain.

## Goal

Do not make every runtime hand-stitch the same prompt from a pile of markdown files.

Instead:

1. fetch a small static table of contents
2. choose shared profiles and any extra rule ids
3. make one compose request
4. get back a crafted preamble plus citations

That lets the control plane decide ordering, pruning, grouping, and phrasing without forcing each runtime to reinvent the weave.

## Static Artifacts

These are fetched first:

- `doctrine/bootstrap-v1.json`
- `doctrine/shared-rule-catalog-v1.json`
- `doctrine/profile-toc-v1.json`

The catalog says what rules exist.

The profile TOC says which groups of rules belong together and which ones are the default shared stack for each runtime.

## Compose Flow

Preferred flow:

1. Fetch `bootstrap-v1.json`
2. Fetch `shared-rule-catalog-v1.json`
3. Fetch `profile-toc-v1.json`
4. Optionally call `/scope` to choose profile ids for the task
5. Call `/compose` once with runtime + selected profiles + task context
6. Use the returned `craftedPreamble`
7. Keep the returned rule ids and citations for audit/debug

## Why This Beats Flat Files

- shared rules live once
- runtime overlays stay thin
- prompt order becomes deterministic
- task-specific pruning becomes normal
- the operator can swap profiles without touching local files
- the API can eventually inject synthetic memory with provenance instead of pasting random prose

## `/compose` Request Shape

See machine-readable contract:

- [doctrine/compose-api-v1.json](./doctrine/compose-api-v1.json)
- [doctrine/compose-request-example-v1.json](./doctrine/compose-request-example-v1.json)
- [doctrine/compose-response-example-v1.json](./doctrine/compose-response-example-v1.json)

High-level request fields:

- `runtime`
  - known runtime ids include `codex`, `claude`, `generic`, and `agent`
- `profileIds`
- `includeRuleIds`
- `excludeRuleIds`
- `task`
- `sessionState`
- `operatorOverride`
- `maxChars`

## `/compose` Response Shape

The response should return:

- `craftedPreamble`
- `selectedProfileIds`
- `orderedRuleIds`
- `citations`
- `warnings`
- `sessionState`

That gives the agent one crafted block to use, plus a paper trail showing which exact rule artifacts were woven into it.

## Compatibility Reality

The live doctrine site does not have a real `/compose` service today.

Today:

- Codex still uses static compatibility artifacts like `CODEX-BOOTSTRAP-PROMPT.md` and `codex-memory-seed-v1.json`
- Claude still uses its instruction pack manifest plus shared rule projections

The contract in this doc is the shape those static compatibility artifacts should converge toward.
