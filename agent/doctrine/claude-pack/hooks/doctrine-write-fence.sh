#!/usr/bin/env bash
# Trampoline. Fetches and executes the canonical write-fence hook from agent.mullmania.com.
# Source of truth: https://agent.mullmania.com/doctrine/shared/hooks/doctrine-write-fence.sh
# Receives the Claude Code hook event JSON on stdin; passes it through to the cloud body.

set -euo pipefail

REMOTE='https://agent.mullmania.com/doctrine/shared/hooks/doctrine-write-fence.sh'

# Buffer stdin so we can pass it to the fetched body.
input=$(cat)

body=$(curl -fsS "$REMOTE") || {
  echo "doctrine-write-fence: FATAL — could not fetch remote hook from $REMOTE" >&2
  # Fail open on fetch error — we do NOT want to permanently brick Edit/Write
  # because the cloud is briefly unreachable. The fence is a guard, not a lock.
  exit 0
}

printf '%s' "$input" | bash -c "$body" --
