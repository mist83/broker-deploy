---
name: phone-pair pattern (TV + phone via QR)
description: Canonical JS primitive for "TV displays QR, phone(s) join over signal-argh" — use pair.js, do not reinvent
type: reference
---

When building any browser surface where a phone joins a TV/dashboard by
scanning a QR code, **use the canonical pairing primitive**:

```js
import { pairScreen, pairPhone } from "https://ui.mullmania.com/js/pair.js";
```

Source lives in `mist83/ui` under `js/pair.js`. Published to
`ui.[base]/js/pair.js` alongside the canon CSS. It wraps `signal-argh`
(see `reference_signal_argh`) with the standard wire conventions so every
consumer agrees on:

- channel naming: `<channelPrefix>-<sessionId>` (sessionId is 8 chars)
- screen role: `userId=screen`
- phone role: `userId=phone-<random>` (multi-phone is the default, not a feature)
- protocol: canonical `SendCustomMessage(channelId, topic, message)` →
  `customMessage({topic, message, userId})`
- phone URL convention: `<remotePath>?s=<sessionId>`

## Minimum usage

**TV side:**
```js
const screen = await pairScreen({
  channelPrefix: "my-app",
  qrCanvas: document.querySelector("#qr"),  // optional
  onPhoneJoin: (userId) => addPlayer(userId),
  onPhoneLeave: (userId) => removePlayer(userId),
  onMessage: (topic, payload, userId) => { ... },
});
screen.remoteUrl  // also encoded in the QR
screen.publish("kick", { id: x })  // server→phone
```

**Phone side:**
```js
const phone = await pairPhone({
  channelPrefix: "my-app",
  onTilt: ({ beta, gamma }) => { ... },  // optional; triggers iOS permission prompt
});
phone.publishTilt(33);          // auto-publishes `tilt` topic at ~30Hz
phone.publish("button", { ... }); // ad-hoc topics
```

## Live proof

The phone-cursor section of `demo.[base]` is the runnable demonstration —
open the section, scan the QR, and the phone becomes a touchpad over the
hub. Other consumers: `app-flyover.[base]` (tilt-to-fly), `marble-maze.[base]`
(tilt-to-roll, multi-phone race).

## Where to read

- Source: `mist83/ui/js/pair.js`
- Canon integration page: `development-canon/integrations/phone-pair.md`
- Underlying hub: see `reference_signal_argh`

## When NOT to use

- Server→server messaging. Use `signal-argh` admin REST directly.
- Same-origin two-tab sync (`BroadcastChannel` is simpler).
- Cases needing presence richer than join/leave userIds. The pattern intentionally
  surfaces only `customMessage` + a parsed join/leave notification; if you need
  channel rosters, query the hub admin REST or extend pair.js — don't reach
  past it.
