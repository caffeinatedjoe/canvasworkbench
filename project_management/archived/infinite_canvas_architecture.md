# Hybrid Infinite-Canvas Architecture (SVG + Canvas)

This document outlines a practical, high-performance architecture for
building an infinite-canvas web application using **SVG for vector
interaction** and **Canvas for raster operations**, similar to how tools
like draw.io, Figma, and scientific imaging apps structure their
rendering pipeline.

------------------------------------------------------------------------

## 1. Overview

The system consists of:

-   **A clipped viewport container**
-   **A raster layer** (HTML `<canvas>`) for images and pixel-level
    operations
-   **A vector layer** (SVG) for user-drawn shapes, interactions, and UI
    tools
-   **A shared camera transform** to synchronize panning and zooming
    across layers

This hybrid model combines the strengths of both technologies: -
Infinite, crisp vector graphics via SVG - Fast raster processing via
Canvas - Native event handling and DOM-based interactivity

------------------------------------------------------------------------

## 2. Layer Structure

    <div class="viewport">
      <canvas id="rasterLayer"></canvas>
      <svg id="vectorLayer">
        <g id="world"></g>
      </svg>
    </div>

### Viewport Container

-   Fixed size (usually full window)
-   `overflow: hidden` for clipping
-   Handles pointer events for pan/zoom

### Canvas Layer (Raster)

-   Stores images, heatmaps, pixel data
-   Redrawn on every pan/zoom
-   Ideal for sampling intensity values along paths

### SVG Layer (Vector)

-   Contains all user-drawn shapes (paths, rectangles, points,
    annotations)
-   `<g id="world">` holds world-space content
-   All shape nodes support:
    -   event listeners
    -   CSS styling
    -   transform inheritance

------------------------------------------------------------------------

## 3. Camera Model

Maintain a virtual camera:

``` js
let offsetX = 0;
let offsetY = 0;
let scale = 1;
```

### Applying the transform (SVG)

``` js
world.setAttribute(
  "transform",
  `translate(${offsetX}, ${offsetY}) scale(${scale})`
);
```

### Applying the transform (Canvas)

``` js
ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
```

### Pan and Zoom Behavior

-   Panning updates `offsetX` and `offsetY`
-   Zooming updates `scale`, typically around the cursor anchor point
-   Both layers are redrawn or re-transformed in sync

------------------------------------------------------------------------

## 4. Rendering Pipeline

### SVG Rendering

-   Automatic; browser handles redraw when attributes or transforms
    change
-   Vector shapes remain crisp at any zoom level
-   Hit-testing is native (`pointerdown` on shapes)

### Canvas Rendering

Typical redraw cycle: 1. `ctx.setTransform(...)` 2. Clear the canvas 3.
Redraw images and raster content 4. Optionally draw cached tiles for
very large images

Canvas must be redrawn on every camera movement, but SVG does not.

------------------------------------------------------------------------

## 5. Interaction Model

### Vector Interaction (SVG)

-   Shapes are real DOM nodes
-   Directly attach pointer listeners
-   Easy selection, hover, drag handles, snapping

### UI Overlays (HTML)

-   For menus, toolbars, text editors, resize handles
-   Positioned with world → screen coordinate transforms
-   Not affected by world zoom (screen-space UI)

### Pointer → World Coordinate Conversion

``` js
const inv = svg.getScreenCTM().inverse();
const pt = svg.createSVGPoint();
pt.x = event.clientX;
pt.y = event.clientY;
const worldPoint = pt.matrixTransform(inv);
```

------------------------------------------------------------------------

## 6. Why This Architecture

### Advantages

-   **Infinite coordinate space** (from SVG)
-   **High-performance raster operations** (via Canvas)
-   **Crisp scaling at all zoom levels**
-   **Native events on shapes**
-   **Simple DOM-based interaction**
-   **Easier tools implementation** (selection boxes, measurement paths,
    etc.)

### Why Not Wrap Everything in Canvas

-   Canvas can't contain DOM/SVG elements
-   You lose vector fidelity, events, and styling
-   Hit-testing becomes manual and slow
-   Infinite coordinate support must be re-implemented manually

------------------------------------------------------------------------

## 7. Example Use Cases

-   Image measurement tools (like ImageJ)
-   Vector drawing editors
-   Infinite whiteboards
-   Mixed vector-raster scientific visualization
-   Diagramming tools (draw.io-style)
-   Applications that require pixel sampling **and** vector annotation

------------------------------------------------------------------------

## 8. Summary

This hybrid Canvas + SVG architecture is optimal when you need:

-   **Infinite-canvas behavior**
-   **High-quality vector interaction**
-   **Pixel-level analysis or raster work**

The Canvas handles raster content. The SVG handles vector elements. A
shared camera transform keeps both in sync.

This approach is battle-tested, scalable, and aligns with the
architecture used by modern professional editors.
