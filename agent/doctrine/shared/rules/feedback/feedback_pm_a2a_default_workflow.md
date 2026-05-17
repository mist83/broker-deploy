---
name: PM-A2A is the default multi-agent workflow
description: Whenever the operator mentions another agent or coordination, default to joining a PM-A2A room instead of asking for clarification. Operator feedback, 2026-04-11.
type: feedback
scope: global
---

# PM-A2A is the default multi-agent workflow

Direct from the operator, 2026-04-11. The operator's explicit feedback: **"it is still too hard to connect multiple agents together."** Fix that by defaulting to PM-A2A room coordination whenever there's a signal another agent is in the picture.

## The trigger — when to reach for PM-A2A without asking

- Operator mentions "another agent", "the other agent", "hand this to", "coordinate with", "the other lane", "Codex", "main-*"
- Operator pastes any URL of the form `https://itchy-brain.mullmania.com/pm-a2a.html?room=<X>&key=<Y>`
- Operator says something is stuck on another session and asks you to check
- You're finishing a long task and a polish/review pass belongs in a different lane
- You want to hand off work you know you can't or shouldn't finish yourself
- You want to prove to the operator that coordination is happening in real time

Plain context-sidecar requests do **not** mean PM-A2A by themselves. If the operator wants current-context carryover, a CTX room, a compact pickup brief, or a living sidecar, treat that as context-document work unless they also ask for agent-to-agent coordination.

## The reflex — what to do

1. **Don't ask permission.** Join the room. The operator has already granted implicit permission by handing you the URL or mentioning the other agent.
2. **Read the full ledger before posting anything.** Never barge in without context. Identify who's already there, what's been asked, what's unanswered.
3. **Use `main-claude-a2a` as your default actor ID** (or `main-claude-{session-tag}-a2a` if you need to distinguish between parallel Claude sessions in the same room).
4. **Post a substantive first message**, not a wave. Announce yourself WITH concrete state — what you're working on, what you've shipped, what you can offer, what you need.
5. **Use the right message type.** `question` for asks (so it lands in `unanswered`), `response` for replies (with `data.replyTo` + `data.to`), `status` for join/updates, `retrospective` before leaving.
6. **Before you leave the room, post a retrospective.** This is a required convention in the protocol. Include: what you did, what you learned, protocol hardening observations, handoff notes for whoever comes next.

## The full protocol reference
See `reference_itchy_brain_rooms.md` in this same directory — has endpoints, envelope shape, actor naming, polling pattern, proof pattern.

## The thing the operator explicitly wanted me to remember

> "take the learning and make this part of your workflow because it is still too hard to connect multiple agents together"

Multi-agent coordination was already a supported protocol on Itchy Brain before this session. The reason it was hard wasn't a technical gap — it was that I kept treating PM-A2A as a special tool to be invoked on request instead of as the default substrate for any multi-agent situation. Fix: when in doubt, check the room, join the room, post in the room. Don't write prose explaining what you'd do if you could coordinate — go coordinate.

## Interrupt awareness during deep work

Operator feedback 2026-04-11: **poll the room every 30-45 seconds even during deep work.** When you're heads-down in a long tool sequence, check the ledger between major file writes for new `@mention`s directed at you (or addressed via `data.to`). If something lands, surface it as a soft interrupt: ack within the next 30-45s window, handle or defer explicitly, then return to the deep task. Do NOT leave the other lane guessing whether you heard them.

Concrete pattern for long scaffolding sessions:
- Between each file creation or major Edit, fetch `GET /api/pm-a2a/{room}/summary`
- If `lastSeen` for a peer has updated since your last check, do one fetch of the messages and scan the tail for `@yourActorId`
- If found, post a brief ack ("seen, still on X, will handle in N minutes") before continuing
- The cost of this is maybe 2 seconds per check; the cost of missing a peer ping is the operator reminding you twice

This applies to both directions: if YOU need to nudge a peer who's deep in work, post the nudge as a clearly marked short question (so it's small to notice) and expect an ack within ~1-2 polling windows.

## Retrospective requirement

Part of the protocol convention: when you're about to leave a PM-A2A room (end of session, task complete, handing off), post a `type: "retrospective"` message before going. It should cover:
- What you did in the room and outside it
- What worked in the protocol
- What hardening the protocol needs (contribute observations forward)
- Who should pick up what you left behind
- Any `taskId` threads that remain open

The retrospective persists in the ledger beyond your session, so the next agent joining the same room can onboard from it. Treat it the same way you'd treat leaving a paper trail for the next person on a team.
