Tombstone the specified repository using the graveyard protocol (entomb-and-delete).

Usage: /tombstone <owner/repo> [superseded-by]

If no superseded-by is given, use NONE.

## Source of truth

The authoritative procedure lives in the `feedback_tombstone_safety` doctrine
rule and the working automation script in the graveyard repo:

- Rule: <https://agent.mullmania.com/doctrine/shared/rules/feedback/feedback_tombstone_safety.md>
- Automation: <https://github.com/mist83/graveyard/blob/main/scripts/entomb-repo.py>
- Graveyard repo (entomb target): <https://github.com/mist83/graveyard>
- Site (3D viewer): <https://graveyard.mullmania.com/>

**DEPRECATED:** the previous "purge-and-remove" protocol (which left a `DEFUNCT`
README stub on the source repo and kept the repo on GitHub) was retired
2026-04-14. The current protocol is entomb-and-delete: full history is moved
into `mist83/graveyard` and the source repo is removed from GitHub. Do not
follow the old purge-and-remove instructions.

## Protocol summary

For each repo to retire:

1. **Preflight.** `git fetch origin && git log origin/HEAD -5 --oneline` on
   any local clone. If upstream HEAD already shows an `Entomb` or
   `Tombstone` commit, the repo is already entombed — skip.
2. **Run the canonical automation.**

   ```bash
   python3 ~/Code/graveyard/scripts/entomb-repo.py <owner/repo> \
     [--superseded-by <other-repo>]
   ```

   The script handles: fresh-clone the source to staging (NOT `~/Code/`),
   capture birth + death timestamps, bundle full history with
   `git bundle --all`, extract the pre-tombstone tree into
   `mist83/graveyard/<repo>/`, strip `.env*` files at ingress, place the
   bundle (in-tree if ≤100MB; S3 archive pointer at
   `s3://mullmania.com-archive/graveyard/<repo>.bundle` if larger),
   atomically commit in graveyard with the canonical message shape (Born,
   Died, Superseded, Source was), push to graveyard, then
   `gh repo delete <owner/repo> --yes` only after the graveyard push lands.

3. **Remove any stale local clone** at `~/Code/<repo>/` so future
   `canonize`, `deploy`, or `bootstrap` work doesn't resurrect the dead
   repo from a stale tree. This is the failure mode `feedback_tombstone_safety`
   was created to prevent (see the BrainDumpster 2026-04-11 incident).
4. **Refresh graveyard site data** so the rendered viewer reflects the
   new entomb:

   ```bash
   cd ~/Code/graveyard
   node scripts/generate-graveyard-data.mjs
   git add docs/data/ && git commit -m "Refresh graveyard data" && git push
   ```

5. **Verify.** `gh repo view <owner/repo>` should report
   "Could not resolve to a Repository". `curl
   https://graveyard.mullmania.com/data/graves.json | jq '.[] | select(.repo
   == "<repo>")'` should return the new entomb (requires
   `isPublic: true` on the graveyard catalog row to be reachable
   anonymously).

## Manual fallback

If `entomb-repo.py` is unavailable, the full step-by-step is in
`feedback_tombstone_safety`. Follow it exactly — the danger is dropping a
push between graveyard and `gh repo delete`, which loses the source.

## Final report

After tombstoning, state:

- Source repo: `<owner/repo>`
- Entomb commit in graveyard: `<sha>`
- Bundle placement: in-tree or S3 (path)
- Superseded by: `<repo>` or NONE
- Source repo deleted from GitHub: yes / no
- Stale local clone removed: yes / no
- Graveyard site data refreshed and pushed: yes / no
- Anything that should be merged into the replacement repo
