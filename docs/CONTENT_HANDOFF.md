# Content and asset handoff

## Deliberate evidence boundaries

The supplied assets support five real 3D map exports, a narrated overview video, a four-group qualitative comparison, and three measured result tables/charts (final paper Tables I–III, plus Figs. 1, 2, 4, 5, 6 and 8). They do not establish additional intermediate mapping snapshots beyond the refinement steps in Table II, or comparison assets beyond the supplied paper figures. The site distinguishes measured content from illustrative schematics visually and in its data manifests.

- **3D map exports:** each scene's `.sog` payload was extracted without changing its bytes; the parent does not load it until interaction. Scenes: `fr3` (TUM RGB-D fr3/long_office_household), `kitchen1` (Orbbec, real sensor), `scannetpp` (ScanNet++ 8b5caf3398), `room2` and `office0` (Replica). No PSNR numbers are shown in the viewer.
- **Overview video:** `assets/video/eligsir-overview.mp4` (1080p) with a 720p fallback, English captions and a chapter track. Chapter timestamps come from `assets/video/eligsir-overview.chapters.vtt`. Per-frame PSNR overlays baked into the video are illustrative for the shown frames only; the Results section carries the reported metrics.
- **Method illustrations:** the Map-Guided View Scheduling filmstrip uses real TUM RGB-D fr3 input frames (`assets/real/fr3-frame-a/b/c.webp`) and the paper's own microcell figure (`assets/paper-figures/fig5-scheduling.svg`) rather than an invented overlay. The Load-Adaptive Fidelity demo uses one real fr3 frame, box-downsampled to 1×, 1/2×, 1/4× and 1/8× (`assets/real/fidelity-*.webp`) and is labeled as showing controller behaviour illustratively. The Targeted Geometry Growth panel is a labeled schematic SVG, not a photographic asset.
- **Results — real-time factor:** `assets/data/results.json` `online.rows`, TUM fr3, GT and tracked poses. RTF = elapsed processing time / 87.14 s acquisition; 1× is real time.
- **Results — across scenes:** `assets/data/results.json` `scenes`, plus the two `online.rows` groups (GT/tracked poses) as the first two table groups. Some rows carry a `footnote` explaining a timing caveat (rendered as lettered footnotes below the table).
- **Results — refinement:** `assets/data/results.json` `refinement.rows`, TUM fr3, separate 4k/8k/16k runs on a 45-view split distinct from Table I.
- **Results — ablations:** `assets/data/results.json` `ablations.scenes` (Table III): TUM fr3, ScanNet++ and Orbbec kitchen1, each with the full method and two leave-one-mechanism-out variants.
- **Qualitative comparisons:** `data/comparisons.json` defines four groups — TUM fr3 view 1152 (vs. CaRtGS, RGB+depth with metrics), kitchen1 source 865 (vs. CaRtGS, RGB+depth with metrics), ScanNet views 48/2624/5872 and ScanNet++ views 8/5624/6752 (reference vs. EliGSiR only, RGB, no baseline and no numbers per the paper's presentation of those figures). Depth uses one shared metric range, 0.3–5.0 m, shown via `assets/qualitative/depth-colorbar-0.3-5m.webp`.
- **Caution:** the site states explicitly, near the Results section, that Table I, the refinement study and the ablations use separate runs and evaluation splits, so absolute PSNR values should not be compared across those blocks.

## Asset slots

| Slot | Current state |
| --- | --- |
| Hero / viewer poster | Real EliGSiR rendering of TUM fr3 from the overview video (`assets/real/hero-fr3-eligsir-render.webp`) |
| 3D viewer | Five real scene exports via `assets/viewer/viewer.html?scene=<id>` |
| Overview video | Real 1080p/720p MP4s with captions and chapters |
| Method illustrations | Real fr3 input frames, real downsampled-fidelity frames, the paper's own scheduling figure, and a labeled schematic SVG for geometry growth |
| Qualitative comparisons | Real paper Fig. 7/8 crops for four scene groups |
| Results (RTF / scenes / refinement / ablations) | Transcribed from the final paper's Tables I–III, not rerun |
| Paper & citation | Final anonymous PDF (`assets/paper/eligsir-anonymous.pdf`) and a BibTeX block |

## Replacing comparison data

Edit `data/comparisons.json`. Top-level `groups` describe each scene group (id, label, baseline label, available modes). Top-level `views` is a flat list; each view has a `group` field and a flat `images` map (`reference_rgb`, `baseline_rgb`, `eligsir_rgb`, and the `_depth` variants where depth is available). Optional `metrics.<mode>` gives the baseline/EliGSiR caption text shown on the wipe. Views without `metrics` (ScanNet, ScanNet++) render as reference-vs-EliGSiR only, matching the paper's presentation.

After editing manifests, run `python3 tools/update_data.py`. Use `python3 tools/audit_site.py` to verify required local assets and URL destinations; it also checks the release manifest and rejects a stale `data/content.js`.

## Browser behavior

Media never automatically trains or modifies the map. The heavy model and renderer load only when selected; the video uses `preload="none"`. The viewer uses an isolated iframe with local source/data and a same-origin message contract (`eligsir-viewer-ready` / `eligsir-viewer-error` / `eligsir-viewer-reset`, plus `requestFullscreen`/`exitFullscreen`). The page has no external runtime dependencies; repository and notice links are ordinary outbound links, and the three code-component cards are intentionally non-links, tagged "Released upon acceptance".

`prefers-reduced-motion` disables decorative movement. Explanatory states remain operable, and no continuous animation is required to read content. The static content, comparison defaults and numeric tables remain visible without JavaScript; enhanced controls require it.

## Release checks outside this ZIP

Validate public repository access, conference supplementary-material rules, organization/activity anonymity, author consent and dataset/media redistribution terms. Review any future image metadata, SVG editor paths, PDF properties and video metadata before copying them into `assets/`. This package does not publish or modify GitHub resources.

## Trajectory comparisons (TUM fr3 · vs CaRtGS / vs SplaTAM)

Frames come from the overview-video render pipeline. Every method's exported map is rendered along the same ground-truth training trajectory as the TUM reference frames, and per-frame PSNR is computed at 640×480 against the raw frames. These are observed views, not held-out views. They were selected for large, visible differences:
- **CaRtGS: frames 705, 2570, 280.** These have the largest gaps that survive a shift-compensated PSNR check, which rules out misregistration as the cause.
- **SplaTAM: frames 1065, 330, 1880.**

Averages over all frames are in Results (Table I). The paper's Fig. 1 held-out CaRtGS panels were not used, because their PSNR gap is mostly a small pose offset rather than a visible reconstruction difference.
