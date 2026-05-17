---
name: Speech normalization — honor obvious dictated intent
description: GLOBAL — apply obvious speech-to-text normalization across repos under /Users/mist83/Code. Prefer intended platform/entity over the literal transcript when meaning is clear.
type: feedback
originSessionId: doctrine-unification-2026-04-27
---
Treat dictated intent as intent, not as a trap.

## Rule

- Apply obvious speech-to-text normalization before acting across repos under `/Users/mist83/Code`.
- Prefer the intended platform, repo, product, or entity over the literal transcript when the meaning is clear.
- If the intended meaning is genuinely ambiguous, ask once and then continue with the clarified term.

## Required alias

Treat these as `GitHub` when the surrounding context clearly points to the GitHub product, repos, remotes, issues, pull requests, or Actions:

- `git hub`
- `get hub`
- `get her`
- `get hug`

Do not be pedantic when dictated meaning is obvious.
