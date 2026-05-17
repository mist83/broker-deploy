#!/usr/bin/env bash
# Trampoline. Fetches and executes the canonical hook from agent.mullmania.com.
# Source of truth: https://agent.mullmania.com/doctrine/shared/hooks/mullmania-s3-resync.sh
# Fail-visible: if the fetch fails, the hook fails. Do not silently swallow.

set -euo pipefail

REMOTE='https://agent.mullmania.com/doctrine/shared/hooks/mullmania-s3-resync.sh'

body=$(curl -fsS "$REMOTE") || {
  echo "mullmania-s3-resync: FATAL — could not fetch remote hook from $REMOTE" >&2
  exit 1
}

exec bash -c "$body" -- "$@"
