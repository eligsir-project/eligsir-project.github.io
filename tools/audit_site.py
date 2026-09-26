#!/usr/bin/env python3
"""Audit site links and public metadata. Optional private denylist stays external."""
from __future__ import annotations
import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
ROOT = Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []; self.ids = set(); self.authors = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        for key in ['src','href','poster','data-lightbox']:
            if a.get(key): self.refs.append((tag,key,a[key]))
        if tag == 'meta' and a.get('name','').lower() == 'author': self.authors.append(a.get('content',''))
def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--denylist', type=Path, help='External UTF-8 file with one private/legacy identifier per line. Never copy it into the site.')
    args = parser.parse_args()
    errors = []; external = []; checked = 0
    deny = []
    if args.denylist:
        try: deny = [s.strip().lower() for s in args.denylist.read_text().splitlines() if s.strip() and not s.startswith('#')]
        except OSError as e: parser.error(str(e))
    for p in ROOT.rglob('*'):
        if not p.is_file(): continue
        rel = p.relative_to(ROOT).as_posix()
        parts = p.relative_to(ROOT).parts
        if parts[0] == '.git': continue
        if '.git' in parts: errors.append(f'Unexpected private/development file: {rel}')
        if p.suffix in {'.pem','.key','.env'}: errors.append(f'Unexpected private/development file: {rel}')
        if p.is_symlink(): errors.append(f'Symlink: {rel}')
        size_limit = 60_000_000 if rel.startswith('assets/video/') or rel.startswith('assets/viewer/scenes/') else 10_000_000
        if p.stat().st_size > size_limit: errors.append(f'File exceeds {size_limit // 1_000_000} MB: {rel}')
        if any(word in rel.lower() for word in deny): errors.append(f'Denylist matched filename: {rel}')
        if p.suffix in {'.html','.js','.css','.json','.svg','.md','.py','.txt'}:
            text = p.read_text(encoding='utf-8')
            if any(word in text.lower() for word in deny): errors.append(f'Denylist matched text: {rel}')
        if p.suffix == '.html':
            doc = Links(); doc.feed(p.read_text())
            if doc.authors: errors.append(f'Author metadata requires review: {rel}')
            for tag,key,url in doc.refs:
                parsed = urlparse(url)
                if parsed.scheme in {'data','blob','mailto','javascript'}: continue
                if parsed.scheme in {'http','https'} or url.startswith('//'):
                    external.append({'file':rel,'kind':key,'url':url}); continue
                if not parsed.path:
                    if parsed.fragment and parsed.fragment not in doc.ids: errors.append(f'Missing anchor {url} in {rel}')
                    continue
                dest = p.parent / unquote(parsed.path)
                checked += 1
                if not dest.exists(): errors.append(f'Missing local resource {url} in {rel}')
        if p.suffix == '.svg':
            try: svg = ET.fromstring(p.read_text())
            except ET.ParseError as e: errors.append(f'Invalid SVG {rel}: {e}'); continue
            for el in svg.iter():
                for key,value in el.attrib.items():
                    if key.endswith('export-filename') or key.endswith('absref'): errors.append(f'Editor path metadata: {rel}')
                    if key.endswith('href') and value and not value.startswith(('data:','#')):
                        if urlparse(value).scheme: errors.append(f'External SVG asset: {rel}')
                        elif not (p.parent/value).exists(): errors.append(f'Missing SVG dependency: {rel}')
    try:
        comparisons = json.loads((ROOT/'data/comparisons.json').read_text())
        results = json.loads((ROOT/'assets/data/results.json').read_text())
        release = json.loads((ROOT/'assets/data/release.json').read_text())
    except (OSError, ValueError) as error:
        errors.append(f'Data manifest could not be loaded: {error}')
        comparisons = {'views': []}
        results = {}
        release = {}
    expected_release = {
        'release': 'icra27-rc2',
        'core': 'fa859ba3c37240d3dfdf79d4d65e8c9d47f00f4b',
        'ros2': 'e4c3249752c9241887595eac05a0ca06d89be584',
        'rgbd_sync': '9a5930762806bd56af99c7176352e70c21733b91',
        'gsplat_rocm': 'c6b363ab9239c958a4ac6619f725119dc8e5706b',
        'image_digests': {
            'core': {
                'cuda': 'sha256:85283937f9571cd91dd78af80287baab25eaf1ee6d57da8b03c73e96f3294a58',
                'rocm': 'sha256:bdf2da71a0fde621a3cb044be0728a9169b5f09126860fbe48f2f21fa14234f3',
            },
            'ros2': {
                'cuda': 'sha256:a78fca70428ac395743faf5e823f53c32ab4829245b2216430abd4163dc17881',
                'rocm': 'sha256:0953233f571afb31153322dd706d5d1883b24cf8b16ee5327619fe13bdca83c8',
            },
        },
    }
    if release != expected_release:
        errors.append('Release manifest does not match the frozen icra27-rc2 revisions')
    for component in ('core', 'ros2', 'rgbd_sync', 'gsplat_rocm'):
        value = release.get(component)
        if not isinstance(value, str) or not re.fullmatch(r'[0-9a-f]{40}', value):
            errors.append(f'Release manifest field {component} must be a 40-character lowercase commit SHA')
    for component in ('core', 'ros2'):
        for platform in ('cuda', 'rocm'):
            value = release.get('image_digests', {}).get(component, {}).get(platform)
            if not isinstance(value, str) or not re.fullmatch(r'sha256:[0-9a-f]{64}', value):
                errors.append(f'Release manifest image digest {component}/{platform} must be a sha256 digest')
    if (ROOT/'data/results.json').exists():
        errors.append('Duplicate result manifest remains at data/results.json')
    for view in comparisons['views']:
        for rel in view['images'].values():
            checked += 1
            if not (ROOT/rel).is_file(): errors.append(f'Missing comparison image: {rel}')
    try:
        embedded = (ROOT/'data/content.js').read_text().split('window.ELIGSIR_CONTENT = ',1)[1].rstrip().removesuffix(';')
        data = json.loads(embedded)
    except (OSError, IndexError, ValueError) as error:
        errors.append(f'Generated data bundle could not be loaded: {error}')
        data = {}
    if data.get('release') != release: errors.append('Release data bundle is stale; run tools/update_data.py')
    if data.get('results') != results: errors.append('Result data bundle is stale; run tools/update_data.py')
    if data.get('comparisons') != comparisons: errors.append('Comparison data bundle is stale; run tools/update_data.py')
    for link in external:
        if link['kind'] in {'src','poster'}: errors.append(f'External runtime resource: {link["file"]} {link["url"]}')
    result = {'passed':not errors,'local_references_checked':checked,'external_navigation_links':external,'external_denylist_supplied':bool(deny),'errors':errors}
    print(json.dumps(result,indent=2))
    return 0 if not errors else 1
if __name__ == '__main__':
    sys.exit(main())
