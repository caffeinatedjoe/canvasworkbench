# As-Built Architecture (Canvas Workbench)

## Overview
The current app is a single-page, client-side HTML/CSS/JS implementation of an infinite workspace using a dual-layer rendering model: an HTML `<canvas>` for raster and an SVG `<g>` for vector elements. All logic is loaded as global scripts in the browser without a module system.

## Top-Level Structure
- `index.html` defines a full-viewport container with two layers:
  - `#rasterLayer` (canvas) for raster drawing.
  - `#vectorLayer` (svg) containing `<g id="world">` for vector elements.
- Script load order is explicitly chained via `<script>` tags:
  - `RadialMenu.js` → `InteractiveElement.js` → shape elements → `ElementManager.js` → `main.js`.
- Styles are split across `css/styles.css` and `css/radial-menu.css`, with overlapping `.radial-menu` definitions.

## Rendering Model
- **Camera state** is managed by globals in `js/main.js`:
  - `offsetX`, `offsetY` for panning.
  - `scale` for zoom.
- **SVG transform** is applied to the `#world` group using a `transform` attribute.
- **Canvas transform** is applied via `ctx.setTransform(...)`, then the canvas is cleared on every update.
- Raster drawing is currently minimal (no content), but transform plumbing exists.

## Interaction Model
- Input handling is centralized in `js/main.js` with global state flags:
  - Panning via middle mouse drag on `#viewport`.
  - Selection and dragging via left click on SVG elements.
  - Scaling via handles (`data-handle-type="scale"`).
  - Rotation via handles (`data-handle-type="rotate"`).
  - Zoom via wheel, centered on cursor position.
  - Context menu (right click) opens a radial menu at screen coordinates.
- Screen → world conversion uses `clientToWorld(...)`, based on the current camera offset and scale.

## Element System
- `js/InteractiveElement.js` defines a base class with:
  - Common properties (`id`, `type`, `position`, `scale`, `rotation`, `container`).
  - Lifecycle methods (`render`, `delete`) and interaction helpers (`select`, `deselect`).
  - Default handle rendering with scale/rotate handles.
- Concrete subclasses implement shape-specific logic:
  - `CircleElement` (SVG `circle`) with custom handle layout.
  - `RectangleElement` (SVG `rect`) with rotation support via `transform`.
  - `LineElement` (SVG `line`) with endpoint handles and custom rotation math.
- Each element updates its SVG attributes directly (no virtual model layer).

## Selection and Group Operations
- `js/ElementManager.js` maintains:
  - `elements` (all objects).
  - `selectedElements` (current selection).
  - `groupHandles` (UI handles for multi-select).
  - `groupRotation` and `groupRotationCenter`.
- Selection is handled on click via `handleClick`, which checks whether the click hit a known SVG element.
- Group bounding boxes are computed with custom geometry helpers that account for rotated rectangles and lines.
- Group handles are rendered as SVG shapes attached to the element container (assumes shared container).

## Radial Menu
- `js/RadialMenu.js` builds an SVG donut menu in a positioned HTML `<div>`.
- Menu items are configured with ids, SVG path icons, and actions.
- In `main.js`, the radial menu invokes:
  - `addCircleAt(...)`
  - `addRectAt(...)`
  - `addLineAt(...)`
  - `addTextAt(...)` (creates SVG `<text>` directly, outside the element system)

## Data Flow Summary
1. User input (mouse/wheel/contextmenu) updates camera or element state.
2. Camera updates reapply transforms to `#world` and the raster canvas context.
3. Element state changes call `updateSvgPosition/Scale/Rotation`, updating DOM directly.
4. Selection changes re-render handles via `ElementManager` and element methods.

## Current Coupling and Global State
- `main.js` coordinates:
  - Camera state.
  - Input handling.
  - Element creation.
  - Radial menu actions.
  - Geometry helper utilities.
- Element geometry and handle logic is split between `InteractiveElement` and `ElementManager`.
- No event bus or data model layer exists; DOM is the source of truth.

## Refactor Opportunities (Modularity + Best Practices)
1. **Introduce ES modules and namespaces**: Convert global scripts into `import`/`export` modules and reduce global state (`main.js` becomes a composition root).
2. **Extract a Camera controller**: Encapsulate `offsetX/offsetY/scale`, `clientToWorld`, and transform updates in a `Camera` class.
3. **Split input handling by concern**: Separate mouse/keyboard listeners into `PanningController`, `SelectionController`, `TransformController`, and `MenuController`.
4. **Unify geometry utilities**: Move `rotatePoint`, `distance`, and bbox helpers into a shared `geometry.js` module.
5. **Consolidate handle rendering**: Create a `HandleRenderer` with consistent behavior for single vs. group selection.
6. **Normalize scaling behavior**: Decide on uniform vs. non-uniform scaling rules per element and keep logic in element subclasses.
7. **Avoid direct DOM coupling for text**: Add a `TextElement` class to keep all elements under `ElementManager`.
8. **Remove CSS duplication**: Merge `.radial-menu` styles into a single file to avoid conflicting layout rules.
9. **Add a lightweight state store**: Centralize element data and selection state to make undo/redo feasible.
10. **Add tests for geometry math**: Unit tests for bbox, rotation, and scaling operations to prevent regressions.
11. **Adopt linting/formatting**: Use ESLint/Prettier for consistent formatting and cleaner diffs.
12. **Use pointer events**: Replace mouse-only handlers with Pointer Events for touch and pen support.
