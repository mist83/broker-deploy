---
name: Domain-agnostic contract
description: Never hardcode mullmania.com or mikesendpoint.com — derive the base domain from window.location.hostname at runtime
type: feedback
---

Never hardcode `mullmania.com` or `mikesendpoint.com` in any browser-facing code. The two domains must be interchangeable.

**Why:** The user has raised this multiple times across sessions. Hardcoded domains cause drift when the same code runs on either surface. The UI framework already supports this via `window.UI.origin`.

**How to apply:**
- For initial CSS/JS bootstrap (before the framework loads): derive the base domain from `window.location.hostname.split('.').slice(-2).join('.')` and inject tags dynamically.
- After `ui.js` loads: use `window.UI.origin` for all asset URLs.
- For displayed text (e.g. "yoursite.mullmania.com"): derive the suffix from the current hostname.
- Build scripts should accept the domain as a parameter or infer it — never bake in a specific domain.
- The only acceptable fallback (for localhost dev) is a default, and even that should be configurable.
