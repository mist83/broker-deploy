---
name: NSMenu live-update gotchas (JXA/AppKit)
description: Two non-obvious AppKit behaviors when live-updating an NSStatusItem menu from JXA — required for held-open menus to reflect state changes.
type: reference
---

When building a macOS menu bar app in JXA (or pure AppKit) where menu items must update while the menu is open (e.g. a "Working in: X" row that ticks as a daemon scans):

**1. NSTimers must be registered in `NSRunLoopCommonModes`, not default mode.**
While an NSMenu is being tracked, the main runloop enters `NSEventTrackingRunLoopMode`. Any NSTimer scheduled only in `NSDefaultRunLoopMode` stops firing until the menu closes. A manual `runUntilDate` poll loop in default mode also parks. Fix:

```js
const timer = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(
  0.75, state.delegate, 'refreshTick:', null, true
);
$.NSRunLoop.currentRunLoop.addTimerForMode(timer, $.NSRunLoopCommonModes);
```

**2. `setTitle:` / `setHidden:` on live NSMenuItems don't auto-redraw.**
Even when the timer fires correctly during tracking, mutating an NSMenuItem's title or visibility doesn't trigger a redraw on its own. Call `state.menu.update;` after any in-place mutation to force the menu to re-lay out. Replacing `statusItem.menu = newMenu` wholesale *also* fails while tracking — always mutate existing items and call update.

**Reference implementation**: `/Users/mist83/Code/gitter/mac-menu-bar/GitterMenuBar.js` — `installRefreshTimer()`, `updateLiveMenuItems()`, `menuWillOpen:` / `menuDidClose:` delegate methods.

**How to apply**: Any JXA/Swift menu bar app that shows live state (scan progress, sync counters, build status). Diagnostic tip: add a tick counter that logs `menuOpen=true/false` so you can prove the timer is or isn't firing during tracking before chasing redraw issues.
