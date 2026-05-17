#!/usr/bin/env bash
# doctrine-write-fence — block Claude/Codex Edit and Write tool calls that would
# author standing policy into local doctrine surfaces. Push the change to
# agent.mullmania.com instead.
#
# This hook fires on PreToolUse for Edit, Write, and NotebookEdit. It reads the
# Claude Code hook event JSON from stdin, extracts the target file path, and
# refuses if that path is a doctrine projection.
#
# Exit codes:
#   0  allow (path not in fenced area, or no path resolvable)
#   2  block — Claude Code treats stderr from a non-zero exit as a denial reason
#
# This hook is the canonical safeguard against local-source-of-truth drift.

set -euo pipefail

input=$(cat)

# Best-effort extraction; tool input shape can vary.
path=$(printf '%s' "$input" | jq -r '
  .tool_input.file_path
  // .tool_input.path
  // .tool_input.notebook_path
  // empty
' 2>/dev/null || true)

if [ -z "$path" ]; then
  exit 0
fi

# Normalize ~ if present
case "$path" in
  '~/'*) path="$HOME/${path#'~/'}" ;;
esac

deny() {
  local reason="$1"
  cat >&2 <<EOF
BLOCKED by doctrine-write-fence: $path

$reason

Authoritative source: https://agent.mullmania.com/doctrine/
- Skills, commands, hooks, rules: edit the file under doctrine/shared/ in mist83/agent.
- Claude flavor shims (CLAUDE.md, settings.json, .mcp.json, MEMORY.md): edit under doctrine/claude-pack/ in mist83/agent.
- After editing, run \`npm run build && bash scripts/deploy.sh apply\` from ~/Code/agent, then say AGENT_SYNC to re-project locally.

If the change is not durable doctrine, do it elsewhere — not under ~/.claude/, ~/.codex/, or AGENTS.md / CLAUDE.md.
EOF
  exit 2
}

case "$path" in
  # Allow edits inside the doctrine source tree itself — that IS where doctrine is authored.
  # Without this guard, the catch-all CLAUDE.md / AGENTS.md patterns below greedily match
  # paths like .../agent/doctrine/claude-pack/instructions/global/CLAUDE.md, which is the
  # source of truth the deny message itself tells you to edit.
  "$HOME/Code/agent/doctrine/"*) exit 0 ;;
esac

case "$path" in
  "$HOME/.claude/CLAUDE.md"|"$HOME/.codex/AGENTS.md")
    deny "This is a bootstrap pointer (a generated projection). Authored standing policy must live in the cloud doctrine, not in this file." ;;
  "$HOME/.claude/settings.json"|"$HOME/.claude/.mcp.json"|"$HOME/.claude/plugins/known_marketplaces.json")
    deny "Harness shims are projected from doctrine/claude-pack/. Edit there, rebuild, redeploy." ;;
  "$HOME/.claude/projects/"*"/memory/"*)
    deny "Memory files are projected from doctrine/shared/rules/ (or are intentionally NOT projected — Path B served from the cloud at runtime). Do not write standing memory locally." ;;
  "$HOME/.claude/skills/"*|"$HOME/.claude/commands/"*|"$HOME/.claude/hooks/"*)
    deny "Skills, commands, and hooks are doctrine-managed. Local files are trampolines. Edit the body in doctrine/shared/ and re-deploy." ;;
  /Users/mist83/Code/AGENTS.md|/Users/mist83/Code/*/AGENTS.md|/Users/mist83/Code/*/CLAUDE.md)
    deny "Workspace-level AGENTS.md and CLAUDE.md files are also doctrine projections. Push the change to agent.mullmania.com." ;;
esac

exit 0
