---
name: UI canon first — never invent CSS; read BOTH layers before writing markup
description: GLOBAL — before any markup that uses the UI framework, read ui.[base]/llm-docs.md (primitives) AND development-canon/core/ui-style-guide.md (shell layer). Use framework classes; if missing, add upstream first. Browser-verify shell contract after deploy.
type: feedback
originSessionId: 9d01b121-8837-442b-ab09-8890417ab07b
---
When building any Mullmania/mikesendpoint page that uses the UI framework: read TWO docs before writing markup, never invent custom CSS for what the framework already provides, and verify the shell contract in the browser after deploy.

## Read both layers

1. **`https://ui.[base-url]/llm-docs.md`** — primitives layer. Tokens (`--bg-secondary`, `--text-muted`, `--space-md`), components (`.card`, `.tone-badge`, `.badge-list`, `.btn-primary`, `.tone-info/success/warning/danger/neutral`, `.gallery-card__tags`), theme/mode loader.
2. **`development-canon/core/ui-style-guide.md`** (fetch from the development-canon repo) — shell layer. Dictates the structural skeleton:
   - **Document / single-purpose front door**: `.header` + `#content-container` + `.page-container`
   - **Tool surface (2+ tasks, browse, list/detail)**: `#header-container` + `#tabs-container` + `#content-container`, default header + tabs + sidebar
   - **`.container` is NOT a generic page wrapper.** A package index, endpoint browser, settings panel, admin surface, dashboard — these are tool surfaces, not document pages.
   - The document shell is the **exception, not the default** — burden is on the implementer to justify the simpler shell.
   - Consider `UI.frontdoor.mount('#app')` with `frontdoor.json` for hub-ish cases.

A page can be 100% clean at the primitives layer and still violate the canon at the shell layer. Both layers are required.

## Don't invent CSS

Before writing any badge, chip, table, card, toolbar, or layout class:
1. Fetch and read `ui.[base]/active/layout.css` to see what exists.
2. If a component is close but not quite right, add the missing piece to the UI repo first, then consume it downstream.
3. If a reusable pattern is needed (e.g. `.badge-list` for wrapping badges), add it to the framework — not the consuming site.
4. Use `style.css` with relative imports (`./colors.css`, `./layout.css`) so it works from any host.

## Verification rule

After deploy, browser-check the shell contract: header present, correct scroll owner, wordmark not duplicated. "HTTP 200 + grep for expected content" is not sufficient — that's what missed shell violations in the past.

**Past incidents:**
- **2026-04-17 — packages.mullmania.com:** used `<main class="container">` as a generic wrapper (canon explicitly forbids), shipped without `.header`, `#content-container`, `.page-container`. Operator caught it: "WHY DOES IT NOT HAVE A HEADER AS IS REQUIRED PER THE UI SPEC."
- **Earlier — launchpad:** invented `.flag-chip`, `.flag-list`, and 16 custom `.tone-*` color rules when the framework already had `.tone-badge`, `.tone-info/success/warning/danger/neutral`, and `.gallery-card__tags`. Created drift and maintenance burden.
