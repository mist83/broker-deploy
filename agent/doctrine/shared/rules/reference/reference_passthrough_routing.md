---
name: Passthrough subdomain routing
description: How `routing.passthrough=true` catalog flag bypasses /<siteId>/ prefix prepending in the CF subdomain router
type: reference
originSessionId: 2452ee0b-aa86-4230-b5af-9b8c7d73decd
---
The `mullmania-subdomain-router` CloudFront function normally prepends `/<siteId>/` to incoming request URIs (`disco.mullmania.com/foo` → S3 key `disco/foo`). Catalog entries can opt into a "passthrough" mode where this prefix is NOT added: the request URI is left intact and used as the S3 key directly.

**How to enable**: add `routing: {passthrough: true}` to the entry in `s3://mullmania.com-data/_catalog/sites.json`, then POST `/api/router/rebuild` (operator-key auth) on the sites lambda function URL to regenerate the router.

**When you need it**: any subdomain whose backing tool bakes its own internal path prefix into served URLs. The motivating case is `nuget.mullmania.com` — Sleet's static-feed metadata bakes `https://nuget.mullmania.com/nuget/...` into every URL because Sleet enforces `BaseURI` ends with `feedSubPath` (validated in `SleetLib/Utility/SourceUtility.cs`). Without passthrough, the router would prepend a second `/nuget/` and 404 every metadata fetch.

**Code location**: 
- Catalog flag honored in `build_router_host_sets()` (sites/api/index.py)
- JS template var `PT=__PASSTHROUGH_SITE_MAP__`; `route(r,s)` does `var p=PT[s]?'':'/'+s` and short-circuits when `p===''`

**Don't confuse with**: the `htmlFallbackPath` routing field (different flag, controls where `/` resolves). `passthrough` and `htmlFallbackPath` are independent — passthrough subdomains shouldn't need a fallback because they're not HTML sites.
