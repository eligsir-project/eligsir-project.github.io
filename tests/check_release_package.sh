#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

required_files=(
  "assets/viewer/viewer.html"
  "assets/viewer/scenes/fr3.sog"
  "assets/viewer/scenes/kitchen1.sog"
  "assets/viewer/scenes/scannetpp.sog"
  "assets/viewer/scenes/room2.sog"
  "assets/viewer/scenes/office0.sog"
  "assets/viewer/LICENSE"
  "assets/video/eligsir-overview.mp4"
  "assets/video/eligsir-overview-720p.mp4"
  "assets/video/eligsir-overview-poster.webp"
  "assets/video/eligsir-overview.en.vtt"
  "assets/video/eligsir-overview.chapters.vtt"
  "assets/paper/eligsir-anonymous.pdf"
  "assets/paper-figures/fig1-teaser.webp"
  "assets/paper-figures/fig2-method.webp"
  "assets/paper-figures/fig3-psnr-vs-rtf.svg"
  "assets/paper-figures/fig4-cvq.svg"
  "assets/paper-figures/fig5-scheduling.svg"
  "assets/paper-figures/fig6-fidelity.svg"
  "assets/paper-figures/fig8-qualitative.webp"
  "assets/qualitative/fr3-1152-reference-rgb.webp"
  "assets/qualitative/fr3-1152-cartgs-rgb.webp"
  "assets/qualitative/fr3-1152-eligsir-rgb.webp"
  "assets/qualitative/fr3-1152-reference-depth.webp"
  "assets/qualitative/fr3-1152-cartgs-depth.webp"
  "assets/qualitative/fr3-1152-eligsir-depth.webp"
  "assets/qualitative/depth-colorbar-0.3-5m.webp"
  "assets/data/release.json"
  "assets/data/results.json"
  "data/comparisons.json"
  "app.js"
  "styles.css"
  "THIRD_PARTY.md"
)

for path in "${required_files[@]}"; do
  test -s "$path" || { echo "missing or empty release asset: $path" >&2; exit 1; }
done

python3 - <<'PY'
import json
import re
from pathlib import Path

release = json.loads(Path("assets/data/release.json").read_text())
assert release == {
    "release": "icra27-rc2",
    "core": "fa859ba3c37240d3dfdf79d4d65e8c9d47f00f4b",
    "ros2": "e4c3249752c9241887595eac05a0ca06d89be584",
    "rgbd_sync": "9a5930762806bd56af99c7176352e70c21733b91",
    "gsplat_rocm": "c6b363ab9239c958a4ac6619f725119dc8e5706b",
    "image_digests": {
        "core": {
            "cuda": "sha256:85283937f9571cd91dd78af80287baab25eaf1ee6d57da8b03c73e96f3294a58",
            "rocm": "sha256:bdf2da71a0fde621a3cb044be0728a9169b5f09126860fbe48f2f21fa14234f3",
        },
        "ros2": {
            "cuda": "sha256:a78fca70428ac395743faf5e823f53c32ab4829245b2216430abd4163dc17881",
            "rocm": "sha256:0953233f571afb31153322dd706d5d1883b24cf8b16ee5327619fe13bdca83c8",
        },
    },
}
for component in ("core", "ros2", "rgbd_sync", "gsplat_rocm"):
    value = release[component]
    assert isinstance(value, str) and re.fullmatch(r"[0-9a-f]{40}", value), component
for component in ("core", "ros2"):
    for platform in ("cuda", "rocm"):
        value = release["image_digests"][component][platform]
        assert re.fullmatch(r"sha256:[0-9a-f]{64}", value), f"{component}_{platform}"

assert not Path("data/results.json").exists(), "results.json must have one canonical location"
PY

test -f .gitignore && grep -qx '/graft/' .gitignore || {
  echo "missing /graft/ ignore rule" >&2
  exit 1
}

audit_output="$(python3 tools/audit_site.py)"
grep -q '"passed": true' <<<"$audit_output" || {
  echo "site audit did not report passed: true" >&2
  printf '%s\n' "$audit_output" >&2
  exit 1
}

if rg -n --hidden --glob '!\.git/**' \
  --glob '!tests/**' \
  'assets/(css|js|img|results)(/|\\.)|assets/video/README\.md' \
  .; then
  echo "references to obsolete placeholder assets remain" >&2
  exit 1
fi

nested_root="audit-nested-git-test-$$"
nested_marker="$nested_root/public/.git/marker.txt"
cleanup_nested() { rm -rf "$nested_root"; }
trap cleanup_nested EXIT
mkdir -p "$(dirname "$nested_marker")"
printf 'nested audit marker\n' > "$nested_marker"
set +e
nested_audit="$(python3 tools/audit_site.py 2>&1)"
nested_rc=$?
set -e
test "$nested_rc" -ne 0 || { echo "nested .git marker was not rejected" >&2; exit 1; }
grep -q "Unexpected private/development file: $nested_marker" <<<"$nested_audit" || {
  echo "nested .git marker rejection was not reported specifically" >&2
  printf '%s\n' "$nested_audit" >&2
  exit 1
}

echo "release package checks passed"
