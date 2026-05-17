---
name: canonize
description: Audit a target repo and produce a migration plan to make it 100% conformant with the canonical UI framework at ui.mullmania.com. Plan-only — never edits the target repo or the canon. TRIGGER when the operator says anything like "/canonize <repo>", "canonize this repo", "make <repo> conform to the canon", "rebuild <repo> against the UI canon", "audit <repo> for canon-compliance", "migrate <repo> to the framework", "canonicalize <repo>", or names a specific repo and asks to bring it in line with ui.mullmania.com. Each run also flags reusable code that should be lifted upstream into ~/Code/ui so the canon gets stronger. DO NOT TRIGGER for non-UI work, generic refactor requests without a named repo, or one-off styling questions.
---

# canonize

Audit a single repo and produce a migration plan that brings it to 100% conformance with the canonical UI framework at `ui.mullmania.com`. The plan is the deliverable. **Never edit the target repo. Never edit the canon. Never commit. Never deploy.** Read-only audit, write the plan, stop.

## Why this exists

The canon at `ui.mullmania.com` (source: `~/Code/ui`) is the single source of truth for UI in the operator's ecosystem. Consumer repos are not allowed to invent UI primitives or duplicate styling — every reusable control belongs upstream so other consumers benefit. This skill audits a single repo, plans the migration, and identifies anything reusable that should be lifted into the canon (with example contracts).

The operator runs this against many repos in turn. Each invocation produces one plan, persisted to memory. The operator (or another session) executes the plan separately. This skill never touches the file system outside its own plan output.

## Invocation

`/canonize <repo-name>` — argument is the directory name under `~/Code/`. If the operator says just "canonize" with no arg, ask which repo. If `~/Code/<repo>` doesn't exist, stop and say so.

## Hard rules

- **Plan only.** Read freely. Do not edit the target repo. Do not edit `~/Code/ui`. Do not commit. Do not deploy.
- **Zero custom CSS in the consumer.** No `<style>` blocks. No consumer stylesheets. No CSS variable overrides. If the consumer needs different colors/fonts, the plan picks an existing theme via `data-ui-theme` or proposes a new theme upstream into `~/Code/ui`.
- **Zero custom JS for UI rendering.** All UI rendering happens through the canon: a remote contract, `UI.frontdoor.mount()`, or `UI.mount()`. Consumer JS is only allowed for business logic — data fetches, domain calculations, event handlers wired to canon components.
- **Pattern preference, highest canon first:**
  1. Remote contract (`<script src="...ui.js">` + `?source=page.json` or `UI.contract.renderFromLocation`) — zero consumer JS, page is pure data
  2. `UI.frontdoor.mount()` — one-line bootstrap from `frontdoor.json`
  3. `UI.mount('#app', {...})` — in-page assembly when the page genuinely needs JS to assemble
  Recommend the highest pattern the repo can actually use. Briefly explain why lower patterns were rejected.
- **Shell auto-decision.** Tabs, workspace UI, sidebar, multi-mode app → app shell (`#header-container` + `#tabs-container` + `#content-container`). Otherwise → doc shell (`.header` + `#content-container` + `.page-container`). Show the reasoning in the plan.
- **Upstream bar.** Flag a primitive for upstream into `~/Code/ui` only if all three hold: (a) used 2+ places in the consumer, (b) the name is generic with no business-domain noun, (c) no backend coupling. One-offs and business-specific things stay local — but should still be expressed as composition of canon primitives, not as bespoke HTML/CSS.
- **Themes are first-class.** Existing themes: `active-classic`, `cyberpink`, `editorial`, `mockup`, `ocean`, `pumpkin`, `sunset`, `walmart` (plus `active` as a swappable alias). List `~/Code/ui/` to confirm the current set — themes are added over time.

## Workflow

### 1. Resolve and verify the target

- Resolve `~/Code/<repo>`. If missing, stop.
- `ls ~/Code/<repo>` to identify the UI surface (HTML, CSS, JS files). If there is no UI surface, stop and say so.

### 2. Read the canon (fresh every run — do not cache)

The canon evolves. Read these directly each time:

- `~/Code/ui/llm-docs.md` — consumer guide, shell rules, anti-patterns, typography roles
- `~/Code/ui/active/style.css` — currently-active theme classes
- `~/Code/ui/core/layout.css` — shell layer (the doc/app shell selectors)
- `~/Code/ui/js/components.js` — `UI.<helper>()` API surface
- `~/Code/ui/page-contract.schema.json` — accepted contract `component` types
- `~/Code/ui/examples/hello-framework.page.json` — reference contract
- `~/Code/ui/sitemap.json` — tab routing reference

List `~/Code/ui/` to confirm available themes. Note the available `UI.*` exports.

If `~/Code/json-tools/docs/index.html` exists, glance at it as a good-citizen reference for how a minimal canonical page is wired.

### 3. Recon the target

Inventory:

- **Custom CSS** — count rules, list selectors, classify each into: theme tokens (`--color-*` etc.), layout, component, business-specific. Note any inline `style=` and `<style>` blocks.
- **Custom JS** — count files, list functions, classify each into: UI rendering vs business logic.
- **HTML shell** — identify the shell pattern in use (doc, app, none, broken). Note any custom containers competing with the canon shell.
- **Existing aesthetic** — colors, fonts, density. Match against the available themes.
- **Business-domain code** — the carve-out that legitimately stays local (data shapes, domain logic, integrations).

Capture this URL in the plan for the operator to open: `dag.mullmania.com/?named=<repo>` (canon-mandated investigation step). The operator will read the plan in a browser-capable context.

### 4. Make decisions

- **Shell**: doc or app, with reasoning grounded in the recon.
- **Pattern**: highest canon pattern that fits, with reasoning. Note the data flow if the page is dynamic.
- **Theme**: best-match existing theme, OR a proposed new theme upstream (only if no existing theme fits the brand). If proposing a new theme, the plan includes the proposed name and the deviation from the closest existing theme.
- **Component mapping**: for each meaningful element in the target, the `UI.<helper>` or contract `component` that replaces it.

### 5. Identify upstream candidates

For each consumer-side pattern that meets the upstream bar, document:

- Proposed helper name and signature: `UI.<name>({...})`
- One-paragraph behavior spec
- A draft `<name>.page.json` example contract for `~/Code/ui/examples/`
- Where in `~/Code/ui/js/components.js` and `~/Code/ui/active-classic/style.css` the additions go
- Whether it should also be added to `~/Code/ui/page-contract.schema.json` (if it's a contract-renderable component)

If there are no upstream candidates, say so explicitly — don't omit the section silently.

### 6. Write the plan to memory

Write to `/Users/mist83/.claude/projects/-Users-mist83-Code/memory/project_canonize_<repo>.md` using exactly this template:

````markdown
---
name: Canonize plan for <repo>
description: Migration plan to bring <repo> to 100% canon conformance — generated <YYYY-MM-DD>
type: project
---

# Canonize plan: <repo>

Generated: <YYYY-MM-DD>
Target: ~/Code/<repo>
Canon source: ~/Code/ui (deployed at ui.mullmania.com)

## Audit summary
- Custom CSS: <N rules across M files> — <classification breakdown>
- Custom JS: <N files> — <UI vs business breakdown>
- Shell pattern in use: <doc | app | none | broken>
- Existing aesthetic: <one line>
- dag: dag.mullmania.com/?named=<repo>

## Decisions
- **Shell**: <doc | app> — <one-line reason>
- **Pattern**: <remote contract | frontdoor | UI.mount> — <one-line reason; why lower patterns rejected>
- **Theme**: <existing-theme-name | propose new theme: <name>> — <one-line reason>

## Component mapping

| Existing element | Canon replacement | Notes |
|---|---|---|
| ... | ... | ... |

## Upstream candidates

<If none: state "None — all consumer patterns are one-offs or business-specific.">

### `UI.<helperName>`
- **Signature**: `UI.helperName({...})`
- **Behavior**: <one paragraph>
- **Example contract** (`~/Code/ui/examples/<name>.page.json`):
  ```json
  { "$schema": "https://ui.mullmania.com/page-contract.schema.json", "version": 1, ... }
  ```
- **Add to**: `~/Code/ui/js/components.js`, `~/Code/ui/active-classic/style.css`, `~/Code/ui/page-contract.schema.json` (if contract-renderable)

## Carve-outs (business-domain — stays local)

- `<file>`: <what it does, why it stays>

## Execution checklist

1. Pin theme: add `data-ui-theme="<theme>"` to the `<script src="https://ui.mullmania.com/ui.js">` tag
2. Replace shell — before/after sketch:
   - **Before**: <current top-level HTML>
   - **After**: <canonical shell>
3. Replace components per the mapping table above
4. Delete custom CSS files: <list>
5. Delete custom JS files: <list>
6. (If upstreams) edit `~/Code/ui` per the Upstream candidates section, then deploy ui.mullmania.com
7. Run the verification gates below — all must return zero

## Verification (grep gates)

After execution, all of these must return zero:

```bash
find ~/Code/<repo> -name '*.css' -not -path '*/node_modules/*' | wc -l
grep -r 'style=' ~/Code/<repo> --include='*.html' | wc -l
grep -r '<style' ~/Code/<repo> --include='*.html' | wc -l
grep -rE '(getElementById|querySelector).*\.style\.' ~/Code/<repo> --include='*.js' | wc -l
```

The consumer should pull `https://ui.mullmania.com/ui.js` (and nothing else) for UI.
````

### 7. Index the plan in MEMORY.md

Append (or update if a plan for this repo already exists) the entry in `/Users/mist83/.claude/projects/-Users-mist83-Code/memory/MEMORY.md`:

```
- [Canonize plan: <repo>](project_canonize_<repo>.md) — <shell> shell + <pattern> pattern + <theme> theme; <N> upstream candidates
```

If a prior plan exists for this repo, overwrite it — the latest plan supersedes.

### 8. Summarize in chat

After writing the file, give the operator a tight summary in chat. Format:

```
Plan written: ~/.claude/projects/-Users-mist83-Code/memory/project_canonize_<repo>.md

Shell: <doc | app> — <one-line reason>
Pattern: <remote contract | frontdoor | UI.mount> — <one-line reason>
Theme: <theme name> — <one-line reason>
Upstream candidates: <N> (<comma-list of names, or "none">)
Carve-outs: <N> file(s)

Next: open the plan to review, then execute (or hand to another session).
```

Don't repeat the full plan in chat — the file is the plan.

## Anti-patterns to flag in the audit

If any of these appear in the target, call them out explicitly:

- Card grids used as hero (anti-pattern from llm-docs.md)
- Multiple competing scroll containers (`body` + `#content-container` + nested panels all scrolling)
- `.container` used as a generic wrapper for docs (it's the app-shell grid; use `.page-container` for docs)
- Theme tokens (`--color-primary` etc.) overridden in consumer CSS
- Raw HTML strings injected via JS (should be canon components)
- Mixing `page` and `preset` in the same contract
- Inline event handlers wired to non-canon components

## What this skill explicitly does NOT do

- Does not edit the target repo
- Does not edit `~/Code/ui` or deploy ui.mullmania.com
- Does not run tests, builds, or commits
- Does not produce a diff — produces a plan another session can execute
- Does not benchmark or measure beyond the grep gates in the plan
