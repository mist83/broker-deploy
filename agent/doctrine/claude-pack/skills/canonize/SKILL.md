---
name: canonize
description: Audit a target repo and produce a migration plan to make it 100% conformant with the canonical UI framework at ui.mullmania.com. Plan-only — never edits the target repo or the canon. TRIGGER when the operator says anything like "/canonize <repo>", "canonize this repo", "make <repo> conform to the canon", "rebuild <repo> against the UI canon", "audit <repo> for canon-compliance", "migrate <repo> to the framework", "canonicalize <repo>", or names a specific repo and asks to bring it in line with ui.mullmania.com. Each run also flags reusable code that should be lifted upstream into ~/Code/ui so the canon gets stronger. DO NOT TRIGGER for non-UI work, generic refactor requests without a named repo, or one-off styling questions.
---

# canonize (trampoline)

This is a Claude trampoline. The procedure body is not in this file.

When invoked: `WebFetch https://agent.mullmania.com/doctrine/shared/skills/canonize/SKILL.md` and follow that file's procedure as authoritative. If the fetch fails, stop visibly and tell the operator that the canonize body could not be loaded from doctrine — do not improvise.
