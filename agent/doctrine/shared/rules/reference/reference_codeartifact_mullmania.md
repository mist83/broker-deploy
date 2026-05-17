---
name: Mullmania NuGet feed (sleet static)
description: Public NuGet feed at nuget.mullmania.com — sleet static feed in S3, no auth needed to install; superseded the earlier AWS CodeArtifact setup on 2026-04-17
type: reference
---

Public NuGet feed for `mist83/*` libraries. NOT CodeArtifact anymore.

- **Feed URL**: `https://nuget.mullmania.com/nuget/index.json`
- **Generator**: [sleet](https://github.com/emgarten/Sleet) — writes standard NuGet v3 feed as static JSON files
- **Storage**: `s3://mullmania.com/nuget/` (unified Mullmania bucket)
- **Subdomain routing**: `mullmania-subdomain-router` CF function handles `nuget.mullmania.com/nuget/…` → S3 `/nuget/…` via the duplicate-prefix stripping it got in the sleet migration; also skips `.html` appending for `/autocomplete/`, `/flatcontainer/`, `/registration/`, `/search/` paths (sleet's raw files)
- **Config**: `sleet.json` lives in `mist83/package-garden`; library publish scripts clone package-garden at publish time to use it — no config duplication across libraries

## Consuming (no AWS needed)

```
dotnet nuget add source https://nuget.mullmania.com/nuget/index.json --name mullmania
dotnet add package <Name>
```

Works from any machine, any CI, any account. MIT libraries, publicly installable.

## Publishing

Library's `scripts/publish-to-codeartifact.sh` (filename kept for back-compat; contents now sleet-based):
1. `dotnet pack`
2. Clones `mist83/package-garden` for `sleet.json`
3. `sleet push <nupkg> --config sleet.json --source mullmania --force`
4. Calls package-garden's `register-package.sh` + `update-index.sh` to refresh `packages.mullmania.com`

Requires AWS credentials with S3 write on `mullmania.com` (the existing `github-actions-role` or local dev `mullman-console` user).

## Migration history (2026-04-17)

Replaced AWS CodeArtifact (`mullmania/nuget` domain in us-west-2) with sleet because:
- CodeArtifact needed `aws codeartifact login` every 12h for consumers
- CodeArtifact had per-request service charges; sleet is free-tier S3
- Libraries are MIT, so "private feed" was defending nothing

During migration:
- Domain `mullmania` / repo `nuget` / package `jsonutilities` all deleted
- IAM inline policy `codeartifact-publish-mullmania` removed from `github-actions-role`
- CF router `mullmania-subdomain-router` gained two improvements (duplicate-prefix strip + raw-path extension skip) that are useful beyond sleet
- Full cold-cache test verified: fresh `dotnet add package JsonUtilities` from empty `globalPackagesFolder` pulled from sleet feed and ran successfully

## Cost

Fractions of a cent per month at current scale. Fully inside AWS free tier.
