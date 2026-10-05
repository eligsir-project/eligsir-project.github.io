# Third-party notices

## SuperSplat Viewer and PlayCanvas Engine

The self-hosted viewer is derived from the user-supplied SuperSplat Viewer HTML export. Its runtime reports SuperSplat Viewer 1.31.2 and PlayCanvas Engine 2.22.1. The original bundled engine and renderer are retained rather than replaced by a different package version.

Copyright (c) 2011-2026 PlayCanvas Ltd. Distributed under the MIT license. The complete notice is in `assets/viewer/LICENSE`.

Upstream references:
- https://github.com/playcanvas/supersplat-viewer
- https://github.com/playcanvas/engine
- https://developer.playcanvas.com/user-manual/supersplat/viewer/self-hosting/

Changes in this package: neutral page title; extracted the embedded model into a same-origin `.sog` file; paused initial orbit view; adjusted initial field of view; disabled optional XR initialization and its network profile path; added same-origin ready/error/reset messaging; added a same-origin content security policy. No Gaussian geometry or appearance data was changed.

Third-party comments and references inside the bundled viewer are preserved. Names in upstream technical references are not project-author attribution.

## Datasets and derived maps

Imagery, renders and Gaussian maps shown on this page are derived from the following datasets: TUM RGB-D, Replica, ScanNet and ScanNet++, plus real-sensor Orbbec recordings captured for this work. Their images and any maps derived from them remain subject to the respective dataset licences; this document does not declare a new license for that media. The numeric endpoints shown are transcribed from the supplied anonymous manuscript.

## Page shell

The HTML, CSS, JavaScript, local preview server, data manifests and maintenance utilities were authored for this website package. A final project-wide distribution license should be set by the project owner. No standalone font files or external font services are included.

## AMD logo

`assets/brand/amd-logo.svg` is the unmodified white AMD logo supplied by [AMD](https://www.amd.com/content/dam/code/images/header/amd-header-logo.svg). It accompanies the AMD University Program support acknowledgment. The AMD name and logo remain the property of Advanced Micro Devices, Inc.; this page does not relicense them.
