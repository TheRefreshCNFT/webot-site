#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
node scripts/verify-owned-runtime-process-clean.mjs
node scripts/test-itinerary-flow.mjs "$@"
