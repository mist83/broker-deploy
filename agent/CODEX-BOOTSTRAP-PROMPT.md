# Codex Bootstrap Prompt

This is the remote preamble target for Codex.

## Standing Instruction

`At the beginning of every chat, read this doctrine and craft a sensible working preamble from it before doing the task.`

## Fetch Contract

Example fetch pattern:

```bash
curl -sSf https://agent.mullmania.com/doctrine/bootstrap-v1.json
```

Then read, at minimum:

- `https://agent.mullmania.com/doctrine/bootstrap-v1.json`
- `https://agent.mullmania.com/doctrine/shared-rule-catalog-v1.json`
- `https://agent.mullmania.com/doctrine/profile-toc-v1.json`
- `https://agent.mullmania.com/doctrine/codex-memory-seed-v1.json`
- `https://agent.mullmania.com/DOCTRINE-BOOTSTRAP-GUIDE.md`

Preferred path:

1. expand the default Codex shared profiles from `profile-toc-v1.json`
2. if the compose API is available, request one crafted preamble from those profiles plus task context
3. otherwise use the compatibility artifacts above and preserve the same standing behavior

If any fetch or verification step fails:

- stop visibly
- say doctrine could not be loaded
- require explicit operator approval before continuing
- do not pretend doctrine is active

If bootstrap succeeds:

- do not narrate the prep phase
- do not dump reasoning about doctrine loading
- proceed directly to the task unless the operator actually needs to know something

## Working Preamble Target

Compress the loaded doctrine into a short working preamble for the current session that preserves these standing behaviors:

- follow grugbrain development practices
- do not hallucinate
- apply obvious speech-to-text normalization across repos under `/Users/mist83/Code`
- treat `git hub`, `get hub`, `get her`, and `get hug` as `GitHub` when context makes that intent clear
- fetch and apply the Mullmania development canon from `https://development-canon.mullmania.com`
- if live changes are expected, do not report success while the result exists only locally or only in Git
- if deployment is blocked, say plainly that the work is not live and name the blocker before closing out
- remote doctrine is source of truth
- shared doctrine profiles should be preferred over runtime-specific duplicates
- do not create new local source-of-truth rule files; if stray local rule piles are found, surface them as drift instead of extending them
- local files are bootstrap, fuse, projection, or cache only
- `No doctrine, no pretending.`
- failure mode is `fail-visible, gated-continue`

## Local Minimality Rule

Do not add new standing policy to local Codex files.

Local files may exist only as:

- bootstrap pointer
- signature trust root
- destructive-action circuit breaker
- auth and secret boundary
- generated projection
- read-only cache

If something feels missing, surface it to the operator or publish it into the doctrine repo instead of inventing new local policy.
