#!/usr/bin/env bash
set -euo pipefail

# Lightweight, repo-local checks for common copy/paste breaking typos.
# This complements book-formatter QA checks (unicode/textlint/link/layout/structure).

scan_dir="${1:-docs}"

fail=0

check() {
  local pattern="$1"
  local label="$2"
  if rg -n -P -- "$pattern" "$scan_dir" >/dev/null; then
    echo "::error::Found forbidden pattern: ${label}"
    rg -n -P -- "$pattern" "$scan_dir" | head -n 50
    fail=1
  fi
}

# Missing pipe symbol in Japanese explanation (e.g., "パイプ（ ）").
check 'パイプ（\s*）' 'Missing pipe symbol in パイプ（|）'

# Python format spec typo: ":.2 f" (space).
check ':\.2\s+f' 'Python format spec contains a space (:.2 f)'

# Rootfs download should use HTTPS.
check 'http://dl-cdn\.alpinelinux\.org/' 'Alpine rootfs URL should use https'

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "docs sanity check: OK"

