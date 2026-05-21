---
description: Open lecter — context surgery control panel for your sessions
allowed-tools: Bash
---

Open the Lecter UI in your browser, scoped to the current project. The sidebar
lists every session — pick one, then click turns to drop them, strip images
into pointers, or splice across sessions. Surgery happens visually; lecter
writes a new session file and leaves the original intact.

```bash
cwd_enc=$(pwd | python3 -c "import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read().strip()))")
if ! curl -sS -o /dev/null -m 1 "http://127.0.0.1:5173/"; then
  echo "Lecter server isn't running on 127.0.0.1:5173 — launch the menu bar app first."
  exit 1
fi
open "http://127.0.0.1:5173/?cwd=${cwd_enc}"
```

Lecter URL: http://127.0.0.1:5173
