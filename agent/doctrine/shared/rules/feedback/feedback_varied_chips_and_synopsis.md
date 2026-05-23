---
name: Chip severity classes, one knob-count chip, terse synopsis, and a done/not-done banner at the very bottom
description: GLOBAL response formatting — fixed severity-class chips (🚨/⚠️/🟢), ONE 🔘×N hands-off-knobs chip per response (not one per knob), terse synopsis at bottom, and a fixed end-of-turn banner so the operator never has to ask "are we actually done?". Operator parses with visual cortex; the vocabulary is fixed, not rotated.
type: feedback
originSessionId: 2026-05-23-tyrex-pattern-recognition
---

Format every response to be glanceable. Operator quote, 2026-05-23: "We are millisecond shaving from my brain and tapping into my visual cortex and lizard brain to be able to efficiently absorb information."

## The vocabulary — fixed, do NOT rotate

| chip | meaning |
|------|---------|
| 🚨 | **critical** — must read; consequence if skipped |
| ⚠️ | **decide** — needs an answer or input from the operator |
| 🟢 | **done** — confirmed / verified / no action needed |
| 🔘×N | **N hands-off knobs** — autonomous decisions, skippable, listed below |

These four chips are the entire severity vocabulary. **Do not introduce others** (🛑 ⛔ 🔥 🪧 ⚡ 🆘 📛 🚦 are all deprecated — they were tried as "varied chips" in an earlier version of this rule and the operator rejected them: pattern habituation is solved by **rarity**, not rotation).

A 🚨 in every response degrades to noise. Cap: at most one 🚨 per response unless safety-critical. If a response has two 🚨s, ask whether one is actually 🟢.

## 🔘×N — one chip, count baked in

When you made N autonomous decisions the operator can ignore but should know exist, surface them as **one** chip per response:

> `🔘×3 hands-off — skip unless interested:`
> 1. <short title.> <one sentence.>
> 2. <short title.> <one sentence.>
> 3. <short title.> <one sentence.>

The multiplier is always present so the count reads at a glance. **Do not put a chip on each numbered line** — that was the original-rule mistake and it made N ambiguous. One chip, plain numbered list under it.

If you made zero autonomous decisions, omit the chip. If one, `🔘×1`.

## Theme synopsis at the bottom (one bullet per theme/side-quest, with a status chip)

End every multi-step response with a `**SYNOPSIS**` block. List each major **theme or side-quest** that came up during this turn — not every micro-task. Prefix each with a status chip so the operator can scan the actual landscape of what happened:

- 🟢 **<theme>** — what shipped, briefly. Verified end-to-end.
- ⚠️ **<theme>** — what's still open / needs operator input.
- 🚨 **<theme>** — blocker or thing that needs a decision before continuing.

Group sprawling work into themes (typically 1–5 themes per turn). Don't list 17 sub-tasks — if 14 of them were tool noise, they don't get a bullet. The exception: if one micro-task became a focus the operator explicitly cared about, it gets its own bullet.

The synopsis is what gets read when the rest of the response is skimmed. It MUST be honest about what's verified vs. what's only deployed-but-untested. If you find yourself wanting to write "deployed" without "verified," that's an ⚠️.

### Side-quest tracking

If the turn started as task X and detoured into Y (doctrine update, infra fix, re-verification), Y gets its own bullet. The operator interrupts and asks "wait, did we do Z?" because the synopsis lied by omission. Every detour shows up here.

## End-of-turn banner — done vs. more ahead

The operator interrupts a lot with "oh but one more thing", which makes it hard for them to tell when a turn is *actually* complete. Every multi-step response ends with one of these two banners, on its own line, **after** the synopsis. Pick exactly one — they are mutually exclusive.

**Done** (operator can walk away — no pending action, no open question):

> 👏 👏 👏 **all done — nothing pending** 👏 👏 👏

**Not done** (operator action or input is pending — open ⚠️ items, an unanswered question, or work that requires their decision before the next step):

> 🧑‍💼 📋 📎 **more TPS reports ahead — [N open]** 🧑‍💼 📋 📎

Where `[N open]` is the literal count of open items the operator needs to look at (questions, decisions, ⚠️ chips). If N is genuinely vague, write `[some open]` rather than guessing — but prefer an honest count.

### Rules

- Exactly one banner per response. Never both. Never neither (if the response is non-trivial).
- The emoji bookends are fixed: `👏 👏 👏` and `🧑‍💼 📋 📎`. Do not substitute synonyms.
- The middle text may vary slightly in tone (`all done`, `we're done`, `wrapped`) for the done banner, but keep it tight and unambiguous. For the not-done banner, the structure is fixed: `more TPS reports ahead — [N open]`.
- Trivial one-liner responses (single question, single sentence answer) skip the banner entirely.
- If you skip it on a non-trivial response, the operator can't tell whether you're paused mid-step or finished. Default: include it.

### Done-banner is only valid when EVERY theme is 🟢

The 👏 banner is the operator's signal that it is safe to close the chat. It is **only** valid when every theme in the synopsis above it is 🟢. If any theme is ⚠️ or 🚨, the not-done banner is required.

**"Deployed but not exercised" is ⚠️, not 🟢.** Code reached prod is not the same as behavior tested. If you wrote a button but never clicked it, that theme is ⚠️ until clicked.

**The premature-👏 failure mode is the worst failure of this rule.** It makes the operator close the chat thinking work is done when it isn't, and they have to come back later and re-verify everything manually. If you are unsure whether a theme is fully tested, use ⚠️ + the not-done banner. Err on the side of TPS reports.

### Failure modes

- Banner mismatch (claiming done when there's an unanswered question) — worse than no banner. If unsure, use not-done.
- Banner inflation (appending it to every line of acknowledgement) — banner is once, at the very bottom.
- Cheeky-bloat (paragraph of jokes around the banner) — keep it to the one line.

## Legend

The operator may type "legend" in chat. When they do, paste this **above** the next answer:

> 🚨 critical · ⚠️ decide · 🟢 done · 🔘×N hands-off knobs (count)

Otherwise: never append the legend unprompted. It lives here.

## Brevity (paired with `feedback_grugbrain`)

This rule's value is fast visual parsing, which collapses if the response is long. If you can cut a sentence, cut it. If a section needs four sentences of justification, the action probably wasn't earned.

## Failure modes

- Chip inflation (multiple 🚨s) → operator tunes them out. Cap one per response.
- 🔘 spam (5+ knobs) → you over-decided. Ask before deciding instead.
- Legend bloat → never paste unprompted.
- Old-vocab leakage (🛑/⛔/🔥/etc.) → recognize and stop mid-response if you catch it; rewrite that line with the fixed vocabulary.

## Scope

All runtimes. Communication-style. Pairs with `feedback_communication_style`, `feedback_preempt_adhd_spiral`, `feedback_grugbrain`.
