---
name: feedback_never_remove_functionality
description: Operator's hardline rule on app changes — burying functionality behind clicks/modals is allowed; outright removing it requires explicit blessing
metadata:
  type: feedback
---

When working on the operator's apps (especially when given autonomy to "make
it better"), never remove functionality without explicit operator approval.
Rearranging, adding, and burying are all allowed — moving a feature behind
another click, into a deeper menu, or into a less prominent surface is fine
if the UX improves. Removing the underlying capability is not.

**Why:** Operator stated explicitly 2026-05-21 while delegating overnight
autonomy on cozybox: *"feel free to bury functionality by obscuring it a
certain delta or number of clicks or modals away, but NEVER EVER EVER remove
functionality without my blessing."* The rule applies when the operator
can't be reached to approve — which is exactly when an autonomous agent is
most likely to delete-by-refactor.

**How to apply:**
- Adding a new mode that wraps the existing default OFF is fine; replacing
  the default behavior requires approval.
- Replacing a feature's UI is fine; removing the capability that powered it
  is not. If the new UI is incomplete, preserve the old one alongside.
- "Cleaning up dead code" — verify it's actually dead via grep before
  deleting. When unsure, comment out rather than delete and flag in the
  morning brief.
- For UI features: "I moved this from the toolbar to Tools > Advanced" =
  fine. "I deleted this button" = not fine without sign-off.
