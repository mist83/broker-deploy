# Broker Deploy Usage

This is the one deploy path for repo-backed Mullmania sites.

It does not replace the Sites control-plane deploy itself, and it does not yet
replace in-console blank/editor/template publishes. Those still write directly
through the protected Sites API. The broker is the default path for
allowlisted repo-backed redeploys.

## Current Shape

```text
manual button / operator API / GitHub push webhook
  -> sites.mullmania.com
  -> central target store
  -> broker-deploy workflow
  -> private source repo archive
  -> AWS static artifact
  -> GitHub Pages mirror
```

The central target store is `s3://mullmania.com-data/_deploy/redeploy-targets.json`.
The broker repo does not store the target list.

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

## Manual Redeploy

This queues the broker through the Sites API:

```bash
curl -fsS -X POST https://sites.mullmania.com/api/redeploy/tic-hack-toe \
  -H "x-operator-key: $SITES_OPERATOR_KEY" \
  -H "content-type: application/json" \
  -d '{"reason":"manual redeploy","source":"operator"}'
```

The Sites fullscreen Redeploy button uses the same protected endpoint.

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
Sites API. `tic-hack-toe` is already wired this way.

## Proof Target

`tic-hack-toe` is the current proof target.

- AWS: `https://tic-hack-toe.mullmania.com/`
- GitHub Pages mirror: `https://mist83.github.io/broker-deploy/tic-hack-toe/`
- Latest proof run: `https://github.com/mist83/broker-deploy/actions/runs/25976573380`

