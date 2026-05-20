---
name: Mullmania infra is S3 + Lambda — do not suggest other hosts
description: GLOBAL — when deploying or shipping anything under *.mullmania.com, the only sanctioned hosting is S3 static + Lambda (where an API is needed). Never propose Fly, Render, Fargate, Cloud Run, Railway, Vercel, Netlify, Heroku, App Service, EC2, Docker hosts, or any other PaaS.
type: feedback
originSessionId: cobalt-wealthops-deploy-2026-05-20
---
Mullmania has one deploy fabric and Mike is tired of agents reinventing it.

**Why:** The full pipeline already works end-to-end: `mullmania.site.json` + `deploy.sh` + `scripts/deploy.sh` → `s3://mullmania.com-data/_tools/deploy-site.mjs` publishes static bundles into `s3://mullmania.com/<siteId>/`. CloudFront `ENGWDAVJ3FK6` (the `*.mullmania.com` wildcard distribution) serves them via the `mullmania-subdomain-router` Viewer-Request function. The shared `mullmania-launchpad-api` Lambda (Function URL `btuarc3jsqogre3oi3spieaoqm0ceqvu.lambda-url.us-west-2.on.aws`) handles all `/api/*` traffic via an ordered CloudFront behavior. Any suggestion outside this stack is noise — the costs are paid, the wiring exists, and proposing Fly/Render/etc. forces Mike to spell out "S3 and Lambda, that's it" again.

**How to apply:**
- For a new static demo or UI: add `mullmania.site.json` (see existing repos like `url-previewer`, `caroms`, `gitter`) plus `deploy.sh` + `scripts/deploy.sh` (canonical 4-liner that pulls deploy-site.mjs from S3). `bash deploy.sh apply` publishes.
- For a new `*.mullmania.com` hostname: after the first publish, flip the catalog public via `POST /api/catalog/access/site/<siteId>` with `{"isPublic": true}` and the operator key (`~/Code/sites/out/sites-api.json`). The subdomain router PS allowlist refreshes automatically.
- For dynamic backend behavior: add routes to the existing `mullmania-launchpad-api` Lambda. Do NOT stand up a second Lambda + a custom CloudFront behavior unless there is a concrete reason the shared API cannot host the routes.
- For a fully self-contained `.NET` app like `cobalt-wealthops` whose API uses an in-memory store: deploy as a static snapshot — bake `GET /api/*` responses to disk under a non-`/api/` prefix (e.g. `/_api/*.json`), gate fixture reads on `!localhost` in the client, and simulate mutations client-side with a small toast. Do not Lambda-wrap a stateless demo; the snapshot is enough for "send to a coworker to play around."

**Hard "no" list — never suggest these for Mullmania:**
- Fly.io / fly.toml
- Render / render.yaml
- AWS Fargate / ECS
- Google Cloud Run
- Railway / Heroku
- Vercel / Netlify
- Azure App Service / EC2 / standalone Docker hosts
- Container-as-a-service of any flavor

Reference: cobalt-wealthops → wealth-ops.mullmania.com static snapshot deploy, 2026-05-20.
