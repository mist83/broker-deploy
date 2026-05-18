Sweep all local changes, commit, push, and deploy. One shot. No permission asks.

Usage: /shipit [optional commit message]

## Mandate

The operator said /shipit. That means: whatever is in the working tree, sweep it up, commit it, push it, deploy it. Do not ask for confirmation at any step. Do not split the work into "vetted" and "unvetted" — there is no vetting. If something is in the tree, it ships.

The only legitimate stopping conditions are:
- Not inside a git repo
- A git command exits non-zero (network, auth, conflict, hook rejection)
- The deploy command exits non-zero
- The deploy resolver finds no deploy contract AND `mullmania.site.json` is also absent

When something stops the chain, report exactly what failed in plain text and stop. Do NOT try to "fix" hook failures, force-push around non-fast-forward errors, or invent a deploy. Surface the error to the operator.

## Procedure

Run as a tight sequence. Use parallel Bash calls within a single phase where steps are independent. Be terse in user-facing output — one short status line per phase.

### 1. Sanity

- `git rev-parse --show-toplevel` — confirm we're in a repo. If not, report and stop.
- In parallel: `git status --porcelain`, `git rev-parse --abbrev-ref HEAD`, `git rev-parse --short HEAD`.

### 2. Sweep + commit

- If `git status --porcelain` is empty, skip to step 3 (push step will be a no-op too if nothing is ahead, then we still try to deploy).
- `git add -A` — sweep everything. Yes, everything. The operator accepted that risk.
- Commit message:
  - If `$ARGUMENTS` is non-empty, use it verbatim as the subject line.
  - Otherwise generate one short subject from the diff (e.g. `shipit: update <main file or area>`). Do not write multi-paragraph commit bodies.
- Always include the Co-Authored-By trailer via heredoc.

```bash
git commit -m "$(cat <<'EOF'
<message>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### 3. Push

- Determine if upstream is set: `git rev-parse --abbrev-ref --symbolic-full-name @{u}` (non-zero exit means no upstream).
- If upstream is set: `git push`.
- If no upstream but `git remote` lists `origin`: `git push -u origin <branch>`.
- If no remote at all: report `local-only repo, skipping push` and continue to deploy.
- If push is rejected (non-fast-forward, hook rejection, auth): stop. Report the exact stderr. **Never** `--force`, `--no-verify`, or `--force-with-lease`.

### 4. Deploy resolver

Resolve the deploy command in this priority order. Stop at the first match. The repo's own contract wins — operators wrap things in `deploy.sh` for reasons (build steps, custom flags, non-Mullmania targets).

| Priority | Detector | Command |
|---|---|---|
| 1 | `./deploy.sh` exists and is a regular file | `./deploy.sh apply` (or `./deploy.sh` if it doesn't accept `apply` — test by reading the script first; most local wrappers forward `${1:-apply}`) |
| 2 | `./scripts/deploy.sh` exists | `./scripts/deploy.sh apply` |
| 3 | `./scripts/deploy-site.mjs` exists | `node ./scripts/deploy-site.mjs apply` |
| 4 | `./Makefile` has a `deploy:` target | `make deploy` |
| 5 | `./package.json` has a `scripts.deploy` entry | `npm run deploy` |
| 6 | `./mullmania.site.json` exists (and none of the above) | `aws s3 cp s3://mullmania.com-data/_tools/deploy.sh - \| bash -s -- apply` |
| 7 | None of the above | report `no deploy target detected` and stop after the push |

Honor `DEPLOY_BASE_URL` if it is set in the operator's environment — pass it through unchanged to whatever deploy command runs. The canonical deploy script reads it directly. Local wrappers should too; if a wrapper doesn't, that's the wrapper's problem, not ours.

**Pre-deploy snapshot** (only when `mullmania.site.json` exists): capture `_catalog/sites.json` LastModified from `s3://${DEPLOY_BASE_URL:-mullmania.com}-data/_catalog/sites.json` via `aws s3api head-object`. Hold it.

After the deploy command exits 0:
- Read `siteId` from `mullmania.site.json` if present.
- Re-read the catalog's LastModified. If it did NOT advance, the deploy was a silent no-op — flag it loudly in the report. (Known cause on macOS: the canonical `deploy-site.mjs` wrapper downloads to a `mktemp` path under `/var/folders/...`; node canonicalizes `import.meta.url` through `/private/var` while `process.argv[1]` doesn't, so the bottom-of-file `main()` guard fails silently. If you observe this, either flag it for the operator or invoke `node` against a non-symlinked copy of `deploy-site.mjs`.)
- Compute the live URL: `https://<siteId>.${DEPLOY_BASE_URL:-mullmania.com}/`.
- If no `mullmania.site.json`, just report the deploy command's exit status.

## Final report

Three lines max:

```
commit <short-sha>: <subject>
push: <ok | local-only | failed: ...>
deploy: <url | command exited 0 | no deploy target | failed: ...>
```

Then a contextually relevant meme per the global rule. Nothing else.

## Hard rules

- **Sweep means sweep.** `git add -A`. If `.env`/`credentials.*`/`*.pem` shows up in the staged diff, mention it in the final report so the operator can rotate. Do not block.
- **No interactive prompts.** No TODO list, no "should I proceed?", no plans. Execute.
- **No `--amend`, no `--no-verify`, no `--force`.** Ever.
- **Failures stop the chain.** Commit fails → no push. Push fails → no deploy. Deploy fails → leave the commit pushed and report.
- **No "fix and retry" automation.** If a hook rejects the commit, surface the hook's stderr and stop. The operator decides whether to retry.
