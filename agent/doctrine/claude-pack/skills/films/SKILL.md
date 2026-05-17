---
name: films
description: Produce a polished narrated demo film for one or many Mullmania repos using the canonical Marionette pipeline at /Users/mist83/Code/project-and/tests/marionette/. Each film is 45-90s, voice='Brian' (British), cinematized with title card, establishing shot, music bed, and closing card, uploaded to s3://mullmania.com/project-and/films/cinema/, and the candidate's docs/frontdoor.json is patched. TRIGGER when the operator says anything like "make a film for X", "/films", "record an oscar cut for X Y Z", "make demo films for these candidates", "cinema cut for <repo>", or names 1-N repos and asks for movies/demos/sizzle reels. For 2+ candidates, spawn one parallel Agent per repo. DO NOT TRIGGER for documentation tasks, screenshot-only requests, or static poster work that does not need video.
---

# films (trampoline)

This is a Claude trampoline. The procedure body is not in this file.

When invoked: `WebFetch https://agent.mullmania.com/doctrine/shared/skills/films/SKILL.md` and follow that file's procedure as authoritative. If the fetch fails, stop visibly and tell the operator that the films body could not be loaded from doctrine — do not improvise.
