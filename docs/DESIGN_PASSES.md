# Review passes (final-paper release)

The page was rebuilt on the final anonymous ICRA 2027 manuscript and then reviewed in five passes. Browser checks used headless Chrome with GPU WebGL2 (real Gaussian rendering), at 1440 px desktop, 390 px mobile and 320 px widths.

1. **Function and layout.** Every `href`/`src` fetched (no 4xx), no console errors, no broken images, no horizontal overflow. Figure frames hug their images, per-scene viewer posters are real renders of the shipped maps, comparison panels keep their native aspect ratio, and the RTF chart labels do not overlap.
2. **Paper accuracy.** Every number, caption and claim was checked against the manuscript source (Tables I–III, Figs. 3–8, abstract). RTF values are recomputed as time / 87.14 s. Framing follows the paper: blocks are not compared across tables, and the live demo is not called real time.
3. **Interaction.** An automated script exercises video chapters, 720p switch, scene picker, viewer load/switch/reset/unload, method tabs, fidelity slider, growth states, result tabs, chart points, refinement stages, comparison groups/modes/views/wipe/side-by-side, every lightbox with Escape, BibTeX copy, scope details and mobile navigation (63 checks).
4. **Accessibility and robustness.** axe-core reports 0 violations with reduced motion on desktop and mobile. There are visible focus styles for all controls including chart points, and keyboard access to scrollable tables. Static `<noscript>` result tables are generated from `assets/data/results.json`.
5. **Release.** Shipped files, media metadata, decompressed PDF streams and all git blobs were scanned for names, affiliations and local paths. All images come from the paper, the overview video, public datasets or renders of the shipped maps.
