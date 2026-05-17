# Broker Deploy Usage

This is the deploy path for repo-backed Mullmania sites and for normal
Sites-created pages.

It also dogfoods `sites.mullmania.com` through one locked control-plane recipe.
That is intentionally special-cased: ordinary repos still publish static
artifacts only, while `sites` publishes the protected Sites API before the
static app.

## Current Shape

```text
Sites create/edit/copy API / manual button / operator API / GitHub push webhook
  -> sites.mullmania.com
  -> central target store
  -> broker-deploy workflow
  -> allowlisted source repo archive
  -> optional approved backend recipe
  -> AWS static artifact
  -> GitHub Pages mirror
```

The central target store is `s3://mullmania.com-data/_deploy/redeploy-targets.json`.
The broker repo does not store the target list.

## Two Source Modes

**Managed Sites source**

- Source repo: `mist83/mullmania-managed-sites` (private)
- Source layout: `sites/<site-id>/`
- Config path: `sites/<site-id>/mullmania.site.json`
- Used by: Sites blank/editor/template/copy create flows
- Remote edit behavior: a push touching `sites/<site-id>/` triggers a broker
  redeploy for that site id only

**Standalone source repo**

- Source repo: any allowlisted GitHub repo
- Config path: usually `mullmania.site.json`
- Used by: existing projects like `tic-hack-toe`
- Remote edit behavior: a push webhook from that repo triggers the broker for
  the registered site

## Target Types

**`static-site`**

This is the default. The broker downloads the allowlisted source repo, runs the
site build/publish contract, publishes the static artifact to AWS, mirrors the
same artifact to GitHub Pages, and updates the public transparency page.

**`sites-control-plane`**

This is locked to one target:

- site id: `sites`
- source repo: `mist83/sites`
- source ref: `main`
- config: `mullmania.site.json`

For this target only, the broker first runs the Sites API/control-room backend
deploy, then builds and publishes `sites.mullmania.com`, mirrors the public
artifact, and updates transparency. Arbitrary backend commands are not accepted
from repos.

## Register A Target

Use the helper from this repo:

```bash
SITES_OPERATOR_KEY=... node scripts/register-target.mjs \
  --site tic-hack-toe \
  --source mist83/tic-hack-toe \
  --ref master \
  --config mullmania.site.json
```

For the Sites control plane, include the locked deploy type:

```bash
SITES_OPERATOR_KEY=... node scripts/register-target.mjs \
  --site sites \
  --source mist83/sites \
  --ref main \
  --config mullmania.site.json \
  --deploy-type sites-control-plane
```

That registers:

- the Mullmania site id
- the private source repository
- the source branch/ref
- the deploy config path
- the public URL
- the public broker workflow that should deploy it

## List Registered Targets

```bash
SITES_OPERATOR_KEY=... node scripts/list-targets.mjs
```

Use `--json` for the raw target payload.

## Create Or Edit From The Sites API

These endpoints commit into `mist83/mullmania-managed-sites`, register the
target, and queue the broker.

```bash
curl -fsS -X POST https://sites.mullmania.com/api/deploy/editor/my-site \
  -H "x-operator-key: $SITES_OPERATOR_KEY" \
  -H "content-type: application/json" \
  -d '{"overwrite":true,"html":"<main>Hello</main>","css":"body{font:16px system-ui}","js":""}'
```

```bash
curl -fsS -X POST https://sites.mullmania.com/api/deploy/blank/my-blank-site \
  -H "x-operator-key: $SITES_OPERATOR_KEY" \
  -H "content-type: application/json" \
  -d '{"overwrite":true}'
```

```bash
curl -fsS -X POST https://sites.mullmania.com/api/deploy/copy/my-copy \
  -H "x-operator-key: $SITES_OPERATOR_KEY" \
  -H "content-type: application/json" \
  -d '{"overwrite":true,"sourceSiteId":"managed-broker-proof"}'
```

The response should include:

- `queued: true`
- `brokerQueued: true`
- `managedSource.repo`
- `managedSource.path`
- `managedSource.commitUrl`

## Remote Edit From GitHub

For Sites-created pages, edit files under:

```text
mist83/mullmania-managed-sites:sites/<site-id>/
```

Commit the change to `main`. The private repo webhook posts to:

```text
https://sites.mullmania.com/api/redeploy/github-webhook
```

The Sites API verifies the GitHub signature, maps changed paths back to
registered site ids, and queues the broker workflow. This is the mobile GitHub
API/edit-file path.

## Manual Redeploy

This queues the broker through the Sites API:

```bash
curl -fsS -X POST https://sites.mullmania.com/api/redeploy/target/tic-hack-toe \
  -H "x-operator-key: $SITES_OPERATOR_KEY" \
  -H "content-type: application/json" \
  -d '{"reason":"manual redeploy","source":"operator"}'
```

The Sites fullscreen Redeploy button uses the same protected endpoint for
registered targets.

## Direct Broker Dispatch

This bypasses the Sites API dispatch endpoint, but the broker still asks Sites
for the allowlisted target before it can download or deploy anything:

```bash
gh workflow run deploy-mullmania-site.yml \
  --repo mist83/broker-deploy \
  -f site_id=tic-hack-toe \
  -f reason=manual \
  -f source=operator
```

## Public Transparency Page

The broker GitHub Pages root is read-only:

```text
https://mist83.github.io/broker-deploy/
```

It is regenerated after successful broker deploys and shows the public mirror
inventory, latest publish timestamps, and public broker run links. It does not
include private source repository names, the protected target list, secrets, or
raw webhook payloads.

The same public data is available as JSON:

```text
https://mist83.github.io/broker-deploy/_deployments/index.json
```

## Auto Redeploy On Push

For auto redeploy, the source repository needs a GitHub push webhook pointing to:

```text
https://sites.mullmania.com/api/redeploy/github-webhook
```

The webhook must use the shared GitHub webhook signing secret configured on the
Sites API. `tic-hack-toe`, `mullmania-managed-sites`, `bug-beacon`,
`tap-repeater`, `rhythm-engine`, `gitter`, `liskov-file-system`, `agent`, and
`ui` are wired this way. `sites` is also wired after the control-plane dogfood
proof.

Push-triggered redeploys are intentionally literal: if an auto-committer pushes
every few minutes, the broker redeploys every few minutes. That is correct for
freshness, but noisy repos should get source-side throttling or fewer
auto-commits if Actions cost becomes the concern.

## Proof Targets

Standalone repo proof:

- AWS: `https://tic-hack-toe.mullmania.com/`
- GitHub Pages mirror: `https://mist83.github.io/broker-deploy/tic-hack-toe/`
- Latest proof run: `https://github.com/mist83/broker-deploy/actions/runs/25976573380`

Managed-source proofs:

- Editor/API create: `managed-broker-proof`, run `25977318635`
- Blank create: `managed-blank-proof`, run `25977366068`
- Copy create: `managed-copy-proof`, run `25977410528`
- TV template create: `managed-tv-proof`, run `25977465561`
- Remote GitHub API edit: `managed-broker-proof`, run `25977608383`

Example mirrors:

- `https://managed-broker-proof.mullmania.com/`
- `https://mist83.github.io/broker-deploy/managed-broker-proof/`

Migrated source-repo proofs:

- `bug-beacon`, run `25978586770`
- `tap-repeater`, run `25978629075`
- `rhythm-engine`, run `25978661473`
- `gitter`, run `25979137933`
- `liskov-file-system`, run `25979137625`
- `agent`, run `25979196035`
- `ui`, run `25979309174`

Control-plane dogfood proof:

- `sites`, deploy type `sites-control-plane`, proof runs `25980319064` and
  `25980391465`
- AWS: `https://sites.mullmania.com/`
- GitHub Pages mirror: `https://mist83.github.io/broker-deploy/sites/`
- Public transparency entry:
  `https://mist83.github.io/broker-deploy/_deployments/index.json`
