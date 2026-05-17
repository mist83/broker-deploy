---
name: MEC/MMC adoption initiative
description: Mike's decision to pin MovieLabs MDDF as the ingest language for v3/VIZIO-like aggregator work, captured at mec.mullmania.com
type: project
---

Decision reached 2026-04-17 after a long ChatGPT thread: pin MovieLabs MDDF (MEC + MMC + Avails + EIDR) as the ingest *language*, publish `Mullmania MDDF Profile 1.0` as the *contract*, use the official validator as the gate, treat validated supplier packages as the authoritative store. v3 apple-trie internal item shape becomes one of N compiled outputs, not the center. No LCD schema. No LLM in the translation path. No raw partner XML as database.

**Why:** the existing v3 internal schema (`{id, type, title, releaseYear, description, posterImage, widescreenImage, images[], raw[]}`) is sediment, not moat. ~7 fields where MEC has ~80, nothing for availability, localization, tracks, or edits. Mike wants to "run away from the junk" and standardize on an industry-adopted spec so partners can deliver what they're already delivering to Amazon/Roku/WBD/Google.

**How to apply:**
- Decision doc lives at `/Users/mist83/Code/mec/` (not yet deployed to `mec.mullmania.com`).
- Pickup notes in `/Users/mist83/Code/mec/NEXT.md` — includes deploy status, the open Apple-feed-creds security finding on the apple-trie lambda, and the next concrete artifact to author (Mullmania MDDF Profile 1.0 under development-canon).
- When Mike references MEC/MMC/MDDF/Avails, or talks about the v3 ingestion playbook, this is the current state — don't re-litigate the decision, build on it.
- The v3 swagger is at `3y5fdemhmbauwcyo7jc2eib5te0zsuer.lambda-url.us-west-2.on.aws/swagger/v1/swagger.json` — `Ingestion V3 Playbook`, DataSource-shaped. Real sources: apple, peacock, starz, acorntv, amcplus, plus hundreds of synthetic `aaa_*` streamers for testing.
