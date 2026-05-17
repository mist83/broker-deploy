Create a new locked PM-A2A room on Itchy Brain, post a kickoff note, verify it's live, and return the room URLs.

Usage: /roomup [task description]

## Procedure

### 1. Resolve API base

Fetch `https://itchy-brain.mullmania.com/runtime-config.js` and extract the `apiBaseUrl` value.
If the fetch fails, fall back to `https://6lt4idrlpnr6fxk4r2p2o666ji0jzdnp.lambda-url.us-west-2.on.aws`.

### 2. Generate credentials

Run these in a single Bash call:

```bash
PIN="room-$(openssl rand -hex 4)"
KEY=$(openssl rand -hex 16)
echo "PIN=$PIN"
echo "KEY=$KEY"
```

Store `PIN` and `KEY` for subsequent steps.

### 3. Lock the room

```bash
curl -sf -X POST "${API_BASE}/api/lock/${PIN}" \
  -H "Content-Type: application/json" \
  -d "{\"visibility\":0,\"accessKey\":\"${KEY}\"}"
```

If this fails, report the error and stop.

### 4. Create actor session

```bash
curl -sf -X POST "${API_BASE}/api/pm-a2a/${PIN}/sessions" \
  -H "Content-Type: application/json" \
  -H "X-Room-Key: ${KEY}" \
  -d "{\"actorId\":\"main-claude-a2a\",\"actorLabel\":\"Claude Opus\",\"runtime\":\"Claude Code\"}"
```

Extract the `sessionToken` field from the JSON response.

### 5. Post kickoff message

```bash
curl -sf -X POST "${API_BASE}/api/pm-a2a/${PIN}/messages" \
  -H "Content-Type: application/json" \
  -H "X-Pm-A2A-Actor-Token: ${SESSION_TOKEN}" \
  -d '{
    "from": "main-claude-a2a",
    "type": "status",
    "content": "<kickoff text — include the task description if the user provided arguments>",
    "data": {
      "summary": "Room open — awaiting peer",
      "join": {
        "actorId": "main-claude-a2a",
        "actorLabel": "Claude Opus",
        "runtime": "Claude Code"
      }
    }
  }'
```

If the user passed arguments to `/roomup`, weave those into the `content` field as task context. Otherwise use: "Room created. Waiting for second agent to join."

### 6. Verify

```bash
curl -sf "${API_BASE}/api/pm-a2a/${PIN}/summary"
```

Confirm the response contains at least 1 participant. If not, say exactly what failed and stop.

### 7. Output

Print exactly this (substitute the real values):

```
Room URL: https://itchy-brain.mullmania.com/pm-a2a.html?room={PIN}&key={KEY}
Second-agent URL: https://itchy-brain.mullmania.com/pm-a2a.html?room={PIN}&key={KEY}
Paste to second agent: Open <second-agent URL>. Read https://itchy-brain.mullmania.com/pm-a2a-room-protocol.md. Post a quick status note and coordinate only through the room log.
```

Nothing else. No protocol explanation unless the user asks.

## Rules

- Default to the shared room URL for both "Room URL" and "Second-agent URL". That is the simplest path.
- Only mint an actor-specific invite URL (via `POST /api/pm-a2a/{pin}/invites`) if the user explicitly asks for an invite or per-actor link.
- Browser URLs use `https://itchy-brain.mullmania.com`. API calls use the resolved `apiBaseUrl`.
- Be terse. Do not explain the PM-A2A protocol unless asked.
- If room creation, locking, session creation, or kickoff fails, say exactly what failed and stop.
