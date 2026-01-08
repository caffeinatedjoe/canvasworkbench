# Program Architecture: Div Workbench

## Overview
Div Workbench is an infinite canvas application that allows users to pan and zoom through a 2D space containing both vector and raster graphics. The application uses HTML, CSS, and JavaScript to create a viewport that supports camera controls, enabling navigation through an unbounded drawing area.

## HTML Structure
The HTML file (`index.html`) defines the basic structure of the application:

- **Viewport**: A `<div>` element with ID `viewport` that serves as the main container, covering the entire viewport (100vw x 100vh).
- **Layers**:
  - **Raster Layer**: A `<canvas>` element with ID `rasterLayer` for rendering raster graphics.
  - **Vector Layer**: An `<svg>` element with ID `vectorLayer` containing a group (`<g>`) with ID `world` that holds vector shapes.
- **Sample Content**: The SVG includes sample vector elements (circle, rectangle, line) for demonstration.

The JavaScript file (`main.js`) is loaded at the end of the body.

## CSS Styling
The CSS file (`styles.css`) provides the visual layout:

- **Body**: Removes default margins, padding, and hides overflow to prevent scrolling.
- **Viewport**: Positioned relatively, full screen, with a light gray background and hidden overflow.
- **Layers**: Both canvas and SVG are absolutely positioned to overlay the viewport, covering 100% width and height.

## JavaScript Logic
The JavaScript file (`main.js`) implements the core functionality:

### Camera System
- **Variables**: `offsetX`, `offsetY` for translation, `scale` for zoom level.
- **Elements**: References to viewport, raster layer (canvas), vector layer (SVG), and world group.

### Canvas Setup
- Sets the canvas width and height to match the viewport dimensions.
- Obtains the 2D rendering context.

### Transform Updates
The `updateTransforms()` function applies camera transformations:
- **SVG**: Sets the `transform` attribute on the `world` group to `translate(offsetX, offsetY) scale(scale)`.
- **Canvas**: Uses `ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY)` to apply scaling and translation.
- Clears the canvas area to prevent artifacts during panning/zooming.

### Panning
- **Trigger**: Right-click and drag on the viewport.
- **Implementation**: Tracks mouse movement, updates `offsetX` and `offsetY`, and calls `updateTransforms()` to apply changes.
- **Context Menu**: Prevents the default right-click context menu.

### Zooming
- **Trigger**: Mouse wheel scroll.
- **Implementation**: Calculates zoom factor (0.9 for zoom out, 1.1 for zoom in).
- **Zoom to Cursor**: Adjusts `offsetX` and `offsetY` to zoom towards the mouse position, maintaining the world point under the cursor.
- Updates `scale` and offsets, then calls `updateTransforms()`.

## How It Works
1. **Initialization**: On page load, elements are referenced, canvas is sized, and initial transforms are set (identity).
2. **Interaction**:
   - **Panning**: User right-clicks and drags to move the camera, translating both layers.
   - **Zooming**: User scrolls to zoom in/out, scaling both layers while adjusting translation to focus on the cursor.
3. **Rendering**:
   - Vector graphics (SVG) are transformed via CSS transforms on the group element.
   - Raster graphics (canvas) are transformed via the canvas context's transformation matrix.
   - Both layers move and scale together, creating a unified infinite canvas experience.

## Layers
- **Vector Layer (SVG)**: Ideal for shapes, paths, and scalable graphics that remain crisp at any zoom level. Currently contains static sample shapes.
- **Raster Layer (Canvas)**: Suitable for pixel-based graphics, images, or dynamic drawing. Currently empty but set up for future raster content.

This architecture allows for a seamless, performant infinite canvas with dual rendering capabilities, supporting both vector and raster elements under unified camera controls.