Doneness audit at the end of an `/overdrive` run. The finishing move of the `/overdrive` protocol.

Usage: `/breadcrumb` (no args required)

Pair with: `/overdrive` (the work) → `/breadcrumb` (the audit). The operator is scrolling for the bottom line, so the final marker must be unambiguous.

## Procedure — execute verbatim, do not paraphrase

STOP. Doneness audit against the /overdrive protocol. For each item, respond with ONLY:
  ✅ + concrete evidence (SHA, count, URL, file)
  🚨🚨🚨 NOT DONE 🚨🚨🚨 + what's missing
  ⚠️ N/A + one-sentence reason

1. Chapters shipped (list titles + commit SHAs)
2. Each chapter has a test that FAILS without the fix — confirmed by revert-check (yes per chapter)
3. Full suite green — paste final counts
4. Multi-pass stability (3x/5x) — paste counts, or ⚠️ N/A
5. RegressionTestCount bumped, or ⚠️ N/A
6. Snapshots/goldens refreshed, or ⚠️ N/A
7. All chapters pushed (SHAs)
8. Deployed AND live-verified on the deployed URL (paste URL + what you clicked), or ⚠️ N/A
9. Final cross-cutting suite run ≥3x AFTER all chapters landed — paste counts
10. Combinatorial run with all new flags ON, or ⚠️ N/A
11. Retro posted to retro.mullmania.com (paste entry id / response)
12. Deferred items list (paste, or "nothing deferred")
13. NO refactors, NO contract breaks, NO silent dep upgrades, NO aesthetic drift outside focus arg — confirm

Last line of your response must be EXACTLY one of these and nothing else:
  🚨🚨🚨 OVERDRIVE COMPLETE!!! 🚨🚨🚨 SAFE TO CLOSE 🚨🚨🚨
  🛑🛑🛑 DO NOT CLOSE 🛑🛑🛑 OVERDRIVE INCOMPLETE 🛑🛑🛑

One 🚨 anywhere = mandatory 🛑 marker. I'm scrolling for the bottom line.

## Notes

- Do not improvise items. Do not add a 14th. Do not collapse two items into one. The list is fixed so the operator can scan position-by-position across many chats.
- Evidence must be concrete and verifiable: a SHA, a count, a URL, a file path. "Looks good" is not evidence.
- `⚠️ N/A` requires a one-sentence reason — not a hand-wave. If a check genuinely does not apply (e.g. repo has no `RegressionTestCount`), say so plainly.
- Do not soften the failure marker. One 🚨 anywhere forces the 🛑 bottom line. Do not finesse it into "mostly complete."
- This command is the END of `/overdrive`. If `/overdrive` was not run, the right answer is to say so and stop, not to fabricate an audit.

## Relationship to the breadcrumb_protocol rule

This slash command is the verbose, `/overdrive`-specific doneness audit. It is NOT a substitute for the operator's terse `bp` / `crumbs` / `safe to close` shorthand defined in `feedback_breadcrumb_protocol` — that rule's two-line response shape is still the right answer when the operator pings any chat with shorthand. Use `/breadcrumb` only when invoked as a slash command, typically at the tail of an `/overdrive` session.

ARGUMENTS: $ARGUMENTS
