---
name: Mullmania bucket safety (API-first writes, per-site .git, audit before delete)
description: GLOBAL — three rules for touching the unified s3://mullmania.com bucket: prefer the sites API over raw aws s3 (resync if you used raw S3), ensure each site has its own local .git, audit prefix before any recursive delete
type: feedback
originSessionId: 9d01b121-8837-442b-ab09-8890417ab07b
---
The `mullmania.com` S3 bucket is unified — every `*.mullmania.com` subdomain routes through it via the `mullmania-subdomain-router` CloudFront function. The sites API auto-commits per-site git history at `s3://mullmania.com-history/<site_id>/.git/`. Three rules apply when touching it.

## 1. API-first writes; resync if you used raw S3

Default to the sites API (`POST /api/deploy/...`) over `aws s3 cp/sync/rm`. URL and operator key live in `~/Code/sites/out/sites-api.json`. Direct `aws s3 ...` from a terminal **bypasses** the auto-commit and creates silent drift in the per-site git history.

If you must use `aws s3` directly (one-off rescue, batch fixup), resync immediately:
```
curl -X POST -H "x-operator-key: $(jq -r .operatorKey ~/Code/sites/out/sites-api.json)" \
  "$(jq -r .functionUrl ~/Code/sites/out/sites-api.json)/api/git/resync/<site_id>"
```
Full-bucket reconcile: `POST /api/git/resync` (heavy; may time out on the ~880-site bucket).

The PostToolUse hook in `~/.claude/settings.json` catches matching Bash calls automatically, but only from the main Claude Code session — Codex CLI, manual terminal, sub-agents that don't share the main thread, and CI all bypass it. Rule still applies when the hook exists.

## 2. Per-site local .git history

Before editing any site working dir under the bucket (anything served at `sites.mullmania.com/<name>/` or any subdomain that routes there), ensure it has its own `.git`. If absent: `git init && git add -A && git commit -m "initial snapshot"`. No GitHub remote needed — local git is sufficient. Backfill applies; when you encounter a site without `.git`, init it as part of the first edit, never silently. Trigger is "this directory is/maps-to a deployable site under the mullmania.com bucket" — not arbitrary repos under `~/Code`.

## 3. Audit before any recursive delete

Prefixes (`_catalog/`, `sites/`, `packages/`, `_root/`, etc.) are owned by DIFFERENT sites. There is no safe "subdirectory that is clearly tool X's" — sleet's default init drops files at bucket root alongside everything.

Before ANY `aws s3 rm --recursive` on `s3://mullmania.com/` or its subprefixes:
- `aws s3 ls <prefix>` first.
- Compare with sibling prefixes.
- Grep `~/Code/mullmania/` for any filenames found.
- Only delete if EVERY file matches the tool you're cleaning up after.
- Default to per-file deletes (`aws s3 rm s3://bucket/specific-file.json`) over recursive.
- If a tool wants to init at bucket root, configure a sub-path BEFORE running init. NuGet static feed lives at `s3://mullmania.com/nuget/`.

## Why all three coexist

Sites are unrollable without per-site history (rule 2). The API is the only path that maintains that history (rule 1). The bucket is shared, so deletes can vaporize unrelated sites' data (rule 3). Each rule covers a different gap; none subsumes the others.

**Reference incident — 2026-04-17:** recursive delete of `_catalog/` during sleet migration, assumed it was sleet's catalog. It was sites.mullmania.com's catalog (`sites-full.csv`, `sites-simple.csv`). Restored from `s3://mullmania.com/sites/` because authoritative copies happened to live there. Next time it might not.
