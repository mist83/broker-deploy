---
name: Mullmania packages.mullmania.com hub
description: Public-facing index of the private NuGet feed — repo, site layout, deploy pipeline, how the publish flow refreshes it
type: reference
originSessionId: 2452ee0b-aa86-4230-b5af-9b8c7d73decd
---
`https://packages.mullmania.com` is the auto-generated index of every package in the public sleet-static `mullmania/nuget` feed. Zero-manual-edit list — always consistent with what's actually published.

## Source of truth

- **GitHub**: [mist83/package-garden](https://github.com/mist83/package-garden) (private)
- **Local**: `/Users/mist83/Code/package-garden`
- **S3**: `s3://mullmania.com/packages/` prefix in the unified Mullmania bucket
- **CDN**: CloudFront distribution `ENGWDAVJ3FK6` (`*.mullmania.com`), routed by function `mullmania-subdomain-router`
- **Cert + DNS**: already covered by pre-existing `*.mullmania.com` ACM cert and wildcard Route53 A-record — no per-subdomain infra

## Key files in the repo

- `site/index.html` — the template AND the last-rendered page. Marker blocks `<!-- PACKAGES:START -->` … `<!-- PACKAGES:END -->` and `<!-- UPDATED_AT:START -->` … `<!-- UPDATED_AT:END -->` are auto-rewritten. Edit freely outside them.
- `scripts/update-index.sh` — reads `s3://mullmania.com/nuget/sleet.packageindex.json` (gzipped), splices HTML, `aws s3 sync site/ s3://mullmania.com/packages/`, invalidates CF paths `/packages/*`. (Was CodeArtifact-based until 2026-04-25; CodeArtifact domain `mullmania` retired with the sleet migration on 2026-04-17, leaving a silent `WARN` on every publish until fixed.)
- `mullmania.site.json` — canon frontdoor-v1 manifest (`siteId: packages`, `publishDir: ./site`).
- `CLAUDE.md` — in-repo agent notes for the publish flow.

## How the publish flow uses this

Each `mist83/*` library's `scripts/publish-to-codeartifact.sh`, after a successful `dotnet nuget push`, runs:

```bash
PG_DIR=$(mktemp -d)
gh repo clone mist83/package-garden "$PG_DIR" -- --depth 1 --quiet \
  || git clone --depth 1 --quiet git@github.com:mist83/package-garden.git "$PG_DIR"
"$PG_DIR/scripts/update-index.sh"
```

Non-fatal — if the clone fails (e.g. CI without cross-repo auth), publish still succeeds and the site just stays stale until the next local run.

## Styling

Uses `https://ui.mullmania.com/active/style.css` per the canon UI framework rule. Don't duplicate framework CSS; add to the framework if a pattern is missing.

## Manual refresh

```bash
cd /Users/mist83/Code/package-garden
./scripts/update-index.sh              # full deploy
DRY_RUN=1 ./scripts/update-index.sh    # render only, don't upload
```

## Cost

Single-digit KB storage, one CloudFront invalidation per publish. Rounds to zero/month.
