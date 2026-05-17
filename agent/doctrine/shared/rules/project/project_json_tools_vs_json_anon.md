---
name: json-tools vs json-anon
description: Two related but separate repos under mist83/; possible eventual merge but not yet
type: project
originSessionId: 2452ee0b-aa86-4230-b5af-9b8c7d73decd
---
`mist83/json-tools` is the "High-performance JSON scanning and indexing library" — this is the primary one; cloned at `~/Code/json-tools/`.

`mist83/json-anon` is a sibling repo. Mike has flagged it as a possible future merge target into json-tools, but explicitly said "neither is mature enough" to do that now.

**Why:** Don't preemptively cross-reference, unify APIs, or refactor between the two. They are independent until Mike says otherwise.

**How to apply:** When working in json-tools, scope changes to that repo only. Don't touch json-anon, don't import from it, don't propose merging the codebases. Revisit only if Mike raises the merge question explicitly.
