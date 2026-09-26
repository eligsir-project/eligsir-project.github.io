# EliGSiR project website

A complete, self-hosted static research page for the anonymous ICRA 2027 submission. No build system, npm installation, analytics, externally loaded fonts or content delivery network is required. The 3D map exports are actual supplied Gaussian scenes, not generated mockups.

## Preview

From this directory:

```sh
python3 serve.py
```

Open `http://127.0.0.1:8000` in a browser. The preview server binds to your own machine and supports byte-range video requests. (`python3 -m http.server` also works, but cannot seek within the video.)

The page requires HTTP serving for the 3D scenes. Opening `index.html` as a local file is not the full preview workflow. Stop the server with Ctrl+C.

## What is implemented

- Responsive editorial layout with the supplied Alexandrite SVG wordmark, system typography and a light research-page palette.
- A six-minute narrated overview video with captions, a chapter list and a smaller 720p source for constrained devices.
- A large, central, click-to-load 3D viewer with a scene picker across five real map exports (TUM fr3, Orbbec kitchen1, ScanNet++, Replica room2 and Replica office0). Orbit, pan, zoom, reset, fullscreen, unload and a browser-failure fallback are wired.
- Interactive method tabs for the paper's three mechanisms — Map-Guided View Scheduling, Load-Adaptive Fidelity and Targeted Geometry Growth — illustrated with real TUM fr3 input frames and the paper's own scheduling figure. These are labeled explanatory schematics, not experimental telemetry.
- Measured results: a real-time-factor scatter chart, an across-scenes accessible table, and a continued-refinement panel, all sourced from `assets/data/results.json` (the final paper's Tables I–III).
- A "during mapping" section with the paper's CVQ/CUC regional-quality figures and the component-ablation table.
- A qualitative comparison ("Look Closer") across four scene groups with an RGB/Depth wipe, side-by-side toggle, and a shared metric depth colorbar.
- A paper card (PDF + BibTeX with a copy button) and three non-linked code-component cards tagged "Released upon acceptance".
- Mobile navigation, keyboard-operable tabs and controls, reduced-motion support, accessible tables and Escape-to-close dialogs.

## Edit

| File | Purpose |
| --- | --- |
| `index.html` | Sections, editorial copy and accessible structure |
| `styles.css` | Design tokens, layouts, breakpoints and motion |
| `app.js` | Interactions; no framework |
| `assets/data/results.json` | Exact numeric endpoints, protocol notes and captions (final paper Tables I–III) |
| `assets/data/release.json` | RC2 release name and pinned source revisions |
| `data/comparisons.json` | Qualitative comparison groups, views, image paths and metrics |
| `data/content.js` | Browser data generated from the release, results and comparison JSON manifests |
| `data/asset-manifest.json` | Shipped media inventory, integrity hashes and usage notes |
| `assets/viewer/viewer.html` | Bundled viewer runtime, reads `?scene=<id>` |
| `assets/viewer/scenes/<id>.sog` | Extracted Gaussian-scene payloads, one per scene |
| `docs/CONTENT_HANDOFF.md` | Source caveats and replacement contracts |

After editing the JSON data, regenerate the browser bundle:

```sh
python3 tools/update_data.py
python3 tools/audit_site.py
```

`tools/update_data.py` also regenerates `data/asset-manifest.json` by walking `assets/` and hashing every file.

## Publication boundary

No Git history, credentials, private author metadata, original source archives or original-name assets are included. Public filenames are neutral and use the current project identity. Third-party notices are retained.

Deployment runs only through the manual `Deploy static site to GitHub Pages` workflow.

For static hosting, upload `index.html`, `styles.css`, `app.js`, `data/`, `assets/`, `.nojekyll` and `THIRD_PARTY.md`. `serve.py`, `tools/` and `docs/` are authoring/support files and are not deployed; the Pages workflow copies only the files listed above.

## Deliberately not claimed

Table I, the refinement study and the ablations in `assets/data/results.json` use separate runs and evaluation splits; absolute PSNR values should not be compared across these blocks. The interactive method tabs are explanatory schematics — they illustrate the mechanisms, not measured priority weights, timings or error reductions. The overview video's per-frame PSNR overlays are illustrative for the shown frames only; reported metrics live in the Results section. Qualitative comparison panels are from the paper's Figs. 7 and 8, matched viewpoints; native image resolutions differ across roles (reference/baseline/EliGSiR) and depth uses one shared metric range (0.3–5.0 m) where available.

## Rights

See `THIRD_PARTY.md` and `assets/viewer/LICENSE`. Scene/media rights and the final publication license remain the project owner's responsibility; this bundle does not relicense supplied research assets.
