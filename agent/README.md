# agent

Prompt rules, scaffolds, workflows, and doctrine artifacts for agents. This repo absorbs the old `clinerules` and `agent-rules` names; `.clinerules` remains only because some tools still load that file extension directly.

Browse the site at <https://agent.mullmania.com/>.

## Layout

- **Rules** (`*.clinerules`): synopsis-style trigger/purpose files. The `.clinerules` extension stays because some agent shells still load that format directly.
- **Full guides** (`full/*.md`): the expanded how-to for each rule. The synopsis points at these.
- **Meta docs** (`README.md`, `RULE-CREATION-GUIDE.md`, `rules-index.md`, `custom_instructions.md`, etc.): project-level writeups.
- **Facets** (`facets/*.facet`): category rollups used by the loader.
- **Doctrine** (`doctrine/*`): machine-readable bootstrap and memory seed artifacts intended to become the remote source of truth.

## Doctrine Direction

- `agent.mullmania.com` is the current live host. If `agents.mullmania.com` is introduced later, it should replace or mirror this host instead of forking the doctrine.
- Doctrine artifacts should be publicly readable from the current host. If they are not reachable, consumers should fail visibly instead of silently falling back.
- The shared doctrine core now lives in `doctrine/shared-rule-catalog-v1.json` plus `doctrine/profile-toc-v1.json`. Runtime packs are overlays, not separate brains.
- Runtime instruction packs live at `doctrine/claude-instruction-pack-v1.json` and `doctrine/codex-instruction-pack-v1.json`; their flavor trees are projection shims, while durable command and skill behavior stays under `doctrine/shared/`.
- Existing `.clinerules`, `full/*.md`, `custom_instructions.md`, and similar platform-shaped files are now legacy compatibility material and historical inputs.
- New source-of-truth behavior belongs in the doctrine artifacts and their guiding docs, not in ad hoc local Codex/Claude files.
- Local platform files should become generated projections or tiny bootstrap/fuse shims, not authored policy.

## Site

- Shell: canon tool surface (`#header-container` + `#tabs-container` + `#content-container`) loaded from `https://ui.mullmania.com`.
- Tabs: Overview / Rules / Full Guides / Docs.
- Rules, Full Guides, and Docs tabs use the `layout: "workspace"` sidebar split.
- `scripts/build.mjs` renders every source into an HTML fragment under `tabs/` and regenerates `sitemap.json`. Run `node scripts/build.mjs` after editing any rule or doc.

## Deploy

- `mullmania.site.json` is the publish contract. The deploy workflow runs the configured install/build commands (`npm install` and `npm run build`) on push to `master`, then syncs the configured publish root to `s3://mullmania.com/agent/`.
- GitHub Pages also mirrors the repo root from `master`.

## Working locally

```bash
npm install
node scripts/build.mjs
python3 -m http.server 8732
# open http://localhost:8732
```
