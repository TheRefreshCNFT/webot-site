#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
node scripts/validate-paid-ads.mjs
