---
name: tv-telemetry (live console + error stream from any browser app)
description: Canonical drop-in shim + hosted dashboard for browser-app telemetry over signal-argh. Closes the deploy → test → log → fix loop on TV / mobile / VR / kiosk surfaces where you can't open devtools.
type: reference
originSessionId: disem-bowling-2026-04-30
---

# tv-telemetry

For any browser app where opening devtools on the target device is hard or
impossible (TV remotes, smart-display kiosks, the operator's friend's phone,
a Vision Pro, an embedded panel), use the **tv-tail** pipeline. It's the
operator's "logging 101" baseline — every browser app the operator ships
should have it wired in.

## Two pieces

- **Client shim**: `https://tv-tail.mullmania.com/log-tap.js` (source:
  `mist83/tv-tail`). Drop one `<script src=...>` into `<head>` — it patches
  `console.{log,info,warn,error,debug}`, captures `window.error` +
  `unhandledrejection`, sends a `hello` announce on connect, batches log
  events every ~1.2s, sends a 15s heartbeat, and best-effort `bye` on
  pagehide. Lazy-loads `@microsoft/signalr` if it isn't already on the page.
- **Sinks** (read-side):
  - Hosted dashboard: <https://tv-tail.mullmania.com> — per-app sidebar with
    live/stale state, per-level filters, search, pause / clear / copy.
  - Agent CLI: `~/.claude/tools/tv-tail` (Node + `@microsoft/signalr`).
    Wrapper at `~/.claude/scripts/tv-tail` for `Bash`-tool invocation.

## The loop

1. Agent edits + deploys an app.
2. Operator opens it on the target device.
3. Agent runs `tv-tail` (or operator opens the dashboard).
4. Agent reads the stream live, sees the real error, fixes, redeploys.
5. Repeat until the device behaves.

No log-collection AWS resources to provision — `signal-argh` is already
deployed and unauthenticated for channel chat, so this is zero-infra.

## Wiring a new app (canonical recipe)

```html
<head>
  <meta name="repo-name" content="my-app">
  <!-- tv-tail must load BEFORE module scripts so it captures module-load failures -->
  <script src="https://tv-tail.mullmania.com/log-tap.js"></script>
  <!-- ... rest of head ... -->
</head>
```

That's it. The shim derives the hub host from `location.hostname`, so the
same line works on `mullmania.com` and `mikesendpoint.com` without code
changes.

Optional overrides via globals defined **before** the script tag:

```html
<script>
  window.LOG_TAP_APP_ID  = "my-app";                          // default: <meta name=repo-name>
  window.LOG_TAP_HUB     = "https://signalargh.mikesendpoint.com";
  window.LOG_TAP_CHANNEL = "tv-logs";                          // shared by default
  window.LOG_TAP_VERSION = "2026.04.30-1";                     // surfaced on dashboard
  window.LOG_TAP_DISABLE = true;                               // no-op
</script>
```

Recommended companion: a tiny boot-status banner that flips `data-state="ok"`
once the app finishes booting. Lets the operator tell from across the room
whether the page is live, on top of the log stream. Reference:
`mist83/disem-bowling/docs/index.html` + `site.css#boot-status`.

## Protocol

Single shared channel: **`tv-logs`** on `signalargh.<base-host>`. Three
`customMessage` topics, JSON in the message string:

| topic   | payload                                                          | meaning |
|---------|------------------------------------------------------------------|---------|
| `hello` | `{appId, sessionId, ua, screen, version, url}`                    | App attached |
| `log`   | `{appId, sessionId, batch:[{ts,level,msg,url}], dropped}`         | Batch of events |
| `bye`   | `{appId, sessionId}`                                              | Pagehide best-effort |

`appId` is the canonical identifier — comes from `<meta name="repo-name">`
unless overridden. The dashboard groups, filters, and labels by it.

## Why `customMessage` not `/admin/*`

`/admin/*` on signal-argh is operator-key-gated. Embedding that key in
browser code would leak it to every device. log-tap connects as a regular
hub user and uses `SendCustomMessage`; channel membership is the auth
boundary. (Channel chat would also work; custom topics let us multiplex
hello/log/bye on one channel without parsing prefix conventions.)

## Limits

- Subscriber must be online when events fire — no historical replay. Open
  the dashboard / start `tv-tail` *before* triggering the bug.
- One shared channel for all apps. Per-app private channels are possible
  via `LOG_TAP_CHANNEL` override but aren't the default.
- The `signal-argh` hub is single-instance. Very high log volume can
  saturate it; the shim caps batches at 400 entries and drops oldest first.
- Dropped count is reported in each `log` payload as `dropped: N` so you
  know when you're losing data on the client side.

## Don't roll your own

If you find yourself writing `console` patches or `window.error` handlers
for a new app, stop and add the `<script src=...>` tag instead. The shim
is the canonical implementation — fixes propagate to every app for free
when `mist83/tv-tail` is updated.
