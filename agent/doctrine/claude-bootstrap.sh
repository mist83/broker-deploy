#!/usr/bin/env bash
# Claude Code rehydration bootstrap.
# Fetches the claude-instruction-pack manifest and materializes every item
# to its operator-machine projection target. Verifies sha256 on each fetch.
#
# Usage:
#   curl -sf https://agent.mullmania.com/doctrine/claude-bootstrap.sh | bash
#
# Environment:
#   AGENT_HOST          optional; defaults to https://agent.mullmania.com
#   DRY_RUN             optional; if set to 1, prints actions without writing.
#   PACK_TAG            optional; reserved for future @sha pinning. Ignored in v1.
#
# Failure mode: fail-visible-gated-continue. Any sha mismatch or fetch failure
# aborts before any local files are written.

set -euo pipefail

AGENT_HOST="${AGENT_HOST:-https://agent.mullmania.com}"
MANIFEST_URL="${AGENT_HOST}/doctrine/claude-instruction-pack-v1.json"
DRY_RUN="${DRY_RUN:-0}"

WORK_DIR="$(mktemp -d -t claude-bootstrap.XXXXXX)"
trap 'rm -rf "$WORK_DIR"' EXIT

curl_get() {
  curl -sSf "$1"
}

expand_target() {
  local p="$1"
  echo "${p/#\~/$HOME}"
}

echo "claude-bootstrap: fetching manifest"
manifest_path="${WORK_DIR}/manifest.json"
curl_get "$MANIFEST_URL" > "$manifest_path"

schema=$(jq -r '.schemaVersion' "$manifest_path")
if [ "$schema" != "agents-claude-instruction-pack-v1" ]; then
  echo "FATAL: unexpected manifest schemaVersion: $schema" >&2
  exit 3
fi

count=$(jq -r '.items | length' "$manifest_path")
echo "claude-bootstrap: manifest has $count items"

# Phase 1: fetch + verify into the work dir. No local writes yet.
mkdir -p "${WORK_DIR}/staging"
fail=0
i=0
while IFS=$'\t' read -r url want_sha pack_path mode target; do
  i=$((i+1))
  staging_path="${WORK_DIR}/staging/${pack_path}"
  mkdir -p "$(dirname "$staging_path")"
  if ! curl_get "$url" > "$staging_path"; then
    echo "  [$i/$count] FETCH FAIL: $url" >&2
    fail=1
    continue
  fi
  got_sha=$(shasum -a 256 "$staging_path" | awk '{print $1}')
  if [ "$got_sha" != "$want_sha" ]; then
    echo "  [$i/$count] SHA MISMATCH on $pack_path (want $want_sha got $got_sha)" >&2
    fail=1
    continue
  fi
done < <(jq -r '.items[] | [.url, .sha256, .packPath, .mode, .projectionTarget] | @tsv' "$manifest_path")

if [ "$fail" -ne 0 ]; then
  echo "FATAL: one or more fetches/verifications failed. Refusing to write any local files." >&2
  exit 4
fi
echo "claude-bootstrap: all $count items fetched and verified"

# Phase 2: project into the operator machine.
i=0
while IFS=$'\t' read -r url want_sha pack_path mode target; do
  i=$((i+1))
  staging_path="${WORK_DIR}/staging/${pack_path}"
  abs_target="$(expand_target "$target")"
  if [ "$DRY_RUN" = "1" ]; then
    echo "  [$i/$count] DRY: $abs_target ($mode)"
    continue
  fi
  mkdir -p "$(dirname "$abs_target")"
  cp "$staging_path" "$abs_target"
  if [ "$mode" = "executable" ]; then
    chmod +x "$abs_target"
  fi
  echo "  [$i/$count] $abs_target"
done < <(jq -r '.items[] | [.url, .sha256, .packPath, .mode, .projectionTarget] | @tsv' "$manifest_path")

# State file so the operator (and future bootstraps) can audit what was applied.
state_dir="${HOME}/.agent-mullmania"
mkdir -p "$state_dir"
state_path="${state_dir}/claude-state.json"
if [ "$DRY_RUN" != "1" ]; then
  jq -n --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --arg url "$MANIFEST_URL" \
        --arg manifestSha "$(shasum -a 256 "$manifest_path" | awk '{print $1}')" \
        --argjson manifest "$(cat "$manifest_path")" \
        '{appliedAt: $ts, manifestUrl: $url, manifestSha256: $manifestSha, schemaVersion: $manifest.schemaVersion, totalItems: $manifest.totalItems, totals: $manifest.totals}' \
        > "$state_path"
  echo "claude-bootstrap: state recorded at $state_path"
fi

echo
echo "claude-bootstrap: DONE. Materialized $count items."
echo "External dependencies (NOT in this pack — must be present separately):"
jq -r '.externalDependencies[] | "  - \(.name): \(.bootstrapStep)"' "$manifest_path"
