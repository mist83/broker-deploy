# ui.mullmania.com - Consumer Guidance

Purpose: canonical UI library for Mullmania surfaces. Use the shared runtime and helpers, but do not stop at mechanical component assembly. Build pages and app surfaces with clear hierarchy, restraint, and one dominant visual idea per section.

## Fastest Start

Default one-line include:

```html
<script src="https://ui.mullmania.com/ui.js"></script>
```

If the page is a Swagger UI surface and should also load the hosted Swagger skin:

```html
<script src="https://ui.mullmania.com/ui.js" data-ui-theme="active" data-ui-swagger="obliterated"></script>
```

Supported Swagger skins:

- `classic`
- `mono`
- `obliterated`

That single line loads the current published default, Tabler icons, and the shared JS primitives.

`active` is the published-default route. Bare `ui.js`, `data-ui-theme="active"`, and `/active/*` all follow the published default from `https://ui.mullmania.com/active-theme.json`. Explicit theme ids such as `ocean` or `walmart` stay pinned. `UI.setTheme()` only changes the current document; it does not publish a new global default.

## Shell Contract

The recurring failure mode is not “forgot the stylesheet.” The runtime already loads that for you. The recurring failure mode is using the wrong shell primitive.

Use these rules:

1. Document pages, forms, landing pages, and front doors with one lane:
   use `.header` + `#content-container` + `.page-container`
2. Search tools, endpoint browsers, admin/operator surfaces, list/detail explorers, and any surface with 2+ modes:
   use `#header-container` + `#tabs-container` + `#content-container`, with top-level tabs and `layout: "workspace"` where the active view needs navigation or inspection
3. If the surface has navigation, source switching, filters, or list/detail flow, the active view should usually be `workspace`
4. If the surface has 2+ distinct tasks or views, those should usually be top tabs
5. Do not wrap a document page in `.container`

Why:

- `.container` is the app shell. It is viewport-locked and assumes fixed-height content regions.
- `#content-container` is the framework’s scroll container.
- `.page-container` is the centered document-width content wrapper.
- App shells should have one clear vertical scroll owner per region. Do not make `body`, `#content-container`, and nested panels all compete for the same axis.
- On desktop, keep body/document pinned and let the intended inner region own scroll. On narrow mobile layouts, let the active content region scroll if that is what keeps the workspace reachable.

The important default:

- do not flatten app-like work into a document page just because the framework can render one
- if the user asked for a site that behaves like a tool, the richer shell is usually the correct answer

Verification default:

- check which region actually scrolls in a real browser
- check that the wordmark appears once, not in header + sidebar + masthead
- check that source or mode switches do not leave stale search/query state behind
- for search/browse tools, turn those checks into browser regression tests instead of relying on a manual glance

Canonical document shell:

```html
<body>
  <header class="header">
    <h1><i class="ti ti-car"></i><span>Valet</span></h1>
    <div class="header-links">
      <a class="header-link" href="/docs">
        <i class="ti ti-book"></i><span>Docs</span>
      </a>
    </div>
  </header>

  <div id="content-container">
    <main class="page-container">
      <div id="app"></div>
    </main>
  </div>

  <script src="https://ui.mullmania.com/ui.js"></script>
  <script>
    UI.ready().then(() => {
      UI.mount('#app', {
        title: 'Drop a task',
        sections: [
          UI.section({ title: 'Overview', children: ['...'] })
        ]
      });
    });
  </script>
</body>
```

Anti-pattern:

```html
<body>
  <main class="container">
    <div id="app"></div>
  </main>
</body>
```

That pattern is what causes the “page looks trapped / won’t scroll / feels like a broken panel” bug.

If you want a fixed theme without adding a separate stylesheet tag:

```html
<script src="https://ui.mullmania.com/ui.js" data-ui-theme="ocean"></script>
```

If you also want the hosted Swagger selectors:

```html
<script src="https://ui.mullmania.com/ui.js" data-ui-theme="active" data-ui-swagger="mono"></script>
```

If you prefer an explicit stylesheet pin:

```html
<link rel="stylesheet" href="https://ui.mullmania.com/ocean/style.css">
<script src="https://ui.mullmania.com/ui.js"></script>
```

If you want to follow the published default explicitly through CSS:

```html
<link rel="stylesheet" href="https://ui.mullmania.com/active/style.css">
<script src="https://ui.mullmania.com/ui.js"></script>
```

If you need a hard cache bust:

```html
<script src="https://ui.mullmania.com/ui.js?v=20260329"></script>
```

## Canonical Endpoints

- `https://ui.mullmania.com/ui.js`
  Preferred runtime entrypoint.
- `https://ui.mullmania.com/render.html`
  Hosted renderer for validated remote page contracts.
- `https://ui.mullmania.com/style.css`
  CSS-only alias for the current published theme.
- `https://ui.mullmania.com/active-theme.json`
  Public manifest for the currently published default.
- `https://ui.mullmania.com/active/style.css`
  Explicit path for the current published default.
- `https://ui.mullmania.com/active/typography.html`
  Visual reference for tokens, primitives, and composition guidance.
- `https://ui.mullmania.com/llms.txt`
  Short LLM-first entrypoint.

## Sitemap-First Rule

For any app, docs shell, builder, or tabbed surface, start by declaring structure in `sitemap.json`.

Preferred order:

1. `sitemap.json` + `preset`
2. `sitemap.json` + `component`
3. `sitemap.json` + `componentSource`
4. `htmlSource` only as an escape hatch

If the surface can be expressed as framework structure plus shared runtime primitives, it should not drop into raw HTML.

Sitemap layout can also describe the app shell header when the surface needs one:

```json
{
  "header": {
    "title": "MULLMANIA",
    "icon": "ti ti-palette",
    "controls": [
      { "type": "link", "label": "Handoff", "href": "/HANDOFF_UI_REFACTOR.md", "icon": "ti ti-notes" }
    ]
  }
}
```

Workspace sidebars default to the left. Set `sidebarPosition` at the sitemap root to flip every workspace tab, or set it on a tab for a local override:

```json
{
  "sidebarPosition": "right",
  "tabs": [
    { "id": "docs", "label": "Docs", "layout": "workspace" },
    { "id": "audit", "label": "Audit", "layout": "workspace", "sidebarPosition": "left" }
  ]
}
```

Top-level tab navigation is app-level only because the tab strip sits outside each tab workspace. Set `tabNavigation` at the sitemap root:

```json
{
  "tabNavigation": "bottom",
  "tabs": [
    { "id": "docs", "label": "Docs", "layout": "workspace" },
    { "id": "audit", "label": "Audit", "layout": "workspace" }
  ]
}
```

Supported values are `top`, `bottom`, and `pager`. `top` and `bottom` render a full strip; `pager` renders a compact bottom-centered control.

Example:

```json
{
  "tabs": [
    { "id": "docs", "name": "Docs", "preset": "docs.overview" },
    {
      "id": "themes",
      "name": "Themes",
      "items": [
        { "id": "editorial", "name": "Editorial", "preset": "themes.editorial" }
      ]
    }
  ]
}
```

For workspace tabs, `headerHtml` can mount fixed shell content above the inner workspace scroll region:

```json
{
  "tabs": [
    {
      "id": "sources",
      "label": "Sources",
      "layout": "workspace",
      "headerHtml": "<div id=\"sources-tab-header-host\"></div>"
    }
  ]
}
```

That header stays pinned while the workspace sidebar and content panes continue to own their own scrolling.

## Video-Capable Sitemap Convention

`ui.mullmania.com` surfaces can be made tourable without AI by adding a sitemap automation block:

```json
{
  "automation": {
    "version": 1,
    "tour": {
      "baseHref": "./index.html",
      "traversal": "ordered",
      "narrationFallback": "description",
      "durationMs": 3000,
      "viewport": { "width": 1440, "height": 900 }
    }
  }
}
```

Each tab or item may add `tour` metadata: `description`, `order`, `importance`, `durationMs`, `viewport`, `theme`, `mode`, `narration`, `anchors`, and `actions`.

The deterministic action vocabulary is:

```json
["visit", "focus", "activate", "scroll", "zoom", "pause", "snapshot", "callout"]
```

Recorders should consume `ui-tour-manifest.json`, not raw sitemap structure. Generate it with:

```bash
node scripts/generate-tour-manifest.mjs --sitemap sitemap.json --output ui-tour-manifest.json
```

Validate a site before claiming it is video-capable:

```bash
node scripts/validate-tour.mjs --sitemap sitemap.json --manifest ui-tour-manifest.json
```

Narration may fall back to `description` only when `automation.tour.narrationFallback` allows it. AI can help write descriptions or narration, but a passing tour must replay from the manifest without AI.

## Rich List Items and Sidebar Filters

Workspace `type: "list"` sections support a richer item schema for catalogs that need thumbnails, badges, or subtitles, and an optional `filters` block that mounts a search/chip/select rail above the sidebar items.

Item fields (all optional, all backward-compatible):

- `thumbnail` — image URL rendered in a 44×44 square at the left of the row
- `subtitle` — small line of text below the label; falls back to the first line of `description`
- `badges` — array of `{ "label": "stl", "tone": "neutral" }` rendered as small pills

When any of these is present, the framework adds `.sidebar-item--rich` and renders a two-line stack.

Section `filters` block:

```json
{
  "type": "list",
  "dataSource": "./data/models.json",
  "filters": {
    "search": { "placeholder": "Filter models", "fields": ["name", "description", "tags"] },
    "chips": {
      "field": "source",
      "options": [
        { "id": "all", "label": "All" },
        { "id": "mullformed", "label": "Mullformed" },
        { "id": "cozybox", "label": "CozyBox" }
      ]
    },
    "selects": [
      {
        "id": "format",
        "label": "Format",
        "field": "formats",
        "options": [
          { "id": "all", "label": "All formats" },
          { "id": "stl", "label": "STL" },
          { "id": "obj", "label": "OBJ" }
        ]
      }
    ]
  }
}
```

`search.fields` defaults to `["name", "title", "description"]`. Array properties (like `tags` or `formats`) are joined and substring-matched. The `chips.field` is matched directly; an `"all"` option means no filter. Each entry in `selects` filters by membership (array property) or equality (scalar property), and selecting the first option means no filter.

The framework also accepts `records` as a wrapper key in `dataSource` JSON (alongside `data`, `items`, `results`).

If the source data uses different field names from the canon (e.g. `title` instead of `name`, an array of strings instead of `badges`), add an `itemMap` on the list section to alias them — no need to rewrite the data:

```json
{
  "type": "list",
  "dataSource": "./data/models.json",
  "itemMap": {
    "name": "title",
    "description": "summary",
    "badges": "formats"
  }
}
```

The mapper only fills targets that are currently undefined on the item, so canonical fields always win. When the target is `badges` and the source is an array of strings, each string is wrapped in `{ label: ... }` automatically.

## Delegated Detail Mode

For workspace tabs where the detail pane is a long-lived custom surface (a three.js canvas, a chart, a paint tool) rather than per-item HTML, set `tab.detailHtmlSource` to mount the detail pane once and let app code drive updates via the `ui:item-selected` event.

```json
{
  "id": "library",
  "label": "Library",
  "layout": "workspace",
  "detailHtmlSource": "./panels/library-detail.html",
  "sections": [
    { "type": "list", "dataSource": "./data/models.json", "filters": { "search": {} } }
  ]
}
```

Listen for the event:

```js
document.addEventListener('ui:item-selected', (event) => {
  const { tabId, itemId, item } = event.detail;
  // app renders inside #<tabId>-detail however it wants
});
```

In delegated mode the framework still owns sidebar rendering, selection state, and URL history, but it does NOT wipe or repaint the detail pane on selection. Equivalently, set `listSection.delegateDetail: true` if the detail HTML is already in the document.

## Automatic Framework Tab

Every sitemap-backed shell gets a final `UI Framework` tab from the shared runtime.

The tab includes:

- an about panel explaining what the framework is doing on the current site
- a link to `https://ui.mullmania.com/about.html`
- live theme and light/dark controls for checking local CSS drift
- links back to the framework docs and tour manifest
- an embedded renderer proof showing JSON becoming a page

Do not duplicate this tab in a site sitemap. It is injected by `TabsEverywhere` after sitemap load so consumer sites inherit it automatically. If a host has a hard blocker, set `frameworkTools: false` in the shell config or sitemap; this is an escape hatch, not the default.

## How Consumers Should Build

The runtime solves shared UI primitives. It does not replace design judgment.

When using this library:

1. Start with composition, not components.
2. Give each section one job and one main takeaway.
3. Make the brand or product name the loudest text on branded pages.
4. Default to cardless layout. Use cards only when the card itself is the interaction.
5. Use no more than two typefaces and one accent color unless the product already has a strong system.
6. Use real imagery when imagery is part of the story. Decorative texture alone is not a visual anchor.
7. Use utility copy for app surfaces. Use product copy for branded landing pages.

## Branded Page Rules

For marketing pages, launch surfaces, docs homepages, and other branded first impressions:

1. Treat the first viewport like a poster, not a dashboard.
2. Use one dominant visual idea in the hero.
3. Keep the text column narrow enough to scan in one glance.
4. Put the order in this sequence: brand, headline, support copy, CTA.
5. Avoid hero cards, stat strips, logo clouds, badge soup, or floating dashboards by default.
6. Avoid boxed center-column heroes when the page wants a full-bleed first impression.

If the first screen works exactly the same after removing the main image or visual anchor, the hero is too weak.

## Product UI Rules

For app surfaces, builders, dashboards, inspectors, and admin flows:

1. Default to a real shell: header bar, top tabs, and a workspace layout when the surface has modes, navigation, or inspection.
2. Use strong typography and spacing before adding borders, shadows, or extra containers.
3. Use headings that orient the operator immediately.
4. Prefer labels like `Selected KPIs`, `Plan Status`, `Top Segments`, `Last Sync`, or `Canvas Properties`.
5. Put mode changes in tabs instead of burying them halfway down the page.
6. Put navigation, filters, source lists, or list/detail pivots in the sidebar instead of a long stacked column.
7. Avoid campaign-style hero copy inside operational workspaces unless explicitly requested.
8. If a panel can become plain layout without losing meaning, remove the card treatment.
9. Use one brand moment. The header should carry product identity; the sidebar should carry context; the content masthead should carry the current task or view.

## Typography Rules

Use typography to establish hierarchy, not decoration.

1. Use one UI sans family for controls, body text, forms, and tables.
2. Use one display family only for high-impact moments like page titles, branded hero headlines, or editorial accents.
3. Use mono for tabs, labels, token names, diagnostics, and tiny metadata.
4. Keep paragraph copy short and easy to scan.
5. Use spacing, scale, and contrast before adding extra UI chrome.
6. On tool surfaces, assume a visible header, tabs, and sidebar labels are part of the hierarchy contract, not optional decoration.
7. Use `https://ui.mullmania.com/active/typography.html` as the hard reference before improvising hierarchy.
8. Do not repeat the full product wordmark in the header, sidebar, and content masthead. Assign each region a different job.

Recommended default split:

- Sans for UI: buttons, forms, navigation, tables, body copy
- Display for emphasis: page title, hero headline, brand accent
- Mono for metadata: labels, tabs, variable names, diagnostics

That role split is available directly in the shared system:

- `.type-brand`
- `.type-display`
- `.type-ui-title`
- `.type-body`
- `.type-label`

Heavy-default rule:

- if the site behaves like an app, it should look like an app shell
- if the hierarchy still reads like a generic single page after applying the theme, the structure is still too weak

## Motion Rules

Motion should create presence and hierarchy, not noise.

Ship at most 2-3 meaningful motions:

1. one entrance sequence for the first viewport
2. one scroll-linked or sticky depth effect
3. one hover or reveal motion that sharpens affordance

Do not add ornamental motion that does not improve orientation or atmosphere.

Hard ban:

- do not translate, lift, bounce, or nudge buttons or icons on hover
- hover affordance should come from color, border, underline, or shadow changes only
- if a control moves under the pointer, that is a bug, not polish

## JS-First App Model

Start from `UI.mount(...)` and shared helpers. Use them to express clear structure, not to dump a pile of generic cards.

```html
<div id="app"></div>
<script src="https://ui.mullmania.com/ui.js"></script>
<script>
UI.ready().then(() => {
  UI.mount('#app', {
    title: 'Agent Workspace',
    subtitle: 'Operational UI with clear hierarchy and shared primitives.',
    actions: [
      { label: 'Refresh', variant: 'secondary', icon: 'ti ti-refresh' }
    ],
    sections: [
      UI.section({
        title: 'Overview',
        description: 'Use structure and spacing before adding more containers.',
        children: [
          UI.grid({
            columns: 2,
            children: [
              UI.stat({
                label: 'Status',
                value: 'Live',
                icon: 'ti ti-circle-check',
                badge: { label: 'Healthy', tone: 'success' }
              }),
              UI.alert({
                tone: 'info',
                title: 'Working Rule',
                message: 'Do not invent a custom card mosaic when layout and typography are enough.'
              })
            ]
          })
        ]
      }),
      UI.section({
        title: 'Projects',
        description: 'Section headings should tell the user what this area is for.',
        children: [
          UI.table({
            columns: [
              'name',
              {
                key: 'status',
                label: 'Status',
                render: (row) => UI.status({ label: row.status, tone: row.tone })
              }
            ],
            rows: [
              { name: 'Launchpad', status: 'Live', tone: 'success' },
              { name: 'Docs', status: 'Draft', tone: 'warning' }
            ]
          })
        ]
      })
    ]
  });
  });
</script>
```

## Pager Primitive

Use the shared pager contract instead of inventing one per app.

- CSS classes: `.pager`, `.pager__summary`, `.pager__controls`, `.pager__button`, `.pager__status`, `.pager__size`, `.pager__size-label`, `.pager__select`
- JS helper: `UI.pager(...)`
- Shared table helper: `TablesEverywhere` now supports `pagination.pageSize` and `pagination.pageSizeOptions`

Example:

```js
UI.pager({
  summary: '1-50 of 1,153 rows',
  page: 1,
  pageCount: 24,
  onPrev: () => console.log('prev'),
  onNext: () => console.log('next'),
  after: {
    tag: 'label',
    className: 'pager__size',
    children: [
      { tag: 'span', className: 'pager__size-label', text: 'Rows' },
      { tag: 'select', className: 'pager__select', children: [
        { tag: 'option', attrs: { value: '50' }, text: '50' },
        { tag: 'option', attrs: { value: '100' }, text: '100' }
      ] }
    ]
  }
});
```

## Collapsible Section Primitive

Use the shared collapsible primitive for any sidebar/panel surface that has expandable groups (Widgets, Data, Settings, filter rails, etc). State is persisted to `localStorage` per-namespace.

- CSS classes: `.collapsible-section`, `.collapsible-header`, `.collapsible-toggle`, `.collapsible-icon`, `.collapsible-title`, `.collapsible-badge`, `.collapsible-content`
- JS helper: `UI.collapsible.init(container, namespace)`
- Also exposed: `UI.collapsible.toggle(section)`, `UI.collapsible.expandAll(container, namespace)`, `UI.collapsible.collapseAll(container, namespace)`, `UI.collapsible.clearStates()`

Styles ship with the active theme stylesheet — no separate `<link>` required if you load `ui.js` plus a theme CSS the normal way.

Minimal HTML:

```html
<div id="my-sidebar">
  <div class="collapsible-section" data-search-terms="charts analytics">
    <div class="collapsible-header">
      <span class="collapsible-toggle">&gt;</span>
      <i class="collapsible-icon ti ti-chart-bar"></i>
      <span class="collapsible-title">Analytics</span>
      <span class="collapsible-badge">7</span>
    </div>
    <div class="collapsible-content">
      <!-- content rendered when expanded -->
    </div>
  </div>
</div>

<script>
UI.ready().then(() => {
  UI.collapsible.init(document.getElementById('my-sidebar'), 'widgets');
});
</script>
```

Each call to `init` accepts a `namespace` string (e.g. `'widgets'`, `'data'`, `'settings'`). Expansion state is keyed by `namespace` plus a section id derived from `data-section-id` (or auto-generated). Use distinct namespaces per surface so collapse state doesn't leak across sidebars.

## Choice Card Primitive

Use the shared choice-card primitive for any "pick one from a small grid of options" surface (grid-size pickers, theme variants, layout templates, snippet libraries). CSS-only — selection is a `.selected` class your click handler toggles.

- CSS classes: `.choice-card`, `.choice-card.selected`, `.choice-card-thumb`, `.choice-card-label`, `.choice-card-meta`
- No JS helper — wire your own click handler.

Styles ship with the active theme stylesheet — no separate `<link>` required if you load `ui.js` plus a theme CSS the normal way.

Minimal HTML:

```html
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
  <button class="choice-card selected" data-value="6x3">
    <div class="choice-card-thumb">
      <svg width="90" height="50" viewBox="0 0 90 50"><!-- preview --></svg>
    </div>
    <div class="choice-card-label">Standard</div>
    <div class="choice-card-meta">6 x 3</div>
  </button>
  <button class="choice-card" data-value="custom">
    <div class="choice-card-thumb"><i class="ti ti-pencil"></i></div>
    <div class="choice-card-label">Custom</div>
    <div class="choice-card-meta">Manual</div>
  </button>
</div>

<script>
document.querySelectorAll('.choice-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.choice-card').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
  });
});
</script>
```

Sizes, padding, and the selected-state border all come from canon tokens — the card adopts the active theme automatically.

## Library List Primitive

Use the shared library-list primitive for left-rail catalogs that group items by collapsible category (widget libraries, theme pickers, snippet browsers, asset panels). CSS-only — wire your own toggle/drag/click handlers.

- Container: `.library-list`
- Category group: `.library-list-category`
- Category header (clickable): `.library-list-category-header`, `.library-list-category-toggle`, `.library-list-category-icon`, `.library-list-category-name`, `.library-list-category-count`
- Items container: `.library-list-category-items`
- Item card: `.library-list-item`, `.library-list-item-title`, `.library-list-item-thumb`, `.library-list-item-badge`

Styles ship with the active theme stylesheet — no separate `<link>` required if you load `ui.js` plus a theme CSS the normal way.

When to pick this vs. `collapsible-section`:

- Use `library-list` when each section's body is a uniform list of pickable thumbnails — it carries the item-card styling for you.
- Use `collapsible-section` for arbitrary panel content (forms, mixed widgets, free-form sections).

Minimal HTML:

```html
<div class="library-list" id="my-library">
  <div class="library-list-category" data-category="charts">
    <div class="library-list-category-header">
      <i class="library-list-category-toggle ti ti-chevron-right"></i>
      <i class="library-list-category-icon ti ti-chart-bar"></i>
      <span class="library-list-category-name">Charts</span>
      <span class="library-list-category-count">7</span>
    </div>
    <div class="library-list-category-items">
      <div class="library-list-item" data-search-terms="bar chart">
        <div class="library-list-item-title">Bar Chart</div>
        <div class="library-list-item-thumb">
          <span class="library-list-item-badge">2x2</span>
          <!-- preview render target -->
        </div>
      </div>
    </div>
  </div>
</div>
```

The toggle behavior is yours to implement (or compose with `UI.collapsible.init` if you prefer the namespaced-localStorage persistence treatment).

## Form Field Primitive

Use the shared form-field primitive for any "stacked label + input row" pattern — property editors, settings panels, modal forms, builder/admin config surfaces. CSS-only — wire your own input/change handlers and toggle `.active` on select-button variants.

- Container: `.property-field`
- Eyebrow label: `.property-label`
- Input wrapper: `.property-input` (text/number inputs inside pick up canon defaults)
- Helper text: `.property-description`
- Checkbox row: `.property-checkbox-wrapper`, `.custom-checkbox` (`.checked`), `.property-checkbox-label`
- Select-button row: `.property-select-wrapper`, `.property-select-btn` (`.active`)
- Color picker row: `.property-color-wrapper` + `input[type="color"]` + `.property-color-text`
- Stylemode toggle row: `.property-stylemode-wrapper`, `.property-stylemode-btn` (`.active`)
- Alignment 3-col grid: `.property-alignment-wrapper`, `.property-alignment-btn` (`.active`)

Styles ship with the active theme stylesheet — no separate `<link>` required if you load `ui.js` plus a theme CSS the normal way.

Minimal HTML:

```html
<div class="property-field">
  <label class="property-label">Title</label>
  <div class="property-input">
    <input type="text" value="My Widget">
  </div>
  <div class="property-description">Shown in the widget header.</div>
</div>

<div class="property-field">
  <label class="property-label">Size</label>
  <div class="property-select-wrapper">
    <button class="property-select-btn active">Small</button>
    <button class="property-select-btn">Medium</button>
    <button class="property-select-btn">Large</button>
  </div>
</div>

<div class="property-field">
  <label class="property-label">Background</label>
  <div class="property-color-wrapper">
    <input type="color" value="#0d6efd">
    <input class="property-color-text" type="text" value="#0d6efd">
  </div>
</div>
```

Padding, borders, and active-state colors all flow from canon tokens — the field adopts the active theme automatically.

## Hosted Page Contract

If you want `ui.mullmania.com` to fetch and render a page for you, hand it a JSON contract instead of HTML.

Remote URL form:

```text
https://ui.mullmania.com/render.html?source=https://example.com/page.json
```

Root host form:

```text
https://ui.mullmania.com/?source=https://example.com/page.json
```

Inline contract form:

```text
https://ui.mullmania.com/render.html?spec64=<base64url-json>
```

Minimal contract:

```json
{
  "$schema": "https://ui.mullmania.com/page-contract.schema.json",
  "version": 1,
  "title": "Example Page",
  "theme": "active",
  "page": {
    "component": "app",
    "title": "Example Page",
    "subtitle": "Rendered from a validated contract.",
    "children": [
      {
        "component": "section",
        "title": "Overview",
        "children": [
          {
            "component": "grid",
            "columns": 2,
            "children": [
              { "component": "stat", "label": "Status", "value": "Live" },
              { "component": "alert", "tone": "info", "title": "Ready", "message": "The host rendered this page." }
            ]
          }
        ]
      }
    ]
  }
}
```

Rules for remote contracts:

- Use `page` or `preset`, not both.
- Remote contracts are validated before rendering.
- Raw `html` blocks and event handlers are rejected.
- Remote contracts may use framework components like `text`, `button`, `card`, `table`, `chart`, and `app`.
- Use declarative actions like `copy`, `open`, `modal`, and `toast`.
- If you load a remote JSON file, that host must allow cross-origin fetches from `https://ui.mullmania.com/` or `*`.

Local example contract:

```text
https://ui.mullmania.com/render.html?source=https://ui.mullmania.com/examples/hello-framework.page.json
```

## Primary Helper API

- `sitemap.json` should own tab structure, navigation structure, and routing shape whenever possible.
- `UI.mount(target, definition)` renders a page-level app definition into a selector or DOM node.
- `UI.text(options)` renders semantic text roles like brand, display, UI title, body, and label without custom selectors.
- `UI.section(options)` creates a titled content block with shared spacing and actions.
- `UI.stat(options)` renders a compact metric card.
- `UI.grid(options)` lays out cards and sections with shared grid classes.
- `UI.card(options)` renders a standard card.
- `UI.table(options)` renders a styled data table from columns and rows.
- `UI.alert(options)` and `UI.status(options)` cover common messaging states.
- `UI.button(options)` creates theme-aware action buttons.
- `UI.render(target, spec)` and `UI.createNode(spec)` are lower-level escape hatches when the sitemap + shared helpers still cannot express the needed pattern.

## Working Rules For LLMs

1. Default to `https://ui.mullmania.com/ui.js`.
2. Use the right shell primitive. Document pages use `.header` + `#content-container` + `.page-container`. Apps use tabs/sidebar shells.
3. Prefer `sitemap.json` declarations backed by `preset`, `component`, or `componentSource` over `htmlSource`.
4. Prefer `UI.mount(...)` and shared helpers over hand-written HTML strings.
5. Prefer `UI.text({ role: ... })` and shared type-role classes over one-off heading or label selectors.
6. Prefer semantic tokens like `--color-primary`, `--bg-primary`, and `--text-primary`.
7. For themes, put concrete colors in `colors.css`; make `layout.css` consume tokens or import an existing token-driven recipe.
8. Do not generate extra local CSS unless the library genuinely lacks the required pattern.
9. Do not default to card grids for first impressions.
10. On branded pages, prioritize brand, hierarchy, imagery, and restraint.
11. On product UI, prioritize orientation, status, and action.
12. If a needed pattern is missing, upstream it into the library instead of rebuilding it ad hoc in consumer code.

## Reject These Failures

- generic SaaS card grid as the first impression
- weak brand presence in the first screen
- dashboard chrome used as decoration
- too many accent colors
- typography that does not distinguish headlines, UI, and metadata
- sections that repeat the same idea
- motion that adds noise without improving hierarchy

## Source Of Truth

**Canonical host:** `https://ui.mullmania.com/`

**Visual reference:** `https://ui.mullmania.com/active/typography.html`

**LLM entrypoint:** `https://ui.mullmania.com/llms.txt`
