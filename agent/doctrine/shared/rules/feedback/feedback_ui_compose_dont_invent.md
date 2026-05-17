---
name: ui-compose-dont-invent (use the framework's primitives, in canonical compositions)
description: When building a Mullmania UI, do NOT invent new shells / layout systems / class taxonomies. The framework already has the primitives. Compose them in the documented canonical shapes.
type: feedback
originSessionId: tv-tail-2026-04-30
---

# Don't invent shells. Compose primitives.

The recurring failure mode when an agent builds a Mullmania UI is to roll a
fresh CSS Grid + a fresh BEM tree + a fresh class system, ship it, and only
*then* notice the framework already had every piece. By that point the
inventions have to be ripped out.

**Rule:** Do not invent layout primitives or new shells. Compose existing
ones. If a layout shape repeats often, the answer is to **document a new
canonical composition** — not to write a new shell.

## How to apply

1. **Before you write `<style>` or a `.css` file**, check `ui.mullmania.com/llm-docs.md` and the canonical compositions below. Almost every "new" page is one of these shapes.
2. **For UI primitives** (icon, text, button, status, alert, stack, grid, card, section, stat, pager, table, chart, preview), use `UI.{primitive}({…})` from the runtime. Do not handcraft equivalent markup.
3. **For surface shape**, pick from the canonical list:
   - **Document** — a single lane of authored content (landing page, README-style site, frontdoor). Use `header` + `#content-container` + `.page-container`. No tabs, no workspace. Anti-pattern: wrapping in `.container`.
   - **Workspace / app shell** — a tool with 2+ modes, navigation, source switching, filters, or list/detail flow. Use `#header-container` + `#tabs-container` + `#content-container` with `body.builder-shell` and per-tab `layout: "workspace"`.
   - **Live data dashboard** — workspace shell + a per-tab `inlineData` list (or `dataSource` JSON) on the left, content pane on the right that re-mounts on poll/event. Reference: `mist83/gitter/dashboard.{html,js}`.
   - **Master/detail explorer** — workspace shell with a list section and a detail pane preset. Reference: `ui.mullmania.com` itself (sitemap.json).
   - **Single-screen surface (kiosk / TV / canvas-heavy)** — full-bleed canvas with HTML overlays for HUD; no framework chrome inside the canvas region. Theme via `data-ui-theme`. Reference: `mist83/disem-bowling`.
4. **For palette + typography + chrome** — let the active theme (or a pinned one like `ghoul`) provide colors/fonts/scrollbars/buttons/inputs. Don't redeclare them in the app.
5. **If the shape doesn't fit any canonical composition** — propose a new entry to the canonical list (PR a doc update + wire one reference repo) before you ship a custom shell. The bar is "this is repeating across apps," not "this app needs it."

## What NOT to do

- ❌ Don't add a new `.dashboard-shell`, `.console-shell`, `.app-frame` etc. when `body.builder-shell` + workspace tabs already work.
- ❌ Don't redefine palette tokens (`--bg-primary`, `--color-success`, etc.) in app CSS — they come from the theme.
- ❌ Don't roll your own header/topbar markup — use the framework's `header` element + `UI.tabs` shell.
- ❌ Don't wrap document pages in `.container`. That's the app shell, not a content shell.

## When in doubt

Read `ui.mullmania.com/llm-docs.md` and `ui.mullmania.com/compositions.md` (canonical shapes index). If the shape isn't in there but you keep reaching for the same composition across apps, that's the signal to canonize it — not to ship another local one-off.
