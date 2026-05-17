# Broker Migration Inventory

This inventory is the working map for moving repo-owned Mullmania sites off
per-repo deploy Actions and onto the public `mist83/broker-deploy` workflow.

## Management Points

- List registered targets:
  `SITES_OPERATOR_KEY=... node scripts/list-targets.mjs`
- Register or update one target:
  `SITES_OPERATOR_KEY=... node scripts/register-target.mjs --site <site-id> --source mist83/<repo> --ref <branch>`
- Manual redeploy:
  `POST https://sites.mullmania.com/api/redeploy/<site-id>`
- Direct broker dispatch:
  `gh workflow run deploy-mullmania-site.yml --repo mist83/broker-deploy -f site_id=<site-id>`
- Source repo push redeploy:
  a signed GitHub `push` webhook posts to `https://sites.mullmania.com/api/redeploy/github-webhook`

The source of truth is the protected target store:

```text
s3://mullmania.com-data/_deploy/redeploy-targets.json
```

The public broker repo intentionally does not contain secrets or a checked-in
target list.

## Migrated Batch

| site | source repo | branch | webhook | old deploy workflow | old Pages workflow | broker proof run | live proof |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bug-beacon` | `mist83/bug-beacon` | `master` | `625105687` | disabled | disabled | `25978586770` | AWS 200, Pages 200 |
| `tap-repeater` | `mist83/tap-repeater` | `master` | `625105695` | disabled | disabled | `25978629075` | AWS 200, Pages 200 |
| `rhythm-engine` | `mist83/rhythm-engine` | `main` | `625105699` | disabled | disabled | `25978661473` | AWS 200, Pages 200 |
| `gitter` | `mist83/gitter` | `master` | `625120502` | disabled | disabled | `25979137933` | AWS 200, Pages 200 |
| `liskov-file-system` | `mist83/liskov-file-system` | `master` | `625120506` | disabled | disabled | `25979137625` | AWS 200, Pages 200 |
| `agent` | `mist83/agent` | `master` | `625123310` | disabled | disabled | `25979196035` | AWS 200, Pages 200 |
| `ui` | `mist83/ui` | `main` | `625125790` | disabled | disabled | `25979309174` | AWS 200, Pages 200 |

Notes:

- The old disabled workflows are `.github/workflows/deploy-mullmania-site.yml`
  and `.github/workflows/pages.yml` in each source repo unless noted below.
- `rhythm-engine` CI and scene-viewer smoke workflows were left active.
- `gitter` `python.yml` was left active.
- `liskov-file-system` `ci.yml` and `live-s3.yml` were left active.
- `agent` `.github/workflows/deploy-self-hosted.yml` was disabled too, so the
  broker is now the only registered deploy path for that repo.
- `ui` `.github/workflows/deploy-site.yml` was disabled too. Its
  `screenshot-canonical.yml` test workflow was left active.
- The canonical deploy tool at `s3://mullmania.com-data/_tools/deploy-site.mjs`
  now runs configured install/build commands through `/bin/bash`, expands
  directory excludes such as `tests/` for AWS sync, and uploads with
  `--no-follow-symlinks` so broken dev/test symlinks cannot block static deploys.
- `bug-beacon` produced additional successful broker runs after noisy source
  pushes (`Auto-commit` and TODO cleanup). That was not a broker loop; it is the
  expected result of push-triggered redeploys on an auto-committing source repo.

## Still To Review Or Keep Separate

These repos have old deploy-related workflows but were not migrated in this
batch:

| repo | reason held |
| --- | --- |
| `sites` | Control-plane repo for `sites.mullmania.com`; its workflow deploys the protected Sites API before the static app. The current broker is static-artifact-only, so it must not replace this until API deploy support is deliberately added. |
| repos with CI/test workflows | Non-deploy workflows were left active unless they were duplicate deploy/Page workflows. Disable or throttle those separately if the goal changes from "one deploy path" to "minimum Actions minutes." |

## Operator Rule

For ordinary app sites, the desired final state is:

1. `mullmania.site.json` stays in the source repo.
2. The repo is registered in the broker target store.
3. The source repo has the signed Sites redeploy webhook.
4. Old AWS deploy and old Pages workflows are disabled.
5. Normal commits redeploy through `mist83/broker-deploy`.
6. Manual redeploy is done from Sites, the protected API, or the broker Actions
   dispatch button.
