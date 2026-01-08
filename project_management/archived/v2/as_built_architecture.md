# As-Built Architecture (Canvas Workbench)

## Purpose
Canvas Workbench is a browser-only SVG workspace for creating and manipulating simple elements (shapes, text, and node graphs) with pan/zoom, selection, transform handles, and a radial context menu. The app runs entirely client-side and uses ES modules.

## Entry Points and Runtime Structure
- `index.html` defines the full-viewport layout: `div#viewport` containing `canvas#rasterLayer` and `svg#vectorLayer` with a `g#world` group.
- `js/main.js` is the composition root. It instantiates core services, element types, controllers, and UI, then wires DOM events and custom flow events.

DOM hierarchy at runtime:

```
viewport (div)
  rasterLayer (canvas)
  vectorLayer (svg)
    world (g)
      element SVG nodes (circle/rect/line/text/node/connection)
      selection handles
      marquee rectangle
```

## Core Modules and Responsibilities

### Core Utilities
- `js/core/camera.js`: maintains pan/zoom (`offsetX`, `offsetY`, `scale`), applies transforms to `#world` and the raster canvas, and converts client coordinates to world coordinates.
- `js/core/geometry.js`: math helpers for rotation, distances, and corner positions, used primarily by transform and selection logic.
- `js/core/svg.js`: minimal helper for SVG element creation.

### Elements
All elements extend `InteractiveElement` (`js/elements/InteractiveElement.js`) and own their SVG nodes, selection state, and handle rendering.

- `CircleElement`, `RectangleElement`, `LineElement`, `TextElement`: concrete shape implementations with per-type bounding box and transform logic.
- `NodeElement`: a composite SVG group that renders a node card, editable text (via `foreignObject` input), connectors, and add-connector buttons. Maintains a list of connections for update/removal.
- `ConnectionElement`: a cubic bezier path connecting node output to input connectors with optional control-point handles.

### Manager
- `js/managers/ElementManager.js`: central registry for elements and selection. Responsibilities include:
  - `elements` and `selectedElements` tracking.
  - Selection lifecycle (click, shift-click, marquee selection).
  - Render/remove selection handles for single or group selections.
  - Clipboard copy/paste using serialized element descriptors.
  - Group rotation state and bounding box calculations.

### Controllers (Input and Interaction)
Controllers are responsible for DOM event wiring and translating input into state changes:

- `PanningController`: middle mouse drag pan.
- `ZoomController`: wheel zoom around cursor.
- `SelectionController`: click-to-select and deselect logic, coordinating with drag state.
- `MarqueeSelectionController`: click-drag marquee selection on empty space.
- `TransformController`: drag, scale, rotate, line endpoint edits, and connection bezier handle edits.
- `MenuController`: right-click radial menu tracking and section activation.
- `NodeConnectionController`: click-drag connector wiring between nodes with preview line.

### UI
- `js/ui/RadialMenu.js`: renders the radial menu as an SVG inside a positioned `div` and manages hover/active section state.

### Styles
- `css/styles.css`: global layout, radial menu visuals, marquee styling, node card styling, connection styling, and handle styling.

## Composition and Data Flow (main.js)
1. DOM elements are acquired (`viewport`, `rasterLayer`, `vectorLayer`, `world`).
2. Core services are instantiated (`Camera`, `ElementManager`).
3. UI and controllers are created and wired to DOM events.
4. Element creation helpers (circle/rect/line/text/node) create elements, render SVG, and register with `ElementManager`.
5. Event loop is handled by controllers; elements update their SVG nodes directly.

Key custom state and events:
- `interactionState.dragOccurred` is shared across controllers to suppress unintended click selection after drag.
- `nodeflow:changed` is dispatched on node/connection changes to trigger flow logging.
- `document.addEventListener('keydown', ...)` delegates copy/paste/delete to `ElementManager` and logs flows on `f`.

## Rendering and Transform Model
- `Camera` sets the `transform` on `#world` and sets the canvas transform in the raster layer; the raster layer is cleared on every camera update.
- Elements update their own SVG attributes for movement, scale, and rotation.
- Handles are rendered as additional SVG nodes inside the same `#world` group.

## Node Graph and Flow Logging
- Nodes expose connector circles with `data-connector-*` metadata.
- `NodeConnectionController` creates `ConnectionElement` instances, registering them with nodes and `ElementManager`.
- `main.js` computes flow adjacency from node connections, derives root nodes, and logs text paths to the console.
- Flow logging is throttled by `requestAnimationFrame` and triggered by `nodeflow:changed` and the `f` key.

## Current Architectural Characteristics
- DOM and element instances are the source of truth; there is no separate model layer.
- Controllers attach directly to DOM events and update element instances synchronously.
- ElementManager mixes selection state, clipboard serialization, and handle rendering.
- Global event listeners (`document`/`window`) are used for keyboard and drag capture.

## Refactor Opportunities (Modularity + Best Practices)

1. **Introduce a composition API**
   - Create a `createWorkbench()` entry point that accepts DOM nodes and configuration, returns a lifecycle-managed instance (`destroy()` to unbind events).

2. **Separate model from rendering**
   - Define element models (position, size, rotation, style) and renderers (SVG-specific implementations). Keep DOM nodes out of the model.

3. **Split ElementManager into focused services**
   - `SelectionStore`, `ClipboardService`, `HandleRenderer`, and an `ElementRegistry` for lookups by id.

4. **Decouple controllers from raw DOM events**
   - Add input adapters (`PointerInputAdapter`, `KeyboardInputAdapter`) that normalize events and can be bound/unbound.

5. **Centralize shared state**
   - Introduce a `WorkbenchState` holding camera state, element registry, selection, and interaction flags.

6. **Normalize transform math**
   - Consolidate bounding box and rotation math to avoid duplicated logic across `ElementManager` and elements.

7. **Reduce global listeners and side effects**
   - Replace document-level listeners with scoped listeners where possible; use event delegation thoughtfully.

8. **Improve extensibility for new element types**
   - Define a registry or factory for element creation (and serialization) so `main.js` does not grow with each new type.

9. **Harden clipboard serialization**
   - Version element descriptors and validate data before constructing elements from external sources.

10. **Testing and tooling**
    - Add unit tests for geometry and transform logic; add linting/formatting for consistent style and easier maintenance.

11. **Style scoping**
    - Scope CSS classes or inject styles in a container to reduce collisions when embedded in other apps.

12. **Pointer events and accessibility**
    - Prefer Pointer Events over mouse-only handlers; add keyboard focus and ARIA metadata for menu items.
