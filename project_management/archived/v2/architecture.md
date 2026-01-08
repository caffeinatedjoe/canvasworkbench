# Canvas Workbench Architecture

## Purpose

Canvas Workbench is a browser-based, SVG-first workspace with pan/zoom, element creation, selection, and transforms. The app is client-side only and composes a set of controllers, managers, and element classes around a shared SVG world.

## Runtime Layers

- **DOM scaffold** (`index.html`): a `div#viewport` holding `canvas#rasterLayer` and `svg#vectorLayer`, with a `g#world` group that is transformed for pan/zoom.
- **Composition root** (`js/main.js`): constructs core services, registers controllers, and wires keyboard and pointer events.
- **Core utilities** (`js/core`): camera transform math, geometry helpers, and SVG element creation.
- **Elements** (`js/elements`): interactive shapes that own their SVG nodes and expose transform APIs.
- **Managers** (`js/managers`): selection state, handles, clipboard, and element serialization.
- **Controllers** (`js/controllers`): translate input events into camera movement, element transforms, selection, and menu actions.
- **UI widgets** (`js/ui`): radial menu rendering and interaction.
- **Styles** (`css/styles.css`): layout and visual styles for viewport, menu, and marquee.

## DOM Structure

```
viewport (div)
  rasterLayer (canvas)
  vectorLayer (svg)
    world (g)
      svg elements (circle/rect/line/text)
      selection handles
      marquee rectangle
```

The `world` group is transformed by the camera to implement pan/zoom for all SVG elements. The canvas layer is prepared for raster operations and is currently cleared on every camera update.

## Core Modules

### Camera (`js/core/camera.js`)

- Maintains `offsetX`, `offsetY`, and `scale`.
- Applies transforms to both the SVG world (`transform` attribute) and the raster canvas context.
- Converts client coordinates to world coordinates for controllers.

### Geometry (`js/core/geometry.js`)

Shared geometric utilities for bounding boxes, distance, and rotation. Used by transform and selection logic to keep resizing and group rotation consistent.

### SVG Helper (`js/core/svg.js`)

Small helper for SVG element creation with attributes.

## Elements

All interactive elements extend `InteractiveElement` and encapsulate:

- World-space position, scale, and rotation
- A backing SVG node
- Selection handles and bounding boxes

Concrete element types:

- `CircleElement` (SVG `circle`)
- `RectangleElement` (SVG `rect`)
- `LineElement` (SVG `line`)
- `TextElement` (SVG `text`)

Each element is responsible for:

- Rendering itself into the `world` SVG group
- Updating its SVG attributes when moved, scaled, or rotated
- Rendering handles that are consumed by transform controllers

## Element Management

`ElementManager` owns:

- `elements`: all scene elements
- `selectedElements`: active selection
- Group handle rendering and rotation state
- Clipboard copy/paste via serialized element descriptors

Key responsibilities:

- Selection lifecycle (click, shift-click, marquee)
- Creating selection handles for individual or grouped elements
- Serializing elements for clipboard operations
- Computing bounding boxes for selection and transforms

## Controllers and Interaction Flow

### Panning (`PanningController`)

Middle mouse drag pans the camera by updating offsets.

### Zooming (`ZoomController`)

Mouse wheel zooms the camera around the cursor position.

### Selection (`SelectionController` and `MarqueeSelectionController`)

- Click in `vectorLayer` selects or deselects elements.
- Marquee selection starts on empty-space drag, supports shift-additive selection.

### Transforming (`TransformController`)

Manages drag, scale, rotate, and line endpoint edits:

- Drag moves selected elements in world space.
- Handles drive scaling or rotation depending on handle type.
- Group transforms use a computed bounding box and shared rotation center.

### Menu (`MenuController` + `RadialMenu`)

Right-click opens a radial menu. Dragging across a section triggers element creation at the last context position.

## Rendering and State Flow

1. `main.js` constructs `Camera`, `ElementManager`, and controllers.
2. User input events are routed through controllers.
3. Controllers update camera or element state via `ElementManager`.
4. Elements update their SVG nodes and selection handles.
5. Camera updates the SVG world transform and clears the raster layer.

## Key Extension Points

- `createElementFromDescriptor` in `main.js` enables clipboard paste and is the current entry point for external element creation.
- `ElementManager` centralizes selection and clipboard behavior.
- `RadialMenu` provides a pluggable UI for commands/actions.

## Notable Constraints

- All rendering is SVG-based; the raster canvas is only used for camera context setup.
- Elements own their DOM nodes, tightly coupling the model to the SVG renderer.
- Controllers bind directly to DOM events in the viewport.
