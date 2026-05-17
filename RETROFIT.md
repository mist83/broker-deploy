# Retrofit A Repo To The Broker

Use this when asked to move a Mullmania repo off its own deploy workflow and
onto `mist83/broker-deploy`.

## Short Answer

For a normal static site, the desired final state is:

1. The source repo has a valid `mullmania.site.json`.
2. The source repo is registered in the protected Sites target store.
3. The source repo has a signed GitHub `push` webhook to Sites.
4. One broker proof deploy succeeds.
5. Only then, duplicate deploy or Pages workflows in the source repo are
   disabled.

Do not add a new GitHub Actions deploy workflow to the source repo. The source
repo should redeploy by webhooking Sites, which dispatches this broker.

## What This Broker Does

```text
source repo push or manual redeploy
  -> sites.mullmania.com protected API
  -> broker-deploy GitHub Actions workflow
  -> allowlisted source repo archive
  -> canonical deploy script
  -> AWS live site
  -> GitHub Pages mirror
  -> public transparency page
```

The protected target store is not checked into this repo:

```text
s3://mullmania.com-data/_deploy/redeploy-targets.json
```

## Supported Target Types

- `static-site`: default for normal sites.
- `sites-control-plane`: the only backend recipe currently allowed. It is
  locked to `siteId: sites`, `sourceRepo: mist83/sites`, `sourceRef: main`, and
  `config: mullmania.site.json`.

If a repo needs arbitrary backend deploy commands, stop. Add an approved recipe
first; do not let a source repo define its own backend shell commands.

## Static-Site Migration Steps

1. Inspect the source repo.

```bash
node scripts/inventory-repos.mjs --owner mist83 --repo mist83/<repo> --json
```

Proceed automatically only for `static-safe`. For `backend`, `unknown`,
`static-needs-fix`, or `do-not-touch`, report the blocker instead of guessing.

2. Register or update the target.

```bash
SITES_OPERATOR_KEY=... node scripts/register-target.mjs \
  --site <site-id> \
  --source mist83/<repo> \
  --ref <branch> \
  --config mullmania.site.json
```

3. Install or update the source repo webhook.

The webhook URL is:

```text
https://sites.mullmania.com/api/redeploy/github-webhook
```

Use the shared `GITHUB_REDEPLOY_WEBHOOK_SECRET` from the live Sites API
environment. Never print or commit the secret.

4. Run a broker proof deploy.

```bash
gh workflow run deploy-mullmania-site.yml \
  --repo mist83/broker-deploy \
  -f site_id=<site-id> \
  -f reason=manual-proof \
  -f source=operator
```

Wait for the run to finish. Do not disable old workflows until this succeeds.

5. Verify the live site and mirror.

```text
https://<site-id>.mullmania.com/
https://mist83.github.io/broker-deploy/<site-id>/
https://mist83.github.io/broker-deploy/_deployments/index.json
```

6. Disable duplicate deploy workflows in the source repo.

Disable old AWS/S3/Page deploy workflows only after proof. Leave unrelated CI,
tests, smoke checks, or diagnostics active unless the operator explicitly asks
to reduce Actions usage further.

## Manual Redeploy

Preferred protected API path:

```bash
curl -fsS -X POST https://sites.mullmania.com/api/redeploy/target/<site-id> \
  -H "x-operator-key: $SITES_OPERATOR_KEY" \
  -H "content-type: application/json" \
  -d '{"reason":"manual redeploy","source":"operator"}'
```

Direct broker dispatch is also acceptable for proofs, but the broker still asks
Sites for the allowlisted target before downloading anything.

## Evidence To Leave Behind

When done, update `docs/migration-inventory.md` with:

- site id
- source repo and branch
- webhook id
- old workflow state
- broker proof run id
- live and mirror verification

The public transparency page should also show the latest successful deploy:

```text
https://mist83.github.io/broker-deploy/
```
