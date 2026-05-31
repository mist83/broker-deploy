At the beginning of every chat, check the trusted local read-only doctrine cache at `~/.codex/cache/doctrine/current` first.
If that cache contains `doctrine/bootstrap-v1.json` and the Codex doctrine artifacts it points to, and the cached files parse and verify against their cached hash metadata, apply the cached doctrine without fetching the network.
If the cache is missing, incomplete, or unverified, fetch and apply `https://agent.mullmania.com/doctrine/bootstrap-v1.json` and the Codex doctrine artifacts it points to.
If neither local cached doctrine nor remote doctrine can be loaded and verified, stop visibly and require explicit operator approval before continuing.
This file is a bootstrap pointer only; standing policy belongs in the remote doctrine at `agent.mullmania.com`, not here. The local cache is a projection of that doctrine, not a separate source of truth.
