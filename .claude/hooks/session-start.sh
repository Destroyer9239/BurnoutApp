#!/bin/bash
# SessionStart hook for the Burnout Tracker.
# Installs Node deps so tsc, eslint, and Next.js dev/build run immediately
# in Claude Code on the web sessions.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

if [ ! -f package.json ]; then
  echo "no package.json yet — skipping install" >&2
  exit 0
fi

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || npm install -g pnpm@9 >/dev/null 2>&1 || true
fi

if command -v pnpm >/dev/null 2>&1; then
  pnpm install --prefer-offline --reporter=silent
else
  npm install --no-audit --no-fund --loglevel=error
fi
