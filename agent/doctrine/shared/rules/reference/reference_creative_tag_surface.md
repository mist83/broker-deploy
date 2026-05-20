---
name: Creative tag — visualization surface on sites.mullmania.com
description: How tagging a catalog entry with `creative` surfaces it as a paged iframe entry inside the launchpad's Creative view mode
type: reference
---
The launchpad's **Creative** view mode (toolbar icon `ti ti-chart-bubble`) is a paged iframe stage. Every catalog entry tagged with `creative` automatically appears in the pager — no registration, no manifest, no separate registry file. Adding a viz to Creative is one operator action: edit the entry's `tags` to include `"creative"`.

**The contract is the tag.** A site is a "creative" entry iff:

- It exists in `s3://mullmania.com-data/_catalog/sites.json`.
- It has `hasHostedSite: true` (it's actually live somewhere).
- Its `tags` array contains the literal token `creative` (case-insensitive; normalized via `normalizeCatalogToken`).

That's the entire onboarding requirement. No postMessage protocol, no schema beyond what every catalog entry already carries. The viz is just a website living at its own subdomain.

**What the host gives you, and what it doesn't.** The Creative view does NOT push launchpad state (selection, search, filter, theme) into the viz. The iframe is mounted with its resolved entry URL and otherwise treated as an opaque page. If a future viz needs launchpad data, extend the contract narrowly (one postMessage event, one method) — don't preemptively bake in a protocol.

**The pager UX.**

- One iframe at a time fills the stage.
- Top chrome: `<title> · <host>` on the left, `N / total · Prev · Next · Open` on the right.
- `Open` pops the viz into a new tab (the entry's resolved URL).
- The list wraps around at both ends.
- Empty state shows when zero entries carry the tag.

**Why it scales without cluttering the toolbar.** Creative occupies one view slot regardless of how many viz are registered. The list is paged through inside the view — the toolbar never grows. The tag is sticky and intentional, so the "list of viz" stays curated by virtue of which catalog entries you decide to tag, not by maintaining a parallel registry.

**Code locations** (`sites` repo):

- View registration: `DEFAULT_VIEW_CONFIG.creative` in `src/app/01-state.js`; toolbar entry in `sitemap.json` (`toolbar.views`).
- DOM cache: `creativeViewEl`, `creativeFrameEl`, `creativePrevButton`, `creativeNextButton`, `creativePopoutEl`, `creativeTitleEl`, `creativePositionEl`, `creativeStatusEl`, `creativeEmptyEl` in `src/app/02-dom-cache.js`.
- Pager logic: `getCreativeEntries()`, `renderCreativeView()`, `stepCreative(delta)` in `src/app/05-catalog-filter-render.js`; called from the main `render()` dispatcher and from `creative-prev` / `creative-next` click handlers in `src/app/03-boot-shell-events.js`.
- Markup: `<section id="creative-view" class="surface creative-shell">` in `index.html`.
- Styling: `.creative-shell`, `.creative-toolbar`, `.creative-stage`, `.creative-frame`, `.creative-empty` in `src/styles/02-dependencies.css`; viewport sizing rule for `body.is-creative-mode #content-container` in `src/styles/01-base-tokens.css`.

**Iframe gotcha.** A creative viz site must be marked `isPublic: true` in the catalog (or the operator must arrange a session cookie / `x-site-key`) — otherwise the CloudFront subdomain router whitelist gate 404s the iframe content. See `feedback_mullmania_403_check_whitelist_first.md` for the whitelist flip API. This is the most common reason a freshly tagged viz shows "404 Not Found / Mullmania whitelist gate" inside the iframe.
