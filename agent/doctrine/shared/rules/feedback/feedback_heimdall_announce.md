---
name: Heimdall announce — short Slack note after every completed task
description: GLOBAL — at the end of every completed task, post a short plain-text development update to Slack channel cline-log via the operator's heimdall-announce script. Slack is canonical conversation state; S3 is canonical artifact state.
type: feedback
originSessionId: agent-sync-2026-04-27
---
Slack is canonical conversation state. After every completed task, log a short note so the operator has an out-of-band record without having to read the agent transcript.

## Rule

- After every completed task, run the operator's heimdall-announce script with one short neutral sentence summarizing what was done.
- Default invocation: `python3 /Users/mist83/.codex/skills/heimdall-announce/scripts/announce_to_cline_log.py "<message>"`
- Plain text only. No Block Kit. No timestamp. No signature. No prefix.
- The message is a useful operator note, not marketing copy. One sentence.
- If the user gave exact text, send it verbatim.
- Do not claim success unless the command exits 0 and prints a Slack message id.
- If the command fails, report the error plainly. Do not pretend the announce happened.

## Why

Slack is where the operator scans daily activity. The Slack note is the durable trace of "this happened, here is the operator-readable summary." S3 is for the artifacts; Slack is for the narrative. Without the Slack note, the operator has to dig through transcripts to know what completed.

## Scope

This rule applies to **all** runtimes and **all** repos for this operator. The local heimdall-announce script lives outside any single runtime tree (`~/.codex/skills/heimdall-announce/`) so both Codex and Claude call the same binary.

## Failure mode

If the heimdall script is missing or fails, the task is not done — report the announce failure plainly. Do not suppress the error to make the task look complete.
