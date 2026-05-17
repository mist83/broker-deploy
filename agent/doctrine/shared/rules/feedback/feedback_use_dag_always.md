---
name: Use dag.[base-url] during investigations
description: Canon checklist item app-diagram requires every site to expose a live DAG link; I should open dag.[base-url]/?named=<repo> while investigating any site or tool, not just when building one
type: feedback
originSessionId: 308bea7b-53b9-4d70-a841-9381fbfef15b
---
When investigating anything in the mullmania/mikesendpoint fleet, open `https://dag.[base-url]/?named=<repo-name>` as a first-class context source, not an afterthought.

**Why:** Canon v2026.04.17 checklist item `app-diagram` mandates every site link to a live DAG at `dag.[base-url]/?named=<repo-name>`, agent-maintained. The DAG encodes the graph structure agents are supposed to use for situational awareness — skipping it means reinventing mental models the canon already publishes. Operator called this out after I investigated missing sites without once opening dag.mullmania.com — "you should be using dag all the time."

**How to apply:** Before deep-diving into a repo, site, or deployment question, curl or browse `https://dag.[base-url]/?named=<repo>` to surface the declared graph. Treat an inability to reach the DAG as itself a finding (as in the 2026-04-18 incident where dag.mullmania.com was 404ing).
