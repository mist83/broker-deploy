# Broker Deploy Usage

This is the deploy path for repo-backed Mullmania sites and for normal
Sites-created pages.

It does not replace the Sites control-plane deploy itself: publishing
`sites.mullmania.com` and the protected Sites API is still owned by the
`sites` repo. User-created blank/editor/template/copy sites now flow through a
private managed source repo and this public broker workflow when
`MANAGED_BROKER_DEPLOY_ENABLED=true`.

## Current Shape

```text
Sites create/edit/copy API / manual button / operator API / GitHub push webhook
  -> sites.mullmania.com
  -> central target store
  -> broker-deploy workflow
  -> private source repo archive
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

## Register A Target

Use the helper from this repo:

```bash
SITES_OPERATOR_KEY=... node scripts/register-target.mjs \
  --site tic-hack-toe \
  --source mist83/tic-hack-toe \
  --ref master \
  --config mullmania.site.json
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
curl -fsS -X POST https://sites.mullmania.com/api/redeploy/sites \
  -H "x-operator-key: $SITES_OPERATOR_KEY" \
  -H "content-type: application/json" \
  -d '{}'
```

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
curl -fsS -X POST https://sites.mullmania.com/api/redeploy/tic-hack-toe \
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

## Auto Redeploy On Push

For auto redeploy, the source repository needs a GitHub push webhook pointing to:

```text
https://sites.mullmania.com/api/redeploy/github-webhook
```

The webhook must use the shared GitHub webhook signing secret configured on the
Sites API. `tic-hack-toe` and `mullmania-managed-sites` are wired this way.

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
