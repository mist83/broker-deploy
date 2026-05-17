---
name: ui.mullmania.com contract renderer (data-driven pages)
description: How to build a page whose layout AND content come from a JSON contract — the framework's renderFromLocation API, supported components, and action types.
type: reference
---

The `ui.[base]` framework supports fully data-driven pages: the HTML shell is ~40 lines, and a JSON "page contract" describes both content and layout. The framework renders it with no page-local markup.

**Bootstrap shell**:
```html
<!DOCTYPE html>
<html data-ui-theme="active" data-ui-mode="light">
<head>
  <link rel="stylesheet" href="https://ui.mullmania.com/active/style.css">
  <script src="https://ui.mullmania.com/ui.js" data-ui-theme="active" data-ui-mode="light"></script>
</head>
<body>
  <div id="render-root"></div>
  <script>
    await UI.ready();  // may be promise or accept callback via UI.onReady
    await UI.contract.renderFromLocation(document.getElementById('render-root'), { document: contractJSON });
  </script>
</body>
</html>
```

**Public API** (`UI.contract`):
- `renderFromLocation(target, options?)` — primary render entry. Accepts `{ document, location, theme, mode }`. Pass a pre-loaded contract as `document` to bypass URL-param loading.
- `fetch(source, baseHref?)` — load a contract from a URL.
- `normalize(raw)`, `validate(raw)` — available if you want to preprocess.
- `renderError(target, title, messages)` — render a framework-styled error into the root.
- `example()` — returns a sample contract for reference.
- `hasRenderRequest(search?)`, `loadFromLocation(loc?)`, `parseInline(raw, opts?)` — URL/inline helpers.

**Component dispatcher values** (valid for `"component": "..."`):
`icon`, `text`, `button`, `status`, `alert`, `stack`, `grid`, `card`, `section`, `stat`, `pager`, `table`, `chart`, `preview`, `previewscreen`, `preview-screen`, `page`, `app`, `node`, `element`, `fragment`.

**Action types** (for buttons): `copy`, `open`, `modal`, `toast`. No POST — if you need mutation, extend the server to accept GET+redirect or move the action out of band.

**Tone values** (for `badge.tone`, `alert.tone`): `success`, `warning`, `danger`, `info`, `neutral`, `primary`.

**Schema references**: `/llm-docs.md`, `/contracts/fixtures/operations-dashboard.json` (concrete example), `/render.html` (bootstrap demo), `/js/contract.js` (implementation).

**Reference implementation**: `/Users/mist83/Code/gitter/dashboard.html` (45-line shell) + `/Users/mist83/Code/gitter/gitterapi.py::build_contract` (Python that derives the contract from domain state). Poll `/api/contract` every 5s and re-render — framework handles incremental DOM cleanly.

**How to apply**: Any Mullmania/Mikesendpoint tool surface where the content is structured (stats, tables, alerts, grids of cards). Write the server-side contract builder; keep the client shell trivial. Layout changes become data changes, not HTML edits.
