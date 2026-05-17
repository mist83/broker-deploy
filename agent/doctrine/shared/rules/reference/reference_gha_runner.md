---
name: Self-hosted GitHub Actions runner
description: Local macOS runner on this Mac, registered to mist83/gha-runner, docker via colima. Runbook/follow-ups in repo NOTES.md.
type: reference
---

Dedicated repo `mist83/gha-runner` is the home for the local self-hosted GitHub Actions runner. Full context — install layout, operational runbook, known caveats, DAG/notification follow-ups, and the contrast-dye architectural verdict — lives in that repo's `NOTES.md`. Start there before building anything related to local CI, runners, or tv-rig automation.

Key facts:
- Runner at `~/actions-runner` as a LaunchAgent (auto-start, survives reboot).
- Labels: `self-hosted, macOS, ARM64, devbox, docker`.
- Docker via colima (`brew services start colima`).
- mist83 is a USER account, not an org — no org-level runner possible; additional repos get their own runner dir on the same machine.
- Smoke workflow `mist83/gha-runner/.github/workflows/smoke.yml` is the template — 3-job DAG (host → docker → summary). Extend this shape rather than starting from scratch.
