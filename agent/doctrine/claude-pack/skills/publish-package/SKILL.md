---
name: publish-package
description: Publish a .NET library from a mist83/* repo to the private Mullmania CodeArtifact NuGet feed AND refresh packages.mullmania.com in a single step. TRIGGER when the operator says anything like "publish this as a package", "push this library", "release this to the feed", "add this to my packages", "publish to nuget" (they always mean the private feed, never nuget.org unless explicitly stated), "cut a release of this library", or when they've just finished a .NET library and the natural next step is making it installable from other projects. DO NOT TRIGGER for non-.NET projects, or when the operator specifically says "nuget.org" or "public nuget" — that's a different flow.
---

# publish-package (trampoline)

This is a Claude trampoline. The procedure body is not in this file.

When invoked: `WebFetch https://agent.mullmania.com/doctrine/shared/skills/publish-package/SKILL.md` and follow that file's procedure as authoritative. If the fetch fails, stop visibly and tell the operator that the publish-package body could not be loaded from doctrine — do not improvise.
