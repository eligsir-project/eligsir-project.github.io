#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

tests/check_release_package.sh

if [[ -x tests/check_pages_workflow.sh ]]; then
  tests/check_pages_workflow.sh
fi
