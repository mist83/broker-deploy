---
name: signal-argh (real-time messaging)
description: Canonical SignalR hub repo + where to read operator docs + where the canon entry lives
type: reference
---

Real-time messaging for mist83 projects is `mist83/signal-argh`. A single-tenant
ASP.NET Core 8 SignalR hub, deployed to ECS Fargate, reachable at
`signalargh.[base-url]` (mikesendpoint.com live).

**`mist83/signal-argh-lambda` is DEFUNCT.** Empty scaffold, never had code, tombstoned 2026-03-31. Do not resurrect.

## Where to read

- Operator + agent guide: `mist83/signal-argh/AGENTS.md` — run locally in 60s, full hub method table, REST endpoints, deploy, gotchas.
- Cross-repo integration recipe: the **Add real-time (signalargh)** kata on the katai board (`https://katai.mullmania.com`, kata `add-realtime-signalargh`) — how to pull it into another project, with JS/C# client examples. (Migrated off the retired development-canon site.)

## Must-know gotchas (full list in AGENTS.md)

1. **Single-instance only.** No backplane. Don't horizontally scale.
2. **`/admin/*` has no auth.** `?userId=system` grants admin hub methods too.
3. **Use `@microsoft/signalr`, not raw WebSocket.** SignalR has a handshake protocol raw WS doesn't speak.
4. **CORS is AllowAnyOrigin + AllowCredentials.** Intentional for LLM turn-key; remember it if adding auth.

## Verification

End-to-end test suite at `tests/harness.mjs`. `cd tests && node harness.mjs` against a local `dotnet run` — 30/30 cases covering channels, groups, chat, announcements, private, admin, impersonation. Run it before trusting any change.
