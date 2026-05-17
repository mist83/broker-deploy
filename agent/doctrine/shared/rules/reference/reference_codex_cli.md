---
name: Codex CLI (OpenAI) invocation
description: Where OpenAI's Codex CLI binary lives on this machine and how to invoke it non-interactively
type: reference
---

OpenAI Codex CLI binary lives at:
`/Applications/Codex.app/Contents/Resources/codex`

Not in PATH — must invoke by absolute path unless aliased.

**Non-interactive (equivalent to `claude --print`):**
```
codex exec --skip-git-repo-check "<prompt>"
```

`--skip-git-repo-check` is required when cwd is not a git repo; `/Users/mist83/Code` is a non-git parent directory, so always include this flag when running from there.

**Config** (`~/.codex/config.toml`):
- model: `gpt-5.4`
- reasoning effort: `xhigh`
- approval_policy: `never` (fully autonomous, no prompts)
- `/Users/mist83/Code` already listed as trusted project
- plugin: `github@openai-curated` enabled

**Output format**: Human-readable text with a metadata header (session id, workdir, model, sandbox, reasoning effort), then `user`/`codex` blocks, then `tokens used`. No structured JSON option I've seen yet — check `codex exec --help` if JSON is needed.

**Subcommands worth knowing**:
- `exec` (alias `e`) — non-interactive run
- `review` — non-interactive code review
- `resume` / `fork` — resume or fork a previous session
- `mcp` / `mcp-server` — Codex as MCP client or server
- `sandbox` — run commands inside Codex sandbox
- `apply` (alias `a`) — apply latest Codex diff as git apply

**Verified hello-world**: `codex exec --skip-git-repo-check "reply PONG"` → PONG in ~5s, 18k tokens.
