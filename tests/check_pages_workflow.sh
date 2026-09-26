#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
workflow="$repo_root/.github/workflows/pages.yml"

test -s "$workflow" || {
  echo "missing or empty Pages workflow: .github/workflows/pages.yml" >&2
  exit 1
}

grep -Eq '^on:' "$workflow"
grep -Eq '^  workflow_dispatch:' "$workflow"
if grep -Eq '^  (push|pull_request|schedule):' "$workflow"; then
  echo "Pages workflow must not declare automatic triggers" >&2
  exit 1
fi

grep -Eq '^permissions:' "$workflow"
grep -Eq '^  contents: read$' "$workflow"
grep -Eq '^  pages: write$' "$workflow"
grep -Eq '^  id-token: write$' "$workflow"

grep -Eq 'actions/checkout@v4([[:space:]]|$)' "$workflow"
grep -Eq 'actions/configure-pages@v5([[:space:]]|$)' "$workflow"
grep -Eq 'actions/upload-pages-artifact@v3([[:space:]]|$)' "$workflow"
grep -Eq 'actions/deploy-pages@v4([[:space:]]|$)' "$workflow"

grep -Eq '^concurrency:' "$workflow"
grep -Eq '^  cancel-in-progress: true$' "$workflow"
grep -Eq '^    environment:' "$workflow"
grep -Eq '^      name: github-pages$' "$workflow"
grep -Eq '^      url: \$\{\{ steps.deployment.outputs.page_url \}\}$' "$workflow"

grep -Eq 'staging_dir=' "$workflow"
grep -Eq 'mkdir -p "\$staging_dir/data" "\$staging_dir/assets"' "$workflow"
grep -Eq 'cp index\.html styles\.css app\.js \.nojekyll THIRD_PARTY\.md "\$staging_dir/"' "$workflow"
grep -Eq 'cp -R data/\. "\$staging_dir/data/"' "$workflow"
grep -Eq 'cp -R assets/\. "\$staging_dir/assets/"' "$workflow"
grep -Eq 'path: \$\{\{ steps\.stage\.outputs\.path \}\}' "$workflow"
! grep -Eq 'path: \.($|[[:space:]])' "$workflow"
! grep -Eq 'cp .*(README|tests|graft|\.github)' "$workflow"

echo "Pages workflow checks passed"
