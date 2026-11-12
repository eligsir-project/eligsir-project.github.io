#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

bash tests/check_release_package.sh

if [[ -f tests/check_pages_workflow.sh ]]; then
  bash tests/check_pages_workflow.sh
fi
