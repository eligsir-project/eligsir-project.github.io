#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
workflow="$repo_root/.github/workflows/pages.yml"

test -s "$workflow" || {
  echo "missing Pages workflow" >&2
  exit 1
}

# Deploy only from main, with manual invocation also supported.
grep -Eq '^on:$' "$workflow"
grep -Eq '^  workflow_dispatch:$' "$workflow"
grep -Eq '^  push:$' "$workflow"
grep -Eq '^      - main$' "$workflow"
! grep -Eq '^  (pull_request|schedule):' "$workflow"
grep -Fq "'tests/**'" "$workflow"
grep -Fq "'tools/**'" "$workflow"

# Verify that the site gets audited before anything is deployed.
grep -Fq 'run: bash tests/check.sh' "$workflow"
grep -Eq '^permissions:$' "$workflow"
grep -Eq '^  contents: read$' "$workflow"
grep -Eq '^  pages: write$' "$workflow"
grep -Eq '^  id-token: write$' "$workflow"

for ref in \
  'actions/checkout@v4' \
  'actions/configure-pages@v5' \
  'actions/upload-pages-artifact@v3' \
  'actions/deploy-pages@v4'; do
  grep -Fq "$ref" "$workflow"
done

grep -Eq '^concurrency:$' "$workflow"
grep -Eq '^  cancel-in-progress: true$' "$workflow"
grep -Fq 'cp index.html styles.css app.js .nojekyll THIRD_PARTY.md "$staging_dir/"' "$workflow"
grep -Fq 'cp -R data/. "$staging_dir/data/"' "$workflow"
grep -Fq 'cp -R assets/. "$staging_dir/assets/"' "$workflow"
! grep -Eq 'path: \.($|[[:space:]])' "$workflow"

echo "Pages workflow checks passed"
