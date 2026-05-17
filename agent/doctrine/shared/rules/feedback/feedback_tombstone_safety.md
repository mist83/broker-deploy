---
name: Tombstone safety — graveyard flow + git fetch before any canon work
description: GLOBAL — to retire a mist83 repo, entomb in mist83/graveyard then delete source (graveyard flow as of 2026-04-14). BEFORE any canonize/deploy/bootstrap, git fetch + check upstream HEAD for purge/tombstone commits — local clones go stale and may resurrect a retired repo.
type: feedback
originSessionId: 9d01b121-8837-442b-ab09-8890417ab07b
---
Two coupled rules: how to retire a repo (graveyard protocol), and the precondition that prevents resurrecting a tombstoned repo from a stale clone.

## Precondition: git fetch before any canon/deploy work

Before touching ANY local repo for canon/deploy work (bootstrap, canonize, deploy to S3, edit), run `git fetch origin` and inspect the most recent upstream commit. If the upstream has a commit message containing "Purge", "Tombstone", "Defunct", "Archive", "Retired", or similar — STOP. The local clone is stale and the repo has been retired; do not deploy or bootstrap it.

Concretely:
1. `cd <repo> && git fetch origin && git log origin/HEAD -5 --oneline`
2. If top commits mention purge / tombstone / defunct / retired / archive → skip the repo, post a warning to the coordination room, move on.
3. When purging S3 for a tombstoned repo, distinguish hosting bucket (`s3://<apex>/<site>/`) from data bucket (`s3://<apex>-data/<site>/`). The data bucket often retains user scratch flagged `hasData:true` or `archivedHostedSite:true` in `_catalog/sites.json` — check the live catalog entry before deleting data-bucket content. When in doubt, leave the data bucket alone.
4. If `s3://<apex>-archive/` exists, it's the authoritative backup. Check it before considering any data-bucket delete permanent.

**Reference incident — 2026-04-11:** worker-C canonized BrainDumpster from a stale local clone, not realizing the operator had purged it the day before (`b4ae918 "Purge defunct repo to canonical tombstone"`). Bootstrap + deploy re-created retired content. Rolling that back also did `aws s3 rm --recursive` on `mullmania.com-data/braindumpster/`, which deleted user scratch (fire-notes, general-notes) explicitly flagged `hasData:true, archivedHostedSite:true`. Recovered from `s3://mullmania.com-archive/brain-dumpster-unified/` — barely. Avoidable entirely by checking upstream HEAD first.

## Tombstone protocol (entomb-and-delete via mist83/graveyard)

If the operator says "tombstone" with no qualifier, treat it as `entomb-and-delete`. (Originally `mist83/necropolis`; renamed `graveyard` 2026-04-14 because "necropolis read too weird." GitHub redirects the old URL.)

**Workflow per repo:**

1. Fresh clone source to a staging dir (NOT `~/Code/`).
2. Find the tombstone commit if it exists: `git log --reverse --all -S 'ARCHIVE_STATUS: DEFUNCT' --format='%H' -- README.md | head -1`. Pre-tombstone state is its parent. If no tombstone yet, make one first (README swap + purge rest + commit + push — old canonical pattern).
3. Birth: `git log --reverse --format='%aI' | head -1`. Death: tombstone commit `%aI`.
4. Bundle full history: `git bundle create /tmp/<sid>.bundle --all`.
5. Extract pre-tombstone tree: `git archive <pretombstone_sha> | tar -x -C <graveyard>/<sid>`.
6. Strip secrets at ingress: `find <graveyard>/<sid> -name '.env*' -type f -delete`.
7. Bundle placement:
   - **Bundle ≤ 100MB**: copy to `<graveyard>/<sid>.bundle` (git accepts).
   - **Bundle > 100MB**: upload to `s3://mullmania.com-archive/graveyard/<sid>.bundle` and write `<graveyard>/<sid>.bundle.s3` pointer file (URI + size + sha256 + restore instructions). Don't install git-lfs — operator prefers S3 offload per "S3 is canonical artifact state."
8. Atomic commit in graveyard:
   ```
   Entomb <sid>

   Born:        <birth ISO>
   Died:        <death ISO>
   Superseded:  <owner/repo or NONE>
   Source was:  github.com/mist83/<sid> (deleted post-entombment)
   ```
   If bundle went to S3, append `Bundle:` line with S3 URI.
9. Push to `mist83/graveyard` BEFORE deleting source.
10. `gh repo delete mist83/<sid> --yes` only after push lands.
11. Verify: `gh repo view mist83/<sid>` returns "Could not resolve".
12. `rm -rf` staging dir and `/tmp` bundle.

**Batch notes:** entomb one at a time, atomic commit per repo, push after each — keeps the graveyard git log as the literal obituary timeline. If a push fails (size limit), STOP before `gh repo delete` for that repo. Recover first.

**Repo conventions:** `mist83/graveyard` is private. Root README describes the protocol. Layout: `<sid>/` tree + either `<sid>.bundle` or `<sid>.bundle.s3` pointer. No `.gitignore` at root — graveyard is the full tree by design. Only `.env*` stripped.

**Old protocol (purge-and-remove, leave DEFUNCT stub on `mist83/`)** is DEPRECATED. If asked to revert to stub-only, that's an explicit override — confirm before doing it.

12 repos entombed under graveyard protocol on 2026-04-14: at-my-fingertips, cline-workarounds, modals-everywhere, tabs-everywhere, toasts-everywhere, ui-everywhere, pi-gremlin, themes, keepalive, slack-bot, code-universe, gocrud.
