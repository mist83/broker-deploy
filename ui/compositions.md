# Canonical Compositions

> The companion to `llm-docs.md`. That doc tells you about the primitives;
> this one tells you which combinations are blessed for which surface.
>
> **Directive:** when you build a new Mullmania surface, pick a composition
> from this list. Don't invent a fresh shell. If your shape doesn't match
> anything here and you find yourself reaching for it again on a second app,
> add a new entry — don't ship another one-off.

---

## 1. Document

**When:** landing page, README-style site, frontdoor, single-lane authored
content.

**Shape:** `header` + `#content-container` + `.page-container` + `UI.mount`.

```html
<body>
  <header class="header">
    <h1><i class="ti ti-rocket"></i><span>My Tool</span></h1>
  </header>
  <div id="content-container">
    <main class="page-container">
      <div id="app"></div>
    </main>
  </div>
  <script src="https://ui.mullmania.com/ui.js"></script>
  <script>
    UI.ready().then(() => UI.mount('#app', {
      title: 'Welcome',
      sections: [UI.section({ title: 'Overview', children: ['…'] })],
    }));
  </script>
</body>
```

**Anti-pattern:** wrapping in `.container` (that's the app shell — see #2).

---

## 2. Workspace / app shell

**When:** tool with 2+ modes, navigation, source switching, filters, or
list/detail flow. The default for "looks like an app, not a doc."

**Shape:** `body.builder-shell` + `#header-container` + `#tabs-container` +
`#content-container` + `TabsEverywhere` (loaded with the runtime) + a
sitemap/inline tab definition.

```html
<body class="builder-shell">
  <div id="header-container" class="header"></div>
  <div id="tabs-container" class="tabs"></div>
  <div id="content-container"></div>
  <script src="https://ui.mullmania.com/ui.js"></script>
  <script type="module">
    await UI.ready();
    new TabsEverywhere({
      tabsContainerId: 'tabs-container',
      contentContainerId: 'content-container',
      sitemap: { /* per-tab definitions, see #3 + #4 */ },
    }).init();
  </script>
</body>
```

Each tab takes `layout: "workspace"` when it has its own list/detail
inspection inside.

---

## 3. Live data dashboard

**When:** ops cockpit / monitoring board / log stream / activity feed —
data updates frequently from polling or pushed events; users scan a list
on the side and inspect details on the right.

**Shape:** Workspace shell (#2) + a tab with `layout: "workspace"` and a
sidebar list on the left + content pane that re-mounts on data refresh.

- **Polling reference:** `mist83/gitter/dashboard.js` polls `/api/contract`
  every 5 s and re-mounts via `UI.mount(contentContainer, {component:"app", sections:[…]})`.
- **Push reference:** `mist83/tv-tail` subscribes to `signalargh.<base>/hub`
  on the `tv-logs` channel and re-mounts on each `customMessage` batch.

The sidebar comes from the workspace's per-tab `sections: [{type: "list", inlineData: [...]}]`. The content pane is whatever `UI.section` /
`UI.stack` / `UI.table` composition fits the row shape.

---

## 4. Master / detail explorer

**When:** browse a catalog and inspect one item at a time. Same shape as
#3 but cold (data loaded once, not streaming).

**Reference:** `ui.mullmania.com` itself — `sitemap.json` declares each tab
with a list-typed section pointing at preset detail panes.

---

## 5. Single-screen kiosk / TV / canvas surface

**When:** the surface is one full-bleed canvas (Three.js, WebGL, video
wall, large-print TV HUD). Framework chrome would compete with the
content.

**Shape:** Full-viewport canvas + plain HTML overlays for the HUD. Apply
the active theme via `<body data-ui-theme="…">` so palette tokens flow
into the overlays. Do NOT use `body.builder-shell` here.

**Reference:** `mist83/disem-bowling` — Three.js + cannon-es scene fills
the viewport; HUD/overlays use the `ghoul` theme variables; `tv-tail`
log-tap and the boot-status banner sit on top.

---

## 6. Telemetry-attached app (cross-cutting)

Every app on every shape SHOULD also wire `tv-tail`'s drop-in shim so the
operator can see logs / errors live without devtools. One `<script>` tag
in `<head>` before module scripts:

```html
<script src="https://tv-tail.mullmania.com/log-tap.js"></script>
```

See `reference_tv_telemetry` in agent.mullmania.com doctrine.

---

## How to add a new composition

1. Spot the shape repeating across **two or more** apps.
2. Pick the smallest example as the reference repo.
3. Open a PR adding a new section here AND register it in
   `feedback_ui_compose_dont_invent` (the canon rule that points at this
   doc).
4. Update the reference app to match exactly the form you documented.
5. Heimdall the addition.

A composition is canon when it has a name, a "when" condition, a shape,
and a reference repo. Anything less is "we'll see if it sticks."
