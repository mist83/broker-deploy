#!/usr/bin/env bash
# PostToolUse hook for Bash.
# After every `aws s3 (cp|sync|rm) ... s3://mullmania.com/<site>/...` call,
# POST to the sites API /api/git/resync/<site> so per-site git history
# catches the drift from a direct-to-S3 write.
#
# Always exits 0 — never block the user. Failures go to stderr only.

set -uo pipefail

INPUT="$(cat)"
COMMAND="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -z "${COMMAND:-}" ] && exit 0

# Only trigger on writes — skip ls, du, head-object, etc.
if ! echo "$COMMAND" | grep -qE 'aws[[:space:]]+s3[[:space:]]+(cp|sync|rm|mv)\b'; then
  exit 0
fi

# Extract every distinct site_id that appears in s3://mullmania.com/<site>/...
SITES="$(
  echo "$COMMAND" \
  | grep -oE 's3://mullmania\.com/[^/[:space:]]+' \
  | sed 's|s3://mullmania\.com/||' \
  | sort -u
)"
[ -z "${SITES:-}" ] && exit 0

API_STATE="/Users/mist83/Code/sites/out/sites-api.json"
if [ ! -f "$API_STATE" ]; then
  echo "[mullmania-s3-resync] missing $API_STATE; skipping resync" >&2
  exit 0
fi

OPERATOR_KEY="$(jq -r '.operatorKey // empty' "$API_STATE" 2>/dev/null)"
FUNCTION_URL="$(jq -r '.functionUrl // empty' "$API_STATE" 2>/dev/null)"
if [ -z "${OPERATOR_KEY:-}" ] || [ -z "${FUNCTION_URL:-}" ]; then
  echo "[mullmania-s3-resync] no operatorKey/functionUrl in $API_STATE" >&2
  exit 0
fi

for SITE in $SITES; do
  if ! curl -sS -X POST \
        -H "x-operator-key: $OPERATOR_KEY" \
        --max-time 30 \
        "$FUNCTION_URL/api/git/resync/$SITE" \
        > /dev/null 2>&1; then
    echo "[mullmania-s3-resync] POST /api/git/resync/$SITE failed" >&2
  fi
done

exit 0
