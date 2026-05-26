---
name: daily-brief
description: Build a daily or backfilled accomplishment brief across Codex, Claude Code, Valet, proof-vault, Git, and optional ChatGPT export evidence. Use when the operator asks for a daily brief, accomplishment digest, backfill story, progress timeline, archive-mining pass, or a cross-agent history of what got done and where.
---

# daily-brief

Create an evidence-backed story of what changed, where it came from, and how to resume it. This is the continuity layer over many chats, not a replacement for the bookmark protocol.

## Modes

- **Daily mode**: cover the previous local day unless the operator gives a date range.
- **Backfill mode**: build an index first, then summarize by repo/app/theme across weeks or months.
- **Import mode**: when a ChatGPT export is provided, add it as another source and correlate by repo names, dates, URLs, commits, and proof artifacts.

## Sources

Read only what is needed for the requested window.

- Claude Code chats: `~/.claude/projects/**/*.jsonl`; each record usually carries `timestamp`, `sessionId`, `cwd`, `gitBranch`, `type`, `message`, and tool/result content.
- Claude tasks: `~/.claude/tasks/**/{*.json,.highwatermark}` for spawned task state.
- Codex current/archive index: `~/.codex/state_5.sqlite` table `threads`, `~/.codex/session_index.jsonl`, `~/.codex/sessions/**/*.jsonl`, and `~/.codex/archived_sessions/**/*.jsonl`. Preserve thread id, rollout filename, `archived`, `archived_at`, `cwd`, branch, title, and first user message so the operator can identify the exact chat to unarchive.
- Codex logs: `~/.codex/logs_2.sqlite` table `logs`, joined by `thread_id` when available. Copy live SQLite files before heavy reads if needed; do not mutate them.
- Codex/Valet runs: `~/.codex/valet-runs/**/{result.json,events.jsonl,claude-response.json,prompt.txt}`.
- Proof breadcrumbs: `/Users/mist83/Code/*/.proof.json` and `https://videos.mullmania.com/?tag=proof#feed`.
- Git evidence: per-repo commits in `/Users/mist83/Code/*`, especially commits near the date window.
- Deploy evidence: `mullmania.site.json`, `asset-version.json`, live URLs, and repo proof manifests.
- Future ChatGPT export: treat uploaded `conversations.json` or exported HTML/Markdown as read-only source material; do not assume it is complete until parsed.

## Workflow

1. Define the time window in America/Denver and record the exact UTC bounds.
2. Build an evidence index with one row per candidate accomplishment:
   - date/time
   - repo/app/theme
   - source runtime (`codex`, `claude`, `valet`, `chatgpt-export`, `git`, `proof-vault`)
   - source chat/session locator, including Codex thread id/archive JSONL path/unarchive target when known
   - related commits, proof URLs, deployed URLs, files, and tests
   - confidence: `strong`, `medium`, or `weak`
3. Merge duplicates across agents. Prefer proof URLs, commit SHAs, and deployed URLs over chat claims.
4. Produce the brief:
   - top accomplishments
   - shipped/deployed changes
   - evidence links
   - unresolved handoffs
   - likely cross-chat continuations
   - missing provenance or weak-evidence gaps
5. For backfill, write an index artifact first, then build the narrative from that index. Do not try to write the grand story directly from raw chats.

## Evidence Rules

- Never claim a task shipped based only on chat text. Look for a commit, proof artifact, deploy metadata, test output, or live URL.
- If evidence conflicts, say so and keep the weaker item in `needs_followup`.
- Preserve exact chat/session locators when available so the operator can unarchive the right chat.
- Keep synthetic memory visibly labeled. This skill creates an evidence index, not durable remote memory.
- Do not delete, archive, or modify chat histories.

## Suggested Output Shape

```json
{
  "window": {
    "local_start": "YYYY-MM-DDT00:00:00-06:00",
    "local_end": "YYYY-MM-DDT23:59:59-06:00"
  },
  "headline": "One sentence about the day.",
  "accomplishments": [
    {
      "repo": "example",
      "summary": "What got done.",
      "evidence": ["commit sha", "proof URL", "live URL"],
      "source_chats": ["runtime/session locator"],
      "confidence": "strong"
    }
  ],
  "handoffs": [],
  "needs_followup": []
}
```

For human-readable daily briefs, render the same data as short sections. For backfill, also produce a machine-readable index so later runs can continue without reparsing everything.
