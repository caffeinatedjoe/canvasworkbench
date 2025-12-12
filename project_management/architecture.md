# Web Application Architecture Overview

## Core Concepts

-   Pure client-side rendering using HTML, CSS, and vanilla JavaScript.
-   Infinite, pan-and-zoom workspace implemented with a transformable
    `<div>` container.
-   Images, drawings, and plots are all DOM elements (SVG or `<img>`),
    not canvas drawings.
-   Every object has a UUID for stable identity and dependency tracking.

## Rendering Model

-   **Main workspace**: a large `<div>` that holds all elements.
-   **Transforms**: panning and zooming applied via CSS
    `transform: translate() scale()`.
-   **No `<canvas>` required** except for sampling pixel data when
    needed.

## Elements

### Images

-   Added dynamically as `<image>` elements inside an SVG layer or as
    `<img>` tags.
-   Positioned absolutely within the workspace.
-   Rotated/scaled using SVG/DOM transforms.

### User Drawings

-   Implemented as SVG shapes (lines, paths, polygons).
-   Fully interactive: each element can receive event listeners.
-   SVG sits above images so sampling logic can read underlying pixels.

### Plots

-   Generated dynamically as standalone SVGs.
-   Treated like any other draggable/movable element in the workspace.

## Interaction System

-   **Panning**: right‑click + drag → update workspace transform.
-   **Zooming**: mouse wheel → adjust scale transform.
-   **Selection**: click selects an object via event listeners.
-   **Dragging**: mousedown/move updates element transforms.

## Intensity Sampling

1.  User selects a line.
2.  Convert the line's coordinates into image coordinate space.
3.  For each sample point:
    -   Use an offscreen `<canvas>` to call `getImageData`.
4.  Compute intensity profile.
5.  Generate new plot SVG.

## Reactive Dependency System

-   Each element has a UUID and a list of dependent UUIDs.
-   When an element changes, the system:
    1.  Builds a dependency graph of visible elements.
    2.  Topologically sorts the graph.
    3.  Recomputes affected plots in order.

## UUID Generation

-   Simple UUID v4 in vanilla JS:

    ``` js
    function uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    ```

## Development Flow Starter

-   Begin by implementing:
    1.  Workspace `<div>` with pan/zoom transforms.
    2.  SVG overlay system.
    3.  Dynamic image insertion.
    4.  Line drawing tools.
    5.  Pixel sampling pipeline.
    6.  Plot generation as SVG.
    7.  Dependency graph updater.

This file is intended for use as the initial guiding document for
agentic development workflows.
