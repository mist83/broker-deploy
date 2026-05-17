---
name: publish-package
description: Publish a .NET library from a mist83/* repo to the private Mullmania CodeArtifact NuGet feed AND refresh packages.mullmania.com in a single step. TRIGGER when the operator says anything like "publish this as a package", "push this library", "release this to the feed", "add this to my packages", "publish to nuget" (they always mean the private feed, never nuget.org unless explicitly stated), "cut a release of this library", or when they've just finished a .NET library and the natural next step is making it installable from other projects. DO NOT TRIGGER for non-.NET projects, or when the operator specifically says "nuget.org" or "public nuget" — that's a different flow.
---

# publish-package

Ship a `mist83/*` .NET library to the private Mullmania NuGet feed (AWS CodeArtifact, domain `mullmania`, repo `nuget`, region `us-west-2`) and refresh the public-facing index at `packages.mullmania.com`. One command, both sides stay consistent.

## The canonical flow

Every library that uses this has the same two files:

- `scripts/publish-to-codeartifact.sh` — in the LIBRARY repo. Packs, pushes, then clones `mist83/package-garden` and runs its `update-index.sh`.
- `.github/workflows/publish-nuget.yml` — tag-triggered CI publish using OIDC via the shared `github-actions-role`.

Reference implementation: [`mist83/json-tools`](https://github.com/mist83/json-tools) (the first library published this way).

The site-generating script lives in [`mist83/package-garden`](https://github.com/mist83/package-garden) — do NOT copy that logic into each library. One source of truth, cloned at publish time.

## When the operator says "publish this library"

1. **Look at the csproj** in the target repo. Confirm it has: `<Version>`, `<PackageId>` (or sensible `<AssemblyName>`), `<Description>`, `<Authors>`, `<PackageLicenseExpression>`, `<RepositoryUrl>`, `<PackageTags>`, and ideally `<GenerateDocumentationFile>true`. If any are missing, add them (derive from repo + README where possible, ask only if the answer isn't inferrable).
2. **Copy the two canonical files** from `mist83/json-tools` if the repo doesn't have them yet:
   - `scripts/publish-to-codeartifact.sh` → adjust `PROJECT=` at the top to point at the right csproj.
   - `.github/workflows/publish-nuget.yml` → no changes needed; uses `github-actions-role` which is already scoped to `mist83/*`.
3. **Run the script locally**: `./scripts/publish-to-codeartifact.sh`. It will:
   - Pack the csproj.
   - Push to `mullmania/nuget`.
   - Clone `package-garden` to a temp dir.
   - Run `update-index.sh` which regenerates `packages.mullmania.com`.
4. **Verify**: `curl -sS https://packages.mullmania.com/ | grep <PackageName>` — the new package should appear.
5. **Commit the two new files** in the library repo if they were newly added. Don't push the tag yet unless the operator asks — tagged pushes trigger the CI workflow, which only runs once GitHub billing is live anyway.

## Version bumps

Each new publish needs a new `<Version>` in the csproj. CodeArtifact won't overwrite existing versions (the push will be a no-op via `--skip-duplicate`). If the operator wants a genuinely new release, bump the version first.

## Cost awareness

At current scale (handful of libraries, each tens of KB), total AWS cost is a fraction of a cent per month. Don't invent new infrastructure unless the operator explicitly asks — the existing `mullmania.com` unified bucket, `ENGWDAVJ3FK6` CloudFront distribution, `mullmania-subdomain-router` function, and `*.mullmania.com` ACM cert handle everything. Full details in `reference_codeartifact_mullmania.md` in memory.

## When NOT to use this skill

- Operator says "publish to nuget.org" or "public nuget" — that's a different, unset-up flow. Ask what they want (nuget.org account + API key, versus this private feed).
- The project isn't a .NET library (CodeArtifact supports npm/PyPI/Maven but no matching skill+infra yet).
- The operator is asking about package consumption, not publishing — just point them at the `aws codeartifact login --tool dotnet ...` one-liner and `dotnet add package <Name>`.

## Skill ↔ memory

Works in concert with:
- `reference_codeartifact_mullmania.md` (feed metadata, IAM details)
- `reference_mullmania_packages_site.md` (site layout, CF routing, when it needs a hand)

If either is missing or stale relative to what you discover in the current state of AWS/git, update the memory file first.
