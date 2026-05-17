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

Notes:

- The old disabled workflows are `.github/workflows/deploy-mullmania-site.yml`
  and `.github/workflows/pages.yml` in each source repo.
- `rhythm-engine` CI and scene-viewer smoke workflows were left active.
- The canonical deploy tool at `s3://mullmania.com-data/_tools/deploy-site.mjs`
  now runs configured build commands through `/bin/bash`, not `/bin/zsh`, so it
  works on `ubuntu-latest` broker runners.

## Still To Review

These repos have old deploy-related workflows but were not migrated in this
first batch:

| repo | reason held |
| --- | --- |
| `gitter` | Has deploy and Pages workflows plus Python workflow; review package/runtime expectations before moving. |
| `liskov-file-system` | Has deploy, Pages, CI, and live-S3 workflows; review the live-S3 workflow separately. |
| `agent` | Core agent/control-plane repo; do not batch-migrate with app sites. |
| `ui` | Core UI/canon surface with additional deploy and screenshot workflows. |
| `sites` | Control-plane repo for `sites.mullmania.com`; broker does not replace this repo's own API/site deploy. |

## Operator Rule

For ordinary app sites, the desired final state is:

1. `mullmania.site.json` stays in the source repo.
2. The repo is registered in the broker target store.
3. The source repo has the signed Sites redeploy webhook.
4. Old AWS deploy and old Pages workflows are disabled.
5. Normal commits redeploy through `mist83/broker-deploy`.
6. Manual redeploy is done from Sites, the protected API, or the broker Actions
   dispatch button.
