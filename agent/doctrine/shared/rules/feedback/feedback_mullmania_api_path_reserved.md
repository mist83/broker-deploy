---
name: /api/* on *.mullmania.com is reserved by the launchpad Lambda
description: GLOBAL — the path prefix /api and /api/* on any *.mullmania.com hostname is hardwired in CloudFront to proxy to the shared mullmania-launchpad-api Lambda. Files under wwwroot/api/ in a static site never reach S3. Use /_api/ or another prefix for static JSON fixtures.
type: feedback
originSessionId: cobalt-wealthops-deploy-2026-05-20
---
CloudFront distribution `ENGWDAVJ3FK6` (`*.mullmania.com`) has two ordered cache behaviors above the default S3 origin:

- `/api`       → `Lambda-mullmania-launchpad-api`
- `/api/*`     → `Lambda-mullmania-launchpad-api`

Anything beneath `/api/...` is routed to the shared launchpad API regardless of the hosted site. Static files committed to `wwwroot/api/whatever.json` in a `*.mullmania.com` site **are never served from S3** — the request stops at the Lambda. The Lambda returns 405 (or 404 with its own envelope) for routes it doesn't know about, which looks like a deploy failure but isn't.

**How to apply:**
- For a static site that needs to ship JSON fixtures, put them under a non-`/api/` prefix — `_api/`, `data/`, `fixtures/`, `state/`, anything that doesn't collide. Update the client to fetch from that prefix.
- For dynamic backend behavior, add the routes to `mullmania-launchpad-api` itself (don't try to override the CloudFront behavior with a more-specific pattern unless you genuinely need a per-site backend).
- If you see `405 Method Not Allowed` from `<site>.mullmania.com/api/*` after a static deploy, this is the cause. The fix is renaming the on-disk prefix and bumping the cache-buster — not chasing CORS, IAM, or bucket policy.

Reference: cobalt-wealthops static snapshot deploy hit this on first try, 2026-05-20. Renamed `wwwroot/api/ → wwwroot/_api/` and updated `app.js` to read fixtures from `./_api/*.json`. Second deploy resolved.
