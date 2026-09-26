#!/usr/bin/env python3
"""Refresh the browser's local data bundle after editing the JSON manifests."""
from pathlib import Path
import hashlib
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]

OLD_MANIFEST_NOTES = {}


def _fmt(value, decimals):
    """Match app.js's fmt(): toLocaleString('en-US', {min,max: decimals})."""
    return f'{float(value):,.{decimals}f}'


def _pose_group_label(row):
    return 'GT mapping poses' if row.get('poses') == 'gt' else 'Tracked poses (' + row.get('tracker', '') + ')'


def _scenes_table_html(results):
    rows_html = []
    footnotes = []

    def footnote_letter(text):
        if text not in footnotes:
            footnotes.append(text)
        return chr(97 + footnotes.index(text))

    def add_group(label, rows):
        rows_html.append(
            '<tr class="table-group-row"><th colspan="6" scope="colgroup">' + html.escape(label) + '</th></tr>'
        )
        if not rows:
            return
        best_psnr = max(r['psnr_db'] for r in rows)
        for row in rows:
            tr_class = ' class="eligsir-row"' if row.get('method') == 'EliGSiR' else ''
            seconds = row.get('seconds', row.get('total_seconds'))
            time_cell = _fmt(seconds, 1)
            if row.get('footnote'):
                time_cell += ' [' + footnote_letter(row['footnote']) + ']'
            psnr_class = ' class="best-psnr"' if len(rows) > 1 and row['psnr_db'] == best_psnr else ''
            rows_html.append(
                '<tr' + tr_class + '>'
                '<th scope="row">' + html.escape(row['method']) + '</th>'
                '<td>' + html.escape(row['map_state']) + '</td>'
                '<td' + psnr_class + '>' + _fmt(row['psnr_db'], 2) + ' dB</td>'
                '<td>' + _fmt(row['ssim'], 3) + '</td>'
                '<td>' + _fmt(row['lpips'], 3) + '</td>'
                '<td>' + time_cell + '</td>'
                '</tr>'
            )

    add_group('TUM fr3 · GT poses', [r for r in results['online']['rows'] if r.get('poses') == 'gt'])
    add_group('TUM fr3 · tracked poses', [r for r in results['online']['rows'] if r.get('poses') == 'tracked'])
    for scene in results['scenes']:
        add_group(scene['scene'], scene['rows'])

    table = (
        '<table><caption>Across scenes · final paper Table I</caption>'
        '<thead><tr><th scope="col">Method</th><th scope="col">Map state</th><th scope="col">PSNR &uarr;</th>'
        '<th scope="col">SSIM &uarr;</th><th scope="col">LPIPS &darr;</th><th scope="col">Time [s]</th></tr></thead>'
        '<tbody>' + ''.join(rows_html) + '</tbody></table>'
    )
    footnotes_html = ''
    if footnotes:
        items = ''.join('<li>' + html.escape(text) + '</li>' for text in footnotes)
        footnotes_html = '<ol class="table-footnotes caption">' + items + '</ol>'
    return '<noscript>' + table + footnotes_html + '</noscript>'


def _refinement_table_html(results):
    rows_html = []
    for row in results['refinement']['rows']:
        rows_html.append(
            '<tr><th scope="row">' + html.escape(row['stage']) + '</th>'
            '<td>' + html.escape(str(row['updates'])) + '</td>'
            '<td>' + _fmt(row['psnr_db'], 2) + ' dB</td>'
            '<td>' + _fmt(row['ssim'], 3) + '</td>'
            '<td>' + _fmt(row['lpips'], 3) + '</td>'
            '<td>' + _fmt(row['depth_rmse_m'], 3) + ' m</td>'
            '<td>' + _fmt(row['gaussians_k'], 1) + '</td>'
            '<td>' + _fmt(row['total_seconds'], 1) + '</td>'
            '</tr>'
        )
    table = (
        '<table><caption>Continued refinement · TUM RGB-D fr3/long_office_household</caption>'
        '<thead><tr><th scope="col">Map state</th><th scope="col">Updates</th><th scope="col">PSNR</th>'
        '<th scope="col">SSIM</th><th scope="col">LPIPS</th><th scope="col">Depth RMSE</th>'
        '<th scope="col">Gaussians k</th><th scope="col">Total time s</th></tr></thead>'
        '<tbody>' + ''.join(rows_html) + '</tbody></table>'
    )
    return '<noscript>' + table + '</noscript>'


def _ablations_table_html(results):
    rows_html = []
    for scene in results['ablations']['scenes']:
        rows_html.append(
            '<tr class="table-group-row"><th colspan="6" scope="colgroup">' + html.escape(scene['scene']) + '</th></tr>'
        )
        for row in scene['rows']:
            tr_class = ' class="eligsir-row"' if row.get('variant') == 'EliGSiR' else ''
            rows_html.append(
                '<tr' + tr_class + '>'
                '<th scope="row">' + html.escape(row['variant']) + '</th>'
                '<td>' + _fmt(row['psnr_db'], 2) + ' dB</td>'
                '<td>' + _fmt(row['cvq_auc_db'], 2) + ' dB</td>'
                '<td>' + _fmt(row['cuc20_pct'], 1) + '</td>'
                '<td>' + _fmt(row['supervised_mpix'], 1) + '</td>'
                '<td>' + _fmt(row['gaussians_k'], 1) + '</td>'
                '</tr>'
            )
    table = (
        '<table><caption>Component ablations · final paper Table III</caption>'
        '<thead><tr><th scope="col">Variant</th><th scope="col">PSNR &uarr;</th><th scope="col">CVQ-AUC &uarr;</th>'
        '<th scope="col">CUC@20 &uarr; [%]</th><th scope="col">Sup. px [M] &darr;</th><th scope="col">Gaussians [k]</th></tr></thead>'
        '<tbody>' + ''.join(rows_html) + '</tbody></table>'
    )
    return '<noscript>' + table + '</noscript>'


def _rtf_chart_html():
    return (
        '<noscript><img src="assets/paper-figures/fig3-psnr-vs-rtf.svg" '
        'alt="Paper Fig. 3: held-out PSNR versus real-time factor on TUM fr3" '
        'width="730" height="320" loading="lazy"></noscript>'
    )


def _splice_markers(text, name, fragment):
    open_marker = f'<!-- static:{name} -->'
    close_marker = f'<!-- /static:{name} -->'
    pattern = re.compile(re.escape(open_marker) + r'.*?' + re.escape(close_marker), re.DOTALL)
    replacement = open_marker + '\n' + fragment + '\n' + close_marker
    new_text, count = pattern.subn(lambda _m: replacement, text, count=1)
    if count != 1:
        raise SystemExit(f'Marker pair static:{name} not found in index.html')
    return new_text


def update_static_fragments(results):
    """Regenerate the no-JS static HTML fragments between marker comments in index.html.

    Idempotent: running this twice in a row produces byte-identical output,
    since each run fully replaces the content strictly between each marker pair.
    """
    index_path = ROOT / 'index.html'
    text = index_path.read_text()
    text = _splice_markers(text, 'rtf-chart', _rtf_chart_html())
    text = _splice_markers(text, 'scenes-table', _scenes_table_html(results))
    text = _splice_markers(text, 'refinement-table', _refinement_table_html(results))
    text = _splice_markers(text, 'ablations-table', _ablations_table_html(results))
    index_path.write_text(text)


def _viewer_scene_bytes():
    scenes_dir = ROOT / 'assets/viewer/scenes'
    viewer_html = ROOT / 'assets/viewer/viewer.html'
    if not viewer_html.is_file():
        # Viewer worker has not published viewer.html yet; fall back gracefully
        # so this script still runs. Re-run once assets/viewer/viewer.html exists.
        viewer_html = ROOT / 'assets/viewer/office.html'
    sizes = {}
    if scenes_dir.is_dir() and viewer_html.is_file():
        html_bytes = viewer_html.stat().st_size
        for scene_file in sorted(scenes_dir.glob('*.sog')):
            sizes[scene_file.stem] = html_bytes + scene_file.stat().st_size
    return sizes


def _asset_manifest():
    old = {}
    manifest_path = ROOT / 'data/asset-manifest.json'
    if manifest_path.is_file():
        try:
            for entry in json.loads(manifest_path.read_text()).get('assets', []):
                old[entry['path']] = entry
        except (ValueError, KeyError):
            pass
    entries = []
    for path in sorted(ROOT.rglob('assets/**/*')):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT).as_posix()
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        prior = old.get(rel, {})
        entries.append({
            'path': rel,
            'role': prior.get('role', 'Website media'),
            'notes': prior.get('notes', 'Local supplied or derived website asset; no external loading.'),
            'bytes': path.stat().st_size,
            'sha256': digest,
        })
    return {'schema_version': 1, 'assets': entries}


def main():
    try:
        content = {
            'release': json.loads((ROOT / 'assets/data/release.json').read_text()),
            'results': json.loads((ROOT / 'assets/data/results.json').read_text()),
            'comparisons': json.loads((ROOT / 'data/comparisons.json').read_text()),
            'viewer': {'scenes': _viewer_scene_bytes()},
        }
        text = '/* Local data: generated from assets/data/release.json, assets/data/results.json and data/comparisons.json. */\nwindow.ELIGSIR_CONTENT = ' + json.dumps(content, indent=2) + ';\n'
        (ROOT / 'data/content.js').write_text(text)
        (ROOT / 'data/asset-manifest.json').write_text(json.dumps(_asset_manifest(), indent=2) + '\n')
        update_static_fragments(content['results'])
    except (OSError, ValueError) as error:
        raise SystemExit(f'Data bundle could not be regenerated: {error}') from error
    print('Updated data/content.js, data/asset-manifest.json and index.html static fragments')


if __name__ == '__main__':
    main()
