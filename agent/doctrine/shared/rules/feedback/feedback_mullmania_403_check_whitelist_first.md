---
name: Mullmania 403/404 — check whitelist gate before CORS
description: GLOBAL — when any Mullmania subdomain returns 403 or 404, suspect the whitelist gate (isPublic flag + x-site-key header) FIRST, before CORS / IAM / Lambda-URL auth theories.
type: feedback
originSessionId: 9d76d68c-43af-4276-979a-922fb0d139f3
---
When a request to `*.mullmania.com` returns 403 or 404, the most common cause is the subdomain router's whitelist gate, not CORS.

**Why:** Mike's subdomain router enforces auth at CloudFront. Sites with `isPublic: false` in the catalog are blocked at CF, and any request missing the `x-site-key` header gets 404 (now diagnostic body explains this — see `sites/api/index.py` `gate()` and `require_site_key`). Mike has watched multiple agents (and himself) burn hours assuming CORS, IAM, or Lambda-URL auth, when the actual fix was a single API call to flip `isPublic=true` or set the header.

**How to apply:**
- See a 403/404 from `*.mullmania.com`? First check: read the response body — the router now self-documents. Then `curl https://sites.mullmania.com/api/sites` and confirm the site's `isPublic`.
- To whitelist a site for cross-origin reads: `POST /api/catalog/access/site/<id>` with `{"isPublic": true}` and the `x-operator-key` header (key in `~/Code/sites/out/sites-api.json`).
- If the upstream Lambda still 403s with `{"Message":null}` after whitelist+key, THEN suspect AWS IAM auth on the Function URL — that's the secondary hypothesis, not the primary one.
- Site-key header name is configured (`SITE_KEY_HEADER` env, defaults to `x-site-key`) — read `out/sites-api.json` for the current pair.
