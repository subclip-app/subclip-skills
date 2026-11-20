#!/usr/bin/env bash
# Publishes @subclip/skills. Run by the owner: ./scripts/publish.sh [--dry-run]
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE="../subclip-web/.env"
NPM_TOKEN="$(grep -E '^NPM_TOKEN=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d "\"'")"
[ -n "$NPM_TOKEN" ] || { echo "NPM_TOKEN missing in $ENV_FILE"; exit 1; }
export NPM_TOKEN
exec npm publish --access public "$@"
