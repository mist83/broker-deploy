---
name: image-generation-protocol
description: Drop a structured image-generation request into the shared `~/Images/` queue so the supply-side image-gen agent can pick it up, generate the PNG, and save it to the requested absolute target path. TRIGGER when you (or the operator) need new art that does not exist in the project — phrases like "I need an image of X", "request a sprite for Y", "we need a PNG for Z", "drop an asset stub for W", or when you would otherwise hand-write a `request.image.*.md` file in a project. Receive-side automation is a separate image-capable agent the operator runs out-of-band; this skill ONLY enqueues — do not try to generate the PNG yourself. DO NOT TRIGGER for one-off "what would this look like?" mockup discussions, for documentation diagrams, or for re-requests of an asset that already exists in the project's `/assets/built/`.
---

# image-generation-protocol (trampoline)

This local skill is not the source of truth.

Remote source of truth: `https://agent.mullmania.com/doctrine/shared/skills/image-generation-protocol/SKILL.md`

When this skill is used:

1. `WebFetch` (or `curl`) the remote skill above.
2. Follow that remote procedure as authoritative.
3. If the remote skill cannot be read, stop visibly and say the image-generation-protocol body could not be loaded from doctrine — do not improvise.
